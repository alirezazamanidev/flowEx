import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';
import { DepositDto } from './dto/deposit.dto';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/enums/type.enum';
import { TransactionStatus } from '../transaction/enums/status.enum';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import {
  BadRequestMessage,
  NotFoundMessage,
} from 'src/common/enums/messages.enum';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import Big from 'big.js';

@Injectable({})
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
  async chargeWallet(amountInIRR: number,userId: string) {
    // تبدیل ریال به دلار (یا تتر)
    const usdAmount = new Big(amountInIRR).div(100_000);

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const wallet = await this.getOrCreateWallet(userId, 'USD', manager);

      wallet.balance = new Big(wallet.balance).plus(usdAmount).toNumber();
      
      return await manager.save(wallet);
    });
  }
}
