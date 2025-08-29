import { Inject, Injectable, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
    private transactionService: TransactionService,
  ) {}

  async getOrCreateWallet(userId: string, currency: string) {
    const walletRepo = this.dataSource.getRepository(WalletEntity);
    let wallet = await walletRepo.findOne({ where: { userId, currency } });
    if (!wallet) {
      wallet = walletRepo.create({ userId, currency, balance: 0 });
      await walletRepo.save(wallet);
    }
    return wallet;
  }

  async deposit(depositDto: DepositDto) {
    const { amount } = depositDto;
    return await this.dataSource.transaction(async (manager) => {
      const transaction = await this.transactionService.create(manager, {
        userId: this.request.user.id,
        amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        currency: 'IRR',
      });
      const gatewayUrl = await this.transactionService.getGatewayUrl(
        { amount, email: this.request.user.email ,paymentId:transaction.id},
        manager,
      );
      return {
        gatewayUrl,
      }
    });
  }
}
