import { useEffect } from 'react';
import { useYouFollowFeed } from './queries/useDealsQuery';
import { trackScreenView } from '../services/analytics';
import { Deal } from '../types/models';

interface UseFeedReturn {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
  handleRefresh: () => void;
}

/**
 * Feed hook using TanStack Query
 *
 * Benefits:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Much less code!
 */
export const useFeed = (): UseFeedReturn => {
  const { data, isLoading, error, refetch, isRefetching } = useYouFollowFeed(1, 20);

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('FeedScreen');
  }, []);

  return {
    deals: data?.deals || [],
    isLoading,
    error: error?.message || null,
    isRefreshing: isRefetching,
    handleRefresh: () => {
      refetch();
    },
  };
};
