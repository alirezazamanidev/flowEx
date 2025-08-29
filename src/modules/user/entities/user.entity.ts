import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { TransactionEntity } from 'src/modules/transaction/entities/transaction.entity';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {

  @Column({ unique: true })
  username: string;
  @Column({ unique: true })
  email: string;
  @Column()
  hashedPassword: string;
  @Column({ default: false })
  isEmailVerifyed: boolean;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @OneToMany(() => WalletEntity, (wallet) => wallet.user)
  wallets: WalletEntity[];
  @OneToMany(() => TransactionEntity, (transaction) => transaction.user)
  transactions: TransactionEntity[];
}
