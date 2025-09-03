import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { GrpcMethod } from '@nestjs/microservices';
import type { DepositDto, DepositResponse,  } from '@app/common';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}


    @GrpcMethod('WalletService', 'Deposit')
  deposit(dto: DepositDto): Promise<DepositResponse> {
  
    return this.walletService.Deposit(dto);
  }
  
}
