import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Deal } from '../../types/models';
import { TABS } from '../../utils/constants';

interface FeedState {
  youFollow: {
    deals: Deal[];
    page: number;
    hasMore: boolean;
    isLoading: boolean;
    newDealsCount: number;
  };
  nearYou: {
    deals: Deal[];
    page: number;
    hasMore: boolean;
    isLoading: boolean;
    totalInRadius: number;
    categoriesSummary: { [key: string]: number };
  };
  activeTab: typeof TABS.YOU_FOLLOW | typeof TABS.NEAR_YOU;
  error: string | null;
}

const initialState: FeedState = {
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
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setActiveTab: (
      state,
      action: PayloadAction<typeof TABS.YOU_FOLLOW | typeof TABS.NEAR_YOU>
    ) => {
      state.activeTab = action.payload;
    },

    // You Follow Feed
    fetchYouFollowStart: (state) => {
      state.youFollow.isLoading = true;
      state.error = null;
    },
    fetchYouFollowSuccess: (
      state,
      action: PayloadAction<{
        deals: Deal[];
        page: number;
        hasMore: boolean;
        newDealsCount: number;
      }>
    ) => {
      const { deals, page, hasMore, newDealsCount } = action.payload;
      state.youFollow.deals = page === 1 ? deals : [...state.youFollow.deals, ...deals];
      state.youFollow.page = page;
      state.youFollow.hasMore = hasMore;
      state.youFollow.newDealsCount = newDealsCount;
      state.youFollow.isLoading = false;
    },
    fetchYouFollowFailure: (state, action: PayloadAction<string>) => {
      state.youFollow.isLoading = false;
      state.error = action.payload;
    },

    // Near You Feed
    fetchNearYouStart: (state) => {
      state.nearYou.isLoading = true;
      state.error = null;
    },
    fetchNearYouSuccess: (
      state,
      action: PayloadAction<{
        deals: Deal[];
        page: number;
        hasMore: boolean;
        totalInRadius: number;
        categoriesSummary: { [key: string]: number };
      }>
    ) => {
      const { deals, page, hasMore, totalInRadius, categoriesSummary } = action.payload;
      state.nearYou.deals = page === 1 ? deals : [...state.nearYou.deals, ...deals];
      state.nearYou.page = page;
      state.nearYou.hasMore = hasMore;
      state.nearYou.totalInRadius = totalInRadius;
      state.nearYou.categoriesSummary = categoriesSummary;
      state.nearYou.isLoading = false;
    },
    fetchNearYouFailure: (state, action: PayloadAction<string>) => {
      state.nearYou.isLoading = false;
      state.error = action.payload;
    },

    // Add new deal
    addFollowingDeal: (state, action: PayloadAction<Deal>) => {
      state.youFollow.deals.unshift(action.payload);
      state.youFollow.newDealsCount += 1;
    },
    addNearbyDeal: (state, action: PayloadAction<Deal>) => {
      state.nearYou.deals.unshift(action.payload);
    },

    // Clear badge
    clearYouFollowBadge: (state) => {
      state.youFollow.newDealsCount = 0;
    },

    // Refresh feeds
    refreshYouFollow: (state) => {
      state.youFollow.page = 1;
      state.youFollow.deals = [];
    },
    refreshNearYou: (state) => {
      state.nearYou.page = 1;
      state.nearYou.deals = [];
    },
  },
});

export const {
  setActiveTab,
  fetchYouFollowStart,
  fetchYouFollowSuccess,
  fetchYouFollowFailure,
  fetchNearYouStart,
  fetchNearYouSuccess,
  fetchNearYouFailure,
  addFollowingDeal,
  addNearbyDeal,
  clearYouFollowBadge,
  refreshYouFollow,
  refreshNearYou,
} = feedSlice.actions;

export default feedSlice.reducer;
