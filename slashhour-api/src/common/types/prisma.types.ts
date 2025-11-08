/**
 * Prisma Type Definitions
 * Type-safe interfaces for Prisma operations following 2025 best practices
 */

import { DealStatus } from '../../deals/entities/deal.entity';
import { FollowStatus } from '../../follows/entities/follow.entity';
import type { Prisma } from '../../../generated/prisma';

/**
 * User-related Prisma types
 */
export interface PrismaUserCreateInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  user_type: string;
  username: string;
  avatar_url?: string;
  default_location?: Prisma.InputJsonValue; // Prisma JSON type (2025 best practice)
  default_radius_km?: number;
  notify_nearby_deals?: boolean;
  preferred_categories?: string[];
  language?: string;
  currency?: string;
  timezone?: string;
  monthly_savings_goal?: number;
  inflation_rate_reference?: number;
  status?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  scheduled_deletion_date?: Date | null;
}

export interface PrismaUserUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  default_location?: Prisma.InputJsonValue; // Prisma JSON type (2025 best practice)
  default_radius_km?: number;
  notify_nearby_deals?: boolean;
  preferred_categories?: string[];
  language?: string;
  currency?: string;
  timezone?: string;
  monthly_savings_goal?: number;
  inflation_rate_reference?: number;
  status?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  scheduled_deletion_date?: Date | null;
}

/**
 * Deal-related Prisma types
 */
export interface PrismaDealCreateInput {
  business_id: string;
  title: string;
  description?: string;
  original_price: number;
  discounted_price: number;
  discount_percentage?: number;
  category: string;
  tags?: string[];
  starts_at: Date;
  expires_at: Date;
  is_flash_deal?: boolean;
  visibility_radius_km?: number;
  quantity_available?: number;
  quantity_redeemed?: number;
  max_per_user?: number;
  terms_conditions?: string[];
  images?: Array<{ url: string; order: number }>;
  status?: DealStatus;
}

export interface PrismaDealUpdateInput {
  title?: string;
  description?: string;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  category?: string;
  tags?: string[];
  starts_at?: Date;
  expires_at?: Date;
  is_flash_deal?: boolean;
  visibility_radius_km?: number;
  quantity_available?: number;
  quantity_redeemed?: number;
  max_per_user?: number;
  terms_conditions?: string[];
  images?: Array<{ url: string; order: number }>;
  status?: DealStatus;
}

/**
 * Business-related Prisma types
 */
export interface PrismaBusinessCreateInput {
  owner_id: string;
  business_name: string;
  slug: string;
  category: string;
  location: unknown; // Prisma Json type - { lat: number, lng: number }
  address?: string;
  city?: string;
  state_province?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  hours?: unknown; // Prisma Json type
  social_media?: unknown; // Prisma Json type
}

/**
 * Follow-related Prisma types
 */
export interface PrismaFollowCreateInput {
  user_id: string;
  business_id: string;
  status?: FollowStatus;
  notification_preferences?: unknown; // Prisma Json type
}

export interface PrismaFollowUpdateInput {
  status?: FollowStatus;
  notification_preferences?: unknown; // Prisma Json type
}

/**
 * Notification-related Prisma types
 */
export interface PrismaNotificationCreateInput {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: unknown; // Prisma Json type
  image_url?: string;
  is_read?: boolean;
}

/**
 * Conversation-related Prisma types
 */
export interface PrismaConversationCreateInput {
  user_id: string;
  business_id: string;
  last_message?: string;
  last_message_at?: Date;
  unread_count?: number;
}

/**
 * Type guard utilities
 */
export class PrismaTypeGuards {
  static isValidDealStatus(status: unknown): status is DealStatus {
    return (
      typeof status === 'string' &&
      Object.values(DealStatus).includes(status as DealStatus)
    );
  }

  static isValidFollowStatus(status: unknown): status is FollowStatus {
    return (
      typeof status === 'string' &&
      Object.values(FollowStatus).includes(status as FollowStatus)
    );
  }
}
