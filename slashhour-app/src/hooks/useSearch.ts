import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';
import { Deal, Business } from '../types/models';
import { trackSearch, trackCategoryFilter } from '../services/analytics';

export type SearchType = 'all' | 'deals' | 'businesses';

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  flashOnly?: boolean;
  verified?: boolean;
}

export interface SearchResults {
  deals: Deal[];
  businesses: Business[];
  totals: {
    deals: number;
    businesses: number;
  };
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  results: SearchResults;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  search: () => Promise<void>;
  clearSearch: () => void;
  hasSearched: boolean;
}

export const useSearch = (): UseSearchReturn => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResults>({
    deals: [],
    businesses: [],
    totals: { deals: 0, businesses: 0 },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setHasSearched(true);

      let response;

      if (searchType === 'all') {
        // Combined search
        response = await apiClient.get<any>('/search/all', {
          params: { q: query },
        });

        const newResults = {
          deals: response.deals || [],
          businesses: response.businesses || [],
          totals: response.totals || { deals: 0, businesses: 0 },
        };
        setResults(newResults);

        // Track analytics
        const totalResults = newResults.totals.deals + newResults.totals.businesses;
        trackSearch(query, totalResults);

      } else if (searchType === 'deals') {
        // Deals only
        response = await apiClient.get<any>('/search/deals', {
          params: {
            q: query,
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            minDiscount: filters.minDiscount,
            flashOnly: filters.flashOnly,
          },
        });

        const newResults = {
          deals: response.deals || [],
          businesses: [],
          totals: { deals: response.total || 0, businesses: 0 },
        };
        setResults(newResults);

        // Track analytics
        trackSearch(query, newResults.totals.deals);

      } else if (searchType === 'businesses') {
        // Businesses only
        response = await apiClient.get<any>('/search/businesses', {
          params: {
            q: query,
            category: filters.category,
            verified: filters.verified,
          },
        });

        const newResults = {
          deals: [],
          businesses: response.businesses || [],
          totals: { deals: 0, businesses: response.total || 0 },
        };
        setResults(newResults);

        // Track analytics
        trackSearch(query, newResults.totals.businesses);
      }

    } catch (err: any) {
      console.error('Search failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Search failed';
      setError(errorMessage);
      logError(err, { context: 'useSearch.search', query, searchType });
    } finally {
      setIsSearching(false);
    }
  }, [query, searchType, filters]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults({
      deals: [],
      businesses: [],
      totals: { deals: 0, businesses: 0 },
    });
    setError(null);
    setHasSearched(false);
    setFilters({});
  }, []);

  // Auto-search when filters change (if there's an active query)
  useEffect(() => {
    if (hasSearched && query.trim()) {
      const timeoutId = setTimeout(() => {
        search();

        // Track category filter changes
        if (filters.category) {
          trackCategoryFilter(filters.category, results.deals.length);
        }
      }, 300); // Debounce

      return () => clearTimeout(timeoutId);
    }
  }, [filters, hasSearched, query, search, results.deals.length]);

  return {
    query,
    setQuery,
    searchType,
    setSearchType,
    filters,
    setFilters,
    results,
    isLoading,
    isSearching,
    error,
    search,
    clearSearch,
    hasSearched,
  };
};
