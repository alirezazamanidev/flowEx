import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionType } from '../enums/type.enum';
import { TransactionStatus } from '../enums/status.enum';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity('transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true })

  authority: string;
  @Column()
  
  userId: string;
  @Column({ type: 'numeric', precision: 30, scale: 8 })
  amount: number;
  @Column()
  currency: string;
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

}
