import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { EnvConfig } from './configs/env.config';

import { ClientGlobalModule } from './modules/client/client.module';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
    ClientGlobalModule,
    AuthModule,
    WalletModule,
  ],
})
export class GatewayModule {}
