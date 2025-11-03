import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '../services/api/bookmarkService';
import { logError } from '../config/sentry';
import { queryKeys } from '../config/queryClient';

interface UseBookmarkReturn {
  isBookmarked: boolean;
  isProcessing: boolean;
  error: string | null;
  toggleBookmark: () => Promise<void>;
  setIsBookmarked: (value: boolean) => void;
}

/**
 * Hook for managing bookmark state for a single deal
 * Provides optimistic UI updates for better UX
 * Integrated with React Query for automatic cache invalidation
 */
export const useBookmark = (dealId: string, initialBookmarkState: boolean = false): UseBookmarkReturn => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarkState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const toggleBookmark = useCallback(async () => {
    if (!dealId || isProcessing) return;

    // Store previous state for rollback
    const previousState = isBookmarked;

    try {
      setIsProcessing(true);
      setError(null);

      // Optimistic update
      setIsBookmarked(!isBookmarked);

      // Call API
      if (isBookmarked) {
        await bookmarkService.removeBookmark(dealId);
      } else {
        await bookmarkService.addBookmark(dealId);
      }

      if (__DEV__) {
        console.log(`✅ Bookmark ${isBookmarked ? 'removed' : 'added'} for deal:`, dealId);
      }

      // Invalidate React Query caches to refetch fresh data with updated bookmark status
      queryClient.invalidateQueries({
        queryKey: queryKeys.deals.detail(dealId),
      });
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      });
      queryClient.invalidateQueries({
        queryKey: ['bookmarks'],
      });

      if (__DEV__) {
        console.log('🔄 Invalidated React Query caches for deal:', dealId);
      }
    } catch (err: any) {
      // Handle 409 Conflict errors gracefully
      const statusCode = err.response?.status;
      const errorMessage = err.response?.data?.message || err.message || '';

      if (statusCode === 409) {
        // 409 = "Already bookmarked" or "Bookmark not found"
        // Sync state with reality instead of showing error
        if (errorMessage.toLowerCase().includes('already bookmarked')) {
          // Deal is already bookmarked, keep the optimistic update
          setIsBookmarked(true);
          if (__DEV__) {
            console.log('✅ Synced: Deal was already bookmarked');
          }
        } else if (errorMessage.toLowerCase().includes('not found')) {
          // Bookmark doesn't exist, keep the optimistic update
          setIsBookmarked(false);
          if (__DEV__) {
            console.log('✅ Synced: Bookmark was already removed');
          }
        } else {
          // Unknown 409, rollback
          setIsBookmarked(previousState);
        }
        // Don't set error or throw for 409s - user got what they wanted
      } else {
        // Rollback on other errors
        setIsBookmarked(previousState);
        console.error('Failed to toggle bookmark:', err);
        setError(errorMessage || 'Failed to update bookmark');
        logError(err, { context: 'useBookmark.toggleBookmark', dealId });
        throw err; // Re-throw so component can handle it
      }
    } finally {
      setIsProcessing(false);
    }
  }, [dealId, isBookmarked, isProcessing, queryClient]);

  return {
    isBookmarked,
    isProcessing,
    error,
    toggleBookmark,
    setIsBookmarked,
  };
};
