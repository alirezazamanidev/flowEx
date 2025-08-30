import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderSide, OrderStatus } from '../enums/order.enum';
import { Socket } from 'socket.io';

@Injectable()
export class OrderStreamService {
  private readonly redisSub: Redis;
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {
    this.redisSub = new Redis(process.env.REDIS_URL);
  }
  async updateOrders(userId: string, client: Socket) {
    // سفارش‌های باز کاربر
    const orders = await this.orderRepository.find({
      where: { status: OrderStatus.OPEN, userId },
    });
    if (orders.length === 0) return;
    const ordersByCurrency: Record<string, typeof orders> = {};
    for (const order of orders) {
      if (!ordersByCurrency[order.currency]) {
        ordersByCurrency[order.currency] = [];
        this.redisSub.subscribe(`candle:${order.currency}:5`);
      }
      ordersByCurrency[order.currency].push(order);
    }
    this.redisSub.on('message', (channel, message) => {
      const data = JSON.parse(message);
      const { close: currentPrice, symbol } = data;

      const currency = symbol;
      const relatedOrders = ordersByCurrency[currency];
      if (!relatedOrders) return;

      for (const order of relatedOrders) {
        let pnlPercent = 0;

        if (order.side === OrderSide.BUY) {
          pnlPercent =
            ((currentPrice - Number(order.price)) / Number(order.price)) * 100;
        } else if (order.side === OrderSide.SELL) {
          pnlPercent =
            ((Number(order.price) - currentPrice) / Number(order.price)) * 100;
        }

        client.emit('update-order', {
          orderId: order.id,
          currency: order.currency,
          entryPrice: order.price,
          currentPrice,
          pnlPercent: Number(pnlPercent.toFixed(2)),
        });
      }
    });

    console.log('Subscribed and streaming live orders...');
  }
}
