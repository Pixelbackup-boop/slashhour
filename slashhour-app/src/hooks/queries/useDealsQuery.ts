/**
 * TanStack Query Hooks for Deals
 *
 * Modern server state management with automatic caching,
 * background refetching, and loading states
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { dealService } from '../../services/api/dealService';
import { feedService } from '../../services/api/feedService';
import { queryKeys, queryOptions } from '../../config/queryClient';
import { Deal } from '../../types/models';
import { useAuthStore } from '../../stores/useAuthStore';

/**
 * Fetch deals list with filters
 *
 * NOTE: Currently not implemented - dealService doesn't have a getDeals method yet.
 * Use feedService or businessService.getBusinessDeals instead.
 *
 * Features when implemented:
 * - Automatic caching
 * - Background refetching
 * - Loading & error states
 * - Refetch on window focus
 */
/*
export function useDeals(filters?: {
  category?: string;
  location?: { lat: number; lng: number };
  radius?: number;
}) {
  return useQuery({
    queryKey: queryKeys.deals.list(filters || {}),
    queryFn: () => dealService.getDeals(filters),
    ...queryOptions.dynamic,
    enabled: true,
  });
}
*/

/**
 * Fetch single deal by ID
 *
 * Example:
 * const { data: deal, isLoading } = useDeal('deal-id');
 */
export function useDeal(dealId: string) {
  return useQuery({
    queryKey: queryKeys.deals.detail(dealId),
    queryFn: () => dealService.getDealById(dealId),
    ...queryOptions.static,
    enabled: !!dealId,
  });
}

/**
 * Infinite scroll for deals
 *
 * NOTE: Currently not implemented - dealService doesn't have a getDeals method yet.
 * Use feedService (useYouFollowFeed or useNearYouFeed) instead for feed screens.
 *
 * Perfect for feed screens with pagination when implemented
 */
/*
export function useInfiniteDeals(filters?: {
  category?: string;
  location?: { lat: number; lng: number };
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.deals.list(filters || {}),
    queryFn: ({ pageParam = 1 }) =>
      dealService.getDeals({ ...filters, page: pageParam }),
    ...queryOptions.infinite,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });
}
*/

/**
 * Create a new deal (mutation)
 *
 * Features:
 * - Automatic cache invalidation
 * - Optimistic updates (optional)
 * - Error handling
 *
 * Example:
 * const { mutate: createDeal, isPending } = useCreateDeal(businessId);
 * createDeal(dealData, {
 *   onSuccess: () => navigation.goBack()
 * });
 */
export function useCreateDeal(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealData: any) => dealService.createDealWithMultipart(businessId, dealData),
    onSuccess: (newDeal) => {
      // Invalidate deals lists to refetch with new deal
      queryClient.invalidateQueries({
        queryKey: ['businesses', businessId, 'deals'],
      });

      // Invalidate feed queries
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });

      // Add the new deal to cache immediately (optimistic update)
      queryClient.setQueryData(
        queryKeys.deals.detail(newDeal.id),
        newDeal
      );
    },
  });
}

/**
 * Update a deal (mutation)
 */
export function useUpdateDeal(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Deal>) =>
      dealService.updateDeal(dealId, updates),
    onSuccess: (updatedDeal) => {
      // Update the specific deal in cache
      queryClient.setQueryData(
        queryKeys.deals.detail(dealId),
        updatedDeal
      );

      // Invalidate lists that might contain this deal
      queryClient.invalidateQueries({
        queryKey: queryKeys.deals.lists(),
      });
    },
  });
}

/**
 * Delete a deal (mutation)
 */
export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealId: string) => dealService.deleteDeal(dealId),
    onSuccess: (_, dealId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.deals.detail(dealId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.deals.lists(),
      });
    },
  });
}

/**
 * Fetch "You Follow" feed
 *
 * Feed of deals from businesses the user follows
 *
 * IMPORTANT: This endpoint requires authentication.
 * The query will only run after auth state is loaded from AsyncStorage.
 *
 * Example:
 * const { data, isLoading, refetch } = useYouFollowFeed();
 * const { data, isLoading } = useYouFollowFeed(1, 20, { lat: 40.7, lng: -74.0 });
 */
export function useYouFollowFeed(
  page: number = 1,
  limit: number = 20,
  location?: { lat: number; lng: number }
) {
  // Check for token existence (more reliable than isAuthenticated flag)
  // The ApiClient uses token to set Authorization header, so this is what matters
  const hasToken = useAuthStore((state) => !!state.token);

  return useQuery({
    queryKey: ['feed', 'you-follow', { page, limit, location }],
    queryFn: () => feedService.getYouFollowFeed(page, limit, location),
    ...queryOptions.dynamic,
    enabled: hasToken, // Only fetch when we have an auth token
  });
}

/**
 * Fetch "Near You" feed
 *
 * Feed of deals from businesses near user's location
 *
 * IMPORTANT: This endpoint requires authentication.
 * The query will only run after auth state is loaded AND location is available.
 *
 * Example:
 * const { data, isLoading } = useNearYouFeed(37.7749, -122.4194, 5);
 */
export function useNearYouFeed(
  lat?: number,
  lng?: number,
  radius: number = 5,
  page: number = 1,
  limit: number = 20
) {
  // Check for token existence (more reliable than isAuthenticated flag)
  // The ApiClient uses token to set Authorization header, so this is what matters
  const hasToken = useAuthStore((state) => !!state.token);

  return useQuery({
    queryKey: ['feed', 'near-you', { lat, lng, radius, page, limit }],
    queryFn: () => {
      if (!lat || !lng) throw new Error('Location required for Near You feed');
      return feedService.getNearYouFeed(lat, lng, radius, page, limit);
    },
    ...queryOptions.dynamic,
    enabled: hasToken && !!lat && !!lng, // Only fetch when we have token AND location is available
  });
}
