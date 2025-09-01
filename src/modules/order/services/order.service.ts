import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import {
  BadRequestMessage,
  NotFoundMessage,
} from 'src/common/enums/messages.enum';
import { WalletEntity } from '../../wallet/entities/wallet.entity';
import { DataSource, EntityManager } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderSide, OrderStatus, OrderType } from '../enums/order.enum';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { LimitOrderDto, MarketOrderDto } from '../dtos/order.dto';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import Redis from 'ioredis';
import Big from 'big.js';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
@Injectable({ scope: Scope.REQUEST })
export class OrderService {
  constructor(
    @Inject(REDIS_CLIENT) private redisClient: Redis,
    private dataSource: DataSource,
    @InjectQueue('order') private OrderLimitQueue: Queue,
    @Inject(REQUEST) private request: Request,
  ) {}
  async placeMarketOrder(dto: MarketOrderDto) {
    const { percentOfWallet, side, currency } = dto;

    return await this.dataSource.transaction(async (manager) => {
      const baseWallet = await this.lockWallet(manager, 'USD');
      const cryptoWallet = await this.getOrCreateWallet(manager, currency);
      const price = await this.getCurrentPrice(currency);
      const priceBig = Big(price);

      let volumeBig: Big = Big(0);
      let amountToUseBig: Big = Big(0);

      if (side === OrderSide.BUY) {
        if (baseWallet.balance <= 0)
          throw new BadRequestException(
            BadRequestMessage.INSUFFICIENT_WALLET_BALANCE,
          );

        amountToUseBig = Big(baseWallet.balance)
          .times(percentOfWallet)
          .div(100);
        volumeBig = amountToUseBig.div(priceBig);

        baseWallet.balance = Big(baseWallet.balance)
          .minus(amountToUseBig)
          .toNumber();
        cryptoWallet.balance = Big(cryptoWallet.balance)
          .plus(volumeBig)
          .toNumber();
      } else if (side === OrderSide.SELL) {
        if (cryptoWallet.balance <= 0)
          throw new BadRequestException(
            BadRequestMessage.INSUFFICIENT_WALLET_BALANCE,
          );

        volumeBig = Big(cryptoWallet.balance).times(percentOfWallet).div(100);
        amountToUseBig = volumeBig.times(priceBig);

        cryptoWallet.balance = Big(cryptoWallet.balance)
          .minus(volumeBig)
          .toNumber();
        baseWallet.balance = Big(baseWallet.balance)
          .plus(amountToUseBig)
          .toNumber();
      }

      await manager.save(baseWallet);
      await manager.save(cryptoWallet);

      // create order
      await manager.insert(OrderEntity, {
        userId: this.request.user.id,
        currency,
        side,
        status: OrderStatus.CLOSE,
        
        volume: volumeBig.toNumber(),
      });

      return {
        message: `${side} order executed successfully`,
      };
    });
  }

  async placeLimitOrder(dto: LimitOrderDto) {
    const { side, percentOfWallet, currency, targetPrice } = dto;
    return await this.dataSource.transaction(async (manager) => {
      const baseWallet = await this.lockWallet(manager, 'USD');
      // const cryptoWallet = await this.lockWallet(manager, currency);
      let volume: Big = Big(0);
      let amountToUse: Big = Big(0);

      if (side === OrderSide.BUY) {
        // محاسبه مقدار دلاری که باید مصرف شود
        amountToUse = Big(baseWallet.balance).times(percentOfWallet).div(100);
        if (amountToUse.lte(0))
          throw new BadRequestException('موجودی کافی نیست');
        volume = amountToUse.div(targetPrice);
        baseWallet.balance = Big(baseWallet.balance).minus(amountToUse).toNumber();
        await manager.save(baseWallet);
      } else if (side === OrderSide.SELL) {
        // فقط بررسی موجودی کریپتو اگر فروش است
        const cryptoWallet = await this.lockWallet(manager, currency);
        volume = Big(cryptoWallet.balance).times(percentOfWallet).div(100);
        if (volume.lte(0)) throw new BadRequestException('موجودی کافی نیست');
        cryptoWallet.balance=Big(cryptoWallet.balance).minus(volume).toNumber();
        await manager.save(cryptoWallet);
      }

      let order = manager.create(OrderEntity, {
        userId: this.request.user.id,
        side,
        type: OrderType.LIMIT,
        status: OrderStatus.OPEN,
        currency,
        volume: volume.toNumber(),
       targetPrice
      });
      order = await manager.save(order);
      await this.redisClient.zadd(
        `order:limit:${side}:${currency}`,
        targetPrice.toString(),
        order.id,
      );

      await this.OrderLimitQueue.add('check.limit-order', {
        currency,
      });
    });
  }

  private async getOrCreateWallet(
    manager: EntityManager,

    currency: string,
  ): Promise<WalletEntity> {
    let wallet = await manager
      .createQueryBuilder(WalletEntity, 'w')
      .setLock('pessimistic_write')
      .where('w.userId = :userId AND w.currency = :currency', {
        userId: this.request.user.id,
        currency,
      })
      .getOne();

    if (!wallet) {
      wallet = manager.create(WalletEntity, {
        userId: this.request.user.id,
        currency,
        balance: 0,
      });
      await manager.save(wallet);
    }

    return wallet;
  }
  private async getCurrentPrice(currency: string): Promise<number> {
    const cached = await this.redisClient.get(`candle:${currency}:5`);
    if (!cached) throw new NotFoundException(`قیمت ارز ${currency} یافت نشد!`);

    const { close } = JSON.parse(cached);
    return close;
  }
  private async lockWallet(
    manager: EntityManager,
    currency: string,
  ): Promise<WalletEntity> {
    const wallet = await manager
      .createQueryBuilder(WalletEntity, 'w')
      .setLock('pessimistic_write') // جلوگیری از race condition
      .where('w.userId = :userId AND w.currency = :currency', {
        userId: this.request.user.id,
        currency,
      })
      .getOne();

    if (!wallet)
      throw new NotFoundException(`کیف پول ${currency} برای کاربر یافت نشد`);
    return wallet;
  }
}
