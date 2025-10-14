import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';
import { FollowStatus } from '../types/models';
import { trackBusinessFollowed, trackBusinessUnfollowed } from '../services/analytics';

interface UseFollowingReturn {
  followStatus: FollowStatus | null;
  isLoading: boolean;
  isFollowing: boolean;
  isProcessing: boolean;
  error: string | null;
  followBusiness: () => Promise<void>;
  unfollowBusiness: () => Promise<void>;
  refresh: () => void;
}

export const useFollowing = (
  businessId?: string,
  businessName?: string,
  businessCategory?: string
): UseFollowingReturn => {
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch follow status
  const fetchFollowStatus = useCallback(async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<any>(`/follows/${businessId}`);

      // Transform snake_case to camelCase
      const status: FollowStatus = {
        isFollowing: response.is_following,
        status: response.status,
        notifyNewDeals: response.notify_new_deals,
        notifyFlashDeals: response.notify_flash_deals,
        followedAt: response.followed_at,
      };

      setFollowStatus(status);

    } catch (err: any) {
      console.error('Failed to fetch follow status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to check follow status';
      setError(errorMessage);
      logError(err, { context: 'useFollowing.fetchFollowStatus', businessId });
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Follow business
  const followBusiness = useCallback(async () => {
    if (!businessId) return;

    try {
      setIsProcessing(true);
      setError(null);

      await apiClient.post(`/follows/${businessId}`);

      // Update local state
      setFollowStatus({
        isFollowing: true,
        status: 'active',
        notifyNewDeals: true,
        notifyFlashDeals: false,
        followedAt: new Date().toISOString(),
      });

      // Track analytics
      if (businessName && businessCategory) {
        trackBusinessFollowed(businessId, businessName, businessCategory);
      }

    } catch (err: any) {
      console.error('Failed to follow business:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to follow business';
      setError(errorMessage);
      logError(err, { context: 'useFollowing.followBusiness', businessId });
      throw err; // Re-throw so component can handle it
    } finally {
      setIsProcessing(false);
    }
  }, [businessId, businessName, businessCategory]);

  // Unfollow business
  const unfollowBusiness = useCallback(async () => {
    if (!businessId) return;

    try {
      setIsProcessing(true);
      setError(null);

      await apiClient.delete(`/follows/${businessId}`);

      // Update local state
      setFollowStatus({
        isFollowing: false,
      });

      // Track analytics
      if (businessName) {
        trackBusinessUnfollowed(businessId, businessName);
      }

    } catch (err: any) {
      console.error('Failed to unfollow business:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to unfollow business';
      setError(errorMessage);
      logError(err, { context: 'useFollowing.unfollowBusiness', businessId });
      throw err; // Re-throw so component can handle it
    } finally {
      setIsProcessing(false);
    }
  }, [businessId, businessName]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  // Initial fetch
  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  return {
    followStatus,
    isLoading,
    isFollowing: followStatus?.isFollowing || false,
    isProcessing,
    error,
    followBusiness,
    unfollowBusiness,
    refresh,
  };
};
