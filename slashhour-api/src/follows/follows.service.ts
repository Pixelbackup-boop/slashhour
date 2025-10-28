import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Follow, FollowStatus } from './entities/follow.entity';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async followBusiness(userId: string, businessId: string) {
    // Check if business exists
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Prevent business owners from following their own business
    if (business.owner_id === userId) {
      throw new BadRequestException('You cannot follow your own business');
    }

    // Check if already following
    let follow = await this.prisma.follows.findFirst({
      where: { user_id: userId, business_id: businessId },
    });

    if (follow) {
      if (follow.status === FollowStatus.ACTIVE) {
        throw new ConflictException('Already following this business');
      }
      // Reactivate if previously unfollowed
      follow = await this.prisma.follows.update({
        where: { id: follow.id },
        data: { status: FollowStatus.ACTIVE as any },
      });

      // Increment follower count when reactivating
      await this.prisma.businesses.update({
        where: { id: businessId },
        data: { follower_count: { increment: 1 } },
      });
    } else {
      // Create new follow
      follow = await this.prisma.follows.create({
        data: {
          user_id: userId,
          business_id: businessId,
          status: FollowStatus.ACTIVE as any,
          notify_new_deals: true,
          notify_flash_deals: false,
        },
      });

      // Increment follower count for new follow
      await this.prisma.businesses.update({
        where: { id: businessId },
        data: { follower_count: { increment: 1 } },
      });
    }

    return {
      message: 'Successfully followed business',
      follow: {
        id: follow.id,
        business_id: businessId,
        status: follow.status,
        notify_new_deals: follow.notify_new_deals,
        notify_flash_deals: follow.notify_flash_deals,
        followed_at: follow.followed_at,
      },
    };
  }

  async unfollowBusiness(userId: string, businessId: string) {
    const follow = await this.prisma.follows.findFirst({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status === FollowStatus.UNFOLLOWED) {
      throw new NotFoundException('Not following this business');
    }

    await this.prisma.follows.update({
      where: { id: follow.id },
      data: { status: FollowStatus.UNFOLLOWED as any },
    });

    // Decrement follower count when unfollowing
    await this.prisma.businesses.update({
      where: { id: businessId },
      data: { follower_count: { decrement: 1 } },
    });

    return {
      message: 'Successfully unfollowed business',
    };
  }

  async muteBusiness(userId: string, businessId: string) {
    const follow = await this.prisma.follows.findFirst({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status !== FollowStatus.ACTIVE) {
      throw new NotFoundException('Not following this business');
    }

    await this.prisma.follows.update({
      where: { id: follow.id },
      data: { status: FollowStatus.MUTED as any },
    });

    return {
      message: 'Successfully muted business',
    };
  }

  async unmuteBusiness(userId: string, businessId: string) {
    const follow = await this.prisma.follows.findFirst({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status !== FollowStatus.MUTED) {
      throw new NotFoundException('Business is not muted');
    }

    await this.prisma.follows.update({
      where: { id: follow.id },
      data: { status: FollowStatus.ACTIVE as any },
    });

    return {
      message: 'Successfully unmuted business',
    };
  }

  async updateNotificationPreferences(
    userId: string,
    businessId: string,
    updateDto: UpdateNotificationPreferencesDto,
  ) {
    const follow = await this.prisma.follows.findFirst({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status === FollowStatus.UNFOLLOWED) {
      throw new NotFoundException('Not following this business');
    }

    const updateData: any = {};
    if (updateDto.notify_new_deals !== undefined) {
      updateData.notify_new_deals = updateDto.notify_new_deals;
    }
    if (updateDto.notify_flash_deals !== undefined) {
      updateData.notify_flash_deals = updateDto.notify_flash_deals;
    }

    const updatedFollow = await this.prisma.follows.update({
      where: { id: follow.id },
      data: updateData,
    });

    return {
      message: 'Notification preferences updated',
      preferences: {
        notify_new_deals: updatedFollow.notify_new_deals,
        notify_flash_deals: updatedFollow.notify_flash_deals,
      },
    };
  }

  async getFollowedBusinesses(userId: string) {
    const follows = await this.prisma.follows.findMany({
      where: {
        user_id: userId,
        status: {
          in: [FollowStatus.ACTIVE as any, FollowStatus.MUTED as any],
        },
      },
      include: {
        businesses: true,
      },
      orderBy: {
        followed_at: 'desc',
      },
    });

    return {
      total: follows.length,
      businesses: follows.map((follow) => ({
        ...follow.businesses,
        follow_status: follow.status,
        notify_new_deals: follow.notify_new_deals,
        notify_flash_deals: follow.notify_flash_deals,
        followed_at: follow.followed_at,
      })),
    };
  }

  async getFollowStatus(userId: string, businessId: string) {
    const follow = await this.prisma.follows.findFirst({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status === FollowStatus.UNFOLLOWED) {
      return {
        is_following: false,
      };
    }

    return {
      is_following: true,
      status: follow.status,
      notify_new_deals: follow.notify_new_deals,
      notify_flash_deals: follow.notify_flash_deals,
      followed_at: follow.followed_at,
    };
  }

  async getBusinessFollowers(businessId: string) {
    // Check if business exists
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Get all active followers with user details
    const followers = await this.prisma.follows.findMany({
      where: {
        business_id: businessId,
        status: FollowStatus.ACTIVE as any,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        followed_at: 'desc',
      },
    });

    return {
      total: followers.length,
      followers: followers.map((follow) => ({
        user_id: follow.users.id,
        username: follow.users.username,
        name: follow.users.name,
        avatar_url: follow.users.avatar_url,
        followed_at: follow.followed_at,
      })),
    };
  }
}
