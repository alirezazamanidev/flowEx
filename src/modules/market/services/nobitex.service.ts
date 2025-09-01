import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Centrifuge } from 'centrifuge';
import { CryptoSymbolsUSD } from '../contracts/crypto-chanell';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import Redis from 'ioredis';
import { MarketGateway } from '../market.gateway';
import { CandleService } from './candle.service';
import { CandleType } from '../types/crypto.type';

@Injectable()
export class NobitexRealtimeService implements OnModuleInit {
  private client: Centrifuge;
  private logger = new Logger(NobitexRealtimeService.name);
  private USDSymbols = CryptoSymbolsUSD;
  constructor(private candleService:CandleService,private gateway:MarketGateway){}

  onModuleInit() {
    this.connect();
    this.subscribeAllCandles();
  }

  
  private connect() {
    this.client = new Centrifuge('wss://ws.nobitex.ir/connection/websocket');

    this.client.on('connected', () => {
      this.logger.log('✅ Connected to Nobitex WS');
    });

    this.client.on('disconnected', () => {
      this.logger.warn('⚠️ Disconnected. Reconnecting in 5s...');
      setTimeout(() => this.connect(), 5000);
    });

    this.client.on('error', (err) => {
      this.logger.error('❌ WebSocket error: ' + err);
    });

    this.client.connect();
  }


  async subscribeAllCandles() {
    const resolutions = ['1','3', '5', '60'];
    const channels = this.USDSymbols.flatMap((symbol) =>
      resolutions.map((resolution) => ({
        channel: `public:candle-${symbol}-${resolution}`,
        symbol,
        resolution,
      })),
    );
      for (const chanel of channels) {
      const sub = this.client.newSubscription(chanel.channel);
      sub.on('publication', async ({ data }) => {
        const candle:CandleType = {
          symbol: data.symbol || chanel.symbol,
          time: data.t,
          open: data.o ?? 0,
          high: data.h ?? 0,
          low: data.l ?? 0,
          close: data.c ?? 0,
          volume: data.v ?? 0,
        };

        await this.candleService.save(chanel.symbol,chanel.resolution,candle);
        this.gateway.server.to(`candle:${candle.symbol}:${chanel.resolution}`).emit('candle-info',candle);
      });
      sub.subscribe();
    }
  }
}
