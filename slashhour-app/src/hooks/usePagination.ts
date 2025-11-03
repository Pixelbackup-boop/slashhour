import { useState, useCallback } from 'react';

/**
 * Options for usePagination hook
 */
interface UsePaginationOptions {
  /** Number of items per page (default: 20) */
  pageSize?: number;
  /** Callback function to load more data for the specified page */
  onLoadMore: (page: number) => Promise<void>;
}

/**
 * Custom hook for managing pagination logic
 *
 * Provides state and methods for implementing infinite scroll or load more
 * functionality in lists and data grids.
 *
 * @param options - Pagination configuration options
 * @returns Pagination state and methods
 *
 * @example
 * ```tsx
 * const { currentPage, isLoadingMore, hasMore, loadMore, reset } = usePagination({
 *   pageSize: 20,
 *   onLoadMore: async (page) => {
 *     const data = await fetchData(page);
 *     setItems(prev => [...prev, ...data.items]);
 *     if (data.items.length < 20) {
 *       setHasMore(false);
 *     }
 *   }
 * });
 *
 * <FlashList
 *   data={items}
 *   onEndReached={loadMore}
 *   onEndReachedThreshold={0.5}
 *   ListFooterComponent={() => isLoadingMore ? <Loader /> : null}
 * />
 * ```
 */
export const usePagination = ({ pageSize = 20, onLoadMore }: UsePaginationOptions) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Load next page of data
   * Prevents loading if already loading or no more data available
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      await onLoadMore(nextPage);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isLoadingMore, hasMore, onLoadMore]);

  /**
   * Reset pagination to initial state
   * Useful when applying filters or starting a new search
   */
  const reset = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  return {
    /** Current page number (starts at 1) */
    currentPage,
    /** Whether data is currently being loaded */
    isLoadingMore,
    /** Whether more data is available to load */
    hasMore,
    /** Function to load the next page */
    loadMore,
    /** Function to reset pagination state */
    reset,
    /** Function to manually set hasMore flag */
    setHasMore,
  };
};
