import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { MarketGateway } from '../market.gateway';
import { Socket } from 'socket.io';

@Injectable()
export class MarketService {
  private readonly redisSub: Redis;
  constructor() {
    this.redisSub = new Redis(process.env.REDIS_URL);
  }


 
  getOneCandle(symbol: string, resolution: string,client:Socket) {
  
    let candle={}
    this.redisSub.subscribe(`candle:${symbol}:${resolution}`);
    this.redisSub.on('message', (channel, message) => {
      candle=JSON.parse(message)
     client.emit('candleInfo',candle);
    });
    return candle
  }
}
