/**
 * Centralized Error Messages - 2025 Best Practice
 * All error messages in one place for consistency and easier i18n later
 */

export const ErrorMessages = {
  // Authentication & Authorization
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again',
    TOKEN_INVALID: 'Invalid authentication token',
  },

  // User
  USER: {
    NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already exists',
    PHONE_EXISTS: 'Phone number already exists',
    USERNAME_EXISTS: 'Username already exists',
  },

  // Business
  BUSINESS: {
    NOT_FOUND: 'Business not found',
    SLUG_EXISTS: 'Business slug already exists',
    NOT_OWNER: 'You do not have permission to manage this business',
    ALREADY_EXISTS: 'You already have a business account',
  },

  // Deal
  DEAL: {
    NOT_FOUND: 'Deal not found',
    NOT_ACTIVE: 'Deal is not active',
    EXPIRED: 'Deal has expired',
    NOT_STARTED: 'Deal has not started yet',
    SOLD_OUT: 'Deal is sold out',
    NOT_OWNER: 'You do not have permission to manage this deal',
    INVALID_DATES: 'Start date must be before expiration date',
    INVALID_PRICE: 'Discounted price must be less than original price',
    MAX_REDEMPTIONS_REACHED: 'You have reached the maximum number of redemptions for this deal',
  },

  // Review
  REVIEW: {
    NOT_FOUND: 'Review not found',
    ALREADY_REVIEWED: 'You have already reviewed this business',
    NOT_OWNER: 'You can only update your own reviews',
    CANNOT_DELETE: 'You can only delete your own reviews',
  },

  // Follow
  FOLLOW: {
    ALREADY_FOLLOWING: 'You are already following this business',
    NOT_FOLLOWING: 'You are not following this business',
  },

  // Bookmark
  BOOKMARK: {
    ALREADY_BOOKMARKED: 'You have already bookmarked this deal',
    NOT_BOOKMARKED: 'You have not bookmarked this deal',
  },

  // Notification
  NOTIFICATION: {
    NOT_FOUND: 'Notification not found',
    SEND_FAILED: 'Failed to send notification',
  },

  // Upload
  UPLOAD: {
    FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
    INVALID_FILE_TYPE: 'Invalid file type',
    UPLOAD_FAILED: 'File upload failed',
  },

  // Validation
  VALIDATION: {
    INVALID_INPUT: 'Invalid input provided',
    REQUIRED_FIELD: 'Required field is missing',
  },

  // General
  GENERAL: {
    INTERNAL_ERROR: 'An internal server error occurred',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Bad request',
  },
} as const;

/**
 * Type helper for error messages
 */
export type ErrorMessage = typeof ErrorMessages;
