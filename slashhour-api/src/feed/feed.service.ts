import { Injectable } from '@nestjs/common';
import { DealStatus } from '../deals/entities/deal.entity';
import { PrismaService } from '../prisma/prisma.service';

interface LocationParams {
  lat?: number;
  lng?: number;
  radius?: number;
}

@Injectable()
export class FeedService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getYouFollowFeed(
    userId: string,
    page: number = 1,
    limit: number = 20,
    locationParams?: LocationParams,
  ) {
    const skip = (page - 1) * limit;

    // Get user's followed business IDs first
    const followedBusinesses = await this.prisma.follows.findMany({
      where: {
        user_id: userId,
        status: 'active' as any,
      },
      select: {
        business_id: true,
      },
    });

    const businessIds = followedBusinesses.map(f => f.business_id);

    if (businessIds.length === 0) {
      return {
        deals: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    }

    const now = new Date();

    // Get deals from followed businesses with proper relation loading
    const [deals, total] = await Promise.all([
      this.prisma.deals.findMany({
        where: {
          business_id: { in: businessIds },
          status: DealStatus.ACTIVE as any,
          starts_at: { lte: now },
          expires_at: { gt: now },
        },
        include: { businesses: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.deals.count({
        where: {
          business_id: { in: businessIds },
          status: DealStatus.ACTIVE as any,
          starts_at: { lte: now },
          expires_at: { gt: now },
        },
      }),
    ]);

    // Transform deals to match frontend interface (rename 'businesses' to 'business')
    const transformedDeals = deals.map((deal: any) => {
      const { businesses, ...dealData } = deal;
      return {
        ...dealData,
        business: businesses, // Rename from 'businesses' (Prisma relation) to 'business' (frontend interface)
      };
    });

    // If location is provided, calculate distance for each deal
    if (locationParams?.lat != null && locationParams?.lng != null) {
      const userLat = locationParams.lat;
      const userLng = locationParams.lng;

      const dealsWithDistance = transformedDeals.map((deal: any) => {
        const businessLat = deal.business?.location?.lat;
        const businessLng = deal.business?.location?.lng;

        let distance = 0;
        if (businessLat != null && businessLng != null) {
          distance = this.calculateDistance(
            userLat,
            userLng,
            businessLat,
            businessLng,
          );
        }

        return {
          ...deal,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        };
      });

      return {
        deals: dealsWithDistance,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    }

    return {
      deals: transformedDeals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async getNearYouFeed(
    userId: string,
    locationParams: LocationParams,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    // Get user's default location and radius if not provided
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const lat = locationParams.lat ?? (user.default_location as any)?.lat;
    const lng = locationParams.lng ?? (user.default_location as any)?.lng;
    const radius = locationParams.radius ?? user.default_radius_km ?? 5;

    if (!lat || !lng) {
      throw new Error('Location is required. Please provide lat/lng or set default location.');
    }

    // Calculate distance using Haversine formula and filter by radius
    // Using raw query for complex geospatial calculation
    const deals = await this.prisma.$queryRaw<any[]>`
      SELECT
        d.*,
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
      WHERE d.status = 'active'
        AND d.expires_at > NOW()
        AND d.starts_at <= NOW()
        AND (
          6371 * acos(
            cos(radians(${lat})) *
            cos(radians((b.location->>'lat')::float)) *
            cos(radians((b.location->>'lng')::float) - radians(${lng})) +
            sin(radians(${lat})) *
            sin(radians((b.location->>'lat')::float))
          )
        ) <= ${radius}
      ORDER BY d.created_at DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    // Get total count for pagination
    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM deals d
      LEFT JOIN businesses b ON d.business_id = b.id
      WHERE d.status = 'active'
        AND d.expires_at > NOW()
        AND d.starts_at <= NOW()
        AND (
          6371 * acos(
            cos(radians(${lat})) *
            cos(radians((b.location->>'lat')::float)) *
            cos(radians((b.location->>'lng')::float) - radians(${lng})) +
            sin(radians(${lat})) *
            sin(radians((b.location->>'lat')::float))
          )
        ) <= ${radius}
    `;

    const total = Number(countResult[0].count);

    // Transform raw results to include business object and calculate distance
    const dealsWithDistance = deals.map((row) => {
      // Extract business fields from flattened result
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

      const businessLat = (business.location as any)?.lat;
      const businessLng = (business.location as any)?.lng;

      let distance = 0;
      if (businessLat && businessLng) {
        distance = this.calculateDistance(lat, lng, businessLat, businessLng);
      }

      // Remove business_ prefixed fields and add business object
      const deal: any = { ...row };
      Object.keys(deal).forEach(key => {
        if (key.startsWith('business_')) {
          delete deal[key];
        }
      });
      deal.business = business; // Use 'business' (singular) to match frontend interface

      return {
        ...deal,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      };
    });

    return {
      deals: dealsWithDistance,
      location: { lat, lng, radius },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  // Haversine formula to calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
