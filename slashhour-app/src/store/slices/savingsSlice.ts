import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SavingsTracker } from '../../types/models';

interface SavingsState {
  totalSavings: number;
  monthlySavings: { [key: string]: number };
  categoryBreakdown: { [key: string]: number };
  savingsHistory: SavingsTracker[];
  inflationRate: number;
  inflationBeaten: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: SavingsState = {
  totalSavings: 0,
  monthlySavings: {},
  categoryBreakdown: {},
  savingsHistory: [],
  inflationRate: 7.5,
  inflationBeaten: 0,
  isLoading: false,
  error: null,
};

const savingsSlice = createSlice({
  name: 'savings',
  initialState,
  reducers: {
    fetchSavingsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSavingsSuccess: (
      state,
      action: PayloadAction<{
        totalSavings: number;
        monthlySavings: { [key: string]: number };
        categoryBreakdown: { [key: string]: number };
        savingsHistory: SavingsTracker[];
      }>
    ) => {
      state.totalSavings = action.payload.totalSavings;
      state.monthlySavings = action.payload.monthlySavings;
      state.categoryBreakdown = action.payload.categoryBreakdown;
      state.savingsHistory = action.payload.savingsHistory;
      state.isLoading = false;
    },
    fetchSavingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addSavings: (state, action: PayloadAction<number>) => {
      state.totalSavings += action.payload;
    },
    setInflationRate: (state, action: PayloadAction<number>) => {
      state.inflationRate = action.payload;
    },
    calculateInflationBeaten: (state) => {
      // Calculate how much user beat inflation
      // This is a simplified calculation
      state.inflationBeaten = (state.totalSavings / state.inflationRate) * 100;
    },
  },
});

export const {
  fetchSavingsStart,
  fetchSavingsSuccess,
  fetchSavingsFailure,
  addSavings,
  setInflationRate,
  calculateInflationBeaten,
} = savingsSlice.actions;

export default savingsSlice.reducer;
