// Shared types for admin panel

export interface Admin {
  id: string;
  email: string;
  username: string;
  name: string;
  role: AdminRole;
  permissions: string[];
}

export type AdminRole = "super_admin" | "moderator" | "support";

export interface User {
  id: string;
  email: string | null;
  username: string;
  name: string | null;
  user_type: string;
  status: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  last_active_at: string;
  _count?: {
    businesses: number;
    user_redemptions: number;
    follows: number;
  };
}

export interface Business {
  id: string;
  business_name: string;
  slug: string;
  category: string;
  is_verified: boolean;
  subscription_tier: string;
  created_at: string;
  owner_id: string;
}

export interface Deal {
  id: string;
  title: string;
  status: string;
  original_price: number;
  discounted_price: number;
  created_at: string;
  expires_at: string;
}

// API Response types (Discriminated Union - 2025 Best Practice)
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; message?: string };

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    totalDeals: number;
    totalRedemptions: number;
    activeUsers: number;
    verifiedBusinesses: number;
    activeDeals: number;
  };
  recentGrowth: {
    newUsers: number;
    newBusinesses: number;
    newDeals: number;
    newRedemptions: number;
  };
}

// Type guards (2025 Best Practice)
export function isAdmin(data: unknown): data is Admin {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "email" in data &&
    "role" in data
  );
}

export function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "username" in data
  );
}
