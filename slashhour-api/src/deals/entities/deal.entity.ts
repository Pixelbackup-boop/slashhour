import { DealStatus } from '../../common/constants';

/**
 * Deal entity interface
 * Now using Prisma for database operations - this is kept as a TypeScript type
 */
export { DealStatus };

export interface Deal {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  savings_amount: number;
  category: string;
  tags: string[];
  starts_at: Date;
  expires_at: Date;
  is_flash_deal: boolean;
  visibility_radius_km: number;
  quantity_available?: number;
  quantity_redeemed: number;
  max_per_user: number;
  terms_conditions: string[];
  images: Array<{ url: string; caption?: string; order: number }>;
  view_count_followers: number;
  view_count_nearby: number;
  save_count: number;
  share_count: number;
  status: DealStatus;
  created_at: Date;
  updated_at: Date;
}
