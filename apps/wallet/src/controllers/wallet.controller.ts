import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  DepositDto,
  DepositResponse,
  LockFoudsResponse,
  LockFundsRequest,
  verifyPaymentDto,
  VerifyPaymentResponse,
} from '@app/common';
import { TransactionService } from '../services/transaction.service';

@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private transactionService: TransactionService,
  ) {}

  @GrpcMethod('WalletService', 'Deposit')
  deposit(dto: DepositDto): Promise<DepositResponse> {
    return this.walletService.Deposit(dto);
  }
  @GrpcMethod('WalletService', 'VerifyPayment')
  async verifyPayment(dto: verifyPaymentDto): Promise<VerifyPaymentResponse> {
    const url = await this.transactionService.verifyPayment(dto);
    return { url };
  }
  @GrpcMethod('WalletService','LockFunds')
  lockFunds(dto:LockFundsRequest){
    
    return this.walletService.lockFunds(dto)
  }
}
