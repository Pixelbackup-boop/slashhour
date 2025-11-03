import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';
import { useAuthStore } from '../stores/useAuthStore';

interface UserStats {
  totalSavings: number;
  monthlySavings: number;
  totalRedemptions: number;
  monthlyRedemptions: number;
  categoriesUsed: number;
  totalCategories: number;
  followingCount: number;
}

interface UseUserProfileReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook for fetching user profile statistics
 *
 * IMPORTANT: This endpoint requires authentication.
 * The hook will only fetch after auth token is loaded from AsyncStorage.
 */
export const useUserProfile = (): UseUserProfileReturn => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for token existence (more reliable than isAuthenticated flag)
  // The ApiClient uses token to set Authorization header, so this is what matters
  const token = useAuthStore((state) => state.token);

  const fetchUserStats = useCallback(async () => {
    // Don't fetch if no token (user not authenticated)
    if (!token) {
      if (__DEV__) {
        console.log('⏸️ [useUserProfile] Skipping fetch - no auth token');
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await apiClient.get<UserStats>('/users/profile/stats');
      setStats(data);

    } catch (err: any) {
      console.error('Failed to fetch user stats:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load stats';
      setError(errorMessage);
      logError(err, { context: 'useUserProfile' });

      // Don't show alert if there are no stats yet, just show empty state
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const refresh = useCallback(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
};
