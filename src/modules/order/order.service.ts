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
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { DataSource, EntityManager } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderSide, OrderStatus } from './enums/order.enum';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { ReserveOrderDto } from './dtos/order.dto';

@Injectable({ scope: Scope.REQUEST })
export class OrderService {
  constructor(
    private dataSource: DataSource,
    @Inject(REQUEST) private request: Request,
  ) {}

  async reserveFunds(dto: ReserveOrderDto) {
    const { targetPrice, percentOfWallet, side, currency } = dto;
    return await this.dataSource.transaction(async (manager) => {
      switch (side) {
        case OrderSide.BUY:
          await this.reserveForBuy(manager, {
            targetPrice,
            percentOfWallet,
            currency,
          });
          return 'order buy';
        case OrderSide.SELL:
          await this.reserveForSell(manager, {
            targetPrice,
            percentOfWallet,
            currency,
          });
          return 'order sell';

        default:
          break;
      }
    });
  }

  private async completeBuy(
    userId: string,
    buyCurrency: string,
    amountBought: number,
    totalPrice: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const baseWallet = await manager
        .createQueryBuilder(WalletEntity, 'bw')
        .setLock('pessimistic_write')
        .where('bw.userId = :userId AND bw.currency= :currency', {
          userId,
          currency: 'USD',
        })
        .getOne();
      if (!baseWallet) throw new NotFoundException(NotFoundMessage.Wallet);
      baseWallet.reserved = Number(baseWallet?.reserved) - totalPrice;
      await manager.save(baseWallet);

      let buyWallet = await manager
        .createQueryBuilder(WalletEntity, 'w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId AND w.currency = :currency', {
          userId,
          currency: buyCurrency,
        })
        .getOne();
      if (!buyWallet) {
        buyWallet = manager.create(WalletEntity, {
          userId,
          currency: buyCurrency,
          balance: 0,
        });
      }
      buyWallet.balance = Number(buyWallet.balance) + amountBought;
      await manager.save(buyWallet);
    });
  }
  private async completeSell(
    userId: string,
    sellCurrency: string, // ارزی که فروخته می‌شود

    amountSold: number,
    totalPrice: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // کم کردن ارز فروخته شده از رزرو
      const sellWallet = await manager
        .createQueryBuilder(WalletEntity, 'w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId AND w.currency = :currency', {
          userId,
          currency: sellCurrency,
        })
        .getOne();
      if (!sellWallet) throw new NotFoundException(NotFoundMessage.Wallet);

      sellWallet.reserved = Number(sellWallet.reserved) - amountSold;
      await manager.save(sellWallet);

      // اضافه کردن معادل دلاری به کیف پول USD
      let baseWallet = await manager
        .createQueryBuilder(WalletEntity, 'w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId AND w.currency = :currency', {
          userId,
          currency: 'USD',
        })
        .getOne();

      if (!baseWallet) {
        baseWallet = manager.create(WalletEntity, {
          userId,
          currency: 'UDS',
          balance: 0,
        });
      }

      baseWallet.balance = Number(baseWallet.balance) + totalPrice;
      await manager.save(baseWallet);
    });
  }
  private async reserveForBuy(
    manager: EntityManager,
    {
      targetPrice,
      percentOfWallet,
      currency

    }: { targetPrice: number; percentOfWallet: number; currency: string },
  ) {
    const wallet = await manager
      .createQueryBuilder(WalletEntity, 'w')
      .setLock('pessimistic_write')
      .where('w.userId = :userId AND w.currency = :currency', {
        userId: this.request.user.id,
        currency:'USD',
      })
      .getOne();

    if (!wallet) throw new NotFoundException(NotFoundMessage.Wallet);
    const amountToReserve = (percentOfWallet / 100) * wallet.balance;
    const volume = amountToReserve / targetPrice;

    wallet.balance = wallet.balance - amountToReserve;
    wallet.reserved = Number(wallet.reserved) + amountToReserve;
    await manager.save(wallet);
    await manager.insert(OrderEntity, {
      userId: this.request.user.id,
      currency,
      volume,
      price: targetPrice,
      status: OrderStatus.OPEN,
      side: OrderSide.SELL,
    });
  }
  private async reserveForSell(
    manager: EntityManager,
    {
      targetPrice,
      percentOfWallet,
      currency,
    }: { targetPrice: number; percentOfWallet: number; currency: string },
  ) {
    const wallet = await manager
      .createQueryBuilder(WalletEntity, 'w')
      .setLock('pessimistic_write')
      .where('w.userId = :userId AND w.currency = :currency', {
        userId: this.request.user.id,
        currency,
      })
      .getOne();

    if (!wallet) throw new NotFoundException(NotFoundMessage.Wallet);
    const amountToReserve = (percentOfWallet / 100) * wallet.balance;
    const volume = amountToReserve / targetPrice;
    wallet.balance = wallet.balance - amountToReserve;
    wallet.reserved = Number(wallet.reserved) + amountToReserve;
    await manager.save(wallet);
    await manager.insert(OrderEntity, {
      userId: this.request.user.id,
      currency,
      status: OrderStatus.OPEN,
      volume,
      price: targetPrice,
      side: OrderSide.SELL,
    });
  }
}
