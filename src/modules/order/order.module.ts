import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderGateway } from './order.gateway';

@Module({
  providers: [OrderGateway, OrderService],
})
export class OrderModule {}
