/**
 * DeviceToken entity interface
 * Using Prisma for database operations
 */

export interface DeviceToken {
  id: string;
  user_id: string;
  device_token: string;
  device_type: string; // 'ios' | 'android' | 'web'
  device_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
