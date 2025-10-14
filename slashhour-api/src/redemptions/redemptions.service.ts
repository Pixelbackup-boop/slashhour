import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRedemption } from '../users/entities/user-redemption.entity';
import { Deal } from '../deals/entities/deal.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RedemptionsService {
  constructor(
    @InjectRepository(UserRedemption)
    private redemptionRepository: Repository<UserRedemption>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async redeemDeal(userId: string, dealId: string) {
    // Get the deal with business info
    const deal = await this.dealRepository.findOne({
      where: { id: dealId },
      relations: ['business'],
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Check if deal is still active
    if (deal.status !== 'active') {
      throw new BadRequestException('Deal is not active');
    }

    // Check if deal is expired
    if (new Date(deal.expires_at) < new Date()) {
      throw new BadRequestException('Deal has expired');
    }

    // Check if deal has started
    if (new Date(deal.starts_at) > new Date()) {
      throw new BadRequestException('Deal has not started yet');
    }

    // Check quantity available
    if (deal.quantity_available && deal.quantity_redeemed >= deal.quantity_available) {
      throw new BadRequestException('Deal sold out');
    }

    // Load the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check how many times user has redeemed this deal
    const userRedemptions = await this.redemptionRepository
      .createQueryBuilder('redemption')
      .leftJoin('redemption.user', 'user')
      .leftJoin('redemption.deal', 'deal')
      .where('user.id = :userId', { userId })
      .andWhere('deal.id = :dealId', { dealId })
      .getCount();

    if (userRedemptions >= deal.max_per_user) {
      throw new BadRequestException(`You can only redeem this deal ${deal.max_per_user} time(s)`);
    }

    // Create redemption record with proper entity relations
    console.log('🔍 Creating redemption for:', {
      userId: user.id,
      dealId: deal.id,
      businessId: deal.business.id,
    });

    const redemption = this.redemptionRepository.create({
      user,
      deal,
      business: deal.business,
      original_price: deal.original_price,
      paid_price: deal.discounted_price,
      savings_amount: Number(deal.original_price) - Number(deal.discounted_price),
      deal_category: deal.category,
    });

    console.log('✅ Redemption entity created:', {
      hasUser: !!redemption.user,
      hasDeal: !!redemption.deal,
      hasBusiness: !!redemption.business,
      originalPrice: redemption.original_price,
      paidPrice: redemption.paid_price,
    });

    console.log('💾 Saving redemption to database...');
    const savedRedemption = await this.redemptionRepository.save(redemption);
    console.log('✅ Redemption saved successfully! ID:', savedRedemption.id);

    // Increment quantity redeemed
    await this.dealRepository.update(dealId, {
      quantity_redeemed: deal.quantity_redeemed + 1,
    });

    return {
      redemption: savedRedemption,
      redemptionCode: savedRedemption.id, // The redemption ID serves as the code
    };
  }

  async getUserRedemptions(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [redemptions, total] = await this.redemptionRepository
      .createQueryBuilder('redemption')
      .leftJoinAndSelect('redemption.deal', 'deal')
      .leftJoinAndSelect('redemption.business', 'business')
      .leftJoinAndSelect('redemption.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('redemption.redeemed_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Transform to camelCase response
    const transformedRedemptions = redemptions.map(r => ({
      id: r.id,
      originalPrice: parseFloat(r.original_price.toString()),
      paidPrice: parseFloat(r.paid_price.toString()),
      savingsAmount: parseFloat(r.savings_amount.toString()),
      dealCategory: r.deal_category,
      redeemedAt: r.redeemed_at.toISOString(),
      deal: r.deal ? {
        id: r.deal.id,
        title: r.deal.title,
        description: r.deal.description,
        category: r.deal.category,
        images: r.deal.images || [],
      } : null,
      business: r.business ? {
        id: r.business.id,
        businessName: r.business.business_name,
        category: r.business.category,
        address: r.business.address,
        city: r.business.city,
        country: r.business.country,
      } : null,
    }));

    return {
      redemptions: transformedRedemptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async getRedemptionDetails(userId: string, redemptionId: string) {
    const redemption = await this.redemptionRepository
      .createQueryBuilder('redemption')
      .leftJoinAndSelect('redemption.deal', 'deal')
      .leftJoinAndSelect('redemption.business', 'business')
      .leftJoinAndSelect('redemption.user', 'user')
      .where('redemption.id = :redemptionId', { redemptionId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    return redemption;
  }
}
