import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { JwtModule } from '@nestjs/jwt';
import { OrderGateway } from './order.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';
import { BullModule } from '@nestjs/bullmq';
import { OrderExecutionService } from './services/order-execution.service';
import { WalletService } from './services/wallet.service';
import { OrderLimitProcessor } from './processors/limit-order.processor';
import { MarketService } from './services/market.service';

@Module({
  imports: [
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL } }),
    TypeOrmModule.forFeature([OrderEntity]),
    JwtModule.register({ global: true }),
    BullModule.registerQueue({
      name: 'order-limit',
    }),
  ],
  controllers: [OrderController],
  providers: [
    OrderGateway,
    OrderService,
    OrderExecutionService,
    WalletService,
    OrderLimitProcessor,
    MarketService,
  ],
})
export class OrderModule {}
