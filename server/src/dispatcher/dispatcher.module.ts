import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DispatcherController } from './dispatcher.controller';
import { DispatcherService } from './dispatcher.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [DispatcherController],
  providers: [DispatcherService, PrismaService],
})
export class DispatcherModule {}
