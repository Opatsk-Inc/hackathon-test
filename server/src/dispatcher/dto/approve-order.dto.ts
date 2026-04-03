import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveOrderDto {
  @ApiProperty({ description: 'Driver name (optional)', required: false })
  @IsString()
  @IsOptional()
  driverName?: string;
}
