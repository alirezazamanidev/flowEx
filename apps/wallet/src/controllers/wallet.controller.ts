import { Controller, Get } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod('WalletService','deposit')
  deposit(dto){

  }
}
