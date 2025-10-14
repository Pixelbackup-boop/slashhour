import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { feedService } from '../services/api/feedService';
import { logError } from '../config/sentry';
import { trackScreenView } from '../services/analytics';
import { Deal } from '../types/models';

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

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location to see nearby deals.');
        setIsLoading(false);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Error requesting location permission:', err);
      setError('Failed to request location permission');
      setIsLoading(false);
      logError(err, { context: 'useNearbyDeals - requestLocationPermission' });
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (err: any) {
      console.error('Error getting location:', err);
      logError(err, { context: 'useNearbyDeals - getCurrentLocation' });
      throw new Error('Failed to get your location');
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

      // Request permission if not already granted
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      // Get current location
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
      console.error('Error fetching nearby deals:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load nearby deals';
      setError(errorMessage);
      logError(err, { context: 'useNearbyDeals - fetchNearbyDeals', radius });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [radius, requestLocationPermission, getCurrentLocation]);

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
