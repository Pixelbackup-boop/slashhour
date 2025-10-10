import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Business } from '../../types/models';

interface FollowingState {
  businesses: Business[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FollowingState = {
  businesses: [],
  isLoading: false,
  error: null,
};

const followingSlice = createSlice({
  name: 'following',
  initialState,
  reducers: {
    fetchFollowingStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchFollowingSuccess: (state, action: PayloadAction<Business[]>) => {
      state.businesses = action.payload;
      state.isLoading = false;
    },
    fetchFollowingFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    followBusiness: (state, action: PayloadAction<Business>) => {
      state.businesses.push(action.payload);
    },
    unfollowBusiness: (state, action: PayloadAction<string>) => {
      state.businesses = state.businesses.filter((b) => b.id !== action.payload);
    },
  },
});

export const {
  fetchFollowingStart,
  fetchFollowingSuccess,
  fetchFollowingFailure,
  followBusiness,
  unfollowBusiness,
} = followingSlice.actions;

export default followingSlice.reducer;
