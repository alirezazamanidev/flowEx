import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionType } from '../common/enums/type.enum';
import { TransactionStatus } from '../common/enums/status.enum';
import { BaseEntity } from '../common/abstracts/baseEntity.abstract';

@Entity('transaction')
export class TransactionEntity extends BaseEntity {
 
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


}
