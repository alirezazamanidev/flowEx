import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { TransactionService } from './services/transaction.service';
import { HttpModule } from '@nestjs/axios';
import { ZarinPalService } from './services/zarinpale.service';

@Module({
  imports: [HttpModule.register({timeout:5000})],
  controllers: [WalletController],
  providers: [WalletService,TransactionService,ZarinPalService],
})
export class WalletModule {}
