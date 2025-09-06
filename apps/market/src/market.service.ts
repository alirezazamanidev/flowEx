import type { CandleData, StreamCandlesRequest } from '@app/common';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';
import { Centrifuge, Subscription } from 'centrifuge';
import { Observable, Subject } from 'rxjs';
import { SYMBOLS } from './common/contracts/crypto-symbol';
import { REDIS_CLIENT } from '@app/redis';
import Redis from 'ioredis';

@Injectable()
export class MarketService implements OnModuleInit {
  private client: Centrifuge;
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient:Redis ,
  ) {}
  onModuleInit() {
    this.connect();
  }
  private readonly logger = new Logger(MarketService.name);
  private connect() {
    this.client = new Centrifuge('wss://ws.nobitex.ir/connection/websocket');
    this.client.on('connected', () => {
      this.logger.log('✅ Connected to Nobitex WS');
      this.publishOrderBook();
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
  async publishOrderBook() {
    for (const symbol of SYMBOLS) {
      const channelName = `public:orderbook-${symbol}`;

      let sub = this.client.getSubscription(channelName);
      if (!sub) {
        sub = this.client.newSubscription(channelName);
        sub.subscribe();
      }

      sub.on('publication', async ({ data }) => {
        const orderBook = {
          asks: data.asks ?? [],
          bids: data.bids ?? [],
          lastTradePrice: data.lastTradePrice ?? '0',
          lastUpdate: data.lastUpdate ?? Date.now(),
        };

        // پابلیش در Redis
        await this.redisClient.publish(`orderbook:${symbol}`, JSON.stringify(orderBook));

      });
    }
  }

  StreamCandles(dto: StreamCandlesRequest): Observable<CandleData> {
    const { symbol, resolution } = dto;
    const channelName = `public:candle-${symbol}-${resolution}`;

    let sub = this.client.getSubscription(channelName);
    if (!sub) {
      sub = this.client.newSubscription(channelName);
      sub.subscribe();
    }
    return new Observable((subscriber) => {
      sub.on('publication', ({ data }) => {
        const candle: CandleData = {
          symbol: data.symbol || symbol,
          time: data.t,
          open: data.o ?? 0,
          high: data.h ?? 0,
          low: data.l ?? 0,
          close: data.c ?? 0,
          volume: data.v ?? 0,
        };

        subscriber.next(candle);
      });

      return () => sub.unsubscribe();
    });
  }
}
