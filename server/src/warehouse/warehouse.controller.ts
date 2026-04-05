import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Usr } from '../user/user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { WarehouseService } from './warehouse.service';
import { AdjustInventoryDto, CreateOrderDto, UpdateOrderDto } from './dto';

@ApiTags('warehouse')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard(), RolesGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // ─── INVENTORY ────────────────────────────────────────────────────────────────

  @Get('api/inventory/my')
  @Roles(Role.WAREHOUSE_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get inventory for the current user\'s warehouse' })
  @ApiResponse({ status: 200, description: 'Inventory list returned' })
  @ApiResponse({ status: 403, description: 'User has no assigned warehouse' })
  async getMyInventory(@Usr() user: AuthUser) {
    this.ensureWarehouse(user);
    return this.warehouseService.getMyInventory(user.warehouseId!);
  }

  @Post('api/inventory/my/adjust')
  @Roles(Role.WAREHOUSE_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert quantityAvailable for a resource in the user\'s warehouse' })
  @ApiResponse({ status: 200, description: 'Inventory adjusted' })
  @ApiResponse({ status: 403, description: 'User has no assigned warehouse' })
  async adjustInventory(
    @Usr() user: AuthUser,
    @Body() dto: AdjustInventoryDto,
  ) {
    this.ensureWarehouse(user);
    return this.warehouseService.adjustInventory(user.warehouseId!, dto);
  }

  // ─── ORDERS ───────────────────────────────────────────────────────────────────

  @Post('api/orders')
  @Roles(Role.WAREHOUSE_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an order (requesterId = user\'s warehouse)' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 403, description: 'User has no assigned warehouse' })
  async createOrder(
    @Usr() user: AuthUser,
    @Body() dto: CreateOrderDto,
  ) {
    this.ensureWarehouse(user);
    return this.warehouseService.createOrder(user.warehouseId!, dto);
  }

  @Get('api/orders/my')
  @Roles(Role.WAREHOUSE_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get orders where user\'s warehouse is requester or provider' })
  @ApiResponse({ status: 200, description: 'Orders list returned' })
  @ApiResponse({ status: 403, description: 'User has no assigned warehouse' })
  async getMyOrders(@Usr() user: AuthUser) {
    this.ensureWarehouse(user);
    return this.warehouseService.getMyOrders(user.warehouseId!);
  }

  @Patch('api/orders/:orderId/pack')
  @Roles(Role.WAREHOUSE_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an approved order as PACKED' })
  @ApiResponse({ status: 200, description: 'Order packed' })
  @ApiResponse({ status: 400, description: 'Order must be APPROVED first' })
  @ApiResponse({ status: 403, description: 'Only the provider can pack' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'orderId', description: 'ID of the order to pack' })
  async packOrder(
    @Param('orderId') orderId: string,
    @Usr() user: AuthUser,
  ) {
    this.ensureWarehouse(user);
    return this.warehouseService.packOrder(orderId, user.warehouseId!);
  }

  @Patch('api/orders/:orderId')
  @Roles(Role.WAREHOUSE_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing order (recalculate quantities)' })
  @ApiResponse({ status: 200, description: 'Order updated and invetory recalculated' })
  @ApiResponse({ status: 400, description: 'Invalid quantity or status' })
  @ApiResponse({ status: 403, description: 'User does not belong to the requester warehouse' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'orderId', description: 'ID of the order to update' })
  async updateOrder(
    @Param('orderId') orderId: string,
    @Usr() user: AuthUser,
    @Body() dto: UpdateOrderDto,
  ) {
    this.ensureWarehouse(user);
    return this.warehouseService.updateOrder(orderId, user.warehouseId!, dto);
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────────

  private ensureWarehouse(user: AuthUser): void {
    if (!user.warehouseId) {
      throw new ForbiddenException('User is not assigned to any warehouse');
    }
  }
}
