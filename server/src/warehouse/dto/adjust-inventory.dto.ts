import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustInventoryDto {
  @ApiProperty({ description: 'Resource ID to adjust inventory for' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'New available quantity', minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;
}
