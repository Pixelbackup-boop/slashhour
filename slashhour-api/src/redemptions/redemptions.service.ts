import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RedemptionsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async redeemDeal(userId: string, dealId: string) {
    // Get the deal with business info
    const deal = await this.prisma.deals.findUnique({
      where: { id: dealId },
      include: { businesses: true },
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
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check how many times user has redeemed this deal
    const userRedemptions = await this.prisma.user_redemptions.count({
      where: {
        user_id: userId,
        deal_id: dealId,
      },
    });

    if (userRedemptions >= deal.max_per_user) {
      throw new BadRequestException(`You can only redeem this deal ${deal.max_per_user} time(s)`);
    }

    // Create redemption record
    const savingsAmount = Number(deal.original_price) - Number(deal.discounted_price);

    const savedRedemption = await this.prisma.user_redemptions.create({
      data: {
        user_id: userId,
        deal_id: dealId,
        business_id: deal.business_id,
        original_price: deal.original_price,
        paid_price: deal.discounted_price,
        savings_amount: savingsAmount,
        deal_category: deal.category,
      },
    });

    // Increment quantity redeemed
    await this.prisma.deals.update({
      where: { id: dealId },
      data: { quantity_redeemed: deal.quantity_redeemed + 1 },
    });

    return {
      redemption: savedRedemption,
      redemptionCode: savedRedemption.id, // The redemption ID serves as the code
    };
  }

  async getUserRedemptions(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [redemptions, total] = await Promise.all([
      this.prisma.user_redemptions.findMany({
        where: { user_id: userId },
        include: {
          deals: true,
          businesses: true,
          users: true,
        },
        orderBy: { redeemed_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user_redemptions.count({
        where: { user_id: userId },
      }),
    ]);

    // Transform to camelCase response
    const transformedRedemptions = redemptions.map(r => ({
      id: r.id,
      originalPrice: parseFloat(r.original_price.toString()),
      paidPrice: parseFloat(r.paid_price.toString()),
      savingsAmount: parseFloat(r.savings_amount.toString()),
      dealCategory: r.deal_category,
      redeemedAt: r.redeemed_at.toISOString(),
      deal: r.deals ? {
        id: r.deals.id,
        title: r.deals.title,
        description: r.deals.description,
        category: r.deals.category,
        images: r.deals.images || [],
      } : null,
      business: r.businesses ? {
        id: r.businesses.id,
        businessName: r.businesses.business_name,
        category: r.businesses.category,
        address: r.businesses.address,
        city: r.businesses.city,
        country: r.businesses.country,
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
    const redemption = await this.prisma.user_redemptions.findFirst({
      where: {
        id: redemptionId,
        user_id: userId,
      },
      include: {
        deals: true,
        businesses: true,
        users: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    return redemption;
  }
}
