import { Module } from '@nestjs/common';
import { EnvConfig } from './configs/env.config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from './configs/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { RedisModule } from './configs/redis.config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
    }),
    RedisModule.forRoot(),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
