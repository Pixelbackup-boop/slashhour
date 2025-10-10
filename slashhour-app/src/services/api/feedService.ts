import apiClient from './ApiClient';
import { Deal } from '../../types/models';

interface FeedResponse {
  deals: Deal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const feedService = {
  getYouFollowFeed: async (page: number = 1, limit: number = 20): Promise<FeedResponse> => {
    const response = await apiClient.get<FeedResponse>(
      `/feed/you-follow?page=${page}&limit=${limit}`
    );
    return response;
  },

  getNearYouFeed: async (
    lat: number,
    lng: number,
    radius: number = 5,
    page: number = 1,
    limit: number = 20
  ): Promise<FeedResponse> => {
    const response = await apiClient.get<FeedResponse>(
      `/feed/near-you?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}&limit=${limit}`
    );
    return response;
  },
};
