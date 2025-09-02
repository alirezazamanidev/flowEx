import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionType } from './enums/type.enum';
import { TransactionStatus } from './enums/status.enum';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { ZarinPalService } from '../http/services/zarinPal.service';
import { DataSource } from 'typeorm';
import { WalletService } from '../wallet/wallet.service';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable({scope:Scope.REQUEST})
export class TransactionService {
  constructor(
    @Inject(REQUEST) private readonly request:Request,
    private readonly zarinPalService: ZarinPalService,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
    private dataSource: DataSource,
  ) {}
  async create(
    manager: EntityManager,
    createTransactionDto: CreateTransactionDto,
  ) {
    const transaction = manager.create(TransactionEntity, {
      userId: createTransactionDto.userId,
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      status: createTransactionDto.status,
      currency: createTransactionDto.currency,
    });
    await manager.save(transaction);
    return transaction;
  }

  async getGatewayUrl(
    {
      amount,
      email,
      paymentId,
    }: { amount: number; email: string; paymentId: string },
    manager: EntityManager,
  ) {
    const { authority } = await this.zarinPalService.sendRequest({
      amount,
      email,
    });
    await manager.update(TransactionEntity, { id: paymentId }, { authority });
    return `${process.env.ZARINPAL_START_PAY_URL}${authority}`;
  }

  async verifyPayment(status: string, authority: string): Promise<string> {
    const transaction = await this.dataSource.manager.findOne(
      TransactionEntity,
      { where: { authority} },
    );
    if (!transaction)
      return `http://frontend.com/payments?status=failed`;
    if (transaction.status !== TransactionStatus.PENDING)
      return `http://frontend.com/payments?status=success`;
    if (status === 'NOK') {
      transaction.status = TransactionStatus.CANCELED;
      await this.dataSource.manager.save(transaction);
      return `http://frontend.com/payments?status=canceled`;
    }
    if (status === 'OK') {
      const { success } = await this.zarinPalService.verify(
        authority,
        transaction.amount,
      );
      if (success) {
        transaction.status = TransactionStatus.COMPLETED;
        await this.dataSource.manager.save(transaction);
        //  charge wallet
        await this.walletService.chargeWallet(transaction.amount,transaction.userId);
        return `http://frontend.com/payments?status=completed`;
      }
    }
    return `http://frontend.com/payments?status=failed`;
  }
}
