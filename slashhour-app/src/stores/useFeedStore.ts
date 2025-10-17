/**
 * Feed Store (Zustand)
 * Manages "You Follow" and "Near You" feeds
 */

import { create } from 'zustand';
import { Deal } from '../types/models';
import { TABS } from '../utils/constants';

interface FeedTab {
  deals: Deal[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
}

interface YouFollowTab extends FeedTab {
  newDealsCount: number;
}

interface NearYouTab extends FeedTab {
  totalInRadius: number;
  categoriesSummary: { [key: string]: number };
}

interface FeedState {
  // State
  youFollow: YouFollowTab;
  nearYou: NearYouTab;
  activeTab: typeof TABS.YOU_FOLLOW | typeof TABS.NEAR_YOU;
  error: string | null;

  // Actions
  setActiveTab: (tab: typeof TABS.YOU_FOLLOW | typeof TABS.NEAR_YOU) => void;

  // You Follow
  fetchYouFollowStart: () => void;
  fetchYouFollowSuccess: (
    deals: Deal[],
    page: number,
    hasMore: boolean,
    newDealsCount: number
  ) => void;
  fetchYouFollowFailure: (error: string) => void;
  addFollowingDeal: (deal: Deal) => void;
  clearYouFollowBadge: () => void;
  refreshYouFollow: () => void;

  // Near You
  fetchNearYouStart: () => void;
  fetchNearYouSuccess: (
    deals: Deal[],
    page: number,
    hasMore: boolean,
    totalInRadius: number,
    categoriesSummary: { [key: string]: number }
  ) => void;
  fetchNearYouFailure: (error: string) => void;
  addNearbyDeal: (deal: Deal) => void;
  refreshNearYou: () => void;

  clearError: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  // Initial State
  youFollow: {
    deals: [],
    page: 1,
    hasMore: true,
    isLoading: false,
    newDealsCount: 0,
  },
  nearYou: {
    deals: [],
    page: 1,
    hasMore: true,
    isLoading: false,
    totalInRadius: 0,
    categoriesSummary: {},
  },
  activeTab: TABS.YOU_FOLLOW,
  error: null,

  // Actions
  setActiveTab: (tab) =>
    set({
      activeTab: tab,
    }),

  // You Follow Actions
  fetchYouFollowStart: () =>
    set((state) => ({
      youFollow: { ...state.youFollow, isLoading: true },
      error: null,
    })),

  fetchYouFollowSuccess: (deals, page, hasMore, newDealsCount) =>
    set((state) => ({
      youFollow: {
        deals: page === 1 ? deals : [...state.youFollow.deals, ...deals],
        page,
        hasMore,
        newDealsCount,
        isLoading: false,
      },
    })),

  fetchYouFollowFailure: (error) =>
    set((state) => ({
      youFollow: { ...state.youFollow, isLoading: false },
      error,
    })),

  addFollowingDeal: (deal) =>
    set((state) => ({
      youFollow: {
        ...state.youFollow,
        deals: [deal, ...state.youFollow.deals],
        newDealsCount: state.youFollow.newDealsCount + 1,
      },
    })),

  clearYouFollowBadge: () =>
    set((state) => ({
      youFollow: { ...state.youFollow, newDealsCount: 0 },
    })),

  refreshYouFollow: () =>
    set((state) => ({
      youFollow: { ...state.youFollow, page: 1, deals: [] },
    })),

  // Near You Actions
  fetchNearYouStart: () =>
    set((state) => ({
      nearYou: { ...state.nearYou, isLoading: true },
      error: null,
    })),

  fetchNearYouSuccess: (deals, page, hasMore, totalInRadius, categoriesSummary) =>
    set((state) => ({
      nearYou: {
        deals: page === 1 ? deals : [...state.nearYou.deals, ...deals],
        page,
        hasMore,
        totalInRadius,
        categoriesSummary,
        isLoading: false,
      },
    })),

  fetchNearYouFailure: (error) =>
    set((state) => ({
      nearYou: { ...state.nearYou, isLoading: false },
      error,
    })),

  addNearbyDeal: (deal) =>
    set((state) => ({
      nearYou: {
        ...state.nearYou,
        deals: [deal, ...state.nearYou.deals],
      },
    })),

  refreshNearYou: () =>
    set((state) => ({
      nearYou: { ...state.nearYou, page: 1, deals: [] },
    })),

  clearError: () =>
    set({
      error: null,
    }),
}));

// Selector hooks
export const useActiveTab = () => useFeedStore((state) => state.activeTab);
export const useYouFollowDeals = () => useFeedStore((state) => state.youFollow.deals);
export const useNearYouDeals = () => useFeedStore((state) => state.nearYou.deals);
export const useNewDealsCount = () => useFeedStore((state) => state.youFollow.newDealsCount);
