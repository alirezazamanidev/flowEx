import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './configs/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from './configs/typeorm.config';
import { RedisModule } from './configs/redis.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
    }),
    RedisModule.forRoot(),
    AuthModule,
    UserModule
  ],
})
export class AppModule {}
