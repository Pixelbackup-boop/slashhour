/**
 * Date Utility - 2025 Best Practice
 * Centralized date operations for consistency and maintainability
 */

/**
 * Get current date/time
 */
export class DateUtil {
  /**
   * Get current date
   */
  static now(): Date {
    return new Date();
  }

  /**
   * Parse ISO string to Date
   */
  static parseISO(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add hours to a date
   */
  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Add minutes to a date
   */
  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Check if date is after another date
   */
  static isAfter(date1: Date, date2: Date): boolean {
    return date1 > date2;
  }

  /**
   * Check if date is before another date
   */
  static isBefore(date1: Date, date2: Date): boolean {
    return date1 < date2;
  }

  /**
   * Get difference in days between two dates
   */
  static differenceInDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get difference in hours between two dates
   */
  static differenceInHours(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Get difference in minutes between two dates
   */
  static differenceInMinutes(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60));
  }

  /**
   * Check if two dates are on the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Start of day (00:00:00)
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * End of day (23:59:59.999)
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Format date to ISO string
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Check if date is within range (inclusive)
   */
  static isWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  /**
   * Get days until a future date (returns negative if past)
   */
  static daysUntil(date: Date): number {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date is expired (past current date)
   */
  static isExpired(date: Date): boolean {
    return this.isPast(date);
  }

  /**
   * Check if date is valid
   */
  static isValid(date: Date | string): boolean {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d instanceof Date && !isNaN(d.getTime());
    } catch {
      return false;
    }
  }
}
