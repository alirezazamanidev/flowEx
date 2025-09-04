import { DynamicModule, Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';
@Global()
@Module({})
export class RedisModule {
  static forRoot({url}:{url:string}): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_CLIENT,
          useFactory: () => {
            return new Redis(url);
          },
        },
      ],
      exports: [REDIS_CLIENT],
    };
  }
}
