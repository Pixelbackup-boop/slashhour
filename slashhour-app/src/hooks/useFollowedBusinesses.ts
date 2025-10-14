import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';
import { FollowedBusinessesResponse } from '../types/models';

interface UseFollowedBusinessesReturn {
  businesses: FollowedBusinessesResponse['businesses'];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useFollowedBusinesses = (): UseFollowedBusinessesReturn => {
  const [businesses, setBusinesses] = useState<FollowedBusinessesResponse['businesses']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowedBusinesses = useCallback(async () => {
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
  }, []);

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
