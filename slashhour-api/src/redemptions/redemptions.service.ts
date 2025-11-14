import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedemptionStatus } from './dto/validate-redemption.dto';
import { BusinessRedemptionQueryDto } from './dto/business-redemption.dto';

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

  /**
   * Validate a redemption (for business owners)
   * Verifies business ownership and updates redemption status
   */
  async validateRedemption(
    redemptionId: string,
    validatorId: string,
    status?: RedemptionStatus,
  ) {
    console.log('🔍 Validating redemption:', { redemptionId, validatorId, status });

    // Get the redemption with business info
    const redemption = await this.prisma.user_redemptions.findUnique({
      where: { id: redemptionId },
      include: {
        businesses: true,
        deals: true,
        users: true,
      },
    });

    console.log('🔍 Redemption found:', {
      exists: !!redemption,
      hasBusiness: !!redemption?.businesses,
      businessId: redemption?.business_id,
      businessOwnerId: redemption?.businesses?.owner_id,
    });

    if (!redemption) {
      throw new NotFoundException('This is not a valid SlashHour redemption code');
    }

    // Check if business relationship exists
    if (!redemption.businesses) {
      console.error('❌ Business relationship not found for redemption:', redemptionId);
      throw new NotFoundException('Business not found for this redemption');
    }

    // Verify that the validator owns the business
    console.log('🔍 Checking ownership:', {
      businessOwnerId: redemption.businesses.owner_id,
      validatorId,
      matches: redemption.businesses.owner_id === validatorId,
    });

    if (redemption.businesses.owner_id !== validatorId) {
      throw new ForbiddenException('You do not have permission to validate this redemption');
    }

    // Check if already validated
    if (redemption.status === 'validated') {
      throw new BadRequestException('Redemption has already been validated');
    }

    // Default status to 'validated' if not provided
    const newStatus = status || RedemptionStatus.VALIDATED;

    // Update redemption with validation info
    const updatedRedemption = await this.prisma.user_redemptions.update({
      where: { id: redemptionId },
      data: {
        status: newStatus,
        validated_at: new Date(),
        validated_by: validatorId,
      },
    });

    return {
      success: true,
      message: `Redemption ${newStatus} successfully`,
      redemption: {
        id: updatedRedemption.id,
        status: updatedRedemption.status,
        validated_at: updatedRedemption.validated_at,
        validated_by: updatedRedemption.validated_by,
      },
    };
  }

  /**
   * Get all redemptions for a business
   * With optional status filtering and pagination
   */
  async getBusinessRedemptions(
    businessId: string,
    userId: string,
    query: BusinessRedemptionQueryDto,
  ) {
    // Verify business ownership
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to view these redemptions');
    }

    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      business_id: businessId,
    };

    if (status) {
      whereClause.status = status;
    }

    // Execute queries in parallel
    const [redemptions, total, statusCounts] = await Promise.all([
      // Get paginated redemptions
      this.prisma.user_redemptions.findMany({
        where: whereClause,
        include: {
          deals: true,
          users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { redeemed_at: 'desc' },
        skip,
        take: limit,
      }),

      // Get total count
      this.prisma.user_redemptions.count({
        where: whereClause,
      }),

      // Get status counts for summary
      this.prisma.user_redemptions.groupBy({
        by: ['status'],
        where: { business_id: businessId },
        _count: true,
      }),
    ]);

    // Transform redemptions to response format
    const transformedRedemptions = redemptions.map(r => ({
      id: r.id,
      status: r.status,
      original_price: parseFloat(r.original_price.toString()),
      paid_price: parseFloat(r.paid_price.toString()),
      savings_amount: parseFloat(r.savings_amount.toString()),
      redeemed_at: r.redeemed_at,
      validated_at: r.validated_at,
      validated_by: r.validated_by,
      deal: r.deals ? {
        id: r.deals.id,
        title: r.deals.title,
        description: r.deals.description,
        images: r.deals.images || [],
      } : null,
      user: r.users ? {
        id: r.users.id,
        username: r.users.username,
        email: r.users.email,
      } : null,
    }));

    // Build summary from status counts
    const summary = {
      total_redemptions: total,
      pending_count: 0,
      validated_count: 0,
      expired_count: 0,
      cancelled_count: 0,
    };

    statusCounts.forEach(item => {
      const count = item._count;
      switch (item.status) {
        case 'pending':
          summary.pending_count = count;
          break;
        case 'validated':
          summary.validated_count = count;
          break;
        case 'expired':
          summary.expired_count = count;
          break;
        case 'cancelled':
          summary.cancelled_count = count;
          break;
      }
    });

    return {
      redemptions: transformedRedemptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      summary,
    };
  }
}
