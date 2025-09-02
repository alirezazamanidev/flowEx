import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { EnvConfig } from './configs/env.config';
@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
  ],
})
export class GatewayModule {}
