import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { OrderSide, OrderStatus, OrderType } from '../enums/order.enum';

@Entity('order')
export class OrderEntity extends BaseEntity {
  @Column()
  userId: string;
  @Column({ type: 'enum', enum: OrderType })
  type: string;
  @Column({ type: 'varchar', length: 20 })
  currency: string;
  @Column({ type: 'enum', enum: OrderSide })
  side: string;
  @Column({ type: 'enum', enum: OrderStatus })
  status: string;
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  plsn: number; // درصد سود و ضرر
  @Column({
    type: 'numeric',
    precision: 30,
    scale: 10,
    nullable: true,
  })
  @Column({ type: 'numeric', precision: 30, scale: 10, nullable: true })
  takeProfit: number;
  @Column({ type: 'numeric', precision: 30, scale: 10, nullable: true })
  stopLoss: number;
  price: number;
  @Column({
    type: 'numeric',
    precision: 30,
    scale: 10,
    nullable: true,
  })
  volume: number;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
