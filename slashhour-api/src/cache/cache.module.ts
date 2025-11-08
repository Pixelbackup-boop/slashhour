/**
 * Cache Module
 * Provides in-memory caching for frequently accessed data
 * Following 2025 NestJS best practices
 *
 * Cache Strategy:
 * - User profiles: 5 minutes
 * - Business details: 10 minutes
 * - Active deals: 2 minutes
 * - Feed results: 1 minute
 * - Stats/aggregations: 5 minutes
 *
 * For production scaling, replace with Redis using cache-manager-ioredis-yet
 */

import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL') || 300, // Default 5 minutes (in seconds)
        max: configService.get<number>('CACHE_MAX_ITEMS') || 1000, // Max 1000 items
        isGlobal: true, // Make cache available globally
      }),
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}
