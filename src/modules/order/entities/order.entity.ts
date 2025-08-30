import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { OrderSide, OrderStatus } from '../enums/order.enum';

@Entity('order')
export class OrderEntity extends BaseEntity {
  @Column()
  userId: string;
  @Column({ type: 'varchar', length: 20 })
  currency: string;
  @Column({ type: 'enum', enum: OrderSide })
  side: OrderSide;
  @Column({type:'enum',enum:OrderStatus})
  status:string
  @Column({
    type: 'numeric',
    precision: 30,
    scale: 10,
    nullable: true,
  })
  price: number;
  @Column({
    type: 'numeric',
    precision: 30,
    scale: 10,
    nullable: true,
  })
  volume: number;
  
  @CreateDateColumn()
  created_at:Date
  @UpdateDateColumn()
  updated_at:Date
}
