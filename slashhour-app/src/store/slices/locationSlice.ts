import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Location } from '../../types/models';
import { DEFAULT_RADIUS } from '../../utils/constants';

interface LocationState {
  currentLocation: Location | null;
  radius: number;
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;
}

const initialState: LocationState = {
  currentLocation: null,
  radius: DEFAULT_RADIUS,
  isLoading: false,
  error: null,
  permissionGranted: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.error = null;
    },
    setRadius: (state, action: PayloadAction<number>) => {
      state.radius = action.payload;
    },
    setPermissionGranted: (state, action: PayloadAction<boolean>) => {
      state.permissionGranted = action.payload;
    },
    locationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    startLocationLoading: (state) => {
      state.isLoading = true;
    },
    stopLocationLoading: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  setLocation,
  setRadius,
  setPermissionGranted,
  locationError,
  startLocationLoading,
  stopLocationLoading,
} = locationSlice.actions;

export default locationSlice.reducer;
