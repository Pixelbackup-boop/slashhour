import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: ReviewsService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockReviewId = 'review-123';

  const mockRequest = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    },
  };

  const mockReview = {
    id: mockReviewId,
    businessId: mockBusinessId,
    userId: mockUserId,
    rating: 5,
    reviewText: 'Great service!',
    isVerifiedBuyer: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: mockUserId,
      username: 'testuser',
      name: 'Test User',
      avatarUrl: 'avatar.jpg',
    },
  };

  const mockReviewsService = {
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    getBusinessReviews: jest.fn(),
    getUserReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockReviewsService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /reviews', () => {
    it('should create a review', async () => {
      const createDto = {
        business_id: mockBusinessId,
        rating: 5,
        review_text: 'Great service!',
      };

      const mockResponse = {
        message: 'Review created successfully',
        review: mockReview,
      };

      mockReviewsService.createReview.mockResolvedValue(mockResponse);

      const result = await controller.createReview(
        mockRequest as never,
        createDto,
      );

      expect(result).toEqual(mockResponse);
      expect(mockReviewsService.createReview).toHaveBeenCalledWith(
        mockUserId,
        createDto,
      );
    });
  });

  describe('PATCH /reviews/:id', () => {
    it('should update a review', async () => {
      const updateDto = {
        rating: 4,
        review_text: 'Updated review',
      };

      const mockResponse = {
        message: 'Review updated successfully',
        review: { ...mockReview, ...updateDto },
      };

      mockReviewsService.updateReview.mockResolvedValue(mockResponse);

      const result = await controller.updateReview(
        mockRequest as never,
        mockReviewId,
        updateDto,
      );

      expect(result).toEqual(mockResponse);
      expect(mockReviewsService.updateReview).toHaveBeenCalledWith(
        mockUserId,
        mockReviewId,
        updateDto,
      );
    });
  });

  describe('DELETE /reviews/:id', () => {
    it('should delete a review', async () => {
      const mockResponse = {
        message: 'Review deleted successfully',
      };

      mockReviewsService.deleteReview.mockResolvedValue(mockResponse);

      const result = await controller.deleteReview(
        mockRequest as never,
        mockReviewId,
      );

      expect(result).toEqual(mockResponse);
      expect(mockReviewsService.deleteReview).toHaveBeenCalledWith(
        mockUserId,
        mockReviewId,
      );
    });
  });

  describe('GET /businesses/:businessId/reviews', () => {
    it('should return business reviews', async () => {
      const mockResponse = {
        reviews: [mockReview],
        averageRating: 4.5,
        totalReviews: 10,
        ratingDistribution: {
          1: 0,
          2: 1,
          3: 2,
          4: 3,
          5: 4,
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 10,
          totalPages: 1,
          hasMore: false,
        },
      };

      mockReviewsService.getBusinessReviews.mockResolvedValue(mockResponse);

      const result = await controller.getBusinessReviews(mockBusinessId);

      expect(result).toEqual(mockResponse);
      expect(mockReviewsService.getBusinessReviews).toHaveBeenCalledWith(
        mockBusinessId,
        1,
        20,
      );
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };

      mockReviewsService.getBusinessReviews.mockResolvedValue(mockResponse);

      await controller.getBusinessReviews(mockBusinessId, '2', '10');

      expect(mockReviewsService.getBusinessReviews).toHaveBeenCalledWith(
        mockBusinessId,
        2,
        10,
      );
    });

    it('should use default pagination values', async () => {
      const mockResponse = {
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };

      mockReviewsService.getBusinessReviews.mockResolvedValue(mockResponse);

      await controller.getBusinessReviews(mockBusinessId);

      expect(mockReviewsService.getBusinessReviews).toHaveBeenCalledWith(
        mockBusinessId,
        1,
        20,
      );
    });
  });

  describe('GET /businesses/:businessId/my-review', () => {
    it('should return user review if exists', async () => {
      mockReviewsService.getUserReview.mockResolvedValue(mockReview);

      const result = await controller.getUserReview(
        mockRequest as never,
        mockBusinessId,
      );

      expect(result).toEqual(mockReview);
      expect(mockReviewsService.getUserReview).toHaveBeenCalledWith(
        mockUserId,
        mockBusinessId,
      );
    });

    it('should return null if user has not reviewed', async () => {
      mockReviewsService.getUserReview.mockResolvedValue(null);

      const result = await controller.getUserReview(
        mockRequest as never,
        mockBusinessId,
      );

      expect(result).toBeNull();
    });
  });
});
