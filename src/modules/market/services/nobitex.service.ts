import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Centrifuge } from 'centrifuge';
import { cryptoOrderBookchannels } from '../contracts/crypto-chanell';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import Redis from 'ioredis';
import { MarketGateway } from '../market.gateway';

@Injectable()
export class NobitexRealtimeService implements OnModuleInit {
  private client: Centrifuge;
private readonly MARKET_REFRESH_INTERVAL = process.env.MARKET_REFRESH_INTERVAL;
  private readonly logger = new Logger(NobitexRealtimeService.name);
  private channels = cryptoOrderBookchannels;
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient:Redis,
  private readonly gateway: MarketGateway
){}

  onModuleInit() {
    this.connect();
    this.startBroadcastLoop()
  }

  private connect() {
    this.client = new Centrifuge('wss://ws.nobitex.ir/connection/websocket');

    this.client.on('connected', () => {
      this.logger.log('Connected to Nobitex WebSocket');
    this.subscribeChannels();

      
    });

    this.client.on('disconnected', (ctx) => {
      setTimeout(() => this.connect(), 5000);
      this.logger.warn('Disconnected from Nobitex WS, reconnecting...');
    });

    this.client.on('error', (err) => {
      this.logger.error('WebSocket error: ' + err);
    });

    this.client.connect();
  }

 private subscribeChannels() {
    this.channels.forEach((channel) => {
      const sub = this.client.newSubscription(channel);

      sub.on('publication', async (ctx) => {
        const data = ctx.data;
        const symbol = data.symbol || channel.replace('public:orderbook-', '');

        const marketInfo = {
          symbol,
          lastPrice: data.lastPrice,
          bid: data.bids && data.bids.length ? data.bids[0][0] : null,
          ask: data.asks && data.asks.length ? data.asks[0][0] : null,
          volume: data.bids ? data.bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0) : 0,
        };

        // ذخیره داده در Redis
        await this.redisClient.set(`market:${symbol}`, JSON.stringify(marketInfo));
      });

      sub.subscribe();
      this.logger.log(`Subscribed to ${channel}`);
    });
  }
  private startBroadcastLoop() {
    setInterval(async () => {
      const marketData: any = {};
      for (const channel of this.channels) {
        const symbol = channel.replace('public:orderbook-', '');
        const data = await this.redisClient.get(`market:${symbol}`);
        if (data) {
          marketData[symbol] = JSON.parse(data);
        }
      }
      this.gateway.broadcastMarketUpdate(marketData);
    }, this.MARKET_REFRESH_INTERVAL*1000);
  }
}

