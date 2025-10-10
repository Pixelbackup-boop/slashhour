import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessCategory } from '../businesses/entities/business.entity';
import { Deal, DealStatus } from '../deals/entities/deal.entity';

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
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
  ) {}

  async searchBusinesses(filters: BusinessSearchFilters, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    let query = this.businessRepository.createQueryBuilder('business');

    // Text search
    if (filters.query) {
      query = query.andWhere(
        '(business.business_name ILIKE :query OR business.description ILIKE :query)',
        { query: `%${filters.query}%` },
      );
    }

    // Category filter
    if (filters.category) {
      query = query.andWhere('business.category = :category', { category: filters.category });
    }

    // Verified filter
    if (filters.verified !== undefined) {
      query = query.andWhere('business.is_verified = :verified', { verified: filters.verified });
    }

    // Location filter
    if (filters.lat && filters.lng && filters.radius) {
      query = query.andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) *
            cos(radians((business.location->>'lat')::float)) *
            cos(radians((business.location->>'lng')::float) - radians(:lng)) +
            sin(radians(:lat)) *
            sin(radians((business.location->>'lat')::float))
          )
        ) <= :radius`,
        { lat: filters.lat, lng: filters.lng, radius: filters.radius },
      );
    }

    const [businesses, total] = await query
      .orderBy('business.follower_count', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      total,
      page,
      limit,
      businesses,
    };
  }

  async searchDeals(filters: DealSearchFilters, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    let query = this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.business', 'business')
      .where('deal.status = :status', { status: DealStatus.ACTIVE })
      .andWhere('deal.starts_at <= :now', { now: new Date() })
      .andWhere('deal.expires_at > :now', { now: new Date() });

    // Text search
    if (filters.query) {
      query = query.andWhere(
        '(deal.title ILIKE :query OR deal.description ILIKE :query)',
        { query: `%${filters.query}%` },
      );
    }

    // Category filter
    if (filters.category) {
      query = query.andWhere('deal.category = :category', { category: filters.category });
    }

    // Price range
    if (filters.minPrice !== undefined) {
      query = query.andWhere('deal.discounted_price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      query = query.andWhere('deal.discounted_price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    // Discount filter
    if (filters.minDiscount !== undefined) {
      query = query.andWhere('deal.discount_percentage >= :minDiscount', { minDiscount: filters.minDiscount });
    }

    // Flash deals only
    if (filters.flashOnly) {
      query = query.andWhere('deal.is_flash_deal = :flashOnly', { flashOnly: true });
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      query = query.andWhere('deal.tags && :tags', { tags: filters.tags });
    }

    // Location filter (based on business location)
    if (filters.lat && filters.lng && filters.radius) {
      query = query.andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) *
            cos(radians((business.location->>'lat')::float)) *
            cos(radians((business.location->>'lng')::float) - radians(:lng)) +
            sin(radians(:lat)) *
            sin(radians((business.location->>'lat')::float))
          )
        ) <= :radius`,
        { lat: filters.lat, lng: filters.lng, radius: filters.radius },
      );
    }

    const [deals, total] = await query
      .orderBy('deal.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      total,
      page,
      limit,
      deals,
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
