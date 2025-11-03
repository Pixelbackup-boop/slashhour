/**
 * Formatting utility functions
 *
 * Provides consistent formatting for common data types like prices, percentages,
 * and distances throughout the application.
 */

/**
 * Formats a number as a USD price
 *
 * Converts a number to a string with 2 decimal places and $ prefix.
 *
 * @param price - The price value to format
 * @returns Formatted price string (e.g., "$19.99")
 *
 * @example
 * ```ts
 * formatPrice(19.99)        // "$19.99"
 * formatPrice(5)            // "$5.00"
 * formatPrice(1234.567)     // "$1234.57"
 * formatPrice(0)            // "$0.00"
 * ```
 */
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

/**
 * Formats a discount percentage
 *
 * Converts a number to a string with percentage symbol and "OFF" suffix.
 *
 * @param percentage - The discount percentage value
 * @returns Formatted discount string (e.g., "50% OFF")
 *
 * @example
 * ```ts
 * formatDiscount(50)        // "50% OFF"
 * formatDiscount(25.5)      // "25.5% OFF"
 * formatDiscount(100)       // "100% OFF"
 * ```
 */
export const formatDiscount = (percentage: number): string => {
  return `${percentage}% OFF`;
};

/**
 * Formats a distance in meters to a human-readable string
 *
 * For distances under 1000m, displays in meters.
 * For distances 1000m and above, displays in kilometers with 1 decimal place.
 *
 * @param meters - The distance in meters
 * @returns Formatted distance string (e.g., "500m" or "1.5km")
 *
 * @example
 * ```ts
 * formatDistance(500)       // "500m"
 * formatDistance(999)       // "999m"
 * formatDistance(1000)      // "1.0km"
 * formatDistance(1500)      // "1.5km"
 * formatDistance(2345)      // "2.3km"
 * ```
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 *
 * Provides a human-readable representation of how long ago a date occurred.
 *
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted relative time string
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date())                     // "just now"
 * formatRelativeTime(new Date(Date.now() - 60000))   // "1 minute ago"
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 * ```
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (seconds < 2592000) {
    const weeks = Math.floor(seconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(seconds / 2592000);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

/**
 * Formats a phone number with standard formatting
 *
 * Converts a phone number string to a formatted version.
 * Handles US format (xxx) xxx-xxxx for 10-digit numbers.
 *
 * @param phone - The phone number to format
 * @returns Formatted phone number string
 *
 * @example
 * ```ts
 * formatPhoneNumber('1234567890')      // "(123) 456-7890"
 * formatPhoneNumber('+11234567890')    // "+1 (123) 456-7890"
 * formatPhoneNumber('123')             // "123" (unchanged if too short)
 * ```
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle international format (starts with country code)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Handle US format (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Return original if format not recognized
  return phone;
};

/**
 * Truncates text to a specified length and adds ellipsis
 *
 * Useful for displaying previews of long text in cards or lists.
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```ts
 * truncateText('This is a long text', 10)        // "This is a..."
 * truncateText('Short', 10)                       // "Short"
 * truncateText('Exactly ten', 11)                 // "Exactly ten"
 * ```
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
