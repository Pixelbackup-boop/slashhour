import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { admin_role_enum } from '../../../generated/prisma';
import { DateRangeDto } from '../dto/query-params.dto';

@Controller('admin/analytics')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
export class AdminAnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Get('dashboard')
  async getDashboardStats() {
    const [
      totalUsers,
      totalBusinesses,
      totalDeals,
      totalRedemptions,
      activeUsers,
      verifiedBusinesses,
      activeDeals,
    ] = await Promise.all([
      this.prisma.users.count(),
      this.prisma.businesses.count(),
      this.prisma.deals.count(),
      this.prisma.user_redemptions.count(),
      this.prisma.users.count({
        where: {
          last_active_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.businesses.count({ where: { is_verified: true } }),
      this.prisma.deals.count({ where: { status: 'active' } }),
    ]);

    // Get recent growth stats (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [newUsers, newBusinesses, newDeals, newRedemptions] = await Promise.all([
      this.prisma.users.count({
        where: { created_at: { gte: sevenDaysAgo } },
      }),
      this.prisma.businesses.count({
        where: { created_at: { gte: sevenDaysAgo } },
      }),
      this.prisma.deals.count({
        where: { created_at: { gte: sevenDaysAgo } },
      }),
      this.prisma.user_redemptions.count({
        where: { redeemed_at: { gte: sevenDaysAgo } },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalBusinesses,
        totalDeals,
        totalRedemptions,
        activeUsers,
        verifiedBusinesses,
        activeDeals,
      },
      recentGrowth: {
        newUsers,
        newBusinesses,
        newDeals,
        newRedemptions,
      },
    };
  }

  @Get('users/growth')
  async getUserGrowth(@Query() dateRange: DateRangeDto) {
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date();

    const users = await this.prisma.users.groupBy({
      by: ['created_at'],
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    return users;
  }

  @Get('deals/performance')
  async getDealsPerformance(@Query() query: { limit?: number }) {
    const limit = Number(query.limit) || 10;

    const topDeals = await this.prisma.deals.findMany({
      take: limit,
      orderBy: {
        user_redemptions: {
          _count: 'desc',
        },
      },
      include: {
        businesses: {
          select: {
            business_name: true,
          },
        },
        _count: {
          select: {
            user_redemptions: true,
            bookmarks: true,
          },
        },
      },
    });

    return topDeals;
  }

  @Get('businesses/performance')
  async getBusinessesPerformance(@Query() query: { limit?: number }) {
    const limit = Number(query.limit) || 10;

    const topBusinesses = await this.prisma.businesses.findMany({
      take: limit,
      orderBy: [
        { total_redemptions: 'desc' },
        { follower_count: 'desc' },
      ],
      select: {
        id: true,
        business_name: true,
        slug: true,
        category: true,
        follower_count: true,
        total_deals_posted: true,
        total_redemptions: true,
        average_rating: true,
        is_verified: true,
        subscription_tier: true,
      },
    });

    return topBusinesses;
  }

  @Get('redemptions/stats')
  async getRedemptionStats(@Query() dateRange: DateRangeDto) {
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date();

    const [totalRedemptions, totalSavings, avgSavings] = await Promise.all([
      this.prisma.user_redemptions.count({
        where: {
          redeemed_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.user_redemptions.aggregate({
        where: {
          redeemed_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          savings_amount: true,
        },
      }),
      this.prisma.user_redemptions.aggregate({
        where: {
          redeemed_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        _avg: {
          savings_amount: true,
        },
      }),
    ]);

    const redemptionsByCategory = await this.prisma.user_redemptions.groupBy({
      by: ['deal_category'],
      where: {
        redeemed_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      _sum: {
        savings_amount: true,
      },
    });

    return {
      totalRedemptions,
      totalSavings: totalSavings._sum.savings_amount || 0,
      avgSavings: avgSavings._avg.savings_amount || 0,
      byCategory: redemptionsByCategory,
    };
  }

  @Get('revenue/subscriptions')
  @Roles(admin_role_enum.super_admin)
  async getSubscriptionRevenue() {
    const subscriptionCounts = await this.prisma.businesses.groupBy({
      by: ['subscription_tier'],
      _count: true,
    });

    return subscriptionCounts;
  }
}
