import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import { DataSource, EntityManager } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderSide, OrderStatus } from '../enums/order.enum';
import Big from 'big.js';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';

@Processor('order')
export class OrderWorker extends WorkerHost {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private dataSource: DataSource,
  ) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    switch (job.name) {
      case 'check.limit-order':
        await this.checkLimitOrders(job.data.currency, OrderSide.BUY);
        await this.checkLimitOrders(job.data.currency, OrderSide.SELL);
        break;

      default:
        break;
    }
  }
  async checkLimitOrders(currency: string, side: OrderSide) {
    const cached = await this.redisClient.get(`candle:${currency}:1`);
    if (!cached) return;
    const { close: currentPrice } = JSON.parse(cached);

    const key = `order:limit:${side}:${currency}`;
    let orderIds: string[] = await this.redisClient.zrangebyscore(
      key,
      '-inf',
      currentPrice,
    );
   
    for (const orderId of orderIds) {
        await this.executeLimitOrder(orderId,currentPrice);
        await this.redisClient.zrem(key,orderId);
    }
  }

  private async executeLimitOrder(orderId: string, currentPrice: number) {
    const order = await this.dataSource
      .getRepository(OrderEntity)
      .findOne({ where: { id: orderId } });
    if (!order || order.status !== OrderStatus.OPEN) return;
    await this.dataSource.transaction(async (manager) => {
      const baseWallet = await this.getOrCreateWallet(
        manager,
        order.userId,
        'USD',
      );
      const cryptoWallet = await this.getOrCreateWallet(
        manager,
        order.userId,
        order.currency,
      );
      let volume: Big = Big(0);
      if (order.side === OrderSide.BUY) {
        volume = Big(order.volume).div(currentPrice);
        cryptoWallet.balance = Big(cryptoWallet.balance)
          .plus(volume)
          .toNumber();
      } else if (order.side === OrderSide.SELL) {
        const amountUSD = Big(cryptoWallet.balance).times(currentPrice);
        baseWallet.balance = Big(baseWallet.balance).plus(amountUSD).toNumber();
        cryptoWallet.balance = Big(cryptoWallet.balance)
          .minus(order.volume)
          .toNumber();
      }
      await manager.save(WalletEntity, [baseWallet, cryptoWallet]);
      order.status = OrderStatus.CLOSE;
      order.exitPrice=currentPrice;
      
      console.log('order closed!');
      await manager.save(order);
    });
  }

  private async getOrCreateWallet(
    manager: EntityManager,
    userId: string,
    currency: string,
  ): Promise<WalletEntity> {
    let wallet = await manager
      .createQueryBuilder(WalletEntity, 'w')
      .setLock('pessimistic_write')
      .where('w.userId = :userId AND w.currency = :currency', {
        userId,
        currency,
      })
      .getOne();

    if (!wallet) {
      wallet = manager.create(WalletEntity, {
        userId,
        currency,
        balance: 0,
      });
      await manager.save(wallet);
    }

    return wallet;
  }
}
