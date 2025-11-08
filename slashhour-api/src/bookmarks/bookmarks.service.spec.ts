import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksService } from './bookmarks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BookmarksService', () => {
  let service: BookmarksService;
  let prismaService: PrismaService;

  const mockUserId = 'user-123';
  const mockDealId = 'deal-123';
  const mockBookmarkId = 'bookmark-123';

  const mockDeal = {
    id: mockDealId,
    business_id: 'business-123',
    title: '50% Off Pizza',
    description: 'Great deal',
    original_price: 20.0,
    discounted_price: 10.0,
    discount_percentage: 50,
    status: 'active',
    save_count: 5,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockBookmark = {
    id: mockBookmarkId,
    user_id: mockUserId,
    deal_id: mockDealId,
    created_at: new Date(),
  };

  const mockBookmarkWithDeal = {
    ...mockBookmark,
    deals: {
      ...mockDeal,
      businesses: {
        id: 'business-123',
        business_name: 'Test Pizza',
        slug: 'test-pizza',
        logo_url: 'https://example.com/logo.avif',
        category: 'food_beverage',
        location: { type: 'Point', coordinates: [-74.006, 40.7128] },
        city: 'New York',
      },
    },
  };

  // Type-safe Prisma mock
  const mockPrismaService = {
    deals: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bookmarks: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addBookmark', () => {
    it('should successfully add a bookmark', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(mockDeal);
      mockPrismaService.bookmarks.findUnique.mockResolvedValue(null);
      mockPrismaService.bookmarks.create.mockResolvedValue(mockBookmark);
      mockPrismaService.deals.update.mockResolvedValue({
        ...mockDeal,
        save_count: 6,
      });

      const result = await service.addBookmark(mockUserId, mockDealId);

      expect(result).toEqual(mockBookmark);
      expect(mockPrismaService.deals.findUnique).toHaveBeenCalledWith({
        where: { id: mockDealId },
      });
      expect(mockPrismaService.bookmarks.create).toHaveBeenCalledWith({
        data: {
          user_id: mockUserId,
          deal_id: mockDealId,
        },
      });
      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: mockDealId },
        data: { save_count: { increment: 1 } },
      });
    });

    it('should throw NotFoundException if deal does not exist', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(null);

      await expect(
        service.addBookmark(mockUserId, mockDealId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.addBookmark(mockUserId, mockDealId),
      ).rejects.toThrow('Deal not found');
    });

    it('should throw ConflictException if deal is not active', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue({
        ...mockDeal,
        status: 'expired',
      });

      await expect(
        service.addBookmark(mockUserId, mockDealId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.addBookmark(mockUserId, mockDealId),
      ).rejects.toThrow('Can only bookmark active deals');
    });

    it('should throw ConflictException if deal is already bookmarked', async () => {
      mockPrismaService.deals.findUnique.mockResolvedValue(mockDeal);
      mockPrismaService.bookmarks.findUnique.mockResolvedValue(mockBookmark);

      await expect(
        service.addBookmark(mockUserId, mockDealId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.addBookmark(mockUserId, mockDealId),
      ).rejects.toThrow('Deal already bookmarked');
    });
  });

  describe('removeBookmark', () => {
    it('should successfully remove a bookmark', async () => {
      mockPrismaService.bookmarks.findUnique.mockResolvedValue(mockBookmark);
      mockPrismaService.bookmarks.delete.mockResolvedValue(mockBookmark);
      mockPrismaService.deals.update.mockResolvedValue({
        ...mockDeal,
        save_count: 4,
      });

      const result = await service.removeBookmark(mockUserId, mockDealId);

      expect(result).toEqual({ message: 'Bookmark removed successfully' });
      expect(mockPrismaService.bookmarks.findUnique).toHaveBeenCalledWith({
        where: {
          user_id_deal_id: {
            user_id: mockUserId,
            deal_id: mockDealId,
          },
        },
      });
      expect(mockPrismaService.bookmarks.delete).toHaveBeenCalledWith({
        where: { id: mockBookmark.id },
      });
      expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
        where: { id: mockDealId },
        data: { save_count: { decrement: 1 } },
      });
    });

    it('should throw NotFoundException if bookmark does not exist', async () => {
      mockPrismaService.bookmarks.findUnique.mockResolvedValue(null);

      await expect(
        service.removeBookmark(mockUserId, mockDealId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.removeBookmark(mockUserId, mockDealId),
      ).rejects.toThrow('Bookmark not found');
    });
  });

  describe('getUserBookmarks', () => {
    it('should return paginated bookmarks with deals', async () => {
      mockPrismaService.bookmarks.findMany.mockResolvedValue([
        mockBookmarkWithDeal,
      ]);
      mockPrismaService.bookmarks.count.mockResolvedValue(1);

      const result = await service.getUserBookmarks(mockUserId, 1, 20);

      expect(result).toEqual({
        deals: [
          {
            ...mockBookmarkWithDeal.deals,
            business: mockBookmarkWithDeal.deals.businesses,
            isBookmarked: true,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      });
      expect(mockPrismaService.bookmarks.findMany).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
        include: {
          deals: {
            include: {
              businesses: {
                select: {
                  id: true,
                  business_name: true,
                  slug: true,
                  logo_url: true,
                  category: true,
                  location: true,
                  city: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter out bookmarks with null deals', async () => {
      const bookmarkWithNullDeal = { ...mockBookmark, deals: null };
      mockPrismaService.bookmarks.findMany.mockResolvedValue([
        mockBookmarkWithDeal,
        bookmarkWithNullDeal,
      ]);
      mockPrismaService.bookmarks.count.mockResolvedValue(2);

      const result = await service.getUserBookmarks(mockUserId, 1, 20);

      expect(result.deals).toHaveLength(1);
      expect(result.total).toBe(2);
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.bookmarks.findMany.mockResolvedValue([
        mockBookmarkWithDeal,
      ]);
      mockPrismaService.bookmarks.count.mockResolvedValue(25);

      const result = await service.getUserBookmarks(mockUserId, 2, 10);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.hasMore).toBe(true);
      expect(mockPrismaService.bookmarks.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should use default pagination values', async () => {
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);
      mockPrismaService.bookmarks.count.mockResolvedValue(0);

      await service.getUserBookmarks(mockUserId);

      expect(mockPrismaService.bookmarks.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('isBookmarked', () => {
    it('should return true if deal is bookmarked', async () => {
      mockPrismaService.bookmarks.findUnique.mockResolvedValue(mockBookmark);

      const result = await service.isBookmarked(mockUserId, mockDealId);

      expect(result).toBe(true);
      expect(mockPrismaService.bookmarks.findUnique).toHaveBeenCalledWith({
        where: {
          user_id_deal_id: {
            user_id: mockUserId,
            deal_id: mockDealId,
          },
        },
      });
    });

    it('should return false if deal is not bookmarked', async () => {
      mockPrismaService.bookmarks.findUnique.mockResolvedValue(null);

      const result = await service.isBookmarked(mockUserId, mockDealId);

      expect(result).toBe(false);
    });
  });

  describe('getBookmarkStatusForDeals', () => {
    it('should return bookmark status for multiple deals', async () => {
      const dealIds = ['deal-1', 'deal-2', 'deal-3'];
      mockPrismaService.bookmarks.findMany.mockResolvedValue([
        { deal_id: 'deal-1' },
        { deal_id: 'deal-3' },
      ]);

      const result = await service.getBookmarkStatusForDeals(
        mockUserId,
        dealIds,
      );

      expect(result).toEqual({
        'deal-1': true,
        'deal-2': false,
        'deal-3': true,
      });
      expect(mockPrismaService.bookmarks.findMany).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          deal_id: { in: dealIds },
        },
        select: { deal_id: true },
      });
    });

    it('should return all false if no bookmarks exist', async () => {
      const dealIds = ['deal-1', 'deal-2'];
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getBookmarkStatusForDeals(
        mockUserId,
        dealIds,
      );

      expect(result).toEqual({
        'deal-1': false,
        'deal-2': false,
      });
    });

    it('should handle empty deal IDs array', async () => {
      mockPrismaService.bookmarks.findMany.mockResolvedValue([]);

      const result = await service.getBookmarkStatusForDeals(mockUserId, []);

      expect(result).toEqual({});
    });
  });
});
