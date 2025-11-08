import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';

describe('BookmarksController', () => {
  let controller: BookmarksController;
  let bookmarksService: BookmarksService;

  const mockUserId = 'user-123';
  const mockDealId = 'deal-123';
  const mockBookmarkId = 'bookmark-123';

  const mockRequest = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    },
  };

  const mockBookmark = {
    id: mockBookmarkId,
    user_id: mockUserId,
    deal_id: mockDealId,
    created_at: new Date(),
  };

  // Type-safe mocks (2025 best practice)
  const mockBookmarksService: {
    addBookmark: jest.Mock;
    removeBookmark: jest.Mock;
    getUserBookmarks: jest.Mock;
    isBookmarked: jest.Mock;
  } = {
    addBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    getUserBookmarks: jest.fn(),
    isBookmarked: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [{ provide: BookmarksService, useValue: mockBookmarksService }],
    }).compile();

    controller = module.get<BookmarksController>(BookmarksController);
    bookmarksService = module.get<BookmarksService>(BookmarksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /bookmarks/:dealId', () => {
    it('should add bookmark', async () => {
      const mockResponse = {
        message: 'Bookmark added successfully',
        bookmark: mockBookmark,
      };

      mockBookmarksService.addBookmark.mockResolvedValue(mockResponse);

      const result = await controller.addBookmark(
        mockRequest as never,
        mockDealId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockBookmarksService.addBookmark).toHaveBeenCalledWith(
        mockUserId,
        mockDealId,
      );
    });
  });

  describe('DELETE /bookmarks/:dealId', () => {
    it('should remove bookmark', async () => {
      const mockResponse = {
        message: 'Bookmark removed successfully',
      };

      mockBookmarksService.removeBookmark.mockResolvedValue(mockResponse);

      const result = await controller.removeBookmark(
        mockRequest as never,
        mockDealId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockBookmarksService.removeBookmark).toHaveBeenCalledWith(
        mockUserId,
        mockDealId,
      );
    });
  });

  describe('GET /bookmarks', () => {
    it('should return user bookmarks', async () => {
      const mockResponse = {
        bookmarks: [
          {
            ...mockBookmark,
            deals: {
              id: mockDealId,
              title: '50% Off Pizza',
              description: 'Great deal',
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

      mockBookmarksService.getUserBookmarks.mockResolvedValue(mockResponse);

      const result = await controller.getUserBookmarks(mockRequest as never, 1, 20);

      expect(result).toEqual(mockResponse);
      expect(mockBookmarksService.getUserBookmarks).toHaveBeenCalledWith(
        mockUserId,
        1,
        20,
      );
    });

    it('should use default pagination values', async () => {
      mockBookmarksService.getUserBookmarks.mockResolvedValue({
        bookmarks: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });

      await controller.getUserBookmarks(mockRequest as never);

      expect(mockBookmarksService.getUserBookmarks).toHaveBeenCalledWith(
        mockUserId,
        1,
        20,
      );
    });
  });

  describe('GET /bookmarks/check/:dealId', () => {
    it('should check if deal is bookmarked', async () => {
      mockBookmarksService.isBookmarked.mockResolvedValue(true);

      const result = await controller.isBookmarked(
        mockRequest as never,
        mockDealId,
      );

      expect(result).toEqual({ isBookmarked: true });
      expect(mockBookmarksService.isBookmarked).toHaveBeenCalledWith(
        mockUserId,
        mockDealId,
      );
    });

    it('should return false when not bookmarked', async () => {
      mockBookmarksService.isBookmarked.mockResolvedValue(false);

      const result = await controller.isBookmarked(
        mockRequest as never,
        mockDealId,
      );

      expect(result.isBookmarked).toBe(false);
    });
  });
});
