/**
 * TanStack Query Hooks for Businesses
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessService } from '../../services/api/businessService';
import { queryKeys, queryOptions } from '../../config/queryClient';

/**
 * Fetch business profile
 *
 * Example:
 * const { data: business, isLoading } = useBusinessProfile('business-id');
 */
export function useBusinessProfile(businessId: string) {
  return useQuery({
    queryKey: queryKeys.businesses.detail(businessId),
    queryFn: () => businessService.getBusinessById(businessId),
    ...queryOptions.static, // Business info rarely changes
    enabled: !!businessId,
  });
}

/**
 * Fetch my businesses
 *
 * Example:
 * const { data: businesses } = useMyBusinesses();
 */
export function useMyBusinesses() {
  return useQuery({
    queryKey: queryKeys.businesses.myBusinesses(),
    queryFn: () => businessService.getMyBusinesses(),
    ...queryOptions.static,
  });
}

/**
 * Search businesses
 *
 * NOTE: Currently not implemented - businessService doesn't have searchBusinesses yet.
 * Will be added in future version.
 */
/*
export function useSearchBusinesses(query: string, location?: { lat: number; lng: number }) {
  return useQuery({
    queryKey: queryKeys.businesses.list({ query, location }),
    queryFn: () => businessService.searchBusinesses(query, location),
    ...queryOptions.dynamic,
    enabled: query.length > 2,
  });
}
*/

/**
 * Fetch business deals
 *
 * Example:
 * const { data: deals } = useBusinessDeals('business-id');
 */
export function useBusinessDeals(businessId: string) {
  return useQuery({
    queryKey: ['businesses', businessId, 'deals'],
    queryFn: () => businessService.getBusinessDeals(businessId),
    ...queryOptions.dynamic,
    enabled: !!businessId,
  });
}

/**
 * Fetch business statistics
 *
 * Example:
 * const { data: stats } = useBusinessStats('business-id');
 */
export function useBusinessStats(businessId: string) {
  return useQuery({
    queryKey: ['businesses', businessId, 'stats'],
    queryFn: () => businessService.getBusinessStats(businessId),
    ...queryOptions.dynamic,
    enabled: !!businessId,
  });
}

/**
 * Update business profile (mutation)
 */
export function useUpdateBusiness(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: any) => businessService.updateBusiness(businessId, updates),
    onSuccess: (updatedBusiness) => {
      // Update cache immediately
      queryClient.setQueryData(
        queryKeys.businesses.detail(businessId),
        updatedBusiness
      );

      // Invalidate my businesses list
      queryClient.invalidateQueries({
        queryKey: queryKeys.businesses.myBusinesses(),
      });
    },
  });
}
