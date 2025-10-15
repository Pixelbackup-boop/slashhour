import { useState, useEffect, useCallback } from 'react';
import { feedService } from '../services/api/feedService';
import { logError } from '../config/sentry';
import { trackScreenView } from '../services/analytics';
import { Deal } from '../types/models';
import LocationService from '../services/location/LocationService';
import { LocationErrorCode, LocationErrorMessage, isLocationUserAction } from '../services/location/locationConstants';

interface UseNearbyDealsReturn {
  deals: (Deal & { distance: number })[];
  isLoading: boolean;
  error: string | null;
  radius: number;
  isRefreshing: boolean;
  setRadius: (radius: number) => void;
  handleRefresh: () => void;
}

export const useNearbyDeals = (): UseNearbyDealsReturn => {
  const [deals, setDeals] = useState<(Deal & { distance: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(5); // Default 5km radius

  const getCurrentLocation = useCallback(async () => {
    try {
      // LocationService now handles showing native dialogs for:
      // 1. Enabling location services (if disabled)
      // 2. Requesting permissions (if not granted)
      const location = await LocationService.getCurrentLocation();
      return {
        lat: location.latitude,
        lng: location.longitude,
      };
    } catch (err: any) {
      // Check if this is an expected user action vs actual error
      if (isLocationUserAction(err)) {
        // This is normal user behavior - just log at info level
        console.log('ℹ️ User declined location access or services unavailable:', err.message);
      } else {
        // This is an unexpected error - log as error
        console.error('❌ Unexpected error getting location:', err);
        logError(err, { context: 'useNearbyDeals - getCurrentLocation' });
      }

      // Provide friendly error messages when user declines native dialogs
      if (err.message === LocationErrorCode.SERVICES_DISABLED) {
        throw new Error(LocationErrorMessage.SERVICES_DISABLED);
      } else if (err.message === LocationErrorCode.PERMISSION_DENIED) {
        throw new Error(LocationErrorMessage.PERMISSION_DENIED);
      } else if (err.message === LocationErrorCode.TIMEOUT) {
        throw new Error(LocationErrorMessage.TIMEOUT);
      } else {
        throw new Error(LocationErrorMessage.GENERIC_ERROR);
      }
    }
  }, []);

  const fetchNearbyDeals = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Get current location (LocationService handles native dialogs internally)
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Fetch nearby deals
      const response = await feedService.getNearYouFeed(
        currentLocation.lat,
        currentLocation.lng,
        radius,
        1,
        20
      );
      setDeals(response.deals);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load nearby deals';

      // Check if this is a location-related user action (not a real error)
      if (isLocationUserAction(err)) {
        // Expected user behavior - log at info level only
        console.log('ℹ️ Location unavailable:', errorMessage);
      } else {
        // Actual error (API failure, network issue, etc.) - log as error
        console.error('❌ Error fetching nearby deals:', err);
        logError(err, { context: 'useNearbyDeals - fetchNearbyDeals', radius });
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [radius, getCurrentLocation]);

  const handleRefresh = useCallback(() => {
    fetchNearbyDeals(true);
  }, [fetchNearbyDeals]);

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('NearYouScreen');
  }, []);

  // Fetch deals when radius changes
  useEffect(() => {
    fetchNearbyDeals();
  }, [radius]);

  return {
    deals,
    isLoading,
    error,
    radius,
    isRefreshing,
    setRadius,
    handleRefresh,
  };
};
