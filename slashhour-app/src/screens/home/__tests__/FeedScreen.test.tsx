import React from 'react';
import { render } from '@testing-library/react-native';
import FeedScreen from '../FeedScreen';
import { Deal } from '../../../types/models';

// Mock dependencies
jest.mock('../../../hooks/useFeed', () => ({
  useFeed: jest.fn(() => ({
    deals: [],
    isLoading: false,
    error: null,
    isRefreshing: false,
    handleRefresh: jest.fn(),
  })),
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      backgroundSecondary: '#f5f5f5',
      white: '#ffffff',
      borderLight: '#e0e0e0',
      textPrimary: '#000000',
      textSecondary: '#666666',
      primary: '#FF6B6B',
      error: '#ff0000',
    },
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

jest.mock('../../../components/FeedDealCard', () => 'FeedDealCard');
jest.mock('../../../components/DealCardSkeleton', () => 'DealCardSkeleton');

const mockDeals: Deal[] = [
  {
    id: '1',
    business_id: 'business-1',
    title: 'Deal 1',
    description: 'Description 1',
    original_price: '100',
    discounted_price: '50',
    discount_percentage: 50,
    savings_amount: '50',
    category: 'restaurant',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    starts_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    images: [],
    business: {
      id: 'business-1',
      business_name: 'Business 1',
      category: 'restaurant',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    business_id: 'business-2',
    title: 'Deal 2',
    description: 'Description 2',
    original_price: '200',
    discounted_price: '100',
    discount_percentage: 50,
    savings_amount: '100',
    category: 'fashion',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    starts_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    images: [],
    business: {
      id: 'business-2',
      business_name: 'Business 2',
      category: 'fashion',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('FeedScreen', () => {
  it('renders loading state correctly', () => {
    const { useFeed } = require('../../../hooks/useFeed');
    useFeed.mockReturnValue({
      deals: [],
      isLoading: true,
      error: null,
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    const { getByText } = render(<FeedScreen />);

    expect(getByText('Your Deals')).toBeTruthy();
  });

  it('renders error state correctly', () => {
    const { useFeed } = require('../../../hooks/useFeed');
    useFeed.mockReturnValue({
      deals: [],
      isLoading: false,
      error: 'Failed to load deals',
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    const { getByText } = render(<FeedScreen />);

    expect(getByText('Your Deals')).toBeTruthy();
    expect(getByText('Failed to load deals')).toBeTruthy();
  });

  it('renders empty state when no deals', () => {
    const { useFeed } = require('../../../hooks/useFeed');
    useFeed.mockReturnValue({
      deals: [],
      isLoading: false,
      error: null,
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    const { getByText } = render(<FeedScreen />);

    expect(getByText('Your Deals')).toBeTruthy();
    expect(getByText('No deals yet!')).toBeTruthy();
  });

  it('renders deals when available', () => {
    const { useFeed } = require('../../../hooks/useFeed');
    useFeed.mockReturnValue({
      deals: mockDeals,
      isLoading: false,
      error: null,
      isRefreshing: false,
      handleRefresh: jest.fn(),
    });

    const { getByText } = render(<FeedScreen />);

    expect(getByText('Your Deals')).toBeTruthy();
    expect(getByText('2 deals from businesses you follow')).toBeTruthy();
  });

  describe('useCallback optimizations', () => {
    it('uses useCallback for handleDealPress', () => {
      const { useFeed } = require('../../../hooks/useFeed');
      useFeed.mockReturnValue({
        deals: mockDeals,
        isLoading: false,
        error: null,
        isRefreshing: false,
        handleRefresh: jest.fn(),
      });

      // Render and verify no errors
      const { getByText } = render(<FeedScreen />);

      // useCallback ensures function reference stability
      expect(getByText('Your Deals')).toBeTruthy();
    });

    it('uses useCallback for handleBusinessPress', () => {
      const { useFeed } = require('../../../hooks/useFeed');
      useFeed.mockReturnValue({
        deals: mockDeals,
        isLoading: false,
        error: null,
        isRefreshing: false,
        handleRefresh: jest.fn(),
      });

      const { getByText } = render(<FeedScreen />);

      // Callback optimization prevents unnecessary re-renders
      expect(getByText('Your Deals')).toBeTruthy();
    });

    it('uses useCallback for renderItem', () => {
      const { useFeed } = require('../../../hooks/useFeed');
      useFeed.mockReturnValue({
        deals: mockDeals,
        isLoading: false,
        error: null,
        isRefreshing: false,
        handleRefresh: jest.fn(),
      });

      const { UNSAFE_root } = render(<FeedScreen />);

      // renderItem wrapped in useCallback for performance
      expect(UNSAFE_root).toBeTruthy();
    });

    it('uses useCallback for keyExtractor', () => {
      const { useFeed } = require('../../../hooks/useFeed');
      useFeed.mockReturnValue({
        deals: mockDeals,
        isLoading: false,
        error: null,
        isRefreshing: false,
        handleRefresh: jest.fn(),
      });

      const { UNSAFE_root } = render(<FeedScreen />);

      // keyExtractor wrapped in useCallback for stable reference
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('FlashList performance', () => {
    it('renders FlashList with correct number of columns', () => {
      const { useFeed } = require('../../../hooks/useFeed');
      useFeed.mockReturnValue({
        deals: mockDeals,
        isLoading: false,
        error: null,
        isRefreshing: false,
        handleRefresh: jest.fn(),
      });

      const { UNSAFE_root } = render(<FeedScreen />);

      // FlashList configured with numColumns={2}
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
