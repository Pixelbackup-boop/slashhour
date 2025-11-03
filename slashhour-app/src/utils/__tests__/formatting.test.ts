import {
  formatPrice,
  formatDiscount,
  formatDistance,
  formatRelativeTime,
  formatPhoneNumber,
  truncateText,
} from '../formatting';

describe('formatting utilities', () => {
  describe('formatPrice', () => {
    it('should format prices with 2 decimal places', () => {
      expect(formatPrice(19.99)).toBe('$19.99');
      expect(formatPrice(5)).toBe('$5.00');
      expect(formatPrice(1234.567)).toBe('$1234.57');
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('should handle large numbers', () => {
      expect(formatPrice(999999.99)).toBe('$999999.99');
      expect(formatPrice(1000000)).toBe('$1000000.00');
    });

    it('should handle very small numbers', () => {
      expect(formatPrice(0.01)).toBe('$0.01');
      expect(formatPrice(0.001)).toBe('$0.00'); // Rounds down
      expect(formatPrice(0.005)).toBe('$0.01'); // Rounds up
    });

    it('should handle negative numbers', () => {
      expect(formatPrice(-10.50)).toBe('$-10.50');
      expect(formatPrice(-0.99)).toBe('$-0.99');
    });

    it('should round correctly', () => {
      expect(formatPrice(10.125)).toBe('$10.13'); // Rounds up
      expect(formatPrice(10.124)).toBe('$10.12'); // Rounds down
      expect(formatPrice(10.995)).toBe('$11.00'); // Rounds up
    });
  });

  describe('formatDiscount', () => {
    it('should format discount percentages', () => {
      expect(formatDiscount(50)).toBe('50% OFF');
      expect(formatDiscount(25.5)).toBe('25.5% OFF');
      expect(formatDiscount(100)).toBe('100% OFF');
      expect(formatDiscount(0)).toBe('0% OFF');
    });

    it('should handle decimal percentages', () => {
      expect(formatDiscount(33.33)).toBe('33.33% OFF');
      expect(formatDiscount(12.5)).toBe('12.5% OFF');
      expect(formatDiscount(75.25)).toBe('75.25% OFF');
    });

    it('should handle edge cases', () => {
      expect(formatDiscount(1)).toBe('1% OFF');
      expect(formatDiscount(99)).toBe('99% OFF');
      expect(formatDiscount(0.5)).toBe('0.5% OFF');
    });
  });

  describe('formatDistance', () => {
    it('should format distances under 1000m in meters', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
      expect(formatDistance(100)).toBe('100m');
      expect(formatDistance(1)).toBe('1m');
    });

    it('should format distances 1000m and above in kilometers', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(2345)).toBe('2.3km');
      expect(formatDistance(10000)).toBe('10.0km');
    });

    it('should round meters to nearest integer', () => {
      expect(formatDistance(500.7)).toBe('501m');
      expect(formatDistance(500.3)).toBe('500m');
      expect(formatDistance(999.9)).toBe('1000m');
    });

    it('should round kilometers to 1 decimal place', () => {
      expect(formatDistance(1234)).toBe('1.2km');
      expect(formatDistance(1567)).toBe('1.6km');
      expect(formatDistance(9999)).toBe('10.0km');
    });

    it('should handle edge cases', () => {
      expect(formatDistance(0)).toBe('0m');
      expect(formatDistance(999.4)).toBe('999m');
      expect(formatDistance(999.5)).toBe('1000m');
      expect(formatDistance(1000000)).toBe('1000.0km');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // Mock Date.now() for consistent testing
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-15T12:00:00Z').getTime());
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should format recent times as "just now"', () => {
      const now = new Date('2025-01-15T12:00:00Z');
      const thirtySecondsAgo = new Date('2025-01-15T11:59:30Z');

      expect(formatRelativeTime(now)).toBe('just now');
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
    });

    it('should format minutes ago', () => {
      const oneMinuteAgo = new Date('2025-01-15T11:59:00Z');
      const fiveMinutesAgo = new Date('2025-01-15T11:55:00Z');
      const thirtyMinutesAgo = new Date('2025-01-15T11:30:00Z');

      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
      expect(formatRelativeTime(thirtyMinutesAgo)).toBe('30 minutes ago');
    });

    it('should format hours ago', () => {
      const oneHourAgo = new Date('2025-01-15T11:00:00Z');
      const twoHoursAgo = new Date('2025-01-15T10:00:00Z');
      const twelveHoursAgo = new Date('2025-01-15T00:00:00Z');

      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
      expect(formatRelativeTime(twelveHoursAgo)).toBe('12 hours ago');
    });

    it('should format days ago', () => {
      const oneDayAgo = new Date('2025-01-14T12:00:00Z');
      const threeDaysAgo = new Date('2025-01-12T12:00:00Z');
      const sixDaysAgo = new Date('2025-01-09T12:00:00Z');

      expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
      expect(formatRelativeTime(sixDaysAgo)).toBe('6 days ago');
    });

    it('should format weeks ago', () => {
      const oneWeekAgo = new Date('2025-01-08T12:00:00Z');
      const twoWeeksAgo = new Date('2025-01-01T12:00:00Z');
      const threeWeeksAgo = new Date('2024-12-25T12:00:00Z');

      expect(formatRelativeTime(oneWeekAgo)).toBe('1 week ago');
      expect(formatRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');
      expect(formatRelativeTime(threeWeeksAgo)).toBe('3 weeks ago');
    });

    it('should format months ago', () => {
      const oneMonthAgo = new Date('2024-12-15T12:00:00Z');
      const twoMonthsAgo = new Date('2024-11-15T12:00:00Z');
      const sixMonthsAgo = new Date('2024-07-15T12:00:00Z');

      expect(formatRelativeTime(oneMonthAgo)).toBe('1 month ago');
      expect(formatRelativeTime(twoMonthsAgo)).toBe('2 months ago');
      expect(formatRelativeTime(sixMonthsAgo)).toBe('6 months ago');
    });

    it('should handle ISO string dates', () => {
      const isoString = '2025-01-15T11:00:00Z';
      expect(formatRelativeTime(isoString)).toBe('1 hour ago');
    });

    it('should handle proper singular/plural forms', () => {
      const oneMinuteAgo = new Date('2025-01-15T11:59:00Z');
      const twoMinutesAgo = new Date('2025-01-15T11:58:00Z');

      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
      expect(formatRelativeTime(twoMinutesAgo)).toBe('2 minutes ago');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit US phone numbers', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    });

    it('should format 11-digit numbers with country code', () => {
      expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
      expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
    });

    it('should handle already formatted numbers', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('+1 (123) 456-7890')).toBe('+1 (123) 456-7890');
    });

    it('should strip non-digit characters before formatting', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('(123)456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('+1-123-456-7890')).toBe('+1 (123) 456-7890');
    });

    it('should return original for unrecognized formats', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('12345')).toBe('12345');
      expect(formatPhoneNumber('123456789')).toBe('123456789');
      expect(formatPhoneNumber('+441234567890')).toBe('+441234567890');
    });

    it('should handle edge cases', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber('0000000000')).toBe('(000) 000-0000');
      expect(formatPhoneNumber('9999999999')).toBe('(999) 999-9999');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a...');
      expect(truncateText('Hello World', 5)).toBe('Hello...');
      expect(truncateText('Test', 2)).toBe('Te...');
    });

    it('should not truncate text shorter than or equal to maxLength', () => {
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('Exactly ten', 11)).toBe('Exactly ten');
      expect(truncateText('Test', 4)).toBe('Test');
    });

    it('should handle empty strings', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText('', 0)).toBe('');
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      expect(truncateText(longText, 50)).toBe('a'.repeat(50) + '...');
      expect(truncateText(longText, 50).length).toBe(53); // 50 chars + '...'
    });

    it('should handle zero maxLength', () => {
      expect(truncateText('Test', 0)).toBe('...');
    });

    it('should preserve text at exact maxLength', () => {
      expect(truncateText('12345', 5)).toBe('12345');
      expect(truncateText('123456', 5)).toBe('12345...');
    });
  });

  describe('integration scenarios', () => {
    it('should format deal card data', () => {
      const dealData = {
        originalPrice: 100,
        discountedPrice: 50,
        discountPercentage: 50,
        distanceInMeters: 1500,
      };

      expect(formatPrice(dealData.originalPrice)).toBe('$100.00');
      expect(formatPrice(dealData.discountedPrice)).toBe('$50.00');
      expect(formatDiscount(dealData.discountPercentage)).toBe('50% OFF');
      expect(formatDistance(dealData.distanceInMeters)).toBe('1.5km');
    });

    it('should format business profile contact info', () => {
      const contactInfo = {
        phone: '5551234567',
        description: 'This is a very long description that needs to be truncated for the preview card display',
      };

      expect(formatPhoneNumber(contactInfo.phone)).toBe('(555) 123-4567');
      expect(truncateText(contactInfo.description, 50)).toBe(
        'This is a very long description that needs to be...'
      );
    });

    it('should format review timestamps', () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-15T12:00:00Z').getTime());

      const reviews = [
        { createdAt: new Date('2025-01-15T11:30:00Z') },
        { createdAt: new Date('2025-01-14T12:00:00Z') },
        { createdAt: new Date('2025-01-08T12:00:00Z') },
      ];

      expect(formatRelativeTime(reviews[0].createdAt)).toBe('30 minutes ago');
      expect(formatRelativeTime(reviews[1].createdAt)).toBe('1 day ago');
      expect(formatRelativeTime(reviews[2].createdAt)).toBe('1 week ago');

      jest.restoreAllMocks();
    });
  });

  describe('type safety', () => {
    it('should handle correct input types', () => {
      expect(typeof formatPrice(10)).toBe('string');
      expect(typeof formatDiscount(50)).toBe('string');
      expect(typeof formatDistance(1000)).toBe('string');
      expect(typeof formatRelativeTime(new Date())).toBe('string');
      expect(typeof formatPhoneNumber('1234567890')).toBe('string');
      expect(typeof truncateText('test', 10)).toBe('string');
    });

    it('should always return strings', () => {
      expect(formatPrice(0)).toMatch(/^\$/);
      expect(formatDiscount(0)).toMatch(/% OFF$/);
      expect(formatDistance(0)).toMatch(/m$/);
      expect(typeof formatRelativeTime(new Date())).toBe('string');
      expect(typeof formatPhoneNumber('')).toBe('string');
      expect(typeof truncateText('', 0)).toBe('string');
    });
  });

  describe('performance', () => {
    it('should format prices quickly', () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        formatPrice(i * 10.99);
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });

    it('should format all functions quickly', () => {
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        formatPrice(19.99);
        formatDiscount(50);
        formatDistance(1500);
        formatRelativeTime(new Date());
        formatPhoneNumber('1234567890');
        truncateText('Some text to truncate', 10);
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });
  });
});
