import { Module } from '@nestjs/common';

import { MarketService } from './market.service';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './configs/env.config';
import { RedisModule } from '@app/redis';
import { MarketController } from './market.controller';

@Module({
  imports: [
    RedisModule.forRoot({url:process.env.REDIS_URL || 'redis://localhost:6379'}),
    ConfigModule.forRoot(EnvConfig)
  ],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
