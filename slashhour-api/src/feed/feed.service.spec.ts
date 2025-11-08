import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { PrismaService } from '../prisma/prisma.service';
import { DealStatus } from '../deals/entities/deal.entity';

describe('FeedService', () => {
  let service: FeedService;
  let prismaService: PrismaService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockDealId = 'deal-123';

  const mockBusiness = {
    id: mockBusinessId,
    owner_id: 'owner-123',
    business_name: 'Test Pizza Shop',
    slug: 'test-pizza',
    category: 'restaurant',
    location: { lat: 40.7128, lng: -74.0060 },
    logo_url: 'http://example.com/logo.png',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDeal = {
    id: mockDealId,
    business_id: mockBusinessId,
    title: '50% Off Pizza',
    description: 'Get half off',
    original_price: 20.00,
    discounted_price: 10.00,
    discount_percentage: 50,
    category: 'food_beverage',
    tags: ['pizza'],
    starts_at: new Date(Date.now() - 86400000), // Yesterday
    expires_at: new Date(Date.now() + 86400000), // Tomorrow
    is_flash_deal: false,
    visibility_radius_km: 5,
    quantity_available: 100,
    quantity_redeemed: 0,
    max_per_user: 1,
    terms_conditions: [],
    images: [],
    status: 'active' as DealStatus,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Type-safe mock with explicit typing (2025 best practice)
  const mockPrismaService: {
    follows: {
      findMany: jest.Mock<Promise<Array<{ business_id: string }>>, unknown[]>;
    };
    deals: {
      findMany: jest.Mock;
      count: jest.Mock<Promise<number>, unknown[]>;
    };
    bookmarks: {
      findMany: jest.Mock<Promise<Array<{ deal_id: string }>>, unknown[]>;
    };
    users: {
      findUnique: jest.Mock;
    };
    $queryRaw: jest.Mock;
  } = {
    follows: {
      findMany: jest.fn(),
    },
    deals: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    bookmarks: {
      findMany: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getYouFollowFeed', () => {
    it('should return deals from followed businesses', async () => {
      const followedBusinesses = [{ business_id: mockBusinessId }];
      const dealsWithBusiness = [
        {
          ...mockDeal,
          businesses: mockBusiness,
        },
      ];

      mockPrismaService.follows.findMany.mockResolvedValue(followedBusinesses);
      mockPrismaService.deals.findMany.mockResolvedValue(dealsWithBusiness);
      mockPrismaService.deals.count.mockResolvedValue(1);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getYouFollowFeed(mockUserId, 1, 20);

      expect(result.deals).toHaveLength(1);
      expect(result.deals[0]).toHaveProperty('business');
      expect(result.deals[0].business.business_name).toBe('Test Pizza Shop');
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasMore: false,
      });
    });

    it('should return empty array if user follows no businesses', async () => {
      mockPrismaService.follows.findMany.mockResolvedValue([]);

      const result = await service.getYouFollowFeed(mockUserId, 1, 20);

      expect(result.deals).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(mockPrismaService.deals.findMany).not.toHaveBeenCalled();
    });

    it('should only return active deals within valid date range', async () => {
      const followedBusinesses = [{ business_id: mockBusinessId }];
      mockPrismaService.follows.findMany.mockResolvedValue(followedBusinesses);
      mockPrismaService.deals.findMany.mockResolvedValue([]);
      mockPrismaService.deals.count.mockResolvedValue(0);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      await service.getYouFollowFeed(mockUserId, 1, 20);

      expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: DealStatus.ACTIVE,
            starts_at: { lte: expect.any(Date) },
            expires_at: { gt: expect.any(Date) },
          }),
        }),
      );
    });

    it('should include bookmark status for each deal', async () => {
      const followedBusinesses = [{ business_id: mockBusinessId }];
      const dealsWithBusiness = [
        {
          ...mockDeal,
          businesses: mockBusiness,
        },
      ];
      const bookmarks = [{ deal_id: mockDealId }];

      mockPrismaService.follows.findMany.mockResolvedValue(followedBusinesses);
      mockPrismaService.deals.findMany.mockResolvedValue(dealsWithBusiness);
      mockPrismaService.deals.count.mockResolvedValue(1);
      mockPrismaService.bookmarks.findMany.mockResolvedValue(bookmarks);

      const result = await service.getYouFollowFeed(mockUserId, 1, 20);

      expect(result.deals[0].isBookmarked).toBe(true);
    });

    it('should calculate distance when location params provided', async () => {
      const followedBusinesses = [{ business_id: mockBusinessId }];
      const dealsWithBusiness = [
        {
          ...mockDeal,
          businesses: mockBusiness,
        },
      ];

      mockPrismaService.follows.findMany.mockResolvedValue(followedBusinesses);
      mockPrismaService.deals.findMany.mockResolvedValue(dealsWithBusiness);
      mockPrismaService.deals.count.mockResolvedValue(1);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const locationParams = {
        lat: 40.7580,
        lng: -73.9855,
        radius: 10,
      };

      const result = await service.getYouFollowFeed(
        mockUserId,
        1,
        20,
        locationParams,
      );

      expect(result.deals[0]).toHaveProperty('distance');
      expect(typeof result.deals[0].distance).toBe('number');
    });

    it('should handle pagination correctly', async () => {
      const followedBusinesses = [{ business_id: mockBusinessId }];
      mockPrismaService.follows.findMany.mockResolvedValue(followedBusinesses);
      mockPrismaService.deals.findMany.mockResolvedValue([]);
      mockPrismaService.deals.count.mockResolvedValue(100);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getYouFollowFeed(mockUserId, 3, 20);

      expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40, // (3 - 1) * 20
          take: 20,
        }),
      );

      expect(result.pagination).toEqual({
        page: 3,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasMore: true,
      });
    });
  });

  describe('getNearYouFeed', () => {
    const mockUser = {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
      default_location: { lat: 40.7128, lng: -74.0060 },
      default_radius_km: 5,
    };

    const locationParams = {
      lat: 40.7128,
      lng: -74.0060,
      radius: 5,
    };

    it('should return nearby deals using geospatial query', async () => {
      const rawQueryResults = [
        {
          ...mockDeal,
          business_id: mockBusinessId,
          business_business_name: 'Test Pizza Shop',
          business_location: { lat: 40.7128, lng: -74.0060 },
          business_logo_url: 'http://example.com/logo.png',
        },
      ];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$queryRaw.mockResolvedValueOnce(rawQueryResults);
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }]);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getNearYouFeed(
        mockUserId,
        locationParams,
        1,
        20,
      );

      expect(result.deals).toHaveLength(1);
      expect(result.deals[0]).toHaveProperty('business');
      expect(result.deals[0]).toHaveProperty('distance');
      expect(result.location).toEqual({
        lat: locationParams.lat,
        lng: locationParams.lng,
        radius: locationParams.radius,
      });
    });

    it('should use user default location if not provided', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$queryRaw.mockResolvedValueOnce([]);
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getNearYouFeed(mockUserId, {}, 1, 20);

      expect(result.location.lat).toBe(mockUser.default_location.lat);
      expect(result.location.lng).toBe(mockUser.default_location.lng);
      expect(result.location.radius).toBe(mockUser.default_radius_km);
    });

    it('should throw error if user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(
        service.getNearYouFeed(mockUserId, locationParams, 1, 20),
      ).rejects.toThrow('User not found');
    });

    it('should throw error if location not provided and user has no default', async () => {
      const userWithoutLocation = {
        ...mockUser,
        default_location: null,
      };
      mockPrismaService.users.findUnique.mockResolvedValue(userWithoutLocation);

      await expect(
        service.getNearYouFeed(mockUserId, {}, 1, 20),
      ).rejects.toThrow('Location is required');
    });

    it('should use Haversine formula to calculate distance', async () => {
      const rawQueryResults = [
        {
          ...mockDeal,
          business_id: mockBusinessId,
          business_business_name: 'Test Pizza Shop',
          business_location: { lat: 40.7580, lng: -73.9855 }, // ~5km away
          business_logo_url: 'http://example.com/logo.png',
        },
      ];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$queryRaw.mockResolvedValueOnce(rawQueryResults);
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }]);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getNearYouFeed(
        mockUserId,
        locationParams,
        1,
        20,
      );

      // Distance should be approximately 5km (Manhattan to Times Square)
      expect(result.deals[0].distance).toBeGreaterThan(4);
      expect(result.deals[0].distance).toBeLessThan(6);
    });

    it('should include bookmark status', async () => {
      const rawQueryResults = [
        {
          ...mockDeal,
          business_id: mockBusinessId,
          business_business_name: 'Test Pizza Shop',
          business_location: { lat: 40.7128, lng: -74.0060 },
          business_logo_url: 'http://example.com/logo.png',
        },
      ];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$queryRaw.mockResolvedValueOnce(rawQueryResults);
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }]);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([
        { deal_id: mockDealId },
      ]);

      const result = await service.getNearYouFeed(
        mockUserId,
        locationParams,
        1,
        20,
      );

      expect(result.deals[0].isBookmarked).toBe(true);
    });

    it('should handle pagination with LIMIT and OFFSET', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$queryRaw.mockResolvedValueOnce([]);
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ count: BigInt(50) }]);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getNearYouFeed(
        mockUserId,
        locationParams,
        2,
        20,
      );

      // Verify raw SQL query was called (with tagged template literal syntax)
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();

      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasMore: true,
      });
    });
  });

  describe('Distance Calculation (Haversine Formula)', () => {
    it('should calculate distance between New York and Los Angeles correctly', async () => {
      // Use "You Follow" feed with location params to test distance calculation
      const followedBusinesses = [{ business_id: mockBusinessId }];
      const businessInLA = {
        ...mockBusiness,
        location: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
      };
      const dealsWithBusiness = [
        {
          ...mockDeal,
          businesses: businessInLA,
        },
      ];

      mockPrismaService.follows.findMany.mockResolvedValue(followedBusinesses);
      mockPrismaService.deals.findMany.mockResolvedValue(dealsWithBusiness);
      mockPrismaService.deals.count.mockResolvedValue(1);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const nyLocation = {
        lat: 40.7128,
        lng: -74.0060,
      };

      const result = await service.getYouFollowFeed(
        mockUserId,
        1,
        20,
        nyLocation,
      );

      // Distance NY to LA is approximately 3935 km
      expect(result.deals[0].distance).toBeGreaterThan(3900);
      expect(result.deals[0].distance).toBeLessThan(4000);
    });

    it('should return 0 distance for same location', async () => {
      const followedBusinesses = [{ business_id: mockBusinessId }];
      const dealsWithBusiness = [
        {
          ...mockDeal,
          businesses: mockBusiness,
        },
      ];

      mockPrismaService.follows.findMany.mockResolvedValue(followedBusinesses);
      mockPrismaService.deals.findMany.mockResolvedValue(dealsWithBusiness);
      mockPrismaService.deals.count.mockResolvedValue(1);
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getYouFollowFeed(
        mockUserId,
        1,
        20,
        { lat: 40.7128, lng: -74.0060 }, // Same as business location
      );

      expect(result.deals[0].distance).toBeLessThan(0.1); // Very close to 0
    });
  });
});
