import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class UpdatePriorityDto {
  @ApiProperty({ enum: Priority, description: 'New priority for the order' })
  @IsEnum(Priority)
  priority: Priority;
}
