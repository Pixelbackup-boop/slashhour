import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow, FollowStatus } from './entities/follow.entity';
import { Business } from '../businesses/entities/business.entity';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async followBusiness(userId: string, businessId: string) {
    // Check if business exists
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check if already following
    let follow = await this.followRepository.findOne({
      where: { user_id: userId, business_id: businessId },
    });

    if (follow) {
      if (follow.status === FollowStatus.ACTIVE) {
        throw new ConflictException('Already following this business');
      }
      // Reactivate if previously unfollowed
      follow.status = FollowStatus.ACTIVE;
      await this.followRepository.save(follow);
    } else {
      // Create new follow
      follow = this.followRepository.create({
        user_id: userId,
        business_id: businessId,
        status: FollowStatus.ACTIVE,
        notify_new_deals: true,
        notify_flash_deals: false,
      });
      await this.followRepository.save(follow);
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
    const follow = await this.followRepository.findOne({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status === FollowStatus.UNFOLLOWED) {
      throw new NotFoundException('Not following this business');
    }

    follow.status = FollowStatus.UNFOLLOWED;
    await this.followRepository.save(follow);

    return {
      message: 'Successfully unfollowed business',
    };
  }

  async muteBusiness(userId: string, businessId: string) {
    const follow = await this.followRepository.findOne({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status !== FollowStatus.ACTIVE) {
      throw new NotFoundException('Not following this business');
    }

    follow.status = FollowStatus.MUTED;
    await this.followRepository.save(follow);

    return {
      message: 'Successfully muted business',
    };
  }

  async unmuteBusiness(userId: string, businessId: string) {
    const follow = await this.followRepository.findOne({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status !== FollowStatus.MUTED) {
      throw new NotFoundException('Business is not muted');
    }

    follow.status = FollowStatus.ACTIVE;
    await this.followRepository.save(follow);

    return {
      message: 'Successfully unmuted business',
    };
  }

  async updateNotificationPreferences(
    userId: string,
    businessId: string,
    updateDto: UpdateNotificationPreferencesDto,
  ) {
    const follow = await this.followRepository.findOne({
      where: { user_id: userId, business_id: businessId },
    });

    if (!follow || follow.status === FollowStatus.UNFOLLOWED) {
      throw new NotFoundException('Not following this business');
    }

    if (updateDto.notify_new_deals !== undefined) {
      follow.notify_new_deals = updateDto.notify_new_deals;
    }

    if (updateDto.notify_flash_deals !== undefined) {
      follow.notify_flash_deals = updateDto.notify_flash_deals;
    }

    await this.followRepository.save(follow);

    return {
      message: 'Notification preferences updated',
      preferences: {
        notify_new_deals: follow.notify_new_deals,
        notify_flash_deals: follow.notify_flash_deals,
      },
    };
  }

  async getFollowedBusinesses(userId: string) {
    const follows = await this.followRepository
      .createQueryBuilder('follow')
      .innerJoinAndSelect('follow.business', 'business')
      .where('follow.user_id = :userId', { userId })
      .andWhere('follow.status IN (:...statuses)', {
        statuses: [FollowStatus.ACTIVE, FollowStatus.MUTED],
      })
      .orderBy('follow.followed_at', 'DESC')
      .getMany();

    return {
      total: follows.length,
      businesses: follows.map((follow) => ({
        ...follow.business,
        follow_status: follow.status,
        notify_new_deals: follow.notify_new_deals,
        notify_flash_deals: follow.notify_flash_deals,
        followed_at: follow.followed_at,
      })),
    };
  }

  async getFollowStatus(userId: string, businessId: string) {
    const follow = await this.followRepository.findOne({
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
}
