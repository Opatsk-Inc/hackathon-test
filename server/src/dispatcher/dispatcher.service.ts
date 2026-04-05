import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveOrderDto } from './dto/approve-order.dto';

import { RealtimeService } from '../common/realtime.service';

@Injectable()
export class DispatcherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async getAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: {
        inventory: {
          include: {
            resource: true,
          },
        },
      },
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

  async approveOrder(orderId: string, dto: ApproveOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { trip: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in PENDING status');
    }

    // Find a provider warehouse with sufficient inventory
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        resourceId: order.resourceId,
        quantityAvailable: { gte: order.quantity },
        // Provider must not be the requester
        warehouseId: { not: order.requesterId },
      },
      orderBy: { quantityAvailable: 'desc' },
    });

    if (!inventory) {
      throw new BadRequestException(
        'No warehouse has sufficient inventory to fulfill this order',
      );
    }

    // Transaction: reserve inventory + approve order + create trip
    return this.prisma.$transaction(async (tx) => {
      // Reserve inventory at the provider warehouse
      await tx.inventory.update({
        where: {
          warehouseId_resourceId: {
            warehouseId: inventory.warehouseId,
            resourceId: order.resourceId,
          },
        },
        data: {
          quantityAvailable: { decrement: order.quantity },
          quantityReserved: { increment: order.quantity },
        },
      });

      // Approve the order and assign provider
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.APPROVED,
          providerId: inventory.warehouseId,
        },
        include: { resource: true, requester: true, provider: true },
      });

      // Auto-create trip with magic link
      const trip = await tx.trip.create({
        data: {
          orderId,
          driverName: dto.driverName,
        },
      });

      const result = {
        order: updatedOrder,
        trip: {
          id: trip.id,
          magicToken: trip.magicToken,
          status: trip.status,
          driverName: trip.driverName,
        },
        magicLink: `/api/driver/${trip.magicToken}`,
      };

      this.realtimeService.emit('ORDER_APPROVED', result);
      return result;
    });
  }

  async rejectOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING orders can be rejected');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.REJECTED },
    });

    this.realtimeService.emit('ORDER_REJECTED', { orderId: updatedOrder.id });
    return updatedOrder;
  }

  async getActiveTrips() {
    return this.prisma.trip.findMany({
      where: {
        status: { in: ['PENDING', 'EN_ROUTE', 'SOS'] },
      },
      include: {
        order: { include: { resource: true, requester: true, provider: true } },
      },
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
      const deletedTrip = await tx.trip.delete({
        where: { id: tripId },
      });

      this.realtimeService.emit('SOS_RESOLVED', { tripId });

      return deletedTrip;
    });
  }

  async getTripTrack(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return this.prisma.tripPoint.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
