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
