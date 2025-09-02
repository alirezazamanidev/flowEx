import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { CryptoSymbolsUSD } from 'src/modules/market/contracts/crypto-chanell';

@Injectable()
export class MarketService implements OnModuleInit {
  private redisSub: Redis;

  private readonly logger = new Logger(MarketService.name);

  constructor(
        @InjectQueue('order-limit') private orderLimitQueue: Queue,
    
  ) {
    this.redisSub = new Redis(process.env.REDIS_URL);
  }
  async onModuleInit() {
    for (const currency of CryptoSymbolsUSD) {
      const channel = `candle:${currency}:1`;
      this.redisSub.subscribe(channel);
      this.logger.log(`Subscribed to ${channel}`);
    }

    this.redisSub.on('message', async (channel, message) => {
      const { close: currentPrice } = JSON.parse(message);
      if (!currentPrice) return;
  

      const currency = channel.split(':')[1];
      await this.orderLimitQueue.add('check-limit-orders', { currency, currentPrice });
      this.logger.debug(`Enqueued check.limit-orders for ${currency} at ${currentPrice}`);
    });
  }
}
