import { useEffect, useState, useCallback } from 'react';
import { useYouFollowFeed } from './queries/useDealsQuery';
import { trackScreenView } from '../services/analytics';
import { Deal } from '../types/models';
import LocationService from '../services/location/LocationService';

interface UseFeedReturn {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
  handleRefresh: () => void;
}

/**
 * Feed hook using TanStack Query
 *
 * Benefits:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Much less code!
 */
export const useFeed = (): UseFeedReturn => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();

  // Get user location on mount (optional - doesn't block feed loading)
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const loc = await LocationService.getCurrentLocation();
        setLocation({ lat: loc.latitude, lng: loc.longitude });
      } catch (err) {
        // Silently fail - location is optional for feed
        // Feed will just not show distance badges if location unavailable
        console.log('ℹ️ Location unavailable for feed, distance badges will not show');
      }
    };

    getUserLocation();
  }, []);

  const { data, isLoading, error, refetch, isRefetching } = useYouFollowFeed(1, 20, location);

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('FeedScreen');
  }, []);

  return {
    deals: data?.deals || [],
    isLoading,
    error: error?.message || null,
    isRefreshing: isRefetching,
    handleRefresh: () => {
      refetch();
    },
  };
};
