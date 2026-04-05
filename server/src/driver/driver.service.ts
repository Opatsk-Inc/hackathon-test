import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGpsDto } from './dto';

import { RealtimeService } from '../common/realtime.service';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  private async getTripByToken(magicToken: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { magicToken },
      include: {
        order: {
          include: { resource: true, requester: true, provider: true },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async getTripDetails(magicToken: string) {
    return this.getTripByToken(magicToken);
  }

  async startTrip(magicToken: string) {
    const trip = await this.getTripByToken(magicToken);

    if (trip.status !== 'PENDING') {
      throw new BadRequestException('Trip must be in PENDING status to start');
    }

    const order = trip.order;

    return this.prisma.$transaction(async (tx) => {
      // Deduct quantityReserved permanently from Provider's Inventory
      if (order.providerId) {
        await tx.inventory.update({
          where: {
            warehouseId_resourceId: {
              warehouseId: order.providerId,
              resourceId: order.resourceId,
            },
          },
          data: {
            quantityReserved: { decrement: order.quantity },
          },
        });
      }

      // Update order to IN_TRANSIT
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'IN_TRANSIT' },
      });

      // Update trip to EN_ROUTE
      const updatedTrip = await tx.trip.update({
        where: { id: trip.id },
        data: { status: 'EN_ROUTE' },
        include: {
          order: {
            include: { resource: true, requester: true, provider: true },
          },
        },
      });

      this.realtimeService.emit('TRIP_STARTED', updatedTrip);
      return updatedTrip;
    });
  }

  async updateGps(magicToken: string, dto: UpdateGpsDto) {
    const trip = await this.getTripByToken(magicToken);

    const updatedTrip = await this.prisma.trip.update({
      where: { id: trip.id },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
        points: {
          create: {
            lat: dto.lat,
            lng: dto.lng,
          },
        },
      },
    });

    this.realtimeService.emit('GPS_UPDATED', {
      tripId: trip.id,
      lat: dto.lat,
      lng: dto.lng,
    });

    return updatedTrip;
  }

  async reportSos(magicToken: string) {
    const trip = await this.getTripByToken(magicToken);

    if (trip.status !== 'EN_ROUTE' && trip.status !== 'PENDING') {
      throw new BadRequestException(
        'Trip must be EN_ROUTE or PENDING to report SOS',
      );
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id: trip.id },
      data: { status: 'SOS' },
      include: {
        order: {
          include: { resource: true, requester: true, provider: true },
        },
      },
    });

    this.realtimeService.emit('SOS_REPORTED', updatedTrip);
    return updatedTrip;
  }

  async finishTrip(magicToken: string) {
    const trip = await this.getTripByToken(magicToken);

    if (trip.status !== 'EN_ROUTE') {
      throw new BadRequestException('Trip must be EN_ROUTE to finish');
    }

    const order = trip.order;

    return this.prisma.$transaction(async (tx) => {
      // Add quantity to quantityAvailable in the Requester's Inventory
      await tx.inventory.upsert({
        where: {
          warehouseId_resourceId: {
            warehouseId: order.requesterId,
            resourceId: order.resourceId,
          },
        },
        update: {
          quantityAvailable: { increment: order.quantity },
        },
        create: {
          warehouseId: order.requesterId,
          resourceId: order.resourceId,
          quantityAvailable: order.quantity,
        },
      });

      // Update order to DELIVERED
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'DELIVERED' },
      });

      // Update trip to DELIVERED
      const finishedTrip = await tx.trip.update({
        where: { id: trip.id },
        data: { status: 'DELIVERED' },
        include: {
          order: {
            include: { resource: true, requester: true, provider: true },
          },
        },
      });

      this.realtimeService.emit('TRIP_FINISHED', finishedTrip);
      return finishedTrip;
    });
  }
}
