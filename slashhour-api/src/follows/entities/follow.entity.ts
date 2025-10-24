/**
 * Follow status enum matching Prisma schema
 */
export enum FollowStatus {
  ACTIVE = 'active',
  MUTED = 'muted',
  UNFOLLOWED = 'unfollowed',
}

/**
 * Follow entity interface
 * Now using Prisma for database operations - this is kept as a TypeScript type
 */
export interface Follow {
  id: string;
  user_id: string;
  business_id: string;
  status: string;
  notify_new_deals: boolean;
  notify_flash_deals: boolean;
  followed_at: Date;
  updated_at: Date;
}
