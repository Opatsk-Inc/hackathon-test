import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { DriverService } from './driver.service';
import { UpdateGpsDto } from './dto';

@ApiTags('driver')
@Controller('api/driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get(':magicToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get trip and order details by magic token' })
  @ApiResponse({ status: 200, description: 'Trip details returned' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiParam({ name: 'magicToken', description: 'Magic link token for the trip' })
  async getTripDetails(@Param('magicToken') magicToken: string) {
    return this.driverService.getTripDetails(magicToken);
  }

  @Patch(':magicToken/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start trip: EN_ROUTE, order IN_TRANSIT, deduct reserved inventory' })
  @ApiResponse({ status: 200, description: 'Trip started' })
  @ApiResponse({ status: 400, description: 'Trip not in PENDING status' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiParam({ name: 'magicToken', description: 'Magic link token for the trip' })
  async startTrip(@Param('magicToken') magicToken: string) {
    return this.driverService.startTrip(magicToken);
  }

  @Post(':magicToken/gps')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update driver GPS coordinates' })
  @ApiResponse({ status: 200, description: 'GPS coordinates updated' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiParam({ name: 'magicToken', description: 'Magic link token for the trip' })
  async updateGps(
    @Param('magicToken') magicToken: string,
    @Body() dto: UpdateGpsDto,
  ) {
    return this.driverService.updateGps(magicToken, dto);
  }

  @Patch(':magicToken/sos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report SOS for a trip' })
  @ApiResponse({ status: 200, description: 'SOS reported' })
  @ApiResponse({ status: 400, description: 'Trip must be EN_ROUTE' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiParam({ name: 'magicToken', description: 'Magic link token for the trip' })
  async reportSos(@Param('magicToken') magicToken: string) {
    return this.driverService.reportSos(magicToken);
  }

  @Patch(':magicToken/finish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finish trip: DELIVERED, add inventory to requester' })
  @ApiResponse({ status: 200, description: 'Trip finished' })
  @ApiResponse({ status: 400, description: 'Trip must be EN_ROUTE' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiParam({ name: 'magicToken', description: 'Magic link token for the trip' })
  async finishTrip(@Param('magicToken') magicToken: string) {
    return this.driverService.finishTrip(magicToken);
  }
}
