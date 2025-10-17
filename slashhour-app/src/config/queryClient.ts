/**
 * TanStack Query (React Query) Configuration
 *
 * Centralized API data caching, fetching, and synchronization
 * 2025 best practice for server state management
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Query Client Configuration
 *
 * Default settings optimized for mobile apps:
 * - 5 minute cache time (data stays fresh)
 * - 0 stale time (refetch on window focus)
 * - 3 retries with exponential backoff
 * - Background refetching enabled
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time - How long unused data stays in memory
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)

      // Stale time - How long data is considered fresh
      staleTime: 0, // Always refetch on mount (can override per query)

      // Retry logic
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch settings
      refetchOnWindowFocus: true, // Refetch when app comes to foreground
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch when component mounts

      // Network mode
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      // Retry mutations on failure
      retry: 1,
      retryDelay: 1000,

      // Network mode
      networkMode: 'online',
    },
  },
});

/**
 * Query Keys Factory
 * Centralized query key management for consistency
 *
 * Usage:
 * const { data } = useQuery(queryKeys.deals.list({ category: 'food' }))
 */
export const queryKeys = {
  // Deals
  deals: {
    all: ['deals'] as const,
    lists: () => [...queryKeys.deals.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.deals.lists(), filters] as const,
    details: () => [...queryKeys.deals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.deals.details(), id] as const,
  },

  // Businesses
  businesses: {
    all: ['businesses'] as const,
    lists: () => [...queryKeys.businesses.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.businesses.lists(), filters] as const,
    details: () => [...queryKeys.businesses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.businesses.details(), id] as const,
    myBusinesses: () => [...queryKeys.businesses.all, 'my-businesses'] as const,
  },

  // User profile
  user: {
    all: ['user'] as const,
    profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
    stats: (userId: string) => [...queryKeys.user.all, 'stats', userId] as const,
  },

  // Feed
  feed: {
    all: ['feed'] as const,
    youFollow: (page: number) => [...queryKeys.feed.all, 'you-follow', page] as const,
    nearYou: (page: number, location?: { lat: number; lng: number }) =>
      [...queryKeys.feed.all, 'near-you', page, location] as const,
  },

  // Conversations
  conversations: {
    all: ['conversations'] as const,
    list: (userId: string) => [...queryKeys.conversations.all, 'list', userId] as const,
    detail: (conversationId: string) => [...queryKeys.conversations.all, 'detail', conversationId] as const,
    messages: (conversationId: string, page: number) =>
      [...queryKeys.conversations.detail(conversationId), 'messages', page] as const,
  },

  // Following
  following: {
    all: ['following'] as const,
    list: (userId: string) => [...queryKeys.following.all, 'list', userId] as const,
    isFollowing: (businessId: string) => [...queryKeys.following.all, 'is-following', businessId] as const,
  },
};

/**
 * Common Query Options
 * Reusable configurations for different data types
 */
export const queryOptions = {
  // Static/rarely changing data (business info, categories)
  static: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },

  // Dynamic data (feed, deals list)
  dynamic: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  },

  // Real-time data (messages, notifications)
  realtime: {
    staleTime: 0, // Always stale, always refetch
    gcTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 30000, // Poll every 30 seconds
  },

  // Infinite scroll
  infinite: {
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  },
};
