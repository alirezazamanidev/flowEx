import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import { OrderSide } from '../enums/order.enum';
import { OrderExecutionService } from '../services/order-execution.service';

@Processor('order-limit')
export class OrderLimitProcessor extends WorkerHost {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private orderExecutionService: OrderExecutionService,
  ) {
    super();
  }
  async process(job: Job) {
    switch (job.name) {
      case 'check-limit-orders':
        await this.orderExecutionService.checkLimitOrders(
          job.data.currency,
          job.data.side,
        );
        break;
      case 'execute-limit-order':
        await this.orderExecutionService.executeLimitOrder(job.data.orderId,job.data.currentPrice)
        break;

      default:
        break;
    }
  }
}
