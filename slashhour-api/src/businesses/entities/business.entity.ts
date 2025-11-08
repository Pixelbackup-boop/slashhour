import { BusinessCategory, SubscriptionTier } from '../../common/constants';

/**
 * Business entity interface
 * Now using Prisma for database operations - this is kept as a TypeScript type
 */
export { BusinessCategory, SubscriptionTier };
export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  slug: string;
  description?: string;
  category: string;
  subcategory?: string;
  location: { lat: number; lng: number };
  address: string;
  city: string;
  state_province?: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: any;
  logo_url?: string;
  cover_image_url?: string;
  images: Array<{ url: string; caption?: string; order: number }>;
  follower_count: number;
  total_deals_posted: number;
  total_redemptions: number;
  average_rating: number;
  subscription_tier: string;
  subscription_expires_at?: Date;
  is_verified: boolean;
  verification_date?: Date;
  stripe_account_id?: string;
  payment_enabled: boolean;
  created_at: Date;
  updated_at: Date;
  category_last_changed_at?: Date;
}
