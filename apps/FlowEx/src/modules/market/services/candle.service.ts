import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/configs/redis.config";
import { CandleType } from "../types/crypto.type";

@Injectable()
export class CandleService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async save(symbol:string,resolution:string,candle:CandleType){
    const key =`candle:${symbol}:${resolution}`;
    await this.redis.set(key,JSON.stringify(candle));
     await this.redis.publish(key, JSON.stringify(candle));
  }

  async get(symbol: string, resolution: string) {
    const key = `market:candle:${symbol}:${resolution}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
}