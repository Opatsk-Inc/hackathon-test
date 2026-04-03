import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustInventoryDto, CreateOrderDto } from './dto';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.order.create({
      data: {
        requesterId: warehouseId,
        resourceId: dto.resourceId,
        quantity: dto.quantity,
        priority: dto.priority,
      },
      include: { resource: true, requester: true },
    });
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

  async approveOrder(orderId: string, warehouseId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in PENDING status');
    }

    if (order.requesterId === warehouseId) {
      throw new ForbiddenException('Cannot approve your own order');
    }

    // Check inventory availability
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        warehouseId_resourceId: {
          warehouseId,
          resourceId: order.resourceId,
        },
      },
    });

    if (!inventory || inventory.quantityAvailable < order.quantity) {
      throw new BadRequestException('Insufficient inventory to approve this order');
    }

    // Use transaction: set APPROVED + providerId, move qty from available to reserved
    return this.prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: {
          warehouseId_resourceId: {
            warehouseId,
            resourceId: order.resourceId,
          },
        },
        data: {
          quantityAvailable: { decrement: order.quantity },
          quantityReserved: { increment: order.quantity },
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'APPROVED',
          providerId: warehouseId,
        },
        include: { resource: true, requester: true, provider: true },
      });
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
}
