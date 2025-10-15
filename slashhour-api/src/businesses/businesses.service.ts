import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { Deal, DealStatus } from '../deals/entities/deal.entity';
import { UserRedemption } from '../users/entities/user-redemption.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(UserRedemption)
    private redemptionRepository: Repository<UserRedemption>,
  ) {}

  async create(userId: string, createBusinessDto: CreateBusinessDto) {
    // Check if slug is already taken
    const existingBusiness = await this.businessRepository.findOne({
      where: { slug: createBusinessDto.slug },
    });

    if (existingBusiness) {
      throw new ConflictException('Business slug already exists');
    }

    const business = this.businessRepository.create({
      ...createBusinessDto,
      owner_id: userId,
    });

    await this.businessRepository.save(business);

    return {
      message: 'Business created successfully',
      business: {
        id: business.id,
        business_name: business.business_name,
        slug: business.slug,
        category: business.category,
        location: business.location,
        address: business.address,
        created_at: business.created_at,
      },
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [businesses, total] = await this.businessRepository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      total,
      page,
      limit,
      businesses,
    };
  }

  async findOne(id: string) {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async findBySlug(slug: string) {
    const business = await this.businessRepository.findOne({
      where: { slug },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async findByOwner(userId: string) {
    const businesses = await this.businessRepository.find({
      where: { owner_id: userId },
      order: { created_at: 'DESC' },
    });

    return {
      total: businesses.length,
      businesses,
    };
  }

  async update(id: string, userId: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await this.businessRepository.findOne({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check ownership
    if (business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this business');
    }

    // Check slug uniqueness if updating
    if (updateBusinessDto.slug && updateBusinessDto.slug !== business.slug) {
      const existingBusiness = await this.businessRepository.findOne({
        where: { slug: updateBusinessDto.slug },
      });

      if (existingBusiness) {
        throw new ConflictException('Business slug already exists');
      }
    }

    Object.assign(business, updateBusinessDto);
    await this.businessRepository.save(business);

    return {
      message: 'Business updated successfully',
      business,
    };
  }

  async delete(id: string, userId: string) {
    const business = await this.businessRepository.findOne({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check ownership
    if (business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this business');
    }

    await this.businessRepository.remove(business);

    return {
      message: 'Business deleted successfully',
    };
  }

  async updateStats(businessId: string, stats: Partial<Business>) {
    await this.businessRepository.update(businessId, stats);
  }

  async searchByLocation(lat: number, lng: number, radius: number = 5, category?: string) {
    let query = this.businessRepository
      .createQueryBuilder('business')
      .where(
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
      );

    if (category) {
      query = query.andWhere('business.category = :category', { category });
    }

    const businesses = await query
      .orderBy('business.follower_count', 'DESC')
      .getMany();

    return {
      total: businesses.length,
      businesses,
    };
  }

  async getBusinessDeals(businessId: string) {
    // Verify business exists
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Get all active deals for this business
    const deals = await this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.business_id = :businessId', { businessId })
      .andWhere('deal.status = :status', { status: DealStatus.ACTIVE })
      .andWhere('deal.starts_at <= :now', { now: new Date() })
      .andWhere('deal.expires_at > :now', { now: new Date() })
      .orderBy('deal.created_at', 'DESC')
      .getMany();

    return {
      deals,
    };
  }

  async getBusinessStats(businessId: string) {
    // Verify business exists
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Get active deal count
    const activeDealCount = await this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.business_id = :businessId', { businessId })
      .andWhere('deal.status = :status', { status: DealStatus.ACTIVE })
      .andWhere('deal.starts_at <= :now', { now: new Date() })
      .andWhere('deal.expires_at > :now', { now: new Date() })
      .getCount();

    // Get total savings from all redemptions for this business
    const result = await this.redemptionRepository
      .createQueryBuilder('redemption')
      .leftJoin('redemption.business', 'business')
      .select('SUM(redemption.savings_amount)', 'totalSavings')
      .where('business.id = :businessId', { businessId })
      .getRawOne();

    const totalSavings = result?.totalSavings ? parseFloat(result.totalSavings) : 0;

    return {
      activeDealCount,
      followerCount: business.follower_count,
      totalSavings: `$${totalSavings.toFixed(2)}`,
    };
  }
}
