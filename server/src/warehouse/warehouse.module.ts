import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [WarehouseController],
  providers: [WarehouseService, PrismaService],
})
export class WarehouseModule {}
