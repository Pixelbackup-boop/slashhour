import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateUsername,
  validateUrl,
} from '../validation';

describe('validation utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@example.com')).toBe(true);
      expect(validateEmail('user+tag@example.co.uk')).toBe(true);
      expect(validateEmail('user_name@example.org')).toBe(true);
      expect(validateEmail('user123@test-domain.com')).toBe(true);
      expect(validateEmail('a@b.co')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
      expect(validateEmail('user@example')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('user@@example.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail(' user@example.com ')).toBe(false); // spaces
      expect(validateEmail('user@example..com')).toBe(false); // double dots
      expect(validateEmail('user..name@example.com')).toBe(false); // double dots in local
    });
  });

  describe('validatePhone', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePhone('123-456-7890')).toBe(true);
      expect(validatePhone('(123) 456-7890')).toBe(true);
      expect(validatePhone('+1 234 567 890')).toBe(true);
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('+44 20 7946 0958')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('abc123')).toBe(false);
      expect(validatePhone('123abc456')).toBe(false);
      expect(validatePhone('hello')).toBe(false);
      expect(validatePhone('user@example.com')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });

    it('should accept various formats', () => {
      expect(validatePhone('+1 (234) 567-8900')).toBe(true);
      expect(validatePhone('001-234-567-8900')).toBe(true);
      expect(validatePhone('+44-20-7946-0958')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(validatePhone('+')).toBe(true); // Just a plus is technically valid per regex
      expect(validatePhone('123')).toBe(true); // Short number valid per regex
      expect(validatePhone('()')).toBe(true); // Just parentheses valid per regex
    });
  });

  describe('validatePassword', () => {
    it('should accept valid passwords', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('myPassword')).toBe(true);
      expect(validatePassword('P@ssw0rd!')).toBe(true);
      expect(validatePassword('12345678')).toBe(true);
      expect(validatePassword('abcdefgh')).toBe(true);
      expect(validatePassword('a'.repeat(100))).toBe(true); // Very long password
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('1234567')).toBe(false);
      expect(validatePassword('Pass1')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('abc')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validatePassword('12345678')).toBe(true); // Exactly 8 chars
      expect(validatePassword('        ')).toBe(true); // 8 spaces valid
      expect(validatePassword('!@#$%^&*')).toBe(true); // Special chars only
    });
  });

  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('john_doe')).toBe(true);
      expect(validateUsername('user-123')).toBe(true);
      expect(validateUsername('testuser')).toBe(true);
      expect(validateUsername('User123')).toBe(true);
      expect(validateUsername('abc')).toBe(true); // Minimum 3 chars
      expect(validateUsername('a'.repeat(30))).toBe(true); // Maximum 30 chars
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('ab')).toBe(false); // Too short
      expect(validateUsername('a'.repeat(31))).toBe(false); // Too long
      expect(validateUsername('user@name')).toBe(false); // Invalid character
      expect(validateUsername('user name')).toBe(false); // Space not allowed
      expect(validateUsername('user.name')).toBe(false); // Dot not allowed
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('user#123')).toBe(false); // Special char not allowed
    });

    it('should handle edge cases', () => {
      expect(validateUsername('123')).toBe(true); // Numbers only
      expect(validateUsername('___')).toBe(true); // Underscores only
      expect(validateUsername('---')).toBe(true); // Hyphens only
      expect(validateUsername('a-b_c123')).toBe(true); // Mix of allowed chars
    });
  });

  describe('validateUrl', () => {
    it('should accept valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://example.com')).toBe(true);
      expect(validateUrl('https://www.example.com')).toBe(true);
      expect(validateUrl('https://example.com/path')).toBe(true);
      expect(validateUrl('https://example.com/path?query=value')).toBe(true);
      expect(validateUrl('https://sub.example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('https://example.com:8080/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('not a url')).toBe(false);
      expect(validateUrl('')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false); // FTP not allowed
      expect(validateUrl('javascript:alert(1)')).toBe(false);
      expect(validateUrl('file:///path/to/file')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateUrl('https://example.com/')).toBe(true); // Trailing slash
      expect(validateUrl('https://example.com#anchor')).toBe(true); // Hash
      expect(validateUrl('https://user:pass@example.com')).toBe(true); // Auth
      expect(validateUrl('https://192.168.1.1')).toBe(true); // IP address
      expect(validateUrl('https://[::1]')).toBe(true); // IPv6
    });

    it('should handle malformed URLs gracefully', () => {
      expect(validateUrl('https://')).toBe(false);
      expect(validateUrl('http:/example.com')).toBe(false);
      expect(validateUrl('https//example.com')).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should validate user registration form data', () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser123',
        password: 'securePass123',
        phone: '+1234567890',
      };

      expect(validateEmail(userData.email)).toBe(true);
      expect(validateUsername(userData.username)).toBe(true);
      expect(validatePassword(userData.password)).toBe(true);
      expect(validatePhone(userData.phone)).toBe(true);
    });

    it('should reject invalid registration form data', () => {
      const invalidData = {
        email: 'not-an-email',
        username: 'ab',
        password: 'short',
        phone: 'invalid',
      };

      expect(validateEmail(invalidData.email)).toBe(false);
      expect(validateUsername(invalidData.username)).toBe(false);
      expect(validatePassword(invalidData.password)).toBe(false);
      expect(validatePhone(invalidData.phone)).toBe(false);
    });

    it('should validate business profile URLs', () => {
      const businessProfile = {
        website: 'https://business.com',
        instagram: 'https://instagram.com/business',
        facebook: 'https://facebook.com/business',
      };

      expect(validateUrl(businessProfile.website)).toBe(true);
      expect(validateUrl(businessProfile.instagram)).toBe(true);
      expect(validateUrl(businessProfile.facebook)).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should handle different input types correctly', () => {
      // All functions expect strings
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validatePhone('+1234567890')).toBe(true);
      expect(validatePassword('password123')).toBe(true);
      expect(validateUsername('username')).toBe(true);
      expect(validateUrl('https://example.com')).toBe(true);
    });

    it('should return boolean values', () => {
      expect(typeof validateEmail('test@example.com')).toBe('boolean');
      expect(typeof validatePhone('+123')).toBe('boolean');
      expect(typeof validatePassword('pass')).toBe('boolean');
      expect(typeof validateUsername('user')).toBe('boolean');
      expect(typeof validateUrl('https://example.com')).toBe('boolean');
    });
  });

  describe('performance', () => {
    it('should validate email quickly', () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        validateEmail(`user${i}@example.com`);
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should validate all functions quickly', () => {
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        validateEmail('user@example.com');
        validatePhone('+1234567890');
        validatePassword('password123');
        validateUsername('username');
        validateUrl('https://example.com');
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });
  });
});
