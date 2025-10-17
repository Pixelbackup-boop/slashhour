/**
 * Location Store (Zustand)
 * Manages user's current location and search radius
 */

import { create } from 'zustand';
import { Location } from '../types/models';
import { DEFAULT_RADIUS } from '../utils/constants';

interface LocationState {
  // State
  currentLocation: Location | null;
  radius: number;
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;

  // Actions
  setLocation: (location: Location) => void;
  setRadius: (radius: number) => void;
  setPermissionGranted: (granted: boolean) => void;
  locationError: (error: string) => void;
  startLocationLoading: () => void;
  stopLocationLoading: () => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  // Initial State
  currentLocation: null,
  radius: DEFAULT_RADIUS,
  isLoading: false,
  error: null,
  permissionGranted: false,

  // Actions
  setLocation: (location) =>
    set({
      currentLocation: location,
      error: null,
    }),

  setRadius: (radius) =>
    set({
      radius,
    }),

  setPermissionGranted: (granted) =>
    set({
      permissionGranted: granted,
    }),

  locationError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  startLocationLoading: () =>
    set({
      isLoading: true,
    }),

  stopLocationLoading: () =>
    set({
      isLoading: false,
    }),

  clearError: () =>
    set({
      error: null,
    }),
}));

// Selector hooks
export const useCurrentLocation = () => useLocationStore((state) => state.currentLocation);
export const useLocationRadius = () => useLocationStore((state) => state.radius);
export const useLocationPermission = () => useLocationStore((state) => state.permissionGranted);
