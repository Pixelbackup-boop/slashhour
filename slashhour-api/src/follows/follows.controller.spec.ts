import { Test, TestingModule } from '@nestjs/testing';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

describe('FollowsController', () => {
  let controller: FollowsController;
  let followsService: FollowsService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockFollowId = 'follow-123';

  const mockRequest = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    },
  };

  const mockFollow = {
    id: mockFollowId,
    user_id: mockUserId,
    business_id: mockBusinessId,
    status: 'active',
    notify_new_deals: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Type-safe mocks (2025 best practice)
  const mockFollowsService: {
    followBusiness: jest.Mock;
    unfollowBusiness: jest.Mock;
    getFollowedBusinesses: jest.Mock;
    getBusinessFollowers: jest.Mock;
    updateNotificationPreferences: jest.Mock;
    getFollowStatus: jest.Mock;
  } = {
    followBusiness: jest.fn(),
    unfollowBusiness: jest.fn(),
    getFollowedBusinesses: jest.fn(),
    getBusinessFollowers: jest.fn(),
    updateNotificationPreferences: jest.fn(),
    getFollowStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowsController],
      providers: [{ provide: FollowsService, useValue: mockFollowsService }],
    }).compile();

    controller = module.get<FollowsController>(FollowsController);
    followsService = module.get<FollowsService>(FollowsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /follows/:businessId', () => {
    it('should follow a business', async () => {
      const mockResponse = {
        message: 'Successfully followed business',
        follow: mockFollow,
      };

      mockFollowsService.followBusiness.mockResolvedValue(mockResponse);

      const result = await controller.followBusiness(
        mockRequest as never,
        mockBusinessId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockFollowsService.followBusiness).toHaveBeenCalledWith(
        mockUserId,
        mockBusinessId,
      );
    });
  });

  describe('DELETE /follows/:businessId', () => {
    it('should unfollow a business', async () => {
      const mockResponse = {
        message: 'Successfully unfollowed business',
      };

      mockFollowsService.unfollowBusiness.mockResolvedValue(mockResponse);

      const result = await controller.unfollowBusiness(
        mockRequest as never,
        mockBusinessId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockFollowsService.unfollowBusiness).toHaveBeenCalledWith(
        mockUserId,
        mockBusinessId,
      );
    });
  });

  describe('GET /follows', () => {
    it('should return businesses user is following', async () => {
      const mockResponse = {
        following: [
          {
            ...mockFollow,
            businesses: {
              id: mockBusinessId,
              business_name: 'Test Pizza',
              category: 'food_beverage',
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockFollowsService.getFollowedBusinesses.mockResolvedValue(mockResponse);

      const result = await controller.getFollowedBusinesses(mockRequest as never);

      expect(result).toEqual(mockResponse);
      expect(mockFollowsService.getFollowedBusinesses).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('GET /follows/:businessId/followers', () => {
    it('should return followers of a business', async () => {
      const mockResponse = {
        followers: [
          {
            id: 'follow-456',
            user_id: 'user-456',
            business_id: mockBusinessId,
            users: {
              id: 'user-456',
              username: 'follower1',
              name: 'Follower One',
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockFollowsService.getBusinessFollowers.mockResolvedValue(mockResponse);

      const result = await controller.getBusinessFollowers(mockBusinessId);

      expect(result).toEqual(mockResponse);
      expect(mockFollowsService.getBusinessFollowers).toHaveBeenCalledWith(
        mockBusinessId,
      );
    });
  });

  describe('PATCH /follows/:businessId/notifications', () => {
    it('should update notification preferences', async () => {
      const updateDto: UpdateNotificationPreferencesDto = {
        notify_new_deals: false,
      };

      const mockResponse = {
        message: 'Notification preferences updated',
        follow: {
          ...mockFollow,
          notify_new_deals: false,
        },
      };

      mockFollowsService.updateNotificationPreferences.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.updateNotificationPreferences(
        mockRequest as never,
        mockBusinessId,
        updateDto,
      );

      expect(result).toEqual(mockResponse);
      expect(
        mockFollowsService.updateNotificationPreferences,
      ).toHaveBeenCalledWith(mockUserId, mockBusinessId, updateDto);
    });
  });

  describe('GET /follows/:businessId', () => {
    it('should check if user is following business', async () => {
      const mockResponse = { isFollowing: true };

      mockFollowsService.getFollowStatus.mockResolvedValue(mockResponse);

      const result = await controller.getFollowStatus(
        mockRequest as never,
        mockBusinessId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockFollowsService.getFollowStatus).toHaveBeenCalledWith(
        mockUserId,
        mockBusinessId,
      );
    });

    it('should return false when not following', async () => {
      const mockResponse = { isFollowing: false };

      mockFollowsService.getFollowStatus.mockResolvedValue(mockResponse);

      const result = await controller.getFollowStatus(
        mockRequest as never,
        mockBusinessId,
      );

      expect(result.is_following).toBe(false);
    });
  });
});
