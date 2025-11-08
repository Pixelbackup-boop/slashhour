import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaService: PrismaService;

  const mockUserId = 'user-123';
  const mockBusinessId = 'business-123';
  const mockReviewId = 'review-123';

  const mockBusiness = {
    id: mockBusinessId,
    business_name: 'Test Pizza',
    average_rating: 4.5,
  };

  const mockUser = {
    id: mockUserId,
    username: 'testuser',
    name: 'Test User',
    avatar_url: 'avatar.jpg',
  };

  const mockReview = {
    id: mockReviewId,
    business_id: mockBusinessId,
    user_id: mockUserId,
    rating: 5,
    review_text: 'Great service!',
    is_verified_buyer: true,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    users: mockUser,
  };

  const mockPrismaService = {
    businesses: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    business_reviews: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    user_redemptions: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    const createDto = {
      business_id: mockBusinessId,
      rating: 5,
      review_text: 'Great service!',
    };

    beforeEach(() => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(null);
      mockPrismaService.user_redemptions.findFirst.mockResolvedValue({
        id: 'redemption-123',
      });
      mockPrismaService.business_reviews.create.mockResolvedValue(mockReview);
      mockPrismaService.business_reviews.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
      });
      mockPrismaService.businesses.update.mockResolvedValue(mockBusiness);
    });

    it('should create a review successfully', async () => {
      const result = await service.createReview(mockUserId, createDto);

      expect(result.message).toBe('Review created successfully');
      expect(result.review).toBeDefined();
      expect(result.review.rating).toBe(5);
      expect(mockPrismaService.business_reviews.create).toHaveBeenCalledWith({
        data: {
          business_id: mockBusinessId,
          user_id: mockUserId,
          rating: 5,
          review_text: 'Great service!',
          is_verified_buyer: true,
          status: 'active',
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      });
    });

    it('should mark user as verified buyer if they redeemed a deal', async () => {
      await service.createReview(mockUserId, createDto);

      expect(mockPrismaService.user_redemptions.findFirst).toHaveBeenCalledWith(
        {
          where: {
            user_id: mockUserId,
            business_id: mockBusinessId,
          },
        },
      );

      const createCall =
        mockPrismaService.business_reviews.create.mock.calls[0][0];
      expect(createCall.data.is_verified_buyer).toBe(true);
    });

    it('should mark user as not verified buyer if no redemptions', async () => {
      mockPrismaService.user_redemptions.findFirst.mockResolvedValue(null);

      await service.createReview(mockUserId, createDto);

      const createCall =
        mockPrismaService.business_reviews.create.mock.calls[0][0];
      expect(createCall.data.is_verified_buyer).toBe(false);
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(
        service.createReview(mockUserId, createDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createReview(mockUserId, createDto),
      ).rejects.toThrow('Business not found');
    });

    it('should throw ConflictException if user already reviewed', async () => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(
        mockReview,
      );

      await expect(
        service.createReview(mockUserId, createDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.createReview(mockUserId, createDto),
      ).rejects.toThrow('You have already reviewed this business');
    });

    it('should update business average rating after creating review', async () => {
      await service.createReview(mockUserId, createDto);

      expect(mockPrismaService.business_reviews.aggregate).toHaveBeenCalled();
      expect(mockPrismaService.businesses.update).toHaveBeenCalledWith({
        where: { id: mockBusinessId },
        data: { average_rating: 4.5 },
      });
    });
  });

  describe('updateReview', () => {
    const updateDto = {
      rating: 4,
      review_text: 'Updated review',
    };

    beforeEach(() => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(
        mockReview,
      );
      mockPrismaService.business_reviews.update.mockResolvedValue({
        ...mockReview,
        ...updateDto,
      });
      mockPrismaService.business_reviews.aggregate.mockResolvedValue({
        _avg: { rating: 4.2 },
      });
      mockPrismaService.businesses.update.mockResolvedValue(mockBusiness);
    });

    it('should update review successfully', async () => {
      const result = await service.updateReview(
        mockUserId,
        mockReviewId,
        updateDto,
      );

      expect(result.message).toBe('Review updated successfully');
      expect(result.review).toBeDefined();
      expect(mockPrismaService.business_reviews.update).toHaveBeenCalledWith({
        where: { id: mockReviewId },
        data: {
          ...updateDto,
          updated_at: expect.any(Date),
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if review not found', async () => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(null);

      await expect(
        service.updateReview(mockUserId, mockReviewId, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateReview(mockUserId, mockReviewId, updateDto),
      ).rejects.toThrow('Review not found');
    });

    it('should throw ForbiddenException if user does not own review', async () => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue({
        ...mockReview,
        user_id: 'different-user',
      });

      await expect(
        service.updateReview(mockUserId, mockReviewId, updateDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateReview(mockUserId, mockReviewId, updateDto),
      ).rejects.toThrow('You can only update your own reviews');
    });

    it('should update business average rating when rating changes', async () => {
      await service.updateReview(mockUserId, mockReviewId, { rating: 3 });

      expect(mockPrismaService.businesses.update).toHaveBeenCalled();
    });

    it('should not update business rating when only text changes', async () => {
      await service.updateReview(mockUserId, mockReviewId, {
        review_text: 'New text',
      });

      expect(mockPrismaService.businesses.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteReview', () => {
    beforeEach(() => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(
        mockReview,
      );
      mockPrismaService.business_reviews.delete.mockResolvedValue(mockReview);
      mockPrismaService.business_reviews.aggregate.mockResolvedValue({
        _avg: { rating: 4.0 },
      });
      mockPrismaService.businesses.update.mockResolvedValue(mockBusiness);
    });

    it('should delete review successfully', async () => {
      const result = await service.deleteReview(mockUserId, mockReviewId);

      expect(result.message).toBe('Review deleted successfully');
      expect(mockPrismaService.business_reviews.delete).toHaveBeenCalledWith({
        where: { id: mockReviewId },
      });
    });

    it('should throw NotFoundException if review not found', async () => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteReview(mockUserId, mockReviewId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.deleteReview(mockUserId, mockReviewId),
      ).rejects.toThrow('Review not found');
    });

    it('should throw ForbiddenException if user does not own review', async () => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue({
        ...mockReview,
        user_id: 'different-user',
      });

      await expect(
        service.deleteReview(mockUserId, mockReviewId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.deleteReview(mockUserId, mockReviewId),
      ).rejects.toThrow('You can only delete your own reviews');
    });

    it('should update business average rating after deleting review', async () => {
      await service.deleteReview(mockUserId, mockReviewId);

      expect(mockPrismaService.business_reviews.aggregate).toHaveBeenCalled();
      expect(mockPrismaService.businesses.update).toHaveBeenCalled();
    });
  });

  describe('getBusinessReviews', () => {
    const mockReviews = [mockReview, { ...mockReview, id: 'review-456' }];

    beforeEach(() => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.business_reviews.findMany.mockResolvedValue(
        mockReviews,
      );
      mockPrismaService.business_reviews.count.mockResolvedValue(2);
      mockPrismaService.business_reviews.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
      });
    });

    it('should return business reviews with pagination', async () => {
      mockPrismaService.business_reviews.findMany
        .mockResolvedValueOnce(mockReviews)
        .mockResolvedValueOnce([
          { rating: 5 },
          { rating: 4 },
          { rating: 5 },
          { rating: 3 },
          { rating: 4 },
        ]);

      const result = await service.getBusinessReviews(mockBusinessId, 1, 20);

      expect(result.reviews).toHaveLength(2);
      expect(result.totalReviews).toBe(2);
      expect(result.averageRating).toBe(4.5);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasMore: false,
      });
    });

    it('should throw NotFoundException if business not found', async () => {
      mockPrismaService.businesses.findUnique.mockResolvedValue(null);

      await expect(
        service.getBusinessReviews(mockBusinessId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getBusinessReviews(mockBusinessId),
      ).rejects.toThrow('Business not found');
    });

    it('should calculate rating distribution', async () => {
      mockPrismaService.business_reviews.findMany
        .mockResolvedValueOnce(mockReviews)
        .mockResolvedValueOnce([
          { rating: 5 },
          { rating: 5 },
          { rating: 4 },
          { rating: 3 },
          { rating: 1 },
        ]);

      const result = await service.getBusinessReviews(mockBusinessId);

      expect(result.ratingDistribution).toEqual({
        1: 1,
        2: 0,
        3: 1,
        4: 1,
        5: 2,
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.business_reviews.count.mockResolvedValue(50);
      mockPrismaService.business_reviews.findMany
        .mockResolvedValueOnce(mockReviews)
        .mockResolvedValueOnce([]);

      const result = await service.getBusinessReviews(mockBusinessId, 3, 10);

      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasMore: true,
      });

      expect(mockPrismaService.business_reviews.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should only return active reviews', async () => {
      mockPrismaService.business_reviews.findMany
        .mockResolvedValueOnce(mockReviews)
        .mockResolvedValueOnce([]);

      await service.getBusinessReviews(mockBusinessId);

      expect(mockPrismaService.business_reviews.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        }),
      );
    });

    it('should format reviews with camelCase', async () => {
      mockPrismaService.business_reviews.findMany
        .mockResolvedValueOnce([mockReview])
        .mockResolvedValueOnce([{ rating: 5 }]);

      const result = await service.getBusinessReviews(mockBusinessId);

      expect(result.reviews[0]).toHaveProperty('businessId');
      expect(result.reviews[0]).toHaveProperty('userId');
      expect(result.reviews[0]).toHaveProperty('reviewText');
      expect(result.reviews[0]).toHaveProperty('isVerifiedBuyer');
      expect(result.reviews[0]).toHaveProperty('createdAt');
      expect(result.reviews[0]).toHaveProperty('updatedAt');
    });

    it('should round average rating to 1 decimal place', async () => {
      mockPrismaService.business_reviews.aggregate.mockResolvedValue({
        _avg: { rating: 4.567 },
      });
      mockPrismaService.business_reviews.findMany
        .mockResolvedValueOnce(mockReviews)
        .mockResolvedValueOnce([]);

      const result = await service.getBusinessReviews(mockBusinessId);

      expect(result.averageRating).toBe(4.6);
    });

    it('should handle zero average rating', async () => {
      mockPrismaService.business_reviews.aggregate.mockResolvedValue({
        _avg: { rating: null },
      });
      mockPrismaService.business_reviews.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrismaService.business_reviews.count.mockResolvedValue(0);

      const result = await service.getBusinessReviews(mockBusinessId);

      expect(result.averageRating).toBe(0);
    });
  });

  describe('getUserReview', () => {
    it('should return user review if exists', async () => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(
        mockReview,
      );

      const result = await service.getUserReview(mockUserId, mockBusinessId);

      expect(result).toBeDefined();
      expect(result?.rating).toBe(5);
      expect(mockPrismaService.business_reviews.findUnique).toHaveBeenCalledWith(
        {
          where: {
            business_id_user_id: {
              business_id: mockBusinessId,
              user_id: mockUserId,
            },
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar_url: true,
              },
            },
          },
        },
      );
    });

    it('should return null if user has not reviewed', async () => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(null);

      const result = await service.getUserReview(mockUserId, mockBusinessId);

      expect(result).toBeNull();
    });

    it('should format review with camelCase', async () => {
      mockPrismaService.business_reviews.findUnique.mockResolvedValue(
        mockReview,
      );

      const result = await service.getUserReview(mockUserId, mockBusinessId);

      expect(result).toHaveProperty('businessId');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('reviewText');
      expect(result).toHaveProperty('isVerifiedBuyer');
    });
  });
});
