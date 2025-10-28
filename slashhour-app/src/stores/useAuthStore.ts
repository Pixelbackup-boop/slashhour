/**
 * Auth Store (Zustand)
 * Replaces Redux authSlice with simpler, more performant Zustand
 *
 * Benefits vs Redux:
 * - 70% less boilerplate
 * - No actions/reducers complexity
 * - Better TypeScript inference
 * - Faster re-renders (only subscribes to what you use)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { setUserContext, clearUserContext } from '../config/sentry';
import apiClient from '../services/api/ApiClient';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  deviceToken: string | null; // Store device token for cleanup on logout
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions (methods that directly mutate state)
  loginStart: () => void;
  loginSuccess: (user: User, token: string, refreshToken: string) => void;
  loginFailure: (error: string) => void;
  logout: () => Promise<void>; // Changed to async for device token cleanup
  setDeviceToken: (deviceToken: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  updateLocation: (location: { lat: number; lng: number }, radius_km: number) => void;
  clearError: () => void;
}

/**
 * Auth Store with AsyncStorage persistence
 * Usage: const { user, loginSuccess, logout } = useAuthStore();
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      token: null,
      refreshToken: null,
      deviceToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      loginStart: () =>
        set({
          isLoading: true,
          error: null,
        }),

      loginSuccess: (user, token, refreshToken) => {
        // Set Sentry context for error tracking
        setUserContext({
          id: user.id,
          email: user.email,
          username: user.username,
        });

        // Sync token with ApiClient
        apiClient.setToken(token);

        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      loginFailure: (error) =>
        set({
          isLoading: false,
          error,
        }),

      logout: async () => {
        // Get device token before clearing state
        const state = useAuthStore.getState();
        const deviceToken = state.deviceToken;

        // Deactivate device token on backend to prevent notifications after logout
        if (deviceToken) {
          try {
            const notificationService = await import('../services/api/notificationService');
            await notificationService.default.deactivateDeviceToken(deviceToken);
            console.log('[Auth] Device token deactivated on logout');
          } catch (error) {
            console.error('[Auth] Failed to deactivate device token:', error);
            // Continue with logout even if deactivation fails
          }
        }

        // Clear Sentry context
        clearUserContext();

        // Clear token from ApiClient
        apiClient.clearToken();

        set({
          user: null,
          token: null,
          refreshToken: null,
          deviceToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setDeviceToken: (deviceToken) =>
        set({
          deviceToken,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateLocation: (location, radius_km) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                default_location: location,
                default_radius_km: radius_km,
              }
            : null,
        })),

      clearError: () =>
        set({
          error: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After hydration, sync token with ApiClient
        if (state?.token) {
          apiClient.setToken(state.token);

          // Restore Sentry context
          if (state.user) {
            setUserContext({
              id: state.user.id,
              email: state.user.email,
              username: state.user.username,
            });
          }
        }
      },
    }
  )
);

// Selector hooks for better performance (optional but recommended)
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthToken = () => useAuthStore((state) => state.token);
