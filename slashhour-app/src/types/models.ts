// Core Type Definitions

export interface User {
  id: string;
  phone?: string;
  email?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  default_location?: Location;
  default_radius_km: number;
  preferred_categories: string[];
  language: string;
  currency: string;
  timezone: string;
  monthly_savings_goal?: number;
  inflation_rate_reference: number;
  status: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  slug: string;
  description?: string;
  category: BusinessCategory;
  subcategory?: string;
  location: Location;
  address: string;
  city: string;
  state_province?: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: BusinessHours;
  logo_url?: string;
  cover_image_url?: string;
  images: string[];
  follower_count: number;
  total_deals_posted: number;
  total_redemptions: number;
  average_rating: number;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  is_verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export type BusinessCategory =
  | 'restaurant'
  | 'grocery'
  | 'fashion'
  | 'shoes'
  | 'electronics'
  | 'home_living'
  | 'beauty'
  | 'health';

export type SubscriptionTier = 'free' | 'essential' | 'champion' | 'anchor';

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

export interface Deal {
  id: string;
  business_id: string;
  business?: Business;
  title: string;
  description?: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  savings_amount: number;
  category: BusinessCategory;
  tags: string[];
  starts_at: string;
  expires_at: string;
  is_flash_deal: boolean;
  visibility_radius_km: number;
  quantity_available?: number;
  quantity_redeemed: number;
  max_per_user: number;
  terms_conditions: string[];
  valid_days: string;
  images: DealImage[];
  view_count_followers: number;
  view_count_nearby: number;
  save_count: number;
  share_count: number;
  status: DealStatus;
  created_at: string;
  updated_at: string;
  // Computed fields
  distance_km?: number;
  distance_text?: string;
  walking_time?: string;
  direction?: string;
  is_following?: boolean;
  is_new?: boolean;
  time_remaining?: string;
  user_interaction?: {
    is_saved: boolean;
    can_redeem: boolean;
  };
}

export interface DealImage {
  url: string;
  caption?: string;
  order: number;
}

export type DealStatus = 'active' | 'paused' | 'expired' | 'sold_out';

export interface Follow {
  id: string;
  user_id: string;
  business_id: string;
  notifications_enabled: boolean;
  notification_types: {
    new_deal: boolean;
    expiring: boolean;
    flash: boolean;
  };
  last_viewed_at?: string;
  deals_viewed_count: number;
  deals_redeemed_count: number;
  created_at: string;
}

export interface Redemption {
  id: string;
  deal_id: string;
  user_id: string;
  business_id: string;
  redemption_code: string;
  qr_code_data: string;
  validated_at?: string;
  validated_by?: string;
  original_price: number;
  discounted_price: number;
  amount_saved: number;
  status: RedemptionStatus;
  expires_at: string;
  created_at: string;
}

export type RedemptionStatus = 'pending' | 'validated' | 'expired';

export interface Category {
  id: number;
  key: string;
  name: string;
  icon: string;
  parent_id?: number;
  order_index: number;
  is_essential: boolean;
  color?: string;
}

export interface SavingsTracker {
  id: string;
  user_id: string;
  redemption_id: string;
  amount_saved: number;
  category: BusinessCategory;
  business_name: string;
  month: string;
  year: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  deal_id?: string;
  business_id?: string;
  channels: {
    push: boolean;
    in_app: boolean;
  };
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export type NotificationType =
  | 'new_deal'
  | 'expiring_soon'
  | 'flash_deal'
  | 'savings_milestone';

export interface FeedResponse {
  deals: Deal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  new_deals_count?: number;
}

export interface NearbyFeedResponse extends FeedResponse {
  user_location: Location & {
    radius_km: number;
  };
  total_in_radius: number;
  categories_summary: {
    [key: string]: number;
  };
}
