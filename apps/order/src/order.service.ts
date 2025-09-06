import {
  GrpcPackageNames,
  WALLET_SERVICE_NAME,
  WalletServiceClient,
} from '@app/common';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from '@app/common/interfaces/order';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RpcException, type ClientGrpc } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { lastValueFrom } from 'rxjs';
import { REDIS_CLIENT } from '@app/redis';
import Redis from 'ioredis';

@Injectable()
export class OrderService implements OnModuleInit {
  private walletServiceClient: WalletServiceClient;
  constructor(
    private dataSource: DataSource,
    @Inject(GrpcPackageNames.WALLET) private readonly client: ClientGrpc,
    @Inject(REDIS_CLIENT) private readonly redisClient:Redis
  ) {}
  onModuleInit() {
    this.walletServiceClient =
      this.client.getService<WalletServiceClient>(WALLET_SERVICE_NAME);

  
  }
  async createOrder(dto: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { userId, side, percentOfWallet, targetPrice, currency } = dto;

    return await this.dataSource.transaction(async (manager) => {
      const { message, success, amount } = await lastValueFrom(
        this.walletServiceClient.lockFunds({
          userId,
          side,
          percent: percentOfWallet,
          currency,
        }),
      );

      if (!success)
        throw new RpcException({ message, code: HttpStatus.BAD_REQUEST });

      let order = manager.create(OrderEntity, {
        userId,
        currency,
        targetPrice,
        amount,
        side,
      });
      order = await manager.save(order);
      await this.redisClient.zadd(`orderbook:${order.currency}:${order.side}`,targetPrice,order.id);
      return {
        message: 'order created!',
        orderId: order.id,
        success: true,
      };
    });
  }
}
