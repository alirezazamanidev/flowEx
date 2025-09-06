import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from '@app/common/interfaces/order';

@Controller()
export class OrderController {
  constructor(private orderService: OrderService) {}
  @GrpcMethod('OrderService', 'CreateOrder')
  createOrder(dto: CreateOrderRequest): Promise<CreateOrderResponse> {
    
    return this.orderService.createOrder(dto);
  }
}
