import { useState, useEffect } from 'react';
import { businessService } from '../services/api/businessService';
import { logError } from '../config/sentry';
import { Business } from '../types/models';

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

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await businessService.getMyBusinesses();
      setBusinesses(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load businesses';
      setError(errorMessage);
      logError(err, {
        context: 'useMyBusinesses',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return {
    businesses,
    isLoading,
    error,
    refetch: fetchBusinesses,
  };
}
