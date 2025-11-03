import apiClient from './ApiClient';
import { Deal } from '../../types/models';

export interface BookmarksResponse {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BookmarkStatusResponse {
  isBookmarked: boolean;
}

export const bookmarkService = {
  /**
   * Add a bookmark for a deal
   */
  addBookmark: async (dealId: string): Promise<void> => {
    if (__DEV__) {
      console.log('💾 [bookmarkService] Adding bookmark for deal:', dealId);
    }

    try {
      await apiClient.post(`/bookmarks/${dealId}`);

      if (__DEV__) {
        console.log('✅ [bookmarkService] Bookmark added successfully');
      }
    } catch (error: any) {
      // Only log non-409 errors (409s are handled gracefully by useBookmark hook)
      const statusCode = error.response?.status;
      if (statusCode !== 409) {
        console.error('❌ [bookmarkService] Error adding bookmark:', {
          dealId,
          error: error.message,
          status: statusCode,
          data: error.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * Remove a bookmark for a deal
   */
  removeBookmark: async (dealId: string): Promise<void> => {
    if (__DEV__) {
      console.log('🗑️ [bookmarkService] Removing bookmark for deal:', dealId);
    }

    try {
      await apiClient.delete(`/bookmarks/${dealId}`);

      if (__DEV__) {
        console.log('✅ [bookmarkService] Bookmark removed successfully');
      }
    } catch (error: any) {
      // Only log non-409 errors (409s are handled gracefully by useBookmark hook)
      const statusCode = error.response?.status;
      if (statusCode !== 409) {
        console.error('❌ [bookmarkService] Error removing bookmark:', {
          dealId,
          error: error.message,
          status: statusCode,
          data: error.response?.data,
        });
      }
      throw error;
    }
  },

  /**
   * Get user's bookmarked deals with pagination
   */
  getUserBookmarks: async (page: number = 1, limit: number = 20): Promise<BookmarksResponse> => {
    if (__DEV__) {
      console.log('📚 [bookmarkService] Fetching user bookmarks:', { page, limit });
    }

    try {
      const response = await apiClient.get<BookmarksResponse>('/bookmarks', {
        params: { page, limit },
      });

      if (__DEV__) {
        console.log('✅ [bookmarkService] Fetched bookmarks:', response.total, 'total');
      }

      return response;
    } catch (error: any) {
      console.error('❌ [bookmarkService] Error fetching bookmarks:', {
        page,
        limit,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Check if a specific deal is bookmarked
   */
  checkBookmarkStatus: async (dealId: string): Promise<boolean> => {
    if (__DEV__) {
      console.log('🔍 [bookmarkService] Checking bookmark status for deal:', dealId);
    }

    try {
      const response = await apiClient.get<BookmarkStatusResponse>(`/bookmarks/check/${dealId}`);

      if (__DEV__) {
        console.log('✅ [bookmarkService] Bookmark status:', response.isBookmarked);
      }

      return response.isBookmarked;
    } catch (error: any) {
      console.error('❌ [bookmarkService] Error checking bookmark status:', {
        dealId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Toggle bookmark status for a deal
   */
  toggleBookmark: async (dealId: string, currentStatus: boolean): Promise<void> => {
    if (currentStatus) {
      await bookmarkService.removeBookmark(dealId);
    } else {
      await bookmarkService.addBookmark(dealId);
    }
  },
};
