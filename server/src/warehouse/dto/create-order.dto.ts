import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'Resource ID to order' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'Quantity to order', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ enum: Priority, default: Priority.NORMAL, description: 'Order priority' })
  @IsEnum(Priority)
  priority: Priority = Priority.NORMAL;
}
