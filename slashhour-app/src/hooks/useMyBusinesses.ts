import { useState, useEffect, useCallback } from 'react';
import { businessService } from '../services/api/businessService';
import { logError } from '../config/sentry';
import { Business } from '../types/models';
import { useAuthStore } from '../stores/useAuthStore';

interface UseMyBusinessesReturn {
  businesses: Business[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMyBusinesses(): UseMyBusinessesReturn {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for token existence (more reliable than checking user or isAuthenticated)
  // The ApiClient uses token to set Authorization header, so this is what matters
  const token = useAuthStore((state) => state.token);

  const fetchBusinesses = useCallback(async () => {
    // Don't fetch if no token (user not authenticated)
    if (!token) {
      if (__DEV__) {
        console.log('⏸️ [useMyBusinesses] Skipping fetch - no auth token');
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await businessService.getMyBusinesses();
      setBusinesses(data);

      if (__DEV__) {
        console.log(`✅ [useMyBusinesses] Fetched ${data.length} businesses`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load businesses';
      setError(errorMessage);
      logError(err, {
        context: 'useMyBusinesses',
      });
      console.error('Failed to fetch businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Only fetch when userId becomes available (after auth rehydration)
    fetchBusinesses();
  }, [fetchBusinesses]);

  return {
    businesses,
    isLoading,
    error,
    refetch: fetchBusinesses,
  };
}
