import { Test, TestingModule } from '@nestjs/testing';
import { FollowsService } from './follows.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FollowsService - Critical Paths', () => {
  let service: FollowsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    businesses: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    follows: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('followBusiness', () => {
    it('should successfully follow a business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const business = {
        id: businessId,
        business_name: 'Test Business',
        owner_id: 'owner-789', // Different from userId
        follower_count: 0,
      };

      mockPrismaService.businesses.findUnique.mockResolvedValue(business);
      mockPrismaService.follows.findFirst.mockResolvedValue(null);
      mockPrismaService.follows.create.mockResolvedValue({
        id: 'follow-123',
        user_id: userId,
        business_id: businessId,
        status: 'active',
      });

      const result = await service.followBusiness(userId, businessId);

      expect(result).toHaveProperty('message', 'Successfully followed business');
      expect(mockPrismaService.businesses.update).toHaveBeenCalledWith({
        where: { id: businessId },
        data: { follower_count: { increment: 1 } },
      });
    });

    it('should prevent self-following (owner cannot follow own business)', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const business = {
        id: businessId,
        business_name: 'Test Business',
        owner_id: userId, // Same as userId
      };

      mockPrismaService.businesses.findUnique.mockResolvedValue(business);

      await expect(
        service.followBusiness(userId, businessId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.followBusiness(userId, businessId),
      ).rejects.toThrow('You cannot follow your own business');
    });

    it('should throw error for non-existent business', async () => {
      const userId = 'user-123';
      const businessId = 'non-existent';

      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(
        service.followBusiness(userId, businessId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reactivate existing inactive follow', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const business = {
        id: businessId,
        business_name: 'Test Business',
        owner_id: 'owner-789',
        follower_count: 0,
      };
      const existingFollow = {
        id: 'follow-123',
        user_id: userId,
        business_id: businessId,
        status: 'unfollowed',
      };

      mockPrismaService.businesses.findUnique.mockResolvedValue(business);
      mockPrismaService.follows.findFirst.mockResolvedValue(existingFollow);
      mockPrismaService.follows.update.mockResolvedValue({
        ...existingFollow,
        status: 'active',
      });

      const result = await service.followBusiness(userId, businessId);

      expect(result).toHaveProperty('message', 'Successfully followed business');
      expect(mockPrismaService.follows.update).toHaveBeenCalled();
      expect(mockPrismaService.businesses.update).toHaveBeenCalled();
    });
  });

  describe('unfollowBusiness', () => {
    it('should successfully unfollow a business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const business = {
        id: businessId,
        business_name: 'Test Business',
        follower_count: 5,
      };
      const activeFollow = {
        id: 'follow-123',
        user_id: userId,
        business_id: businessId,
        status: 'active',
      };

      mockPrismaService.businesses.findUnique.mockResolvedValue(business);
      mockPrismaService.follows.findFirst.mockResolvedValue(activeFollow);
      mockPrismaService.follows.update.mockResolvedValue({
        ...activeFollow,
        status: 'unfollowed',
      });

      const result = await service.unfollowBusiness(userId, businessId);

      expect(result).toHaveProperty('message', 'Successfully unfollowed business');
      expect(mockPrismaService.businesses.update).toHaveBeenCalledWith({
        where: { id: businessId },
        data: { follower_count: { decrement: 1 } },
      });
    });

    it('should throw error when trying to unfollow without active follow', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const business = { id: businessId };

      mockPrismaService.businesses.findUnique.mockResolvedValue(business);
      mockPrismaService.follows.findFirst.mockResolvedValue(null);

      await expect(
        service.unfollowBusiness(userId, businessId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBusinessFollowers', () => {
    it('should return list of followers for a business', async () => {
      const businessId = 'business-456';
      const business = {
        id: businessId,
        business_name: 'Test Business',
      };
      const followers = [
        {
          id: 'follow-1',
          user_id: 'user-1',
          business_id: businessId,
          status: 'active',
          followed_at: new Date(),
          users: {
            id: 'user-1',
            username: 'user1',
            name: 'User One',
            avatar_url: null,
          },
        },
        {
          id: 'follow-2',
          user_id: 'user-2',
          business_id: businessId,
          status: 'active',
          followed_at: new Date(),
          users: {
            id: 'user-2',
            username: 'user2',
            name: 'User Two',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      ];

      mockPrismaService.businesses.findUnique.mockResolvedValue(business);
      mockPrismaService.follows.findMany.mockResolvedValue(followers);

      const result = await service.getBusinessFollowers(businessId);

      expect(result.total).toBe(2);
      expect(result.followers).toHaveLength(2);
      expect(result.followers[0]).toHaveProperty('user_id', 'user-1');
      expect(result.followers[0]).toHaveProperty('username', 'user1');
      expect(result.followers[1]).toHaveProperty('avatar_url', 'https://example.com/avatar.jpg');
    });

    it('should return empty array for business with no followers', async () => {
      const businessId = 'business-456';
      const business = { id: businessId };

      mockPrismaService.businesses.findUnique.mockResolvedValue(business);
      mockPrismaService.follows.findMany.mockResolvedValue([]);

      const result = await service.getBusinessFollowers(businessId);

      expect(result.total).toBe(0);
      expect(result.followers).toHaveLength(0);
    });

    it('should throw error for non-existent business', async () => {
      const businessId = 'non-existent';

      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(
        service.getBusinessFollowers(businessId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('muteBusiness', () => {
    it('should successfully mute a business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const activeFollow = {
        id: 'follow-123',
        user_id: userId,
        business_id: businessId,
        status: 'active',
      };

      mockPrismaService.follows.findFirst.mockResolvedValue(activeFollow);
      mockPrismaService.follows.update.mockResolvedValue({
        ...activeFollow,
        status: 'muted',
      });

      const result = await service.muteBusiness(userId, businessId);

      expect(result).toEqual({ message: 'Successfully muted business' });
      expect(mockPrismaService.follows.update).toHaveBeenCalledWith({
        where: { id: 'follow-123' },
        data: { status: 'muted' },
      });
    });

    it('should throw error when not following business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue(null);

      await expect(
        service.muteBusiness(userId, businessId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.muteBusiness(userId, businessId),
      ).rejects.toThrow('Not following this business');
    });

    it('should throw error when follow status is not active', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue({
        id: 'follow-123',
        status: 'unfollowed',
      });

      await expect(
        service.muteBusiness(userId, businessId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unmuteBusiness', () => {
    it('should successfully unmute a business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const mutedFollow = {
        id: 'follow-123',
        user_id: userId,
        business_id: businessId,
        status: 'muted',
      };

      mockPrismaService.follows.findFirst.mockResolvedValue(mutedFollow);
      mockPrismaService.follows.update.mockResolvedValue({
        ...mutedFollow,
        status: 'active',
      });

      const result = await service.unmuteBusiness(userId, businessId);

      expect(result).toEqual({ message: 'Successfully unmuted business' });
      expect(mockPrismaService.follows.update).toHaveBeenCalledWith({
        where: { id: 'follow-123' },
        data: { status: 'active' },
      });
    });

    it('should throw error when business is not muted', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue({
        id: 'follow-123',
        status: 'active',
      });

      await expect(
        service.unmuteBusiness(userId, businessId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.unmuteBusiness(userId, businessId),
      ).rejects.toThrow('Business is not muted');
    });

    it('should throw error when not following business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue(null);

      await expect(
        service.unmuteBusiness(userId, businessId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const activeFollow = {
        id: 'follow-123',
        user_id: userId,
        business_id: businessId,
        status: 'active',
      };

      mockPrismaService.follows.findFirst.mockResolvedValue(activeFollow);
      mockPrismaService.follows.update.mockResolvedValue({
        ...activeFollow,
        notify_new_deals: false,
        notify_flash_deals: true,
      });

      const result = await service.updateNotificationPreferences(
        userId,
        businessId,
        { notify_new_deals: false, notify_flash_deals: true },
      );

      expect(result.message).toBe('Notification preferences updated');
      expect(result.preferences).toEqual({
        notify_new_deals: false,
        notify_flash_deals: true,
      });
    });

    it('should update only notify_new_deals', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';
      const activeFollow = {
        id: 'follow-123',
        user_id: userId,
        business_id: businessId,
        status: 'active',
        notify_new_deals: true,
        notify_flash_deals: false,
      };

      mockPrismaService.follows.findFirst.mockResolvedValue(activeFollow);
      mockPrismaService.follows.update.mockResolvedValue({
        ...activeFollow,
        notify_new_deals: false,
      });

      await service.updateNotificationPreferences(userId, businessId, {
        notify_new_deals: false,
      });

      expect(mockPrismaService.follows.update).toHaveBeenCalledWith({
        where: { id: 'follow-123' },
        data: { notify_new_deals: false },
      });
    });

    it('should throw error when not following business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue(null);

      await expect(
        service.updateNotificationPreferences(userId, businessId, {
          notify_new_deals: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when follow status is unfollowed', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue({
        id: 'follow-123',
        status: 'unfollowed',
      });

      await expect(
        service.updateNotificationPreferences(userId, businessId, {
          notify_new_deals: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFollowedBusinesses', () => {
    it('should return list of followed businesses', async () => {
      const userId = 'user-123';
      const follows = [
        {
          id: 'follow-1',
          user_id: userId,
          business_id: 'business-1',
          status: 'active',
          notify_new_deals: true,
          notify_flash_deals: false,
          followed_at: new Date(),
          businesses: {
            id: 'business-1',
            business_name: 'Business One',
            slug: 'business-one',
            category: 'restaurant',
          },
        },
        {
          id: 'follow-2',
          user_id: userId,
          business_id: 'business-2',
          status: 'muted',
          notify_new_deals: false,
          notify_flash_deals: false,
          followed_at: new Date(),
          businesses: {
            id: 'business-2',
            business_name: 'Business Two',
            slug: 'business-two',
            category: 'retail',
          },
        },
      ];

      mockPrismaService.follows.findMany.mockResolvedValue(follows);

      const result = await service.getFollowedBusinesses(userId);

      expect(result.total).toBe(2);
      expect(result.businesses).toHaveLength(2);
      expect(result.businesses[0]).toMatchObject({
        id: 'business-1',
        business_name: 'Business One',
        follow_status: 'active',
        notify_new_deals: true,
      });
      expect(result.businesses[1].follow_status).toBe('muted');
    });

    it('should return empty array when no followed businesses', async () => {
      const userId = 'user-123';

      mockPrismaService.follows.findMany.mockResolvedValue([]);

      const result = await service.getFollowedBusinesses(userId);

      expect(result.total).toBe(0);
      expect(result.businesses).toHaveLength(0);
    });
  });

  describe('getFollowStatus', () => {
    it('should return following status when user is actively following business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue({
        id: 'follow-123',
        status: 'active',
        notify_new_deals: true,
        notify_flash_deals: false,
        followed_at: new Date(),
      });

      const result = await service.getFollowStatus(userId, businessId);

      expect(result.is_following).toBe(true);
      expect(result.status).toBe('active');
    });

    it('should return not following when user is not following business', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue(null);

      const result = await service.getFollowStatus(userId, businessId);

      expect(result.is_following).toBe(false);
    });

    it('should return not following when follow status is unfollowed', async () => {
      const userId = 'user-123';
      const businessId = 'business-456';

      mockPrismaService.follows.findFirst.mockResolvedValue({
        id: 'follow-123',
        status: 'unfollowed',
      });

      const result = await service.getFollowStatus(userId, businessId);

      expect(result.is_following).toBe(false);
    });
  });
});
