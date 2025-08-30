import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BadRequestMessage,
  NotFoundMessage,
} from 'src/common/enums/messages.enum';
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { DataSource } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderSide, OrderStatus } from './enums/order.enum';

@Injectable()
export class OrderService {
  constructor(private dataSource: DataSource) {}

  async reserveFunds(
    userId: string,
    currency: string,
    amount: number,
    side: OrderSide,
    volume: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const wallet = await manager
        .createQueryBuilder(WalletEntity, 'w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId AND w.currency = :currency', {
          userId,
          currency,
        })
        .getOne();
      if (!wallet) throw new NotFoundException(NotFoundMessage.Wallet);
      // check balance
      const totalPrice = amount * volume;
      if (Number(wallet.balance) < totalPrice)
        throw new BadRequestException(
          BadRequestMessage.INSUFFICIENT_WALLET_BALANCE,
        );
      wallet.balance = Number(wallet.balance) - totalPrice;
      wallet.reserved = Number(wallet.balance) + totalPrice;
      await manager.save(wallet);
      // create order
        const order = manager.create(OrderEntity, {
      userId,
      currency,
      side,
      amount,
      volume,
      status: 'OPEN',
    });
    await manager.save(order);
      return wallet;
    });
  }

  async completeBuy(
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
  async completeSell(
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
}
