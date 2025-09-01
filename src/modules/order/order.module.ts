import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { JwtModule } from '@nestjs/jwt';
import { OrderGateway } from './order.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';
import { BullModule } from '@nestjs/bullmq';
import { OrderWorker } from './services/order.worker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    JwtModule.register({ global: true }),
    BullModule.forRoot({
      connection:{
        url:process.env.REDIS_URL
      }
    }),
       BullModule.registerQueue({
      name: 'order',
    }),
  ],
  controllers: [OrderController],
  providers: [OrderGateway, OrderService,OrderWorker],
})
export class OrderModule {}
