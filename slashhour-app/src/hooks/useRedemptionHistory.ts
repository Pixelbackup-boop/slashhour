import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/ApiClient';
import { UserRedemption, UserRedemptionsResponse } from '../types/models';
import { logError } from '../config/sentry';

interface UseRedemptionHistoryReturn {
  redemptions: UserRedemption[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalRedemptions: number;
  loadMore: () => void;
  refresh: () => void;
  isRefreshing: boolean;
}

export const useRedemptionHistory = (initialLimit: number = 20): UseRedemptionHistoryReturn => {
  const [redemptions, setRedemptions] = useState<UserRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalRedemptions, setTotalRedemptions] = useState(0);

  const fetchRedemptions = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await apiClient.get<UserRedemptionsResponse>(
        `/redemptions?page=${pageNum}&limit=${initialLimit}`
      );

      if (isRefresh) {
        // Replace all redemptions on refresh
        setRedemptions(response.redemptions);
        setPage(1);
      } else if (pageNum === 1) {
        // First load
        setRedemptions(response.redemptions);
      } else {
        // Load more - append to existing
        setRedemptions(prev => [...prev, ...response.redemptions]);
      }

      setHasMore(response.pagination.hasMore);
      setTotalRedemptions(response.pagination.total);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load redemption history';
      setError(errorMessage);
      logError(err, { context: 'useRedemptionHistory', page: pageNum });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [initialLimit]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRedemptions(nextPage, false);
    }
  }, [isLoading, hasMore, page, fetchRedemptions]);

  const refresh = useCallback(() => {
    fetchRedemptions(1, true);
  }, [fetchRedemptions]);

  useEffect(() => {
    fetchRedemptions(1, false);
  }, [fetchRedemptions]);

  return {
    redemptions,
    isLoading,
    error,
    hasMore,
    page,
    totalRedemptions,
    loadMore,
    refresh,
    isRefreshing,
  };
};
