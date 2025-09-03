import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { TransactionService } from './services/transaction.service';
import { HttpModule } from '@nestjs/axios';
import { ZarinPalService } from './services/zarinpale.service';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './configs/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from './configs/typeorm.config';
import { TransactionEntity } from './entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
    }),

    TypeOrmModule.forFeature([TransactionEntity]),
    HttpModule.register({ timeout: 5000 }),
  ],
  controllers: [WalletController],
  providers: [WalletService, TransactionService, ZarinPalService],
})
export class WalletModule {}
