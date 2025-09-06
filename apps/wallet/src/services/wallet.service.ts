import {
  BadRequestMessage,
  OrderSide,
  type DepositDto,
  type LockFoudsResponse,
  type LockFundsRequest,
} from '@app/common';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionService } from './transaction.service';
import { GrpcMethod } from '@nestjs/microservices';
import Big from 'big.js';
import { WalletEntity } from '../entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    private dataSource: DataSource,
    @Inject(forwardRef(() => TransactionService))
    private transactionService: TransactionService,
  ) {}

  async Deposit(dto: DepositDto) {
    const { amount, user } = dto;

    return await this.dataSource.transaction(async (manager) => {
      const gatewayUrl = await this.transactionService.getGatewayUrl(
        manager,
        user.id,
        user.email,
        Number(amount),
      );
      return {
        gatewayUrl,
      };
    });
  }
  async chargeWallet(amountInIRR: number, userId: string) {
    // تبدیل ریال به دلار (یا تتر)
    const usdAmount = new Big(amountInIRR).div(100_000);

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const wallet = await this.getOrCreateWallet(manager, userId, 'USD');

      wallet.balance = new Big(wallet.balance).plus(usdAmount).toNumber();

      return await manager.save(wallet);
    });
  }

  async lockFunds(dto: LockFundsRequest){
    const { side, currency, percent, userId } = dto;

    if (percent <= 0 || percent > 100) {
      return { success: false, message: 'Invalid percent' };
    }
    
    try {
      return await this.dataSource.transaction(async (manager) => {
        let currencyToUse = side === OrderSide.BUY ? 'USD' : currency;

        const wallet = await this.getOrCreateWallet(manager, userId, currencyToUse);
        console.log(wallet)
        const available = Big(wallet.balance).minus(wallet.lockedBalance);
        const amountToUse = available.times(percent).div(100);
        if (amountToUse.lte(0)) {
          return { success: false, message: BadRequestMessage.INSUFFICIENT_WALLET_BALANCE};
        }

        wallet.lockedBalance = Big(wallet.lockedBalance).plus(amountToUse).toNumber();
        await manager.save(wallet);

        return {
          success: true,
          message: 'Funds reserved',
          amount: amountToUse.toNumber(), // string برای حفظ precision
        };
      });
    } catch (err) {
      console.error('LockFunds transaction failed', err);
      return { success: false, message: 'Internal error' };
    }
  }


  private async getOrCreateWallet(
    manager: EntityManager,
    userId: string,
    currency: string,
  ) {
    let wallet = await manager
      .createQueryBuilder(WalletEntity, 'w')
      .setLock('pessimistic_write')
      .where('w.userId = :userId AND w.currency = :currency', {
        userId,
        currency,
      })
      .getOne();

    if (!wallet) {
      wallet = manager.create(WalletEntity, { userId, currency, balance: 0 });
      await manager.save(wallet);
    }

    return wallet;
  }
}
