import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WalletService } from './wallet.service';
import { OrderSide, OrderStatus } from '../enums/order.enum';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';
import Big from 'big.js';
import { OrderEntity } from '../entities/order.entity';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { OrderGateway } from '../order.gateway';
@Injectable()
export class OrderExecutionService {
  private logger = new Logger(OrderExecutionService.name);
  constructor(
    private dataSource: DataSource,
    private walletService: WalletService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    @InjectQueue('order-limit') private orderLimitQueue: Queue,
    private gateway: OrderGateway,
  ) {}

  async checkLimitOrders(currency: string, side: string) {
    const cached = await this.redisClient.get(`candle:${currency}:1`);
    if (!cached) return;
    const { close: currentPrice } = JSON.parse(cached);
    const key = `order:limit:${side}:${currency}`;
    let orderIds: string[] = [];
    if (side === OrderSide.BUY) {
      orderIds = await this.redisClient.zrangebyscore(
        key,
        '-inf',
        currentPrice,
      );
    } else if (side === OrderSide.SELL) {
      orderIds = await this.redisClient.zrangebyscore(
        key,
        currentPrice,
        '+inf',
      );
    }

    for (const orderId of orderIds) {
      await this.orderLimitQueue.add('execute-limit-order', {
        orderId,
        currentPrice,
      });
    }
  }
  async executeLimitOrder(orderId: string, currentPrice: number) {
    const order = await this.dataSource
      .getRepository(OrderEntity)
      .findOne({ where: { id: orderId } });
    if (!order || order.status !== OrderStatus.OPEN) return;

    await this.dataSource.transaction(async (manager) => {
      const baseWallet = await this.walletService.getOrCreateWallet(
        manager,
        order.userId,
        'USD',
      );
      const cryptoWallet = await this.walletService.getOrCreateWallet(
        manager,
        order.userId,
        order.currency,
      );

      if (order.side === OrderSide.BUY) {
        const volume = Big(order.amount).div(currentPrice);
        cryptoWallet.balance = Big(cryptoWallet.balance)
          .plus(volume)
          .toNumber();
        baseWallet.balance = Big(baseWallet.balance)
          .minus(order.amount)
          .toNumber();
        baseWallet.lockedBalance = Big(baseWallet.lockedBalance)
          .minus(order.amount)
          .toNumber();
        order.pnlPercent = 0;
      } else if (order.side === OrderSide.SELL) {
        const usdReceived = Big(order.amount).mul(currentPrice);
        cryptoWallet.balance = Big(cryptoWallet.balance)
          .minus(order.amount)
          .toNumber();
        cryptoWallet.lockedBalance = Big(cryptoWallet.lockedBalance)
          .minus(order.amount)
          .toNumber();
        baseWallet.balance = Big(baseWallet.balance)
          .plus(usdReceived)
          .toNumber();
        order.pnlPercent = order.targetPrice
          ? usdReceived
              .minus(Big(order.targetPrice).mul(order.amount))
              .div(Big(order.targetPrice).mul(order.amount))
              .times(100)
              .toNumber()
          : 0;
      }

      await manager.save(WalletEntity, [baseWallet, cryptoWallet]);
      order.status = OrderStatus.CLOSE;
      order.exitPrice = currentPrice;
      await manager.save(order);
      await this.redisClient.zrem(
        `order:limit:${order.side}:${order.currency}`,
        order.id,
      );
      this.gateway.server.to(order.userId).emit('order-closed', {
        message: 'سفارش شما بسته شد',
        order,
      });
    });
  }
}
