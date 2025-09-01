import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('wallet')
export class WalletEntity extends BaseEntity {
  @Column()
  userId: string;
  @Column({ default: 'USD' })
  currency: string;
  @Column({ type: 'numeric', precision: 30, scale: 10, default: 0 })
  balance: number;
  @Column({ type: 'numeric', precision: 30, scale: 10, default: 0 })
  reserved: number;
  @ManyToOne(() => UserEntity, (user) => user.wallets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
