import { useQueryClient } from '@tanstack/react-query';
import { useBusinessProfile as useBusinessProfileQuery, useBusinessDeals, useBusinessStats } from './queries/useBusinessQuery';
import { Business, Deal } from '../types/models';

interface BusinessStats {
  activeDealCount: number;
  followerCount: number;
  totalDealsSold: number;
}

interface UseBusinessProfileReturn {
  business: Business | null;
  deals: Deal[];
  stats: BusinessStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Business profile hook using TanStack Query
 *
 * Fetches 3 things in parallel:
 * - Business profile
 * - Business deals
 * - Business stats
 *
 * Benefits:
 * - Automatic caching for each query
 * - Parallel fetching (faster!)
 * - Background refetching
 * - 70% less code!
 */
export function useBusinessProfile(businessId: string): UseBusinessProfileReturn {
  const queryClient = useQueryClient();

  // Fetch all 3 queries in parallel
  const { data: business, isLoading: isLoadingBusiness, error: businessError, refetch: refetchBusiness } = useBusinessProfileQuery(businessId);
  const { data: deals, isLoading: isLoadingDeals, refetch: refetchDeals } = useBusinessDeals(businessId);
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useBusinessStats(businessId);

  // Combine loading states - loading if ANY query is loading
  const isLoading = isLoadingBusiness || isLoadingDeals || isLoadingStats;

  // Check if any query is refetching
  const isRefreshing = queryClient.isFetching({ queryKey: ['businesses', businessId] }) > 0;

  // Refresh all queries
  const refresh = async () => {
    await Promise.all([
      refetchBusiness(),
      refetchDeals(),
      refetchStats(),
    ]);
  };

  return {
    business: business || null,
    deals: deals || [],
    stats: stats || null,
    isLoading,
    isRefreshing,
    error: businessError?.message || null,
    refresh,
  };
}
