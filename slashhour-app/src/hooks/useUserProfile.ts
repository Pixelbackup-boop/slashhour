import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';

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

export const useUserProfile = (): UseUserProfileReturn => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = useCallback(async () => {
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
  }, []);

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
