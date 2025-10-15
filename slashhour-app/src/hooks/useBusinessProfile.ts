import { useState, useEffect } from 'react';
import { businessService } from '../services/api/businessService';
import { logError } from '../config/sentry';
import { Business, Deal } from '../types/models';

interface BusinessStats {
  activeDealCount: number;
  followerCount: number;
  totalSavings: string;
}

interface UseBusinessProfileReturn {
  business: Business | null;
  deals: Deal[];
  stats: BusinessStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBusinessProfile(businessId: string): UseBusinessProfileReturn {
  const [business, setBusiness] = useState<Business | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch business details
      const businessData = await businessService.getBusinessById(businessId);
      setBusiness(businessData);

      // Fetch business deals
      const dealsData = await businessService.getBusinessDeals(businessId);
      setDeals(dealsData);

      // Fetch business stats
      const statsData = await businessService.getBusinessStats(businessId);
      setStats(statsData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load business';
      setError(errorMessage);
      logError(err, {
        context: 'useBusinessProfile',
        businessId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await fetchBusinessProfile();
  };

  useEffect(() => {
    if (businessId) {
      fetchBusinessProfile();
    }
  }, [businessId]);

  return {
    business,
    deals,
    stats,
    isLoading,
    error,
    refresh,
  };
}
