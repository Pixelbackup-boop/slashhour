import { Injectable } from '@nestjs/common';
import { BusinessCategory } from '../businesses/entities/business.entity';
import { DealStatus } from '../deals/entities/deal.entity';
import { PrismaService } from '../prisma/prisma.service';

export interface BusinessSearchFilters {
  query?: string;
  category?: BusinessCategory;
  lat?: number;
  lng?: number;
  radius?: number;
  verified?: boolean;
}

export interface DealSearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  flashOnly?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  tags?: string[];
}

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async searchBusinesses(filters: BusinessSearchFilters, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Build where clause conditionally
    const where: any = {};

    // Text search - use OR condition
    if (filters.query) {
      where.OR = [
        { business_name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters.category) {
      where.category = filters.category;
    }

    // Verified filter
    if (filters.verified !== undefined) {
      where.is_verified = filters.verified;
    }

    // If no location filter, use standard Prisma query
    if (!filters.lat || !filters.lng || !filters.radius) {
      const [businesses, total] = await Promise.all([
        this.prisma.businesses.findMany({
          where,
          orderBy: { follower_count: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.businesses.count({ where }),
      ]);

      return {
        total,
        page,
        limit,
        businesses,
      };
    }

    // With location filter, use $queryRaw for geospatial calculation
    const conditions: string[] = [];
    const params: any[] = [];

    // Geospatial condition
    conditions.push(`(
      6371 * acos(
        cos(radians($${params.length + 1})) *
        cos(radians((location->>'lat')::float)) *
        cos(radians((location->>'lng')::float) - radians($${params.length + 2})) +
        sin(radians($${params.length + 1})) *
        sin(radians((location->>'lat')::float))
      )
    ) <= $${params.length + 3}`);
    params.push(filters.lat, filters.lng, filters.radius);

    // Text search
    if (filters.query) {
      conditions.push(`(business_name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${filters.query}%`);
    }

    // Category
    if (filters.category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(filters.category);
    }

    // Verified
    if (filters.verified !== undefined) {
      conditions.push(`is_verified = $${params.length + 1}`);
      params.push(filters.verified);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const businesses = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM businesses ${whereClause} ORDER BY follower_count DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      ...params,
      limit,
      skip,
    );

    const countResult = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM businesses ${whereClause}`,
      ...params,
    );

    const total = Number(countResult[0].count);

    return {
      total,
      page,
      limit,
      businesses,
    };
  }

  async searchDeals(filters: DealSearchFilters, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const now = new Date();

    // Build where clause conditionally
    const where: any = {
      status: DealStatus.ACTIVE as any,
      starts_at: { lte: now },
      expires_at: { gt: now },
    };

    // Text search - use OR condition
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters.category) {
      where.category = filters.category;
    }

    // Price range
    if (filters.minPrice !== undefined) {
      where.discounted_price = { ...where.discounted_price, gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined) {
      where.discounted_price = { ...where.discounted_price, lte: filters.maxPrice };
    }

    // Discount filter
    if (filters.minDiscount !== undefined) {
      where.discount_percentage = { gte: filters.minDiscount };
    }

    // Flash deals only
    if (filters.flashOnly) {
      where.is_flash_deal = true;
    }

    // Tags filter - array overlap
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    // If no location filter, use standard Prisma query
    if (!filters.lat || !filters.lng || !filters.radius) {
      const [deals, total] = await Promise.all([
        this.prisma.deals.findMany({
          where,
          include: { businesses: true },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.deals.count({ where }),
      ]);

      return {
        total,
        page,
        limit,
        deals,
      };
    }

    // With location filter, use $queryRaw for geospatial calculation
    const conditions: string[] = [
      `d.status = 'active'`,
      `d.starts_at <= NOW()`,
      `d.expires_at > NOW()`,
    ];
    const params: any[] = [];

    // Geospatial condition
    conditions.push(`(
      6371 * acos(
        cos(radians($${params.length + 1})) *
        cos(radians((b.location->>'lat')::float)) *
        cos(radians((b.location->>'lng')::float) - radians($${params.length + 2})) +
        sin(radians($${params.length + 1})) *
        sin(radians((b.location->>'lat')::float))
      )
    ) <= $${params.length + 3}`);
    params.push(filters.lat, filters.lng, filters.radius);

    // Text search
    if (filters.query) {
      conditions.push(`(d.title ILIKE $${params.length + 1} OR d.description ILIKE $${params.length + 1})`);
      params.push(`%${filters.query}%`);
    }

    // Category
    if (filters.category) {
      conditions.push(`d.category = $${params.length + 1}`);
      params.push(filters.category);
    }

    // Price range
    if (filters.minPrice !== undefined) {
      conditions.push(`d.discounted_price >= $${params.length + 1}`);
      params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(`d.discounted_price <= $${params.length + 1}`);
      params.push(filters.maxPrice);
    }

    // Discount
    if (filters.minDiscount !== undefined) {
      conditions.push(`d.discount_percentage >= $${params.length + 1}`);
      params.push(filters.minDiscount);
    }

    // Flash deals
    if (filters.flashOnly) {
      conditions.push(`d.is_flash_deal = true`);
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`d.tags && $${params.length + 1}::text[]`);
      params.push(filters.tags);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get deals with business data
    const deals = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT d.*,
        b.id as "business_id",
        b.owner_id as "business_owner_id",
        b.business_name as "business_business_name",
        b.slug as "business_slug",
        b.description as "business_description",
        b.category as "business_category",
        b.subcategory as "business_subcategory",
        b.category_last_changed_at as "business_category_last_changed_at",
        b.location as "business_location",
        b.address as "business_address",
        b.city as "business_city",
        b.state_province as "business_state_province",
        b.country as "business_country",
        b.postal_code as "business_postal_code",
        b.phone as "business_phone",
        b.email as "business_email",
        b.website as "business_website",
        b.hours as "business_hours",
        b.logo_url as "business_logo_url",
        b.cover_image_url as "business_cover_image_url",
        b.images as "business_images",
        b.follower_count as "business_follower_count",
        b.total_deals_posted as "business_total_deals_posted",
        b.total_redemptions as "business_total_redemptions",
        b.average_rating as "business_average_rating",
        b.subscription_tier as "business_subscription_tier",
        b.subscription_expires_at as "business_subscription_expires_at",
        b.is_verified as "business_is_verified",
        b.verification_date as "business_verification_date",
        b.stripe_account_id as "business_stripe_account_id",
        b.payment_enabled as "business_payment_enabled",
        b.created_at as "business_created_at",
        b.updated_at as "business_updated_at"
      FROM deals d
      LEFT JOIN businesses b ON d.business_id = b.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      ...params,
      limit,
      skip,
    );

    const countResult = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count
       FROM deals d
       LEFT JOIN businesses b ON d.business_id = b.id
       ${whereClause}`,
      ...params,
    );

    const total = Number(countResult[0].count);

    // Transform results to include business object
    const dealsWithBusiness = deals.map((row) => {
      const business = {
        id: row.business_id,
        owner_id: row.business_owner_id,
        business_name: row.business_business_name,
        slug: row.business_slug,
        description: row.business_description,
        category: row.business_category,
        subcategory: row.business_subcategory,
        category_last_changed_at: row.business_category_last_changed_at,
        location: row.business_location,
        address: row.business_address,
        city: row.business_city,
        state_province: row.business_state_province,
        country: row.business_country,
        postal_code: row.business_postal_code,
        phone: row.business_phone,
        email: row.business_email,
        website: row.business_website,
        hours: row.business_hours,
        logo_url: row.business_logo_url,
        cover_image_url: row.business_cover_image_url,
        images: row.business_images,
        follower_count: row.business_follower_count,
        total_deals_posted: row.business_total_deals_posted,
        total_redemptions: row.business_total_redemptions,
        average_rating: row.business_average_rating,
        subscription_tier: row.business_subscription_tier,
        subscription_expires_at: row.business_subscription_expires_at,
        is_verified: row.business_is_verified,
        verification_date: row.business_verification_date,
        stripe_account_id: row.business_stripe_account_id,
        payment_enabled: row.business_payment_enabled,
        created_at: row.business_created_at,
        updated_at: row.business_updated_at,
      };

      const deal: any = { ...row };
      Object.keys(deal).forEach(key => {
        if (key.startsWith('business_')) {
          delete deal[key];
        }
      });
      deal.businesses = business;

      return deal;
    });

    return {
      total,
      page,
      limit,
      deals: dealsWithBusiness,
    };
  }

  async searchAll(query: string, lat?: number, lng?: number, radius?: number) {
    const [businesses, deals] = await Promise.all([
      this.searchBusinesses({ query, lat, lng, radius }, 1, 5),
      this.searchDeals({ query, lat, lng, radius }, 1, 5),
    ]);

    return {
      businesses: businesses.businesses,
      deals: deals.deals,
      totals: {
        businesses: businesses.total,
        deals: deals.total,
      },
    };
  }
}
