import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
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
import { WalletService } from './wallet.service';
@Injectable({ scope: Scope.REQUEST })
export class OrderService {
  private logger=new Logger(OrderService.name)
  constructor(
    @Inject(REDIS_CLIENT) private redisClient: Redis,
    private dataSource: DataSource,
    @InjectQueue('order-limit') private orderLimitQueue: Queue,
    private readonly walletService:WalletService,
    @Inject(REQUEST) private request: Request,
  ) {}
  async placeLimitOrder(dto:LimitOrderDto){
    const {side,currency,percentOfWallet,targetPrice}=dto
        return this.dataSource.transaction(async (manager) => {
      let amount: Big;
      if (side === OrderSide.BUY) {
        amount = await this.walletService.lockUsdForBuy(
          manager,
          this.request.user.id,
          percentOfWallet,
        );
      } else {
        amount = await this.walletService.lockCryptoForSell(
          manager,
          this.request.user.id,
          currency,
          percentOfWallet,
        );
      }

      let order = manager.create(OrderEntity, {
        userId: this.request.user.id,
        side,
        type: OrderType.LIMIT,
        status: OrderStatus.OPEN,
        currency,
        amount: amount.toNumber(),
        targetPrice,
      });
      order = await manager.save(order);

      await this.redisClient.zadd(
        `order:limit:${side}:${currency}`,
        targetPrice.toString(),
        order.id,
      );
     
      return {
        message:'سفارش شما باز شد',
        orderId:order.id,
      }
    });
  }


}
