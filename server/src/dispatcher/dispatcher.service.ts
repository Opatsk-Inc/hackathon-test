import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto, UpdatePriorityDto } from './dto';

@Injectable()
export class DispatcherService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: { users: { select: { id: true, username: true, firstName: true, lastName: true } } },
    });
  }

  async getGlobalInventory() {
    // Summarize total inventory across the network, grouped by resource
    const items = await this.prisma.inventory.groupBy({
      by: ['resourceId'],
      _sum: {
        quantityAvailable: true,
        quantityReserved: true,
      },
    });

    // Enrich with resource details
    const resourceIds = items.map((i) => i.resourceId);
    const resources = await this.prisma.resource.findMany({
      where: { id: { in: resourceIds } },
    });

    const resourceMap = new Map(resources.map((r) => [r.id, r]));

    return items.map((item) => ({
      resource: resourceMap.get(item.resourceId) ?? { id: item.resourceId },
      totalAvailable: item._sum.quantityAvailable ?? 0,
      totalReserved: item._sum.quantityReserved ?? 0,
    }));
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { resource: true, requester: true, provider: true, trip: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePriority(orderId: string, dto: UpdatePriorityDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { priority: dto.priority },
      include: { resource: true, requester: true, provider: true },
    });
  }

  async createTrip(dto: CreateTripDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { trip: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.trip) {
      throw new BadRequestException('Order already has a trip assigned');
    }

    if (order.status !== 'PACKED' && order.status !== 'APPROVED') {
      throw new BadRequestException(
        'Order must be APPROVED or PACKED before creating a trip',
      );
    }

    const trip = await this.prisma.trip.create({
      data: {
        orderId: dto.orderId,
        driverName: dto.driverName,
      },
      include: { order: { include: { resource: true, requester: true, provider: true } } },
    });

    return {
      ...trip,
      magicToken: trip.magicToken,
    };
  }

  async getActiveTrips() {
    return this.prisma.trip.findMany({
      where: {
        status: { in: ['EN_ROUTE', 'SOS'] },
      },
      include: { order: { include: { resource: true, requester: true, provider: true } } },
    });
  }

  async resolveSos(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { order: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== 'SOS') {
      throw new BadRequestException('Trip is not in SOS status');
    }

    const order = trip.order;

    return this.prisma.$transaction(async (tx) => {
      // Return reserved items to provider's inventory
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
            quantityAvailable: { increment: order.quantity },
          },
        });
      }

      // Reset order to PENDING, nullify providerId
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PENDING',
          providerId: null,
        },
      });

      // Cancel / delete the trip
      return tx.trip.delete({
        where: { id: tripId },
      });
    });
  }
}
