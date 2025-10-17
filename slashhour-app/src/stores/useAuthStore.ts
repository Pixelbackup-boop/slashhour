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
import { User } from '../types/models';
import { setUserContext, clearUserContext } from '../config/sentry';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions (methods that directly mutate state)
  loginStart: () => void;
  loginSuccess: (user: User, token: string, refreshToken: string) => void;
  loginFailure: (error: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateLocation: (location: { lat: number; lng: number }, radius_km: number) => void;
  clearError: () => void;
}

/**
 * Auth Store
 * Usage: const { user, loginSuccess, logout } = useAuthStore();
 */
export const useAuthStore = create<AuthState>((set) => ({
  // Initial State
  user: null,
  token: null,
  refreshToken: null,
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

  logout: () => {
    // Clear Sentry context
    clearUserContext();

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

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
}));

// Selector hooks for better performance (optional but recommended)
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthToken = () => useAuthStore((state) => state.token);
