import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { BusinessCategory } from '../common/constants';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  const mockSearchService = {
    searchBusinesses: jest.fn(),
    searchDeals: jest.fn(),
    searchAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /search/businesses', () => {
    it('should search businesses with query parameter', async () => {
      const mockResponse = {
        total: 1,
        page: 1,
        limit: 20,
        businesses: [{ id: 'business-123', business_name: 'Test Pizza' }],
      };

      mockSearchService.searchBusinesses.mockResolvedValue(mockResponse);

      const result = await controller.searchBusinesses('pizza');

      expect(result).toEqual(mockResponse);
      expect(mockSearchService.searchBusinesses).toHaveBeenCalledWith(
        { query: 'pizza', category: undefined, lat: undefined, lng: undefined, radius: undefined, verified: undefined },
        1,
        20,
      );
    });

    it('should search businesses with category filter', async () => {
      const mockResponse = { total: 0, page: 1, limit: 20, businesses: [] };

      mockSearchService.searchBusinesses.mockResolvedValue(mockResponse);

      await controller.searchBusinesses(undefined, BusinessCategory.FOOD_BEVERAGE);

      expect(mockSearchService.searchBusinesses).toHaveBeenCalledWith(
        { query: undefined, category: BusinessCategory.FOOD_BEVERAGE, lat: undefined, lng: undefined, radius: undefined, verified: undefined },
        1,
        20,
      );
    });

    it('should search businesses with location filters', async () => {
      const mockResponse = { total: 1, page: 1, limit: 20, businesses: [] };

      mockSearchService.searchBusinesses.mockResolvedValue(mockResponse);

      await controller.searchBusinesses(undefined, undefined, 40.7128, -74.006, 5);

      expect(mockSearchService.searchBusinesses).toHaveBeenCalledWith(
        { query: undefined, category: undefined, lat: 40.7128, lng: -74.006, radius: 5, verified: undefined },
        1,
        20,
      );
    });

    it('should search businesses with verified filter', async () => {
      const mockResponse = { total: 1, page: 1, limit: 20, businesses: [] };

      mockSearchService.searchBusinesses.mockResolvedValue(mockResponse);

      await controller.searchBusinesses(undefined, undefined, undefined, undefined, undefined, true);

      expect(mockSearchService.searchBusinesses).toHaveBeenCalledWith(
        { query: undefined, category: undefined, lat: undefined, lng: undefined, radius: undefined, verified: true },
        1,
        20,
      );
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = { total: 100, page: 3, limit: 10, businesses: [] };

      mockSearchService.searchBusinesses.mockResolvedValue(mockResponse);

      await controller.searchBusinesses(undefined, undefined, undefined, undefined, undefined, undefined, 3, 10);

      expect(mockSearchService.searchBusinesses).toHaveBeenCalledWith(
        expect.any(Object),
        3,
        10,
      );
    });

    it('should use default pagination values', async () => {
      const mockResponse = { total: 1, page: 1, limit: 20, businesses: [] };

      mockSearchService.searchBusinesses.mockResolvedValue(mockResponse);

      await controller.searchBusinesses();

      expect(mockSearchService.searchBusinesses).toHaveBeenCalledWith(
        expect.any(Object),
        1,
        20,
      );
    });
  });

  describe('GET /search/deals', () => {
    it('should search deals with query parameter', async () => {
      const mockResponse = {
        total: 1,
        page: 1,
        limit: 20,
        deals: [{ id: 'deal-123', title: '50% Off Pizza' }],
      };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      const result = await controller.searchDeals('pizza');

      expect(result).toEqual(mockResponse);
      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        {
          query: 'pizza',
          category: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          minDiscount: undefined,
          flashOnly: undefined,
          lat: undefined,
          lng: undefined,
          radius: undefined,
          tags: undefined,
        },
        1,
        20,
      );
    });

    it('should search deals with category filter', async () => {
      const mockResponse = { total: 0, page: 1, limit: 20, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals(undefined, BusinessCategory.FOOD_BEVERAGE);

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.objectContaining({ category: BusinessCategory.FOOD_BEVERAGE }),
        1,
        20,
      );
    });

    it('should search deals with price range', async () => {
      const mockResponse = { total: 0, page: 1, limit: 20, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals(undefined, undefined, 5, 20);

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: 5, maxPrice: 20 }),
        1,
        20,
      );
    });

    it('should search deals with minimum discount filter', async () => {
      const mockResponse = { total: 0, page: 1, limit: 20, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals(undefined, undefined, undefined, undefined, 30);

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.objectContaining({ minDiscount: 30 }),
        1,
        20,
      );
    });

    it('should search flash deals only', async () => {
      const mockResponse = { total: 0, page: 1, limit: 20, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals(undefined, undefined, undefined, undefined, undefined, true);

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.objectContaining({ flashOnly: true }),
        1,
        20,
      );
    });

    it('should search deals with location filters', async () => {
      const mockResponse = { total: 0, page: 1, limit: 20, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        40.7128,
        -74.006,
        5,
      );

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.objectContaining({ lat: 40.7128, lng: -74.006, radius: 5 }),
        1,
        20,
      );
    });

    it('should parse tags from comma-separated string', async () => {
      const mockResponse = { total: 0, page: 1, limit: 20, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'pizza,italian,food',
      );

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['pizza', 'italian', 'food'] }),
        1,
        20,
      );
    });

    it('should handle undefined tags', async () => {
      const mockResponse = { total: 0, page: 1, limit: 20, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals();

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.objectContaining({ tags: undefined }),
        1,
        20,
      );
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = { total: 100, page: 2, limit: 15, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        2,
        15,
      );

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.any(Object),
        2,
        15,
      );
    });

    it('should use default pagination values', async () => {
      const mockResponse = { total: 1, page: 1, limit: 20, deals: [] };

      mockSearchService.searchDeals.mockResolvedValue(mockResponse);

      await controller.searchDeals();

      expect(mockSearchService.searchDeals).toHaveBeenCalledWith(
        expect.any(Object),
        1,
        20,
      );
    });
  });

  describe('GET /search/all', () => {
    it('should search both businesses and deals', async () => {
      const mockResponse = {
        businesses: [{ id: 'business-123' }],
        deals: [{ id: 'deal-123' }],
        totals: { businesses: 10, deals: 15 },
      };

      mockSearchService.searchAll.mockResolvedValue(mockResponse);

      const result = await controller.searchAll('pizza');

      expect(result).toEqual(mockResponse);
      expect(mockSearchService.searchAll).toHaveBeenCalledWith(
        'pizza',
        undefined,
        undefined,
        undefined,
      );
    });

    it('should search with location filters', async () => {
      const mockResponse = {
        businesses: [],
        deals: [],
        totals: { businesses: 0, deals: 0 },
      };

      mockSearchService.searchAll.mockResolvedValue(mockResponse);

      await controller.searchAll('pizza', 40.7128, -74.006, 5);

      expect(mockSearchService.searchAll).toHaveBeenCalledWith(
        'pizza',
        40.7128,
        -74.006,
        5,
      );
    });

    it('should handle query without location', async () => {
      const mockResponse = {
        businesses: [],
        deals: [],
        totals: { businesses: 0, deals: 0 },
      };

      mockSearchService.searchAll.mockResolvedValue(mockResponse);

      await controller.searchAll('test query');

      expect(mockSearchService.searchAll).toHaveBeenCalledWith(
        'test query',
        undefined,
        undefined,
        undefined,
      );
    });
  });
});
