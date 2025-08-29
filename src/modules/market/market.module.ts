import { Module } from '@nestjs/common';
import { MarketService } from './services/market.service';
import { MarketController } from './market.controller';
import {NobitexRealtimeService } from './services/nobitex.service';
import { MarketGateway } from './market.gateway';

@Module({
  controllers: [],
  providers: [MarketService,NobitexRealtimeService,MarketGateway],
})
export class MarketModule {}
