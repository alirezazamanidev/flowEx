import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { EnvConfig } from './configs/env.config';

import { ClientGlobalModule } from './modules/client/client.module';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { MarketModule } from './modules/market/market.module';
@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
    ClientGlobalModule,
    AuthModule,
    WalletModule,
    MarketModule,
  ],
})
export class GatewayModule {}
