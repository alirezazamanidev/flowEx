import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionType } from './enums/type.enum';
import { TransactionStatus } from './enums/status.enum';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { ZarinPalService } from '../http/services/zarinPal.service';

@Injectable()
export class TransactionService {
    constructor(private readonly zarinPalService: ZarinPalService) {}
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

  async getGatewayUrl({amount,email,paymentId}:{amount:number,email:string,paymentId:string},manager: EntityManager) {
    const {authority}=await this.zarinPalService.sendRequest({amount,email})
    await manager.update(TransactionEntity,{id:paymentId},{authority});
    return `${process.env.ZARINPAL_START_PAY_URL}/${authority}`;
  }
}
