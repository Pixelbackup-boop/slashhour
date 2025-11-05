// App Constants
export const APP_NAME = 'Slashhour';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.153:3000/api/v1'  // Use local IP for mobile testing
  : 'https://api.slashhour.com/v1';

// Sentry Configuration
export const SENTRY_DSN = __DEV__
  ? '' // Leave empty in development to avoid noise
  : 'https://db542917e54d740a2074a1cc87254c9d@o4510187433295872.ingest.us.sentry.io/4510187468292096';

// NOTE: CATEGORIES moved to src/constants/categories.ts for centralized management
// Import from there instead: import { CATEGORIES } from '../constants/categories';

// Radius Options (in km)
export const RADIUS_OPTIONS = [2, 3, 5, 10];

// Default Settings
export const DEFAULT_RADIUS = 5;
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_LANGUAGE = 'en';

// Tabs
export const TABS = {
  YOU_FOLLOW: 'you_follow',
  NEAR_YOU: 'near_you',
} as const;

// Deal Status
export const DEAL_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  EXPIRED: 'expired',
  SOLD_OUT: 'sold_out',
} as const;

// Redemption Status
export const REDEMPTION_STATUS = {
  PENDING: 'pending',
  VALIDATED: 'validated',
  EXPIRED: 'expired',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_DEAL: 'new_deal',
  EXPIRING_SOON: 'expiring_soon',
  FLASH_DEAL: 'flash_deal',
  SAVINGS_MILESTONE: 'savings_milestone',
} as const;

// Pagination
export const PAGE_SIZE = 20;

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  FEED: 5 * 60 * 1000, // 5 minutes
  BUSINESS_PROFILE: 30 * 60 * 1000, // 30 minutes
  FOLLOWING: 60 * 60 * 1000, // 1 hour
  CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
};

// Image Sizes
export const IMAGE_SIZES = {
  THUMBNAIL: 150,
  MEDIUM: 400,
  LARGE: 800,
};

// Colors
export const COLORS = {
  PRIMARY: '#FF6B6B',
  SECONDARY: '#4ECDC4',
  SUCCESS: '#6BCB77',
  WARNING: '#FFD93D',
  DANGER: '#F38181',
  LIGHT: '#F8F9FA',
  DARK: '#2C3E50',
  GRAY: '#95A5A6',
};

// Screen Names
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  OTP_VERIFICATION: 'OTPVerification',
  ONBOARDING: 'Onboarding',

  // Main
  HOME: 'Home',
  EXPLORE: 'Explore',
  PROFILE: 'Profile',

  // Deal
  DEAL_DETAIL: 'DealDetail',
  REDEMPTION: 'Redemption',
  SAVED_DEALS: 'SavedDeals',

  // Business
  BUSINESS_PROFILE: 'BusinessProfile',
  CREATE_DEAL: 'CreateDeal',
  BUSINESS_DASHBOARD: 'BusinessDashboard',
  FOLLOWING_LIST: 'FollowingList',

  // Savings
  SAVINGS_TRACKER: 'SavingsTracker',
  INFLATION_DASHBOARD: 'InflationDashboard',
} as const;
