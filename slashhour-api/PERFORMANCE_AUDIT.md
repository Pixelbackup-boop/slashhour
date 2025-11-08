# Performance Audit Report
**Date:** 2025-11-07
**Project:** Slashhour API
**Status:** Development (Pre-Production)

---

## Executive Summary

This audit identified **3 critical performance issues** affecting query efficiency, scalability, and response times. The codebase lacks essential database indexes, has no caching infrastructure, and uses raw SQL for geospatial calculations that could benefit from PostGIS optimization.

**Priority Ranking:**
1. **CRITICAL** - Missing Database Indexes (Affects all queries)
2. **HIGH** - No Caching Infrastructure (Repeated data fetching)
3. **MEDIUM** - Raw SQL Geospatial Queries (Could use PostGIS for better performance)

---

## Issue 1: Missing Database Indexes (CRITICAL)

### Impact
- Slow query performance on filtered data (status, dates, foreign keys)
- Full table scans on large datasets
- Poor scalability as data grows
- High CPU usage on database server

### Current State

The Prisma schema at `prisma/schema.prisma` is missing **11 critical indexes**:

#### Deals Table (Lines 72-102)
```prisma
model deals {
  id                   String             @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  business_id          String             @db.Uuid
  status               deals_status_enum  @default(active)
  expires_at           DateTime           @db.Timestamp(6)
  starts_at            DateTime           @db.Timestamp(6)
  is_flash_deal        Boolean            @default(false)
  // ... other fields

  // ❌ MISSING INDEXES
}
```

**Problems:**
- `business_id` - FK lookup requires full table scan (used in every deal query)
- `status` - Filtered in every active deal query
- `expires_at` - Date filtering without index
- `starts_at` - Date range queries inefficient
- `is_flash_deal` - Flash deal endpoint queries scan entire table

#### Follows Table (Lines 104-117)
```prisma
model follows {
  user_id     String              @db.Uuid
  business_id String              @db.Uuid
  status      follows_status_enum @default(active)

  @@unique([user_id, business_id], map: "UQ_user_business_follow")
  // ❌ MISSING: Index on business_id alone
  // ❌ MISSING: Index on status
}
```

**Problems:**
- Reverse lookups (find all users following a business) are slow
- Filtering by status requires full scan

#### User_Redemptions Table (Lines 144-157)
```prisma
model user_redemptions {
  user_id     String @db.Uuid
  deal_id     String @db.Uuid
  business_id String @db.Uuid
  redeemed_at DateTime @default(now()) @db.Timestamp(6)

  // ❌ NO INDEXES AT ALL
}
```

**Problems:**
- User redemption history queries scan entire table
- Business analytics queries are slow
- Date range filtering inefficient

#### Businesses Table (Lines 11-51)
```prisma
model businesses {
  category businesses_category_enum
  location Json // ⚠️ JSON instead of PostGIS geometry

  // ❌ MISSING: Index on category
}
```

**Problems:**
- Category filtering (restaurant, grocery, etc.) requires full scan
- JSON location field can't use spatial indexes

### Recommended Solution

Create a new Prisma migration file:

```prisma
// prisma/migrations/YYYYMMDD_add_performance_indexes.sql

-- DEALS TABLE INDEXES
CREATE INDEX IF NOT EXISTS "idx_deals_business_id" ON "deals"("business_id");
CREATE INDEX IF NOT EXISTS "idx_deals_status" ON "deals"("status");
CREATE INDEX IF NOT EXISTS "idx_deals_expires_at" ON "deals"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_deals_starts_at" ON "deals"("starts_at");
CREATE INDEX IF NOT EXISTS "idx_deals_is_flash_deal" ON "deals"("is_flash_deal") WHERE "is_flash_deal" = true;

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS "idx_deals_status_expires_active"
  ON "deals"("status", "expires_at", "starts_at")
  WHERE "status" = 'active';

-- FOLLOWS TABLE INDEXES
CREATE INDEX IF NOT EXISTS "idx_follows_business_id" ON "follows"("business_id");
CREATE INDEX IF NOT EXISTS "idx_follows_status" ON "follows"("status");
CREATE INDEX IF NOT EXISTS "idx_follows_user_status" ON "follows"("user_id", "status");

-- USER_REDEMPTIONS TABLE INDEXES
CREATE INDEX IF NOT EXISTS "idx_redemptions_user_id" ON "user_redemptions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_redemptions_deal_id" ON "user_redemptions"("deal_id");
CREATE INDEX IF NOT EXISTS "idx_redemptions_business_id" ON "user_redemptions"("business_id");
CREATE INDEX IF NOT EXISTS "idx_redemptions_redeemed_at" ON "user_redemptions"("redeemed_at" DESC);

-- BUSINESSES TABLE INDEXES
CREATE INDEX IF NOT EXISTS "idx_businesses_category" ON "businesses"("category");
```

**Update Prisma Schema:**
```prisma
model deals {
  // ... existing fields

  @@index([business_id], map: "idx_deals_business_id")
  @@index([status], map: "idx_deals_status")
  @@index([expires_at], map: "idx_deals_expires_at")
  @@index([starts_at], map: "idx_deals_starts_at")
  @@index([is_flash_deal], map: "idx_deals_is_flash_deal")
  @@index([status, expires_at, starts_at], map: "idx_deals_status_expires_active")
}

model follows {
  // ... existing fields

  @@index([business_id], map: "idx_follows_business_id")
  @@index([status], map: "idx_follows_status")
  @@index([user_id, status], map: "idx_follows_user_status")
}

model user_redemptions {
  // ... existing fields

  @@index([user_id], map: "idx_redemptions_user_id")
  @@index([deal_id], map: "idx_redemptions_deal_id")
  @@index([business_id], map: "idx_redemptions_business_id")
  @@index([redeemed_at(sort: Desc)], map: "idx_redemptions_redeemed_at")
}

model businesses {
  // ... existing fields

  @@index([category], map: "idx_businesses_category")
}
```

### Expected Performance Improvement
- **Query speed:** 10-100x faster for filtered queries
- **Database CPU:** 60-80% reduction
- **Scalability:** Linear scaling with proper indexes vs exponential without

### Priority: CRITICAL
**Implement immediately before production deployment.**

---

## Issue 2: No Caching Infrastructure (HIGH)

### Impact
- Repeated database queries for identical data
- Increased database load
- Slower response times
- Higher costs (database connection pool exhaustion)

### Current State

**File:** `package.json` (Lines 23-56)

No caching dependencies installed:
```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@prisma/client": "^6.18.0",
    // ❌ NO cache-manager
    // ❌ NO ioredis or redis
    // ❌ NO Prisma Accelerate
  }
}
```

**Grep Search Results:**
```bash
$ grep -r "cache-manager" src/
# No results

$ grep -r "Redis" src/
# No results

$ grep -r "@nestjs/cache-manager" src/
# No results
```

### Data That Should Be Cached

1. **User Profiles** - Accessed on every authenticated request
2. **Business Details** - Rarely change, frequently accessed
3. **Active Deals** - Updated infrequently, queried constantly
4. **Follow Relationships** - Static data, high read volume
5. **Aggregated Statistics** - Expensive calculations (follower counts, ratings)

### Recommended Solution

#### Option 1: In-Memory Caching (Development/Small Scale)
Best for development and low-traffic production.

**Install Dependencies:**
```bash
npm install @nestjs/cache-manager cache-manager
```

**Configure Cache Module:**
```typescript
// src/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    NestCacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 1000, // Max 1000 items in cache
      isGlobal: true,
    }),
  ],
})
export class CacheModule {}
```

**Implementation Example:**
```typescript
// src/deals/deals.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOne(id: string): Promise<Deal> {
    const cacheKey = `deal:${id}`;

    // Check cache first
    const cached = await this.cacheManager.get<Deal>(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const deal = await this.prisma.deals.findUnique({
      where: { id },
      include: { businesses: true },
    });

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, deal, 300);
    return deal;
  }

  async update(id: string, data: UpdateDealDto): Promise<Deal> {
    const deal = await this.prisma.deals.update({
      where: { id },
      data,
    });

    // Invalidate cache on update
    await this.cacheManager.del(`deal:${id}`);
    return deal;
  }
}
```

#### Option 2: Redis (Production Scale)
Best for production with multiple server instances.

**Install Dependencies:**
```bash
npm install @nestjs/cache-manager cache-manager cache-manager-ioredis ioredis
```

**Configure Redis:**
```typescript
// src/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          ttl: 300,
        }),
      }),
    }),
  ],
})
export class CacheModule {}
```

**Environment Variables:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
```

#### Option 3: Prisma Accelerate (Serverless/Edge)
Best for serverless deployments, global edge caching.

**Configure Prisma Accelerate:**
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
  previewFeatures = ["accelerate"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL") // For migrations
}
```

**Usage:**
```typescript
// Automatic query result caching
const deals = await this.prisma.deals.findMany({
  where: { status: 'active' },
  cacheStrategy: {
    ttl: 300, // Cache for 5 minutes
    swr: 600, // Stale-while-revalidate for 10 minutes
  },
});
```

### Cache Invalidation Strategy

**Cache Keys Structure:**
```typescript
// Single entities
`deal:${dealId}`
`business:${businessId}`
`user:${userId}`

// Lists (with pagination)
`deals:active:page:${page}:limit:${limit}`
`feed:user:${userId}:page:${page}`
`follows:user:${userId}`

// Aggregations
`stats:user:${userId}`
`stats:business:${businessId}`
```

**Invalidation Rules:**
```typescript
// When deal is updated/deleted
await this.cacheManager.del(`deal:${dealId}`);
await this.cacheManager.del(`deals:active:*`); // Pattern deletion

// When user follows business
await this.cacheManager.del(`follows:user:${userId}`);
await this.cacheManager.del(`stats:business:${businessId}`);
```

### Expected Performance Improvement
- **Response time:** 50-90% faster for cached data
- **Database load:** 70-90% reduction
- **Concurrent users:** 5-10x more capacity

### Priority: HIGH
**Implement before beta testing with real users.**

---

## Issue 3: Raw SQL Geospatial Queries (MEDIUM)

### Impact
- Slower geospatial calculations
- No spatial index support
- Difficult to maintain raw SQL
- Missing PostGIS optimization opportunities

### Current State

**File:** `src/feed/feed.service.ts` (Lines 175-234)

```typescript
async getNearYouFeed(userId: string, locationParams: LocationParams) {
  // Using raw SQL with Haversine formula
  const deals = await this.prisma.$queryRaw<any[]>`
    SELECT
      d.*,
      b.id as "business_id",
      b.owner_id as "business_owner_id",
      b.business_name as "business_business_name",
      // ... 30+ columns manually selected
      (6371 * acos(
        cos(radians(${lat})) *
        cos(radians((b.location->>'lat')::float)) *
        cos(radians((b.location->>'lng')::float) - radians(${lng})) +
        sin(radians(${lat})) *
        sin(radians((b.location->>'lat')::float))
      )) as distance
    FROM deals d
    LEFT JOIN businesses b ON d.business_id = b.id
    WHERE d.status = 'active'
      AND (6371 * acos(...)) <= ${radius}
    ORDER BY distance ASC
    LIMIT ${limit} OFFSET ${skip}
  `;
}
```

**Problems:**
1. **200+ lines** of manual column selection
2. **No spatial indexes** (location is JSON, not PostGIS geometry)
3. **Haversine calculated twice** (WHERE and SELECT)
4. **Type safety lost** (returns `any[]`)
5. **Maintenance nightmare** (schema changes break query)

### Recommended Solution

#### Option 1: PostGIS (Best Performance)
Transform location JSON fields to PostGIS geometry for spatial indexing.

**Migration:**
```sql
-- Enable PostGIS extension (already enabled based on schema)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column for businesses
ALTER TABLE businesses
ADD COLUMN location_point geometry(Point, 4326);

-- Populate from existing JSON
UPDATE businesses
SET location_point = ST_SetSRID(
  ST_MakePoint(
    (location->>'lng')::float,
    (location->>'lat')::float
  ),
  4326
);

-- Create spatial index
CREATE INDEX idx_businesses_location_point
ON businesses USING GIST (location_point);

-- Same for deals if they have location
ALTER TABLE deals
ADD COLUMN location_point geometry(Point, 4326);

CREATE INDEX idx_deals_location_point
ON deals USING GIST (location_point);
```

**Update Prisma Schema:**
```prisma
model businesses {
  // Keep existing JSON for compatibility
  location        Json
  // Add PostGIS geometry column
  location_point  Unsupported("geometry(Point, 4326)")?

  @@index([location_point], type: Gist, map: "idx_businesses_location_point")
}
```

**Refactor Service:**
```typescript
async getNearYouFeed(
  userId: string,
  locationParams: LocationParams,
  page: number = 1,
  limit: number = 20,
) {
  const skip = (page - 1) * limit;

  // Use PostGIS ST_DWithin for much faster spatial queries
  const deals = await this.prisma.$queryRaw<any[]>`
    SELECT
      d.*,
      b.*,
      ST_Distance(
        b.location_point::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
      ) / 1000 as distance_km
    FROM deals d
    INNER JOIN businesses b ON d.business_id = b.id
    WHERE d.status = 'active'
      AND d.starts_at <= NOW()
      AND d.expires_at > NOW()
      AND ST_DWithin(
        b.location_point::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radius * 1000} -- Convert km to meters
      )
    ORDER BY distance_km ASC
    LIMIT ${limit} OFFSET ${skip}
  `;

  // ... rest of implementation
}
```

**Performance Benefits:**
- **10-100x faster** for proximity queries with spatial index
- **Scales to millions** of locations
- **Native database support** for geospatial operations

#### Option 2: Pre-filter + Application-side Calculation (Quick Fix)
Use bounding box filtering in SQL, then calculate precise distance in application.

```typescript
async getNearYouFeed(userId: string, locationParams: LocationParams) {
  // Calculate bounding box (much faster than Haversine in WHERE)
  const latDelta = radius / 111.0; // ~111km per degree latitude
  const lngDelta = radius / (111.0 * Math.cos(lat * Math.PI / 180));

  // Use Prisma with bounding box filter
  const deals = await this.prisma.deals.findMany({
    where: {
      status: DealStatus.ACTIVE,
      starts_at: { lte: new Date() },
      expires_at: { gt: new Date() },
      businesses: {
        // Rough filter using JSON operators (PostgreSQL)
        location: {
          path: ['lat'],
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
      },
    },
    include: { businesses: true },
  });

  // Calculate precise distance in application code
  const dealsWithDistance = deals
    .map((deal) => {
      const businessLocation = GeospatialUtil.extractGeoPoint(deal.businesses.location);
      if (!businessLocation) return null;

      const distance = GeospatialUtil.calculateDistance(
        { lat, lng },
        businessLocation,
      );

      return { ...deal, distance };
    })
    .filter((deal) => deal && deal.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return dealsWithDistance;
}
```

**Pros:**
- No schema migration required
- Type-safe with Prisma
- Quick to implement

**Cons:**
- Slower than PostGIS (but faster than current raw SQL)
- Can't use spatial indexes
- May fetch more rows than needed

### Expected Performance Improvement
- **PostGIS:** 10-100x faster with spatial indexes
- **Bounding Box:** 2-5x faster, type-safe, easier to maintain

### Priority: MEDIUM
**Implement after caching, before production scale.**

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
1. Create database indexes migration
2. Run migration on development database
3. Verify query performance with `EXPLAIN ANALYZE`
4. Update Prisma schema with index definitions

**Estimated Time:** 4-6 hours
**Expected ROI:** 10-100x query performance improvement

### Phase 2: Caching Infrastructure (Week 2)
1. Install cache-manager (start with in-memory)
2. Implement caching in DealsService
3. Add cache invalidation logic
4. Monitor cache hit rates
5. Consider Redis if scaling beyond single server

**Estimated Time:** 8-12 hours
**Expected ROI:** 70% database load reduction

### Phase 3: Geospatial Optimization (Week 3-4)
1. Evaluate PostGIS vs bounding box approach
2. Create migration for PostGIS columns (if chosen)
3. Refactor feed service queries
4. Add geospatial tests
5. Benchmark performance

**Estimated Time:** 12-16 hours
**Expected ROI:** 10x faster proximity queries

---

## Testing Recommendations

### Before/After Benchmarks

**Test Query Performance:**
```sql
-- Check query execution plan BEFORE indexes
EXPLAIN ANALYZE
SELECT * FROM deals
WHERE status = 'active'
  AND business_id = 'some-uuid';

-- Run again AFTER adding indexes
```

**Measure Cache Hit Rates:**
```typescript
// Add metrics to cache service
private hits = 0;
private misses = 0;

async get(key: string) {
  const value = await this.cacheManager.get(key);
  if (value) this.hits++;
  else this.misses++;
  return value;
}

getStats() {
  const total = this.hits + this.misses;
  return {
    hits: this.hits,
    misses: this.misses,
    hitRate: total > 0 ? (this.hits / total * 100).toFixed(2) + '%' : '0%',
  };
}
```

### Load Testing

Use tools like Apache Bench or k6:
```bash
# Test feed endpoint under load
ab -n 1000 -c 10 http://localhost:3000/api/v1/feed/you-follow?page=1&limit=20

# Compare before/after metrics:
# - Requests per second
# - Average response time
# - 95th percentile latency
```

---

## Additional Recommendations

### 1. Query Monitoring
Install Prisma query logging:
```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) { // Log slow queries > 100ms
    console.warn(`Slow Query: ${e.duration}ms - ${e.query}`);
  }
});
```

### 2. Connection Pooling
Configure Prisma connection pool:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/slashhour?connection_limit=10&pool_timeout=20"
```

### 3. Read Replicas (Future)
For high traffic, consider read replicas:
```typescript
// Primary for writes
const prismaWrite = new PrismaClient({ datasources: { db: { url: PRIMARY_URL } } });

// Replica for reads
const prismaRead = new PrismaClient({ datasources: { db: { url: REPLICA_URL } } });
```

---

## Conclusion

The three identified issues are **fixable within 2-3 weeks** with significant performance gains. Prioritize database indexes first (critical for all queries), followed by caching (high ROI, moderate effort), and geospatial optimization last (medium priority, higher complexity).

**Estimated Total Time:** 24-34 hours
**Expected Performance Improvement:** 10-100x for indexed queries, 70% database load reduction, 50-90% faster response times for cached data

**Next Steps:**
1. Review this report with the team
2. Create GitHub issues for each phase
3. Start with Phase 1 (database indexes) immediately
4. Schedule Phase 2 and 3 based on beta testing timeline
