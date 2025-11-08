/**
 * Centralized Enums - 2025 Best Practice
 * All application enums in one place for consistency and maintainability
 */

/**
 * User type enum
 */
export enum UserType {
  CONSUMER = 'consumer',
  BUSINESS = 'business',
}

/**
 * Business category enum matching Prisma schema
 */
export enum BusinessCategory {
  FOOD_BEVERAGE = 'food_beverage', // Restaurants, cafes, bars
  RESTAURANT = 'restaurant',
  GROCERY = 'grocery',
  FASHION = 'fashion',
  SHOES = 'shoes',
  ELECTRONICS = 'electronics',
  HOME_LIVING = 'home_living',
  BEAUTY = 'beauty',
  HEALTH = 'health',
}

/**
 * Subscription tier enum matching Prisma schema
 */
export enum SubscriptionTier {
  FREE = 'free',
  ESSENTIAL = 'essential',
  CHAMPION = 'champion',
  ANCHOR = 'anchor',
}

/**
 * Deal status enum
 */
export enum DealStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  SOLD_OUT = 'sold_out',
}

/**
 * Notification type enum
 */
export enum NotificationType {
  NEW_DEAL = 'new_deal',
  FLASH_DEAL = 'flash_deal',
  DEAL_EXPIRING_SOON = 'deal_expiring_soon',
  NEW_FOLLOWER = 'new_follower',
  NEW_MESSAGE = 'new_message',
  DEAL_REDEEMED = 'deal_redeemed',
  SYSTEM = 'system',
}

/**
 * Redemption type enum
 */
export enum RedemptionType {
  IN_STORE = 'in_store',
  ONLINE = 'online',
  BOTH = 'both',
}

/**
 * Redemption status enum
 */
export enum RedemptionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}
