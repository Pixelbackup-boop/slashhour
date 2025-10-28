export interface ReviewDto {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  reviewText?: string;
  isVerifiedBuyer: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    name?: string;
    avatarUrl?: string;
  };
}

export interface BusinessReviewsResponseDto {
  reviews: ReviewDto[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
