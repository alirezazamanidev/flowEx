import type { DepositDto } from '@app/common';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionService } from './transaction.service';
import { GrpcMethod } from '@nestjs/microservices';

@Injectable()
export class WalletService {
  constructor(
    private dataSource: DataSource,
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
}
