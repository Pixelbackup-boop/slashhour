/**
 * User entity interface
 * Now using Prisma for database operations - this is kept as a TypeScript type
 */
export interface User {
  id: string;
  phone?: string;
  email?: string;
  username: string;
  password?: string;
  name?: string;
  userType: string; // 'consumer' or 'business'
  avatar_url?: string;
  default_location?: { lat: number; lng: number };
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
  created_at: Date;
  updated_at: Date;
  last_active_at: Date;
}
