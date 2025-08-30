import { WebSocketGateway } from '@nestjs/websockets';
import { OrderService } from './order.service';

@WebSocketGateway()
export class OrderGateway {
  constructor(private readonly orderService: OrderService) {}
}
