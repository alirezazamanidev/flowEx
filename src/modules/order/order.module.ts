import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';
import { OrderController } from './order.controller';

@Module({
  controllers:[OrderController],
  providers: [OrderGateway, OrderService],
})
export class OrderModule {}
