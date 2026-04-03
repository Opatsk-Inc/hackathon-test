import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({ description: 'ID of the order to link the trip to' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Driver name', required: false })
  @IsString()
  @IsOptional()
  driverName?: string;
}
