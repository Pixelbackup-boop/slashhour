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

export enum BusinessCategory {
  RESTAURANT = 'restaurant',
  GROCERY = 'grocery',
  FASHION = 'fashion',
  SHOES = 'shoes',
  ELECTRONICS = 'electronics',
  HOME_LIVING = 'home_living',
  BEAUTY = 'beauty',
  HEALTH = 'health',
}

export enum SubscriptionTier {
  FREE = 'free',
  ESSENTIAL = 'essential',
  CHAMPION = 'champion',
  ANCHOR = 'anchor',
}

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  owner_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  // Basic info
  @Column({ type: 'varchar', length: 200 })
  business_name: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Essential category
  @Column({
    type: 'enum',
    enum: BusinessCategory,
  })
  category: BusinessCategory;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subcategory?: string;

  // Track when category was last changed (can only change once per month)
  @Column({ type: 'timestamp', nullable: true })
  category_last_changed_at?: Date;

  // Location stored as JSON: {lat: number, lng: number}
  @Column({ type: 'jsonb' })
  location: { lat: number; lng: number };

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state_province?: string;

  @Column({ type: 'varchar', length: 2 })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code?: string;

  // Contact
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website?: string;

  // Operating hours
  @Column({ type: 'jsonb', nullable: true })
  hours?: Record<string, { open: string; close: string; closed?: boolean }>;

  // Media
  @Column({ type: 'text', nullable: true })
  logo_url?: string;

  @Column({ type: 'text', nullable: true })
  cover_image_url?: string;

  @Column({ type: 'jsonb', default: '[]' })
  images: string[];

  // Stats
  @Column({ type: 'integer', default: 0 })
  follower_count: number;

  @Column({ type: 'integer', default: 0 })
  total_deals_posted: number;

  @Column({ type: 'integer', default: 0 })
  total_redemptions: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating: number;

  // Subscription
  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
  })
  subscription_tier: SubscriptionTier;

  @Column({ type: 'timestamp', nullable: true })
  subscription_expires_at?: Date;

  // Verification
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verification_date?: Date;

  // Payment
  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_account_id?: string;

  @Column({ type: 'boolean', default: false })
  payment_enabled: boolean;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
