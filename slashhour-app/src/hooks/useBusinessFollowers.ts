import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';

interface Follower {
  user_id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  followed_at: string;
}

interface UseBusinessFollowersReturn {
  followers: Follower[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBusinessFollowers = (businessId?: string): UseBusinessFollowersReturn => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowers = useCallback(async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<any>(`/follows/${businessId}/followers`);

      setFollowers(response.followers || []);

    } catch (err: any) {
      console.error('Failed to fetch followers:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load followers';
      setError(errorMessage);
      logError(err, { context: 'useBusinessFollowers.fetchFollowers', businessId });
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  const refresh = useCallback(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  return {
    followers,
    isLoading,
    error,
    refresh,
  };
};
