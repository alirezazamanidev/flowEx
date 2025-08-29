import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';
import { DepositDto } from './dto/deposit.dto';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/enums/type.enum';
import { TransactionStatus } from '../transaction/enums/status.enum';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class WalletService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => TransactionService))
    private transactionService: TransactionService,
  ) {}

  async getOrCreateWallet(
    userId: string,
    currency: string,
    manager: EntityManager,
  ) {
    let wallet = await manager.findOne(WalletEntity, {
      where: { userId, currency },
    });
    if (!wallet) {
      wallet = manager.create(WalletEntity, { userId, currency, balance: 0 });
      wallet = await manager.save(wallet);
    }
    return wallet;
  }

  async deposit(depositDto: DepositDto) {
    const { amount } = depositDto;

    return await this.dataSource.transaction(async (manager) => {
      const transaction = await this.transactionService.create(manager, {
        amount,
        userId: this.request.user.id,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        currency: 'IRR',
      });
      const gatewayUrl = await this.transactionService.getGatewayUrl(
        { amount, email: this.request.user.email, paymentId: transaction.id },
        manager,
      );
      return {
        gatewayUrl,
      };
    });
  }

async chargeWallet(amount: number, userId: string): Promise<WalletEntity> {
  return await this.dataSource.transaction(async (manager) => {
    // دریافت یا ایجاد کیف پول USD
    const wallet = await this.getOrCreateWallet(userId, 'USD', manager);

    // تبدیل balance از string به number
    const currentBalance = parseFloat(wallet.balance as any); // TypeORM numeric → string

    // تبدیل ریال به USD
    const usdAmount = parseFloat((amount / 100_000).toFixed(8));

    // جمع و rounding
    wallet.balance = parseFloat((currentBalance + usdAmount).toFixed(8));

    // ذخیره والت
    return await manager.save(wallet);
  });
}

}
