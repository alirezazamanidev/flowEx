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
import { ReserveOrderDto } from '../dtos/order.dto';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import Redis from 'ioredis';

@Injectable({ scope: Scope.REQUEST })
export class OrderService {
  constructor(
    @Inject(REDIS_CLIENT) private redisCleint: Redis,
    private dataSource: DataSource,
    @Inject(REQUEST) private request: Request,
  ) {}

  async reserveOrder(dto: ReserveOrderDto) {
    const {
      type,
      side,
      currency,
      targetPrice,
      stopLoss,
      percentOfWallet,
      takeProfit,
    } = dto;
    return await this.dataSource.transaction(async (manager) => {
      if (type === OrderType.MARKET) {
        return await this.orderMarket(manager, {
          percentOfWallet,
          currency,
          side,
          takeProfit,
          stopLoss,
        });
      }
    });
  }
  async orderMarket(
    manager: EntityManager,
    {
      percentOfWallet,
      currency,
      side,
      takeProfit,
      stopLoss,
    }: {
      percentOfWallet: number;
      currency: string;
      side: string;
      takeProfit?: number;
      stopLoss?: number;
    },
  ) {
    if (side == OrderSide.BUY) {
      const baseWallet = await manager
        .createQueryBuilder(WalletEntity, 'w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId AND w.currency = :currency', {
          userId: this.request.user.id,
          currency: 'USD',
        })
        .getOne();
      if (!baseWallet) throw new NotFoundException(NotFoundMessage.Wallet);
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
      }
      const cryptoCached = await this.redisCleint.get(`candle:${currency}:5`);
      if (!cryptoCached) throw new NotFoundException('ارز مورد نظر یافت نشد');
      const { close: cryptoPrice } = JSON.parse(cryptoCached);
      const amountReserved = (percentOfWallet / 100) * baseWallet.balance;
      const volume = amountReserved / cryptoPrice;
      wallet.balance += volume;
      baseWallet.balance -= amountReserved;
      await manager.save(wallet);
      await manager.save(baseWallet);
      await manager.insert(OrderEntity, {
        userId: this.request.user.id,
        currency,
        price: cryptoPrice,
        side,
        type: OrderType.MARKET,
        volume,
        takeProfit,
        stopLoss,
      });
      return {
        message: 'خرید انجام شد!',
      };
    }
  }
}
