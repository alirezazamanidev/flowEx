import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionStatus } from '../common/enums/status.enum';
import { TransactionType } from '../common/enums/type.enum';
import { TransactionEntity } from '../entities/transaction.entity';
import { ZarinPalService } from './zarinpale.service';

@Injectable()
export class TransactionService {
  constructor(private readonly zarinpalService: ZarinPalService) {}

  async create(manager: EntityManager, userId: string, amount: number) {
    const transaction = manager.create(TransactionEntity, {
      userId,
      amount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      currency: 'IRR',
    });
    await manager.save(transaction);
    return transaction;
  }
  async getGatewayUrl(
    manager: EntityManager,
    userId:string,
    email: string,
    amount: number,
  ) {
    // create transaction
    const transaction = await this.create(manager, userId, amount);
    // create gateway url
    const { authority } = await this.zarinpalService.sendRequest(amount, email);
    await manager.update(TransactionEntity, { id: transaction.id }, { authority });
    return `${process.env.ZARINPAL_START_PAY_URL}${authority}`;
  }
}
