import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string;

  @Column({ name: 'user_type', type: 'varchar', length: 20, default: 'consumer' })
  userType: string; // 'consumer' or 'business'

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url?: string;

  // Location stored as JSON: {lat: number, lng: number}
  @Column({ type: 'jsonb', nullable: true })
  default_location?: { lat: number; lng: number };

  @Column({ type: 'integer', default: 5 })
  default_radius_km: number;

  // Preferences
  @Column({ type: 'text', array: true, default: '{}' })
  preferred_categories: string[];

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'America/New_York' })
  timezone: string;

  // Inflation tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthly_savings_goal?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 7.5 })
  inflation_rate_reference: number;

  // Status
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_active_at: Date;
}
