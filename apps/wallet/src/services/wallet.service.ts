import { DepositDto } from '@app/common';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionService } from './transaction.service';

@Injectable()
export class WalletService {
  constructor(
    private dataSource: DataSource,
    private transactionService: TransactionService,
  ) {}
  async deposit(dto: DepositDto) {
    const { amount, userId } = dto;

    return await this.dataSource.transaction(async (manager) => {
      const gatewayUrl = await this.transactionService.getGatewayUrl(
        manager,
        userId,
        Number(amount),
      );
      return {
        gatewayUrl,
      };
    });
  }
}
