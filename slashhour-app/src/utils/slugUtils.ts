/**
 * Slug utilities for creating user-friendly URLs
 * Example: "John's Grocery Store" -> "johns-grocery-store"
 */

/**
 * Generate a URL-friendly slug from a business name
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes multiple consecutive hyphens
 * - Removes leading/trailing hyphens
 */
export const generateSlugFromName = (businessName: string): string => {
  return businessName
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove apostrophes
    .replace(/'/g, '')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
};

/**
 * Validate slug format
 * Rules:
 * - 3-50 characters
 * - Lowercase letters, numbers, hyphens only
 * - Cannot start or end with hyphen
 * - No consecutive hyphens
 */
export const isValidSlug = (slug: string): boolean => {
  // Check length
  if (slug.length < 3 || slug.length > 50) {
    return false;
  }

  // Check format: lowercase letters, numbers, single hyphens only
  const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
};

/**
 * Get validation error message for a slug
 */
export const getSlugValidationError = (slug: string): string | null => {
  if (!slug || slug.trim().length === 0) {
    return 'URL slug is required';
  }

  if (slug.length < 3) {
    return 'URL slug must be at least 3 characters';
  }

  if (slug.length > 50) {
    return 'URL slug must be 50 characters or less';
  }

  if (!isValidSlug(slug)) {
    return 'URL slug can only contain lowercase letters, numbers, and hyphens';
  }

  return null;
};

/**
 * Sanitize user input to create a valid slug
 * This is more lenient than validation - it tries to fix the input
 */
export const sanitizeSlug = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove apostrophes
    .replace(/'/g, '')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Truncate to 50 characters
    .substring(0, 50)
    // Remove trailing hyphen if truncation created one
    .replace(/-$/g, '');
};

/**
 * Format slug for display with domain
 * Example: "johns-grocery" -> "slashhour.com/johns-grocery"
 */
export const formatSlugUrl = (slug: string, domain: string = 'slashhour.com'): string => {
  return `${domain}/${slug}`;
};
