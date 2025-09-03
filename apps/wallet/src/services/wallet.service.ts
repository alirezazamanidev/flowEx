import type { DepositDto } from '@app/common';
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
