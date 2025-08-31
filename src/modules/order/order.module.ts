import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';


import { OrderStreamService } from './services/order-streem.service';
import { JwtModule } from '@nestjs/jwt';
import { OrderGateway } from './order.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), JwtModule.register({ global: true })],
  controllers:[OrderController],
  providers:  [OrderGateway,OrderService, OrderStreamService],
})
export class OrderModule {}
