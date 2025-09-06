
import { Column, CreateDateColumn, Entity, Index, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "../common/abstracts/baseEntity.abstract";
import { OrderSide, OrderStatus, OrderType } from "@app/common";


@Entity('order')
@Index('idx_user_currency_status', ['userId', 'currency', 'status'])

export class OrderEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  currency: string;

  @Column({ type: 'enum', enum: OrderSide })
  side: string;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.OPEN })
  status: string
  
  @Column({ type: 'numeric', precision: 30, scale: 10,default:0 })
  amount: number;
  @Column({ type: 'numeric', precision: 30, scale: 10, nullable: true })
  targetPrice: number | null;
  @Column({ type: 'numeric', precision: 30, scale: 10, nullable: true })
  takeProfit: number | null;
  @Column({ type: 'numeric', precision: 30, scale: 10, nullable: true })
  stopLoss: number | null;

  // درصد سود و ضرر محقق شده (بعد از بسته شدن سفارش محاسبه میشه)
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  pnlPercent: number | null;

  // قیمت خروج واقعی (وقتی سفارش بسته شد)
  @Column({ type: 'numeric', precision: 30, scale: 10, nullable: true })
  exitPrice: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
