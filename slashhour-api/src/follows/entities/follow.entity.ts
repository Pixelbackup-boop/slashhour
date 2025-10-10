import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';

export enum FollowStatus {
  ACTIVE = 'active',
  MUTED = 'muted',
  UNFOLLOWED = 'unfollowed',
}

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  business_id: string;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({
    type: 'enum',
    enum: FollowStatus,
    default: FollowStatus.ACTIVE,
  })
  status: FollowStatus;

  @Column({ type: 'boolean', default: true })
  notify_new_deals: boolean;

  @Column({ type: 'boolean', default: false })
  notify_flash_deals: boolean;

  @CreateDateColumn()
  followed_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
