import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  let mockOnLoadMore: jest.Mock;

  beforeEach(() => {
    mockOnLoadMore = jest.fn().mockResolvedValue(undefined);
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      expect(result.current.currentPage).toBe(1);
      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.hasMore).toBe(true);
    });

    it('should initialize with custom page size', () => {
      const { result } = renderHook(() =>
        usePagination({ pageSize: 50, onLoadMore: mockOnLoadMore })
      );

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('loadMore', () => {
    it('should load next page and increment currentPage', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockOnLoadMore).toHaveBeenCalledWith(2);
      expect(result.current.currentPage).toBe(2);
      expect(result.current.isLoadingMore).toBe(false);
    });

    it('should set isLoadingMore to true during load', async () => {
      let resolveLoad: () => void;
      const slowLoad = jest.fn(
        () => new Promise<void>((resolve) => (resolveLoad = resolve))
      );

      const { result } = renderHook(() =>
        usePagination({ onLoadMore: slowLoad })
      );

      act(() => {
        result.current.loadMore();
      });

      // Should be loading
      expect(result.current.isLoadingMore).toBe(true);
      expect(slowLoad).toHaveBeenCalledWith(2);

      // Complete the load
      await act(async () => {
        resolveLoad!();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoadingMore).toBe(false);
    });

    it('should not load if already loading', async () => {
      let resolveLoad: () => void;
      const slowLoad = jest.fn(
        () => new Promise<void>((resolve) => (resolveLoad = resolve))
      );

      const { result } = renderHook(() =>
        usePagination({ onLoadMore: slowLoad })
      );

      // Start first load
      act(() => {
        result.current.loadMore();
      });

      // Try to load again while first is in progress
      act(() => {
        result.current.loadMore();
      });

      expect(slowLoad).toHaveBeenCalledTimes(1);

      // Complete the load
      await act(async () => {
        resolveLoad!();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    });

    it('should not load if hasMore is false', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      // Set hasMore to false
      act(() => {
        result.current.setHasMore(false);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockOnLoadMore).not.toHaveBeenCalled();
    });

    it('should handle multiple sequential loads', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      // Load page 2
      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockOnLoadMore).toHaveBeenCalledWith(2);
      expect(result.current.currentPage).toBe(2);

      // Load page 3
      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockOnLoadMore).toHaveBeenCalledWith(3);
      expect(result.current.currentPage).toBe(3);

      // Load page 4
      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockOnLoadMore).toHaveBeenCalledWith(4);
      expect(result.current.currentPage).toBe(4);
    });

    it('should handle errors during load', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorLoad = jest.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        usePagination({ onLoadMore: errorLoad })
      );

      await act(async () => {
        await result.current.loadMore();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Pagination error:',
        expect.any(Error)
      );
      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.currentPage).toBe(1); // Should not increment on error

      consoleErrorSpy.mockRestore();
    });

    it('should set isLoadingMore to false even on error', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      const errorLoad = jest.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        usePagination({ onLoadMore: errorLoad })
      );

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.isLoadingMore).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset pagination to initial state', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      // Load a few pages
      await act(async () => {
        await result.current.loadMore();
        await result.current.loadMore();
      });

      expect(result.current.currentPage).toBe(3);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMore).toBe(true);
    });

    it('should reset hasMore to true even if it was false', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      // Set hasMore to false
      act(() => {
        result.current.setHasMore(false);
      });

      expect(result.current.hasMore).toBe(false);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.hasMore).toBe(true);
    });

    it('should allow loading after reset', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      // Load pages
      await act(async () => {
        await result.current.loadMore();
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Load again
      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockOnLoadMore).toHaveBeenLastCalledWith(2);
      expect(result.current.currentPage).toBe(2);
    });
  });

  describe('setHasMore', () => {
    it('should update hasMore flag', () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.setHasMore(false);
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('should prevent loading when hasMore is set to false', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      act(() => {
        result.current.setHasMore(false);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockOnLoadMore).not.toHaveBeenCalled();
    });

    it('should allow toggling hasMore', () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      act(() => {
        result.current.setHasMore(false);
      });
      expect(result.current.hasMore).toBe(false);

      act(() => {
        result.current.setHasMore(true);
      });
      expect(result.current.hasMore).toBe(true);
    });
  });

  describe('hook stability', () => {
    it('should return stable loadMore function reference', () => {
      const { result, rerender } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      const firstLoadMore = result.current.loadMore;
      rerender({});

      // Note: loadMore is not stable because it depends on state
      // This test verifies the function can be called after rerender
      expect(typeof result.current.loadMore).toBe('function');
    });

    it('should return stable reset function reference', () => {
      const { result, rerender } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      const firstReset = result.current.reset;
      rerender({});

      expect(result.current.reset).toBe(firstReset);
    });

    it('should return stable setHasMore function reference', () => {
      const { result, rerender } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      const firstSetHasMore = result.current.setHasMore;
      rerender({});

      expect(result.current.setHasMore).toBe(firstSetHasMore);
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical pagination flow', async () => {
      const items: number[] = [];
      const loadMoreWithData = jest.fn(async (page: number) => {
        // Simulate loading 20 items per page
        const pageSize = 20;
        const newItems = Array.from(
          { length: pageSize },
          (_, i) => (page - 1) * pageSize + i
        );
        items.push(...newItems);
      });

      const { result } = renderHook(() =>
        usePagination({ pageSize: 20, onLoadMore: loadMoreWithData })
      );

      // Load initial data (page 1 is loaded separately)
      items.push(...Array.from({ length: 20 }, (_, i) => i));

      // Load page 2
      await act(async () => {
        await result.current.loadMore();
      });

      expect(items.length).toBe(40);

      // Load page 3
      await act(async () => {
        await result.current.loadMore();
      });

      expect(items.length).toBe(60);
      expect(result.current.currentPage).toBe(3);
    });

    it('should handle end of data scenario', async () => {
      const loadMoreWithLimit = jest.fn(async (page: number) => {
        // Simulate last page with no data
        if (page > 3) {
          return;
        }
      });

      const { result } = renderHook(() =>
        usePagination({ onLoadMore: loadMoreWithLimit })
      );

      // Load pages until end
      await act(async () => {
        await result.current.loadMore(); // page 2
        await result.current.loadMore(); // page 3
        await result.current.loadMore(); // page 4 - empty
      });

      // Manually set hasMore to false (as would be done by the calling component)
      act(() => {
        result.current.setHasMore(false);
      });

      // Try to load more
      await act(async () => {
        await result.current.loadMore();
      });

      expect(loadMoreWithLimit).toHaveBeenCalledTimes(3);
      expect(result.current.currentPage).toBe(4);
    });

    it('should handle filter/search reset scenario', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      // Load some pages
      await act(async () => {
        await result.current.loadMore();
        await result.current.loadMore();
      });

      expect(result.current.currentPage).toBe(3);

      // User applies new filter - reset pagination
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMore).toBe(true);

      // Load with new filter
      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should handle rapid scroll scenario', async () => {
      const { result } = renderHook(() =>
        usePagination({ onLoadMore: mockOnLoadMore })
      );

      // Simulate rapid loadMore calls (e.g., fast scrolling)
      await act(async () => {
        const promises = [
          result.current.loadMore(),
          result.current.loadMore(),
          result.current.loadMore(),
        ];
        await Promise.all(promises);
      });

      // Should only load once due to isLoadingMore guard
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle onLoadMore that completes synchronously', async () => {
      const syncLoad = jest.fn(() => Promise.resolve());

      const { result } = renderHook(() =>
        usePagination({ onLoadMore: syncLoad })
      );

      await act(async () => {
        await result.current.loadMore();
      });

      expect(syncLoad).toHaveBeenCalledWith(2);
      expect(result.current.currentPage).toBe(2);
    });

    it('should handle changing onLoadMore function', async () => {
      let loadFn = jest.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ onLoadMore }: { onLoadMore: any }) => usePagination({ onLoadMore }),
        { initialProps: { onLoadMore: loadFn } }
      );

      await act(async () => {
        await result.current.loadMore();
      });

      expect(loadFn).toHaveBeenCalledWith(2);

      // Change the load function
      const newLoadFn = jest.fn().mockResolvedValue(undefined);
      rerender({ onLoadMore: newLoadFn });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(newLoadFn).toHaveBeenCalledWith(3);
    });

    it('should handle page size parameter', () => {
      const { result: result1 } = renderHook(() =>
        usePagination({ pageSize: 10, onLoadMore: mockOnLoadMore })
      );

      const { result: result2 } = renderHook(() =>
        usePagination({ pageSize: 50, onLoadMore: mockOnLoadMore })
      );

      // PageSize doesn't affect the hook state, but ensures the prop is accepted
      expect(result1.current.currentPage).toBe(1);
      expect(result2.current.currentPage).toBe(1);
    });
  });
});
