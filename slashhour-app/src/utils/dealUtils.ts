import { BusinessCategory } from '../types/models';
import { CATEGORIES } from '../constants/categories';

// Category options for deal creation/editing
// Re-export from centralized categories for consistent UI format
export const DEAL_CATEGORIES: { value: BusinessCategory; label: string }[] =
  CATEGORIES.map(cat => ({ value: cat.id as BusinessCategory, label: cat.label }));

// Valid days options for deal scheduling
export const VALID_DAYS_OPTIONS = [
  { value: 'all', label: 'All Days' },
  { value: 'weekdays', label: 'Weekdays Only' },
  { value: 'weekends', label: 'Weekends Only' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

// Days map for valid_days conversion
const DAYS_MAP: { [key: string]: string } = {
  'all': '1111111',
  'weekdays': '1111100',
  'weekends': '0000011',
  'monday': '1000000',
  'tuesday': '0100000',
  'wednesday': '0010000',
  'thursday': '0001000',
  'friday': '0000100',
  'saturday': '0000010',
  'sunday': '0000001',
};

/**
 * Convert user-friendly valid days to 7-character binary string (Mon-Sun)
 * Format: "1111111" where 1 = valid, 0 = not valid
 * Positions: M T W T F S S
 */
export const convertValidDaysToBinary = (validDays: string): string => {
  return DAYS_MAP[validDays] || '1111111'; // Default to all days
};

/**
 * Convert 7-character binary string to user-friendly valid days format
 */
export const convertBinaryToValidDays = (binary: string | null): string => {
  if (!binary) return 'all';

  // Reverse lookup in the map
  const entry = Object.entries(DAYS_MAP).find(([_, value]) => value === binary);
  return entry ? entry[0] : 'all';
};

/**
 * Calculate savings percentage and amount from prices
 */
export const calculateSavings = (originalPrice: number, discountedPrice: number) => {
  const savings = originalPrice - discountedPrice;
  const percentage = originalPrice > 0 ? (savings / originalPrice) * 100 : 0;

  return {
    savings: savings.toFixed(2),
    percentage: Math.round(percentage),
  };
};

/**
 * Format date for display in deal forms
 */
export const formatDealDate = (date: Date | null): string => {
  if (!date) return 'Select date';
  return date.toLocaleDateString();
};
