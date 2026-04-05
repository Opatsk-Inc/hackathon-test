import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustInventoryDto, CreateOrderDto, UpdateOrderDto } from './dto';

import { RealtimeService } from '../common/realtime.service';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async getMyInventory(warehouseId: string) {
    return this.prisma.inventory.findMany({
      where: { warehouseId },
      include: { resource: true },
    });
  }

  async adjustInventory(warehouseId: string, dto: AdjustInventoryDto) {
    return this.prisma.inventory.upsert({
      where: {
        warehouseId_resourceId: {
          warehouseId,
          resourceId: dto.resourceId,
        },
      },
      update: {
        quantityAvailable: dto.quantity,
      },
      create: {
        warehouseId,
        resourceId: dto.resourceId,
        quantityAvailable: dto.quantity,
      },
      include: { resource: true },
    });
  }

  async createOrder(warehouseId: string, dto: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: {
        requesterId: warehouseId,
        resourceId: dto.resourceId,
        quantity: dto.quantity,
        priority: dto.priority,
      },
      include: { resource: true, requester: true },
    });

    this.realtimeService.emit('ORDER_CREATED', order);

    return order;
  }

  async getMyOrders(warehouseId: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [{ requesterId: warehouseId }, { providerId: warehouseId }],
      },
      include: { resource: true, requester: true, provider: true, trip: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async packOrder(orderId: string, warehouseId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'APPROVED') {
      throw new BadRequestException('Order must be APPROVED before packing');
    }

    if (order.providerId !== warehouseId) {
      throw new ForbiddenException('Only the provider warehouse can pack this order');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PACKED' },
      include: { resource: true, requester: true, provider: true },
    });
  }

  async updateOrder(orderId: string, warehouseId: string, dto: UpdateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.requesterId !== warehouseId) {
        throw new ForbiddenException(
          'Only the requester warehouse can update the order',
        );
      }

      const allowedStatuses: any[] = ['PENDING', 'APPROVED', 'PACKED'];
      if (!allowedStatuses.includes(order.status)) {
        throw new BadRequestException(
          `Cannot update order in ${order.status} status`,
        );
      }

      const { quantity, priority } = dto;

      if (quantity !== undefined && quantity !== order.quantity) {
        const diff = quantity - order.quantity;

        // If order is already assigned to a provider, adjust their inventory
        if (order.providerId && ['APPROVED', 'PACKED'].includes(order.status)) {
          const inventory = await tx.inventory.findUnique({
            where: {
              warehouseId_resourceId: {
                warehouseId: order.providerId,
                resourceId: order.resourceId,
              },
            },
          });

          if (!inventory) {
            throw new NotFoundException('Provider inventory record not found');
          }

          // If increasing quantity, check availability
          if (diff > 0 && inventory.quantityAvailable < diff) {
            throw new BadRequestException(
              `Provider warehouse has insufficient inventory for the increased amount. Available: ${inventory.quantityAvailable}, additional needed: ${diff}`,
            );
          }

          // Update both available and reserved quantities
          await tx.inventory.update({
            where: {
              id: inventory.id,
            },
            data: {
              quantityAvailable: { decrement: diff },
              quantityReserved: { increment: diff },
            },
          });
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          quantity: quantity ?? order.quantity,
          priority: priority ?? order.priority,
        },
        include: { resource: true, requester: true, provider: true },
      });

      this.realtimeService.emit('ORDER_UPDATED', updatedOrder);
      return updatedOrder;
    });
  }
}
