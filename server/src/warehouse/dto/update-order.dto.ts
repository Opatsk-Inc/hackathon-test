import { IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 15, description: 'New quantity requested' })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ enum: Priority, example: Priority.HIGH })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;
}
