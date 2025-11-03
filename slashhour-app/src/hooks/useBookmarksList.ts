import { useState, useEffect, useCallback } from 'react';
import { bookmarkService } from '../services/api/bookmarkService';
import { Deal } from '../types/models';
import { logError } from '../config/sentry';
import { useAuthStore } from '../stores/useAuthStore';

interface UseBookmarksListReturn {
  bookmarks: Deal[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  page: number;
  fetchNextPage: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching user's bookmarked deals with pagination
 * Used in Profile screen to display saved deals
 *
 * IMPORTANT: This endpoint requires authentication.
 * The hook will only fetch after auth token is loaded from AsyncStorage.
 */
export const useBookmarksList = (): UseBookmarksListReturn => {
  const [bookmarks, setBookmarks] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Check for token existence (more reliable than isAuthenticated flag)
  // The ApiClient uses token to set Authorization header, so this is what matters
  const token = useAuthStore((state) => state.token);

  const fetchBookmarks = useCallback(
    async (pageNum: number, isRefresh: boolean = false) => {
      // Don't fetch if no token (user not authenticated)
      if (!token) {
        if (__DEV__) {
          console.log('⏸️ [useBookmarksList] Skipping fetch - no auth token');
        }
        setIsLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const response = await bookmarkService.getUserBookmarks(pageNum, 20);

        if (isRefresh || pageNum === 1) {
          // Replace bookmarks on refresh or first page
          setBookmarks(response.deals);
        } else {
          // Append bookmarks on pagination
          setBookmarks((prev) => [...prev, ...response.deals]);
        }

        setTotal(response.total);
        setHasMore(response.hasMore);
        setPage(pageNum);

        if (__DEV__) {
          console.log(`✅ Fetched ${response.deals.length} bookmarks (page ${pageNum})`);
        }
      } catch (err: any) {
        console.error('Failed to fetch bookmarks:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load bookmarks';
        setError(errorMessage);
        logError(err, { context: 'useBookmarksList.fetchBookmarks', page: pageNum });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

  // Initial fetch - only when token becomes available
  useEffect(() => {
    fetchBookmarks(1);
  }, [fetchBookmarks]);

  // Fetch next page
  const fetchNextPage = useCallback(async () => {
    if (!hasMore || isLoading) return;

    await fetchBookmarks(page + 1);
  }, [hasMore, isLoading, page, fetchBookmarks]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchBookmarks(1, true);
  }, [fetchBookmarks]);

  return {
    bookmarks,
    isLoading,
    isRefreshing,
    error,
    total,
    hasMore,
    page,
    fetchNextPage,
    refresh,
  };
};
