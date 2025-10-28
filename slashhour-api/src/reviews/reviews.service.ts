import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { BusinessReviewsResponseDto, ReviewDto } from './dto/review-response.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    const { business_id, rating, review_text } = createReviewDto;

    // Check if business exists
    const business = await this.prisma.businesses.findUnique({
      where: { id: business_id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Check if user has already reviewed this business
    const existingReview = await this.prisma.business_reviews.findUnique({
      where: {
        business_id_user_id: {
          business_id,
          user_id: userId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this business');
    }

    // Check if user is a verified buyer (has redeemed at least one deal from this business)
    const isVerifiedBuyer = await this.checkIsVerifiedBuyer(userId, business_id);

    // Create the review
    const review = await this.prisma.business_reviews.create({
      data: {
        business_id,
        user_id: userId,
        rating,
        review_text,
        is_verified_buyer: isVerifiedBuyer,
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

    // Update business average rating
    await this.updateBusinessAverageRating(business_id);

    return {
      message: 'Review created successfully',
      review: this.formatReview(review),
    };
  }

  async updateReview(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto) {
    // Find the review
    const review = await this.prisma.business_reviews.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns this review
    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update the review
    const updatedReview = await this.prisma.business_reviews.update({
      where: { id: reviewId },
      data: {
        ...updateReviewDto,
        updated_at: new Date(),
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

    // Update business average rating if rating changed
    if (updateReviewDto.rating !== undefined) {
      await this.updateBusinessAverageRating(review.business_id);
    }

    return {
      message: 'Review updated successfully',
      review: this.formatReview(updatedReview),
    };
  }

  async deleteReview(userId: string, reviewId: string) {
    // Find the review
    const review = await this.prisma.business_reviews.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns this review
    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Delete the review
    await this.prisma.business_reviews.delete({
      where: { id: reviewId },
    });

    // Update business average rating
    await this.updateBusinessAverageRating(review.business_id);

    return {
      message: 'Review deleted successfully',
    };
  }

  async getBusinessReviews(
    businessId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<BusinessReviewsResponseDto> {
    // Check if business exists
    const business = await this.prisma.businesses.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const skip = (page - 1) * limit;

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      this.prisma.business_reviews.findMany({
        where: {
          business_id: businessId,
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
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.business_reviews.count({
        where: {
          business_id: businessId,
          status: 'active',
        },
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await this.getRatingDistribution(businessId);

    // Calculate average rating
    const avgResult = await this.prisma.business_reviews.aggregate({
      where: {
        business_id: businessId,
        status: 'active',
      },
      _avg: {
        rating: true,
      },
    });

    const averageRating = avgResult._avg.rating || 0;

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map(this.formatReview),
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: total,
      ratingDistribution,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  async getUserReview(userId: string, businessId: string): Promise<ReviewDto | null> {
    const review = await this.prisma.business_reviews.findUnique({
      where: {
        business_id_user_id: {
          business_id: businessId,
          user_id: userId,
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
    });

    return review ? this.formatReview(review) : null;
  }

  // Helper method to check if user has redeemed a deal from this business
  private async checkIsVerifiedBuyer(userId: string, businessId: string): Promise<boolean> {
    const redemption = await this.prisma.user_redemptions.findFirst({
      where: {
        user_id: userId,
        business_id: businessId,
      },
    });

    return !!redemption;
  }

  // Helper method to update business average rating
  private async updateBusinessAverageRating(businessId: string) {
    const result = await this.prisma.business_reviews.aggregate({
      where: {
        business_id: businessId,
        status: 'active',
      },
      _avg: {
        rating: true,
      },
    });

    const averageRating = result._avg.rating || 0;

    await this.prisma.businesses.update({
      where: { id: businessId },
      data: {
        average_rating: averageRating,
      },
    });
  }

  // Helper method to get rating distribution
  private async getRatingDistribution(businessId: string) {
    const reviews = await this.prisma.business_reviews.findMany({
      where: {
        business_id: businessId,
        status: 'active',
      },
      select: {
        rating: true,
      },
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return distribution;
  }

  // Helper method to format review
  private formatReview(review: any): ReviewDto {
    return {
      id: review.id,
      businessId: review.business_id,
      userId: review.user_id,
      rating: review.rating,
      reviewText: review.review_text,
      isVerifiedBuyer: review.is_verified_buyer,
      status: review.status,
      createdAt: review.created_at.toISOString(),
      updatedAt: review.updated_at.toISOString(),
      user: {
        id: review.users.id,
        username: review.users.username,
        name: review.users.name,
        avatarUrl: review.users.avatar_url,
      },
    };
  }
}
