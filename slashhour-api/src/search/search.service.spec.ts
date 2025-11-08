import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessCategory } from '../common/constants';

describe('SearchService', () => {
  let service: SearchService;
  let prismaService: PrismaService;

  const mockBusiness = {
    id: 'business-123',
    business_name: 'Test Pizza',
    description: 'Best pizza in town',
    category: BusinessCategory.FOOD_BEVERAGE,
    location: { lat: 40.7128, lng: -74.006 },
    is_verified: true,
    follower_count: 100,
  };

  const mockDeal = {
    id: 'deal-123',
    business_id: 'business-123',
    title: '50% Off Pizza',
    description: 'Great deal on pizza',
    category: BusinessCategory.FOOD_BEVERAGE,
    original_price: 20.0,
    discounted_price: 10.0,
    discount_percentage: 50,
    status: 'active',
    starts_at: new Date(Date.now() - 86400000),
    expires_at: new Date(Date.now() + 86400000),
    is_flash_deal: false,
    tags: ['pizza', 'italian'],
    businesses: mockBusiness,
  };

  const mockPrismaService = {
    businesses: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    deals: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchBusinesses', () => {
    describe('without location filter', () => {
      it('should search businesses by query text', async () => {
        mockPrismaService.businesses.findMany.mockResolvedValue([mockBusiness]);
        mockPrismaService.businesses.count.mockResolvedValue(1);

        const result = await service.searchBusinesses({ query: 'pizza' }, 1, 20);

        expect(result.businesses).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(mockPrismaService.businesses.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { business_name: { contains: 'pizza', mode: 'insensitive' } },
              { description: { contains: 'pizza', mode: 'insensitive' } },
            ],
          },
          orderBy: { follower_count: 'desc' },
          skip: 0,
          take: 20,
        });
      });

      it('should filter businesses by category', async () => {
        mockPrismaService.businesses.findMany.mockResolvedValue([mockBusiness]);
        mockPrismaService.businesses.count.mockResolvedValue(1);

        await service.searchBusinesses({ category: BusinessCategory.FOOD_BEVERAGE }, 1, 20);

        expect(mockPrismaService.businesses.findMany).toHaveBeenCalledWith({
          where: { category: BusinessCategory.FOOD_BEVERAGE },
          orderBy: { follower_count: 'desc' },
          skip: 0,
          take: 20,
        });
      });

      it('should filter businesses by verified status', async () => {
        mockPrismaService.businesses.findMany.mockResolvedValue([mockBusiness]);
        mockPrismaService.businesses.count.mockResolvedValue(1);

        await service.searchBusinesses({ verified: true }, 1, 20);

        expect(mockPrismaService.businesses.findMany).toHaveBeenCalledWith({
          where: { is_verified: true },
          orderBy: { follower_count: 'desc' },
          skip: 0,
          take: 20,
        });
      });

      it('should combine multiple filters', async () => {
        mockPrismaService.businesses.findMany.mockResolvedValue([mockBusiness]);
        mockPrismaService.businesses.count.mockResolvedValue(1);

        await service.searchBusinesses(
          {
            query: 'pizza',
            category: BusinessCategory.FOOD_BEVERAGE,
            verified: true,
          },
          1,
          20,
        );

        expect(mockPrismaService.businesses.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { business_name: { contains: 'pizza', mode: 'insensitive' } },
              { description: { contains: 'pizza', mode: 'insensitive' } },
            ],
            category: BusinessCategory.FOOD_BEVERAGE,
            is_verified: true,
          },
          orderBy: { follower_count: 'desc' },
          skip: 0,
          take: 20,
        });
      });

      it('should handle pagination correctly', async () => {
        mockPrismaService.businesses.findMany.mockResolvedValue([mockBusiness]);
        mockPrismaService.businesses.count.mockResolvedValue(50);

        await service.searchBusinesses({}, 3, 10);

        expect(mockPrismaService.businesses.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 20,
            take: 10,
          }),
        );
      });

      it('should return empty array when no businesses found', async () => {
        mockPrismaService.businesses.findMany.mockResolvedValue([]);
        mockPrismaService.businesses.count.mockResolvedValue(0);

        const result = await service.searchBusinesses({ query: 'nonexistent' });

        expect(result.businesses).toHaveLength(0);
        expect(result.total).toBe(0);
      });
    });

    describe('with location filter', () => {
      it('should use geospatial query with location filters', async () => {
        mockPrismaService.$queryRawUnsafe
          .mockResolvedValueOnce([mockBusiness])
          .mockResolvedValueOnce([{ count: BigInt(1) }]);

        const result = await service.searchBusinesses(
          {
            lat: 40.7128,
            lng: -74.006,
            radius: 5,
          },
          1,
          20,
        );

        expect(result.businesses).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledTimes(2);
      });

      it('should combine location filter with text search', async () => {
        mockPrismaService.$queryRawUnsafe
          .mockResolvedValueOnce([mockBusiness])
          .mockResolvedValueOnce([{ count: BigInt(1) }]);

        await service.searchBusinesses(
          {
            query: 'pizza',
            lat: 40.7128,
            lng: -74.006,
            radius: 5,
          },
          1,
          20,
        );

        expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledTimes(2);
        const queryCall = mockPrismaService.$queryRawUnsafe.mock.calls[0];
        expect(queryCall[0]).toContain('ILIKE');
        expect(queryCall[0]).toContain('WHERE');
      });

      it('should handle category filter with location', async () => {
        mockPrismaService.$queryRawUnsafe
          .mockResolvedValueOnce([mockBusiness])
          .mockResolvedValueOnce([{ count: BigInt(1) }]);

        await service.searchBusinesses(
          {
            category: BusinessCategory.FOOD_BEVERAGE,
            lat: 40.7128,
            lng: -74.006,
            radius: 5,
          },
          1,
          20,
        );

        const queryCall = mockPrismaService.$queryRawUnsafe.mock.calls[0];
        expect(queryCall[0]).toContain('category =');
      });
    });
  });

  describe('searchDeals', () => {
    describe('without location filter', () => {
      it('should search active deals by query text', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(1);

        const result = await service.searchDeals({ query: 'pizza' }, 1, 20);

        expect(result.deals).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: 'active',
              OR: [
                { title: { contains: 'pizza', mode: 'insensitive' } },
                { description: { contains: 'pizza', mode: 'insensitive' } },
              ],
            }),
          }),
        );
      });

      it('should filter deals by category', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(1);

        await service.searchDeals({ category: BusinessCategory.FOOD_BEVERAGE });

        expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              category: BusinessCategory.FOOD_BEVERAGE,
            }),
          }),
        );
      });

      it('should filter deals by price range', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(1);

        await service.searchDeals({ minPrice: 5, maxPrice: 15 });

        expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              discounted_price: { gte: 5, lte: 15 },
            }),
          }),
        );
      });

      it('should filter deals by minimum discount', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(1);

        await service.searchDeals({ minDiscount: 30 });

        expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              discount_percentage: { gte: 30 },
            }),
          }),
        );
      });

      it('should filter flash deals only', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(1);

        await service.searchDeals({ flashOnly: true });

        expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              is_flash_deal: true,
            }),
          }),
        );
      });

      it('should filter deals by tags', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(1);

        await service.searchDeals({ tags: ['pizza', 'italian'] });

        expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              tags: { hasSome: ['pizza', 'italian'] },
            }),
          }),
        );
      });

      it('should only return active, non-expired deals', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(1);

        await service.searchDeals({});

        const callArgs = mockPrismaService.deals.findMany.mock.calls[0][0];
        expect(callArgs.where.status).toBe('active');
        expect(callArgs.where.starts_at).toHaveProperty('lte');
        expect(callArgs.where.expires_at).toHaveProperty('gt');
      });

      it('should include business data', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(1);

        await service.searchDeals({});

        expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            include: { businesses: true },
          }),
        );
      });

      it('should handle pagination', async () => {
        mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
        mockPrismaService.deals.count.mockResolvedValue(100);

        await service.searchDeals({}, 5, 10);

        expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 40,
            take: 10,
          }),
        );
      });
    });

    describe('with location filter', () => {
      it('should use geospatial query with location filters', async () => {
        mockPrismaService.$queryRawUnsafe
          .mockResolvedValueOnce([
            {
              ...mockDeal,
              business_id: 'business-123',
              business_business_name: 'Test Pizza',
            },
          ])
          .mockResolvedValueOnce([{ count: BigInt(1) }]);

        const result = await service.searchDeals(
          {
            lat: 40.7128,
            lng: -74.006,
            radius: 5,
          },
          1,
          20,
        );

        expect(result.deals).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledTimes(2);
      });

      it('should transform business data correctly', async () => {
        const rawDeal = {
          ...mockDeal,
          business_id: 'business-123',
          business_business_name: 'Test Pizza',
          business_logo_url: 'logo.avif',
        };

        mockPrismaService.$queryRawUnsafe
          .mockResolvedValueOnce([rawDeal])
          .mockResolvedValueOnce([{ count: BigInt(1) }]);

        const result = await service.searchDeals(
          {
            lat: 40.7128,
            lng: -74.006,
            radius: 5,
          },
          1,
          20,
        );

        expect(result.deals[0].businesses).toBeDefined();
        expect(result.deals[0].businesses.business_name).toBe('Test Pizza');
        expect(result.deals[0].business_business_name).toBeUndefined();
      });

      it('should combine all filters with location', async () => {
        mockPrismaService.$queryRawUnsafe
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ count: BigInt(0) }]);

        await service.searchDeals({
          query: 'pizza',
          category: BusinessCategory.FOOD_BEVERAGE,
          minPrice: 5,
          maxPrice: 20,
          minDiscount: 30,
          flashOnly: true,
          tags: ['italian'],
          lat: 40.7128,
          lng: -74.006,
          radius: 5,
        });

        const queryCall = mockPrismaService.$queryRawUnsafe.mock.calls[0];
        const sql = queryCall[0];
        expect(sql).toContain('ILIKE');
        expect(sql).toContain('d.category');
        expect(sql).toContain('d.discounted_price >=');
        expect(sql).toContain('d.discounted_price <=');
        expect(sql).toContain('d.discount_percentage >=');
        expect(sql).toContain('d.is_flash_deal = true');
        expect(sql).toContain('d.tags &&');
      });
    });
  });

  describe('searchAll', () => {
    it('should search both businesses and deals', async () => {
      mockPrismaService.businesses.findMany.mockResolvedValue([mockBusiness]);
      mockPrismaService.businesses.count.mockResolvedValue(10);
      mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
      mockPrismaService.deals.count.mockResolvedValue(15);

      const result = await service.searchAll('pizza');

      expect(result.businesses).toHaveLength(1);
      expect(result.deals).toHaveLength(1);
      expect(result.totals.businesses).toBe(10);
      expect(result.totals.deals).toBe(15);
    });

    it('should limit results to 5 each', async () => {
      mockPrismaService.businesses.findMany.mockResolvedValue([mockBusiness]);
      mockPrismaService.businesses.count.mockResolvedValue(100);
      mockPrismaService.deals.findMany.mockResolvedValue([mockDeal]);
      mockPrismaService.deals.count.mockResolvedValue(100);

      await service.searchAll('pizza');

      expect(mockPrismaService.businesses.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
      expect(mockPrismaService.deals.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });

    it('should support location filters', async () => {
      // For location-based queries, deals come back with flattened business_* fields
      const mockDealWithBusiness = {
        id: mockDeal.id,
        business_id: 'business-123',
        title: mockDeal.title,
        description: mockDeal.description,
        category: mockDeal.category,
        original_price: mockDeal.original_price,
        discounted_price: mockDeal.discounted_price,
        discount_percentage: mockDeal.discount_percentage,
        status: mockDeal.status,
        starts_at: mockDeal.starts_at,
        expires_at: mockDeal.expires_at,
        is_flash_deal: mockDeal.is_flash_deal,
        tags: mockDeal.tags,
        // All required business_* fields from the JOIN query
        business_owner_id: 'owner-123',
        business_business_name: 'Test Pizza',
        business_slug: 'test-pizza',
        business_description: 'Best pizza in town',
        business_category: BusinessCategory.FOOD_BEVERAGE,
        business_subcategory: null,
        business_category_last_changed_at: null,
        business_location: { lat: 40.7128, lng: -74.006 },
        business_address: '123 Main St',
        business_city: 'New York',
        business_state_province: 'NY',
        business_country: 'US',
        business_postal_code: '10001',
        business_phone: '+1234567890',
        business_email: 'test@pizza.com',
        business_website: 'https://testpizza.com',
        business_hours: null,
        business_logo_url: 'logo.avif',
        business_cover_image_url: null,
        business_images: [],
        business_follower_count: 100,
        business_total_deals_posted: 5,
        business_total_redemptions: 50,
        business_average_rating: 4.5,
        business_subscription_tier: 'basic',
        business_subscription_expires_at: null,
        business_is_verified: true,
        business_verification_date: null,
        business_stripe_account_id: null,
        business_payment_enabled: false,
        business_created_at: new Date(),
        business_updated_at: new Date(),
      };

      // Since searchBusinesses and searchDeals run in parallel, we need a smarter mock
      // that returns the right data based on the SQL query
      mockPrismaService.$queryRawUnsafe.mockImplementation((sql: string) => {
        if (sql.includes('FROM businesses')) {
          if (sql.includes('COUNT(*)')) {
            return Promise.resolve([{ count: BigInt(10) }]);
          }
          return Promise.resolve([mockBusiness]);
        }
        if (sql.includes('FROM deals')) {
          if (sql.includes('COUNT(*)')) {
            return Promise.resolve([{ count: BigInt(15) }]);
          }
          return Promise.resolve([mockDealWithBusiness]);
        }
        return Promise.resolve([]);
      });

      const result = await service.searchAll('pizza', 40.7128, -74.006, 5);

      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledTimes(4);
      expect(result.businesses).toHaveLength(1);
      expect(result.deals).toHaveLength(1);

      // Verify deal has businesses object and business_* fields are removed
      expect(result.deals[0]).toHaveProperty('businesses');
      expect(result.deals[0]).not.toHaveProperty('business_id');
      expect(result.deals[0]).not.toHaveProperty('business_business_name');

      // Verify businesses object has correct fields
      expect(result.deals[0].businesses).toMatchObject({
        id: 'business-123',
        business_name: 'Test Pizza',
        category: BusinessCategory.FOOD_BEVERAGE,
      });

      expect(result.totals.businesses).toBe(10);
      expect(result.totals.deals).toBe(15);
    });

    it('should handle empty results', async () => {
      mockPrismaService.businesses.findMany.mockResolvedValue([]);
      mockPrismaService.businesses.count.mockResolvedValue(0);
      mockPrismaService.deals.findMany.mockResolvedValue([]);
      mockPrismaService.deals.count.mockResolvedValue(0);

      const result = await service.searchAll('nonexistent');

      expect(result.businesses).toHaveLength(0);
      expect(result.deals).toHaveLength(0);
      expect(result.totals.businesses).toBe(0);
      expect(result.totals.deals).toBe(0);
    });
  });
});
