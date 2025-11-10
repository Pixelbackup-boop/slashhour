/**
 * Centralized Category Configuration
 * Single source of truth for all categories in the app
 *
 * Add or remove categories here, and they'll automatically update in:
 * - Search screen filters
 * - Notification settings
 * - Feed filters
 * - Any other category-dependent UI
 *
 * Future: This can be fetched from admin API instead of hardcoded
 */

import { IconName } from '../components/icons';

export interface Category {
  id: string;
  label: string;
  icon: IconName;
  description?: string;
}

/**
 * Master list of all available categories
 * To add a new category: Add it here
 * To remove a category: Remove it from here
 * Changes will automatically propagate throughout the app
 */
export const CATEGORIES: Category[] = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    icon: 'building',
    description: 'Restaurants, cafes, and eateries',
  },
  {
    id: 'grocery',
    label: 'Grocery',
    icon: 'cart',
    description: 'Supermarkets and grocery stores',
  },
  {
    id: 'fashion',
    label: 'Fashion',
    icon: 'shopping-bag',
    description: 'Clothing and accessories',
  },
  {
    id: 'shoes',
    label: 'Shoes',
    icon: 'shopping-bag',
    description: 'Footwear and shoe stores',
  },
  {
    id: 'electronics',
    label: 'Electronics',
    icon: 'lightning',
    description: 'Tech gadgets and electronics',
  },
  {
    id: 'home_living',
    label: 'Home & Living',
    icon: 'home-simple',
    description: 'Furniture and home decor',
  },
  {
    id: 'beauty',
    label: 'Beauty',
    icon: 'star',
    description: 'Cosmetics and beauty products',
  },
  {
    id: 'health',
    label: 'Health',
    icon: 'shield',
    description: 'Health and wellness',
  },
];

/**
 * Get category by ID
 */
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

/**
 * Get multiple categories by IDs
 */
export const getCategoriesByIds = (ids: string[]): Category[] => {
  return CATEGORIES.filter((cat) => ids.includes(cat.id));
};

/**
 * Get all category IDs
 */
export const getAllCategoryIds = (): string[] => {
  return CATEGORIES.map((cat) => cat.id);
};

/**
 * Format selected categories for display
 * Returns: "All", "3 selected", or "Restaurant, Grocery"
 */
export const formatSelectedCategories = (
  selectedIds: string[],
  maxDisplay: number = 2
): string => {
  if (selectedIds.length === 0) {
    return 'None';
  }

  if (selectedIds.length === CATEGORIES.length) {
    return 'All';
  }

  if (selectedIds.length <= maxDisplay) {
    const categories = getCategoriesByIds(selectedIds);
    return categories.map((cat) => cat.label).join(', ');
  }

  return `${selectedIds.length} selected`;
};
