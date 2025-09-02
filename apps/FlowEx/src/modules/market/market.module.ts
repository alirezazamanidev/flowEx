import { Module } from '@nestjs/common';
import { MarketService } from './services/market.service';
import {NobitexRealtimeService } from './services/nobitex.service';
import { MarketGateway } from './market.gateway';
import { CandleService } from './services/candle.service';

@Module({
  controllers: [],
  providers: [MarketService,NobitexRealtimeService,MarketGateway,CandleService],
})
export class MarketModule {}
