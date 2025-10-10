import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('user_redemptions')
export class UserRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Deal)
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  original_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  paid_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  savings_amount: number;

  @Column({ type: 'varchar', length: 50 })
  deal_category: string;

  @CreateDateColumn()
  redeemed_at: Date;
}
