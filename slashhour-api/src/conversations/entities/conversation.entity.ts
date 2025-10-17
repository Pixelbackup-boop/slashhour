import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @Column({ name: 'last_message_text', type: 'text', nullable: true })
  lastMessageText?: string;

  @Column({ name: 'unread_count', type: 'integer', default: 0 })
  unreadCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Business, { eager: true })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
