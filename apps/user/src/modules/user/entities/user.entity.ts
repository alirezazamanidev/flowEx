
import { BaseEntity } from 'apps/user/src/common/abstracts/baseEntity.abstract';
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

}
