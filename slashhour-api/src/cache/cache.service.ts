/**
 * Cache Service
 * Provides reusable caching utilities and patterns
 * Following 2025 NestJS best practices
 */

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  ONE_MINUTE: 60,
  TWO_MINUTES: 120,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
} as const;

/**
 * Cache key prefixes for namespacing
 */
export const CachePrefix = {
  DEAL: 'deal',
  BUSINESS: 'business',
  USER: 'user',
  FEED: 'feed',
  STATS: 'stats',
  FOLLOWS: 'follows',
  BOOKMARKS: 'bookmarks',
} as const;

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Delete single key from cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Delete multiple keys matching a pattern
   * Note: This is a simple implementation. For Redis, use SCAN for better performance.
   */
  async delPattern(pattern: string): Promise<void> {
    // For in-memory cache, pattern deletion is not directly supported
    // In production with Redis, you would use SCAN + DEL
    // For now, we just delete the specific key if no wildcard
    if (!pattern.includes('*')) {
      await this.del(pattern);
    }
    // Pattern deletion with wildcards requires Redis
    // For in-memory cache, this is a no-op
  }

  /**
   * Reset entire cache
   * Note: Only works with some cache stores (not all)
   */
  async reset(): Promise<void> {
    // Cache reset might not be available in all implementations
    // This is mainly for testing purposes
    if (typeof (this.cacheManager as any).reset === 'function') {
      await (this.cacheManager as any).reset();
    }
  }

  /**
   * Build cache key with prefix
   */
  buildKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Wrap a function with caching logic
   * If cached value exists, return it. Otherwise, execute function and cache result.
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * Invalidate deal-related caches
   */
  async invalidateDeal(dealId: string): Promise<void> {
    await this.del(this.buildKey(CachePrefix.DEAL, dealId));
    // Also invalidate feed caches as deals appear in feeds
    await this.delPattern(`${CachePrefix.FEED}:*`);
  }

  /**
   * Invalidate business-related caches
   */
  async invalidateBusiness(businessId: string): Promise<void> {
    await this.del(this.buildKey(CachePrefix.BUSINESS, businessId));
    await this.delPattern(`${CachePrefix.FEED}:*`);
  }

  /**
   * Invalidate user-related caches
   */
  async invalidateUser(userId: string): Promise<void> {
    await this.del(this.buildKey(CachePrefix.USER, userId));
    await this.del(this.buildKey(CachePrefix.STATS, userId));
    await this.del(this.buildKey(CachePrefix.FOLLOWS, userId));
    await this.del(this.buildKey(CachePrefix.BOOKMARKS, userId));
    await this.delPattern(`${CachePrefix.FEED}:*:${userId}`);
  }

  /**
   * Invalidate feed caches for a user
   */
  async invalidateFeed(userId: string): Promise<void> {
    await this.delPattern(`${CachePrefix.FEED}:*:${userId}`);
  }
}
