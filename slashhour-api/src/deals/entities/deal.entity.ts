import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';

export enum DealStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  SOLD_OUT = 'sold_out',
}

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  business_id: string;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  // Deal details
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Pricing for inflation tracking
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  original_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discounted_price: number;

  // These are database-generated columns - readonly
  // TODO: Make these actual generated columns with SQL expressions when PostGIS migration is set up
  @Column({ type: 'integer', insert: false, update: false, select: true, nullable: true, default: 0 })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, insert: false, update: false, select: true, nullable: true, default: 0 })
  savings_amount: number;

  // Category alignment
  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  // Timing (critical for real-time)
  @Column({ type: 'timestamp' })
  starts_at: Date;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_flash_deal: boolean;

  // Location visibility
  @Column({ type: 'integer', default: 5 })
  visibility_radius_km: number;

  // Inventory
  @Column({ type: 'integer', nullable: true })
  quantity_available?: number;

  @Column({ type: 'integer', default: 0 })
  quantity_redeemed: number;

  @Column({ type: 'integer', default: 1 })
  max_per_user: number;

  // Terms
  @Column({ type: 'text', array: true, default: '{}' })
  terms_conditions: string[];

  @Column({ type: 'varchar', length: 7, default: '1111111' })
  valid_days: string; // Mon-Sun bitmap

  // Media
  @Column({ type: 'jsonb', default: '[]' })
  images: Array<{ url: string; caption?: string; order: number }>;

  // Stats
  @Column({ type: 'integer', default: 0 })
  view_count_followers: number;

  @Column({ type: 'integer', default: 0 })
  view_count_nearby: number;

  @Column({ type: 'integer', default: 0 })
  save_count: number;

  @Column({ type: 'integer', default: 0 })
  share_count: number;

  // Status
  @Column({
    type: 'enum',
    enum: DealStatus,
    default: DealStatus.ACTIVE,
  })
  status: DealStatus;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
