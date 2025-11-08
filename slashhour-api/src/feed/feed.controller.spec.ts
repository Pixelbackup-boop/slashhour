import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

describe('FeedController', () => {
  let controller: FeedController;
  let feedService: FeedService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockDealId = 'deal-123';

  const mockUser = {
    id: mockUserId,
    sub: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockDeal = {
    id: mockDealId,
    business_id: mockBusinessId,
    title: '50% Off Pizza',
    description: 'Great deal',
    original_price: 20.00,
    discounted_price: 10.00,
    category: 'food_beverage',
    status: 'active',
    isBookmarked: false,
    distance: 2.5,
    created_at: new Date(),
  };

  // Type-safe mocks (2025 best practice)
  const mockFeedService: {
    getYouFollowFeed: jest.Mock;
    getNearYouFeed: jest.Mock;
  } = {
    getYouFollowFeed: jest.fn(),
    getNearYouFeed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [{ provide: FeedService, useValue: mockFeedService }],
    }).compile();

    controller = module.get<FeedController>(FeedController);
    feedService = module.get<FeedService>(FeedService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /feed/you-follow', () => {
    it('should return deals from followed businesses', async () => {
      const mockResponse = {
        deals: [mockDeal],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasMore: false,
        },
      };

      mockFeedService.getYouFollowFeed.mockResolvedValue(mockResponse);

      const result = await controller.getYouFollowFeed(
        mockRequest as never,
        1,
        20,
      );

      expect(result).toEqual(mockResponse);
      expect(mockFeedService.getYouFollowFeed).toHaveBeenCalledWith(
        mockUserId,
        1,
        20,
        { lat: undefined, lng: undefined },
      );
    });

    it('should include location params when provided', async () => {
      const lat = 40.7128;
      const lng = -74.0060;

      const mockResponse = {
        deals: [mockDeal],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasMore: false,
        },
      };

      mockFeedService.getYouFollowFeed.mockResolvedValue(mockResponse);

      const result = await controller.getYouFollowFeed(
        mockRequest as never,
        1,
        20,
        lat,
        lng,
      );

      expect(result).toEqual(mockResponse);
      expect(mockFeedService.getYouFollowFeed).toHaveBeenCalledWith(
        mockUserId,
        1,
        20,
        { lat, lng },
      );
    });

    it('should use default pagination values', async () => {
      mockFeedService.getYouFollowFeed.mockResolvedValue({
        deals: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });

      await controller.getYouFollowFeed(mockRequest as never);

      expect(mockFeedService.getYouFollowFeed).toHaveBeenCalledWith(
        mockUserId,
        1,
        20,
        { lat: undefined, lng: undefined },
      );
    });
  });

  describe('GET /feed/near-you', () => {
    it('should return nearby deals', async () => {
      const lat = 40.7128;
      const lng = -74.0060;
      const radius = 5;

      const mockResponse = {
        deals: [mockDeal],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasMore: false,
        },
      };

      mockFeedService.getNearYouFeed.mockResolvedValue(mockResponse);

      const result = await controller.getNearYouFeed(
        mockRequest as never,
        lat,
        lng,
        radius,
        1,
        20,
      );

      expect(result).toEqual(mockResponse);
      expect(mockFeedService.getNearYouFeed).toHaveBeenCalledWith(
        mockUserId,
        { lat, lng, radius },
        1,
        20,
      );
    });

    it('should use default radius when not provided', async () => {
      const lat = 40.7128;
      const lng = -74.0060;

      mockFeedService.getNearYouFeed.mockResolvedValue({
        deals: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });

      await controller.getNearYouFeed(mockRequest as never, lat, lng);

      expect(mockFeedService.getNearYouFeed).toHaveBeenCalledWith(
        mockUserId,
        { lat, lng, radius: undefined },
        1,
        20,
      );
    });

    it('should handle pagination correctly', async () => {
      const lat = 40.7128;
      const lng = -74.0060;
      const page = 3;
      const limit = 10;

      mockFeedService.getNearYouFeed.mockResolvedValue({
        deals: [],
        pagination: {
          page,
          limit,
          total: 50,
          totalPages: 5,
          hasMore: true,
        },
      });

      const result = await controller.getNearYouFeed(
        mockRequest as never,
        lat,
        lng,
        undefined,
        page,
        limit,
      );

      expect(result.pagination.page).toBe(page);
      expect(result.pagination.limit).toBe(limit);
      expect(result.pagination.hasMore).toBe(true);
      expect(mockFeedService.getNearYouFeed).toHaveBeenCalledWith(
        mockUserId,
        { lat, lng, radius: undefined },
        page,
        limit,
      );
    });
  });
});
