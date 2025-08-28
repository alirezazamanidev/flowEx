import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionType } from './enums/type.enum';
import { TransactionStatus } from './enums/status.enum';
import { CreateTransactionDto } from './dtos/create-transaction.dto';

@Injectable()
export class TransactionService {
  async create(manager: EntityManager, createTransactionDto: CreateTransactionDto) {
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
}
