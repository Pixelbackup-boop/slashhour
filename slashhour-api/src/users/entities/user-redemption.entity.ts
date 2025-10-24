/**
 * UserRedemption entity interface
 * Now using Prisma for database operations - this is kept as a TypeScript type
 */
export interface UserRedemption {
  id: string;
  user_id: string;
  deal_id: string;
  business_id: string;
  original_price: number;
  paid_price: number;
  savings_amount: number;
  deal_category: string;
  redeemed_at: Date;
}
