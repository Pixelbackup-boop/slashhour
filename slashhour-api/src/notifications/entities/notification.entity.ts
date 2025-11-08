import { NotificationType } from '../../common/constants';

/**
 * Notification entity interface
 * Using Prisma for database operations
 */
export { NotificationType };

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
