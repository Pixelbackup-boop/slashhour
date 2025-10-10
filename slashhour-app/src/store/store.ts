import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices (will be created)
import authReducer from './slices/authSlice';
import feedReducer from './slices/feedSlice';
import followingReducer from './slices/followingSlice';
import locationReducer from './slices/locationSlice';
import savingsReducer from './slices/savingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    following: followingReducer,
    location: locationReducer,
    savings: savingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
