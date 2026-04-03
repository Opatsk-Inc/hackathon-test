import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGpsDto {
  @ApiProperty({ description: 'Current latitude of the driver' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Current longitude of the driver' })
  @IsNumber()
  lng: number;
}
