import apiClient from './ApiClient';
import { Review, BusinessReviewsResponse } from '../../types/models';

export const reviewService = {
  /**
   * Get all reviews for a business with pagination
   */
  getBusinessReviews: async (
    businessId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<BusinessReviewsResponse> => {
    const response = await apiClient.get<BusinessReviewsResponse>(
      `/businesses/${businessId}/reviews?page=${page}&limit=${limit}`
    );
    return response;
  },

  /**
   * Get the current user's review for a specific business
   */
  getUserReview: async (businessId: string): Promise<Review | null> => {
    try {
      const response = await apiClient.get<Review | null>(
        `/businesses/${businessId}/my-review`
      );
      return response;
    } catch (error: any) {
      // Return null if no review found (404)
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new review for a business
   */
  createReview: async (data: {
    business_id: string;
    rating: number;
    review_text?: string;
  }): Promise<{ message: string; review: Review }> => {
    const response = await apiClient.post<{ message: string; review: Review }>(
      '/reviews',
      data
    );
    return response;
  },

  /**
   * Update an existing review
   */
  updateReview: async (
    reviewId: string,
    data: { rating?: number; review_text?: string }
  ): Promise<{ message: string; review: Review }> => {
    const response = await apiClient.patch<{ message: string; review: Review }>(
      `/reviews/${reviewId}`,
      data
    );
    return response;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/reviews/${reviewId}`
    );
    return response;
  },
};
