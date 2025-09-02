
import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('wallet')
export class WalletEntity  extends BaseEntity{


  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string; // BTC, ETH, USDT ...

  @Column({ type: 'numeric', precision: 30, scale: 10, default: 0 })
    balance: number; // مقدار ارز در کیف پول

  @Column({ type: 'numeric', precision: 30, scale: 10, default: 0 })
  lockedBalance: number; // برای سفارشات Limit در حال انتظار

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(()=>UserEntity,user=>user.wallets)
  @JoinColumn({name:'userId'})
  user:UserEntity
}