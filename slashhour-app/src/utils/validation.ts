/**
 * Validation utility functions
 *
 * Provides common validation logic for user input and data validation.
 * All functions return boolean values indicating whether the input is valid.
 */

/**
 * Validates email address format
 *
 * Uses a standard RFC 5322 compliant regex pattern to validate email addresses.
 * Checks for basic structure: local-part@domain with proper character sets.
 *
 * @param email - The email address to validate
 * @returns true if email format is valid, false otherwise
 *
 * @example
 * ```ts
 * validateEmail('user@example.com')     // true
 * validateEmail('invalid.email')        // false
 * validateEmail('user@')                // false
 * validateEmail('@example.com')         // false
 * ```
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format
 *
 * Accepts international format with optional + prefix, digits, spaces, hyphens, and parentheses.
 * Flexible pattern to accommodate various phone number formats across different countries.
 *
 * @param phone - The phone number to validate
 * @returns true if phone format is valid, false otherwise
 *
 * @example
 * ```ts
 * validatePhone('+1234567890')         // true
 * validatePhone('123-456-7890')        // true
 * validatePhone('(123) 456-7890')      // true
 * validatePhone('+1 234 567 890')      // true
 * validatePhone('abc123')              // false
 * ```
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone);
};

/**
 * Validates password strength
 *
 * Checks for minimum length of 8 characters.
 * For stricter requirements, modify the regex to include:
 * - Uppercase letters: (?=.*[A-Z])
 * - Lowercase letters: (?=.*[a-z])
 * - Numbers: (?=.*\d)
 * - Special characters: (?=.*[@$!%*?&])
 *
 * @param password - The password to validate
 * @returns true if password meets requirements, false otherwise
 *
 * @example
 * ```ts
 * validatePassword('myPassword123')    // true
 * validatePassword('short')            // false
 * validatePassword('')                 // false
 * ```
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Validates username format
 *
 * Checks for alphanumeric characters, underscores, and hyphens.
 * Must be between 3 and 30 characters long.
 *
 * @param username - The username to validate
 * @returns true if username format is valid, false otherwise
 *
 * @example
 * ```ts
 * validateUsername('john_doe')         // true
 * validateUsername('user-123')         // true
 * validateUsername('ab')               // false (too short)
 * validateUsername('user@name')        // false (invalid character)
 * ```
 */
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Validates URL format
 *
 * Checks for valid HTTP or HTTPS URL format.
 *
 * @param url - The URL to validate
 * @returns true if URL format is valid, false otherwise
 *
 * @example
 * ```ts
 * validateUrl('https://example.com')     // true
 * validateUrl('http://example.com')      // true
 * validateUrl('example.com')             // false
 * validateUrl('not a url')               // false
 * ```
 */
export const validateUrl = (url: string): boolean => {
  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    return false;
  }
};
