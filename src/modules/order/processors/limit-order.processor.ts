import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import { OrderSide } from '../enums/order.enum';
import { OrderExecutionService } from '../services/order-execution.service';

@Processor('order-limit')
export class OrderLimitProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderLimitProcessor.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private orderExecutionService: OrderExecutionService,
  ) {
    super();
  }
  async process(job: Job) {
    switch (job.name) {
      case 'check-limit-orders':
        const { currency, currentPrice } = job.data;
        this.logger.debug(
          `Processing limit orders for ${currency} at ${currentPrice}`,
        );
        await this.orderExecutionService.checkLimitOrders(
          currency,
          currentPrice,
        );
        break;
      case 'execute-limit-order':
        await this.orderExecutionService.executeLimitOrder(
          job.data.orderId,
          job.data.currentPrice,
        );
        break;

      default:
        break;
    }
  }
}
