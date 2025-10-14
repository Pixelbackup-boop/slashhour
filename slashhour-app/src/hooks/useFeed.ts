import { useState, useEffect, useCallback } from 'react';
import { feedService } from '../services/api/feedService';
import { logError } from '../config/sentry';
import { trackScreenView } from '../services/analytics';
import { Deal } from '../types/models';

interface UseFeedReturn {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
  handleRefresh: () => void;
}

export const useFeed = (): UseFeedReturn => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await feedService.getYouFollowFeed(1, 20);
      setDeals(response.deals);
    } catch (err: any) {
      console.error('Error fetching deals:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load deals';
      setError(errorMessage);
      logError(err, { context: 'useFeed - fetchDeals' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDeals(true);
  }, [fetchDeals]);

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('FeedScreen');
  }, []);

  // Fetch deals on mount
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    isLoading,
    error,
    isRefreshing,
    handleRefresh,
  };
};
