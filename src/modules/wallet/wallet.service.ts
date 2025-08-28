import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';
import { DepositDto } from './dto/deposit.dto';

@Injectable()
export class WalletService {
  constructor(private readonly dataSource: DataSource) {}

  async getOrCreateWallet(userId: string, currency: string) {
    const walletRepo = this.dataSource.getRepository(WalletEntity);
    let wallet = await walletRepo.findOne({ where: { userId, currency } });
    if (!wallet) {
      wallet = walletRepo.create({ userId ,currency,balance:0});
      await walletRepo.save(wallet);
    }
    return wallet;
  }

  async deposit(depositDto: DepositDto) {
    const { amount } = depositDto;
    
   
  }
}
