import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';
import { WarehouseModule } from './warehouse/warehouse.module';
import { DispatcherModule } from './dispatcher/dispatcher.module';
import { DriverModule } from './driver/driver.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    WarehouseModule,
    DispatcherModule,
    DriverModule,
  ],
  providers: [
    PrismaService,
  ],
  controllers: [AppController],
})
export class AppModule { }
