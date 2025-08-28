import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './configs/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from './configs/typeorm.config';
import { RedisModule } from './configs/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
    }),
    RedisModule.forRoot()
  ],
})
export class AppModule {}
