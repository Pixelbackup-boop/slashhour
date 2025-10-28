/**
 * Notification entity interface
 * Using Prisma for database operations
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

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: Date;
  sent_at: Date;
  image_url?: string;
  action_url?: string;
  created_at: Date;
}
