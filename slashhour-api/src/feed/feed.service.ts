import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThan } from 'typeorm';
import { Deal, DealStatus } from '../deals/entities/deal.entity';
import { User } from '../users/entities/user.entity';

interface LocationParams {
  lat?: number;
  lng?: number;
  radius?: number;
}

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getYouFollowFeed(
    userId: string,
    page: number = 1,
    limit: number = 20,
    locationParams?: LocationParams,
  ) {
    const skip = (page - 1) * limit;

    // Get user's followed business IDs first
    const followedBusinessIds = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('follows', 'follow', 'follow.user_id = user.id')
      .where('user.id = :userId', { userId })
      .andWhere('follow.status = :status', { status: 'active' })
      .select('follow.business_id')
      .getRawMany();

    const businessIds = followedBusinessIds.map(row => row.follow_business_id);

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

    // Get deals from followed businesses with proper relation loading
    const [deals, total] = await this.dealRepository.findAndCount({
      where: {
        business_id: In(businessIds),
        status: DealStatus.ACTIVE,
        starts_at: LessThanOrEqual(new Date()),
        expires_at: MoreThan(new Date()),
      },
      relations: ['business'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // If location is provided, calculate distance for each deal
    if (locationParams?.lat != null && locationParams?.lng != null) {
      const userLat = locationParams.lat;
      const userLng = locationParams.lng;

      const dealsWithDistance = deals.map((deal) => {
        const businessLat = (deal.business.location as any)?.lat;
        const businessLng = (deal.business.location as any)?.lng;

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
      deals,
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const lat = locationParams.lat ?? user.default_location?.lat;
    const lng = locationParams.lng ?? user.default_location?.lng;
    const radius = locationParams.radius ?? user.default_radius_km ?? 5;

    if (!lat || !lng) {
      throw new Error('Location is required. Please provide lat/lng or set default location.');
    }

    // Calculate distance using Haversine formula and filter by radius
    // Using JSONB for location storage, we'll calculate distance in the database
    const query = this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.business', 'business')  // ← Changed from innerJoin + addSelect
      .where('deal.status = :dealStatus', { dealStatus: 'active' })
      .andWhere('deal.expires_at > NOW()')
      .andWhere('deal.starts_at <= NOW()')
      // Calculate distance using Haversine formula
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) *
            cos(radians((business.location->>'lat')::float)) *
            cos(radians((business.location->>'lng')::float) - radians(:lng)) +
            sin(radians(:lat)) *
            sin(radians((business.location->>'lat')::float))
          )
        ) <= :radius`,
        { lat, lng, radius },
      )
      .orderBy('deal.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [deals, total] = await query.getManyAndCount();

    // Calculate actual distance for each deal
    const dealsWithDistance = deals.map((deal) => {
      const businessLat = (deal.business.location as any)?.lat;
      const businessLng = (deal.business.location as any)?.lng;

      let distance = 0;
      if (businessLat && businessLng) {
        distance = this.calculateDistance(lat, lng, businessLat, businessLng);
      }

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
