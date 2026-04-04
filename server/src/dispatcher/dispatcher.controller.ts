import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
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
import { DispatcherService } from './dispatcher.service';
import { ApproveOrderDto } from './dto/approve-order.dto';

@ApiTags('dispatcher')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard(), RolesGuard)
export class DispatcherController {
  constructor(private readonly dispatcherService: DispatcherService) { }

  // ─── WAREHOUSES ───────────────────────────────────────────────────────────────

  @Get('api/warehouses')
  @Roles(Role.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({ status: 200, description: 'All warehouses returned' })
  async getAllWarehouses() {
    return this.dispatcherService.getAllWarehouses();
  }

  // ─── INVENTORY ────────────────────────────────────────────────────────────────

  @Get('api/inventory/global')
  @Roles(Role.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Summarize total inventory across the network' })
  @ApiResponse({ status: 200, description: 'Global inventory summary returned' })
  async getGlobalInventory() {
    return this.dispatcherService.getGlobalInventory();
  }

  // ─── ORDERS ───────────────────────────────────────────────────────────────────

  @Get('api/orders')
  @Roles(Role.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'All orders returned' })
  async getAllOrders() {
    return this.dispatcherService.getAllOrders();
  }

  @Patch('api/orders/:orderId/approve')
  @Roles(Role.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve an order, reserve inventory, and auto-create a trip with magic link' })
  @ApiResponse({ status: 200, description: 'Order approved, trip created with magicToken' })
  @ApiResponse({ status: 400, description: 'No inventory available or wrong status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'orderId', description: 'ID of the order to approve' })
  async approveOrder(
    @Param('orderId') orderId: string,
    @Body() dto: ApproveOrderDto,
  ) {
    return this.dispatcherService.approveOrder(orderId, dto);
  }

  // ─── TRIPS ────────────────────────────────────────────────────────────────────

  @Get('api/trips/active')
  @Roles(Role.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all active trips (EN_ROUTE or SOS)' })
  @ApiResponse({ status: 200, description: 'Active trips returned' })
  async getActiveTrips() {
    return this.dispatcherService.getActiveTrips();
  }

  @Patch('api/trips/:tripId/resolve-sos')
  @Roles(Role.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve an SOS trip: cancel trip, reset order, return inventory' })
  @ApiResponse({ status: 200, description: 'SOS resolved' })
  @ApiResponse({ status: 400, description: 'Trip is not in SOS status' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiParam({ name: 'tripId', description: 'ID of the trip to resolve' })
  async resolveSos(@Param('tripId') tripId: string) {
      return this.dispatcherService.resolveSos(tripId);
  }

  @Get('api/trips/:tripId/track')
  @Roles(Role.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get raw GPS track points for a trip ordered by time' })
  @ApiResponse({ status: 200, description: 'List of track points returned' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiParam({ name: 'tripId', description: 'ID of the trip' })
  async getTripTrack(@Param('tripId') tripId: string) {
    return this.dispatcherService.getTripTrack(tripId);
  }
}
