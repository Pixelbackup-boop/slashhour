import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';
import { FollowedBusinessesResponse } from '../types/models';
import { useAuthStore } from '../stores/useAuthStore';

interface UseFollowedBusinessesReturn {
  businesses: FollowedBusinessesResponse['businesses'];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook for fetching user's followed businesses
 *
 * IMPORTANT: This endpoint requires authentication.
 * The hook will only fetch after auth token is loaded from AsyncStorage.
 */
export const useFollowedBusinesses = (): UseFollowedBusinessesReturn => {
  const [businesses, setBusinesses] = useState<FollowedBusinessesResponse['businesses']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for token existence (more reliable than isAuthenticated flag)
  // The ApiClient uses token to set Authorization header, so this is what matters
  const token = useAuthStore((state) => state.token);

  const fetchFollowedBusinesses = useCallback(async () => {
    // Don't fetch if no token (user not authenticated)
    if (!token) {
      if (__DEV__) {
        console.log('⏸️ [useFollowedBusinesses] Skipping fetch - no auth token');
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<any>('/follows');

      // Transform the response
      const transformedBusinesses = response.businesses.map((business: any) => ({
        ...business,
        followStatus: business.follow_status,
        notifyNewDeals: business.notify_new_deals,
        notifyFlashDeals: business.notify_flash_deals,
        followedAt: business.followed_at,
      }));

      // Deduplicate by business ID (just in case backend returns duplicates)
      const uniqueBusinesses = transformedBusinesses.filter(
        (business: any, index: number, self: any[]) =>
          index === self.findIndex((b) => b.id === business.id)
      );

      setBusinesses(uniqueBusinesses);

    } catch (err: any) {
      console.error('Failed to fetch followed businesses:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load followed businesses';
      setError(errorMessage);
      logError(err, { context: 'useFollowedBusinesses.fetchFollowedBusinesses' });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const refresh = useCallback(() => {
    fetchFollowedBusinesses();
  }, [fetchFollowedBusinesses]);

  useEffect(() => {
    fetchFollowedBusinesses();
  }, [fetchFollowedBusinesses]);

  return {
    businesses,
    isLoading,
    error,
    refresh,
  };
};
