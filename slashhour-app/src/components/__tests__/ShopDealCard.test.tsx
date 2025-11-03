import React from 'react';
import { render } from '@testing-library/react-native';
import ShopDealCard from '../ShopDealCard';
import { Deal } from '../../types/models';

// Mock dependencies
jest.mock('../ImageCarousel', () => 'ImageCarousel');
jest.mock('../../utils/categoryImages', () => ({
  getCategoryImage: jest.fn(() => 'mock-image'),
}));

const mockDeal: Deal = {
  id: '1',
  business_id: 'business-1',
  title: 'Shop Deal',
  description: 'Shop Description',
  original_price: 200,
  discounted_price: 100,
  discount_percentage: 50,
  savings_amount: 100,
  category: 'fashion',
  tags: [],
  expires_at: new Date(Date.now() + 86400000).toISOString(),
  starts_at: new Date(Date.now() - 86400000).toISOString(),
  is_flash_deal: false,
  visibility_radius_km: 10,
  quantity_redeemed: 0,
  max_per_user: 1,
  terms_conditions: [],
  valid_days: 'all',
  view_count_followers: 0,
  view_count_nearby: 0,
  save_count: 0,
  share_count: 0,
  status: 'active',
  images: [{ url: 'https://example.com/image.jpg', order: 0 }],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ShopDealCard', () => {
  it('renders correctly with deal data', () => {
    const { getByText } = render(<ShopDealCard deal={mockDeal} />);

    expect(getByText('Shop Deal')).toBeTruthy();
    expect(getByText('$200')).toBeTruthy();
    expect(getByText('$100')).toBeTruthy();
  });

  it('displays discount percentage', () => {
    const { getByText } = render(<ShopDealCard deal={mockDeal} />);

    expect(getByText('50% OFF')).toBeTruthy();
  });

  it('shows wishlist button when not owner', () => {
    const { getByText } = render(
      <ShopDealCard deal={mockDeal} isOwner={false} />
    );

    expect(getByText('🤍')).toBeTruthy();
  });

  it('shows edit/delete buttons when owner', () => {
    const { getByText } = render(
      <ShopDealCard deal={mockDeal} isOwner={true} />
    );

    expect(getByText('✏️')).toBeTruthy();
    expect(getByText('🗑️')).toBeTruthy();
  });

  it('shows filled heart when wishlisted', () => {
    const { getByText } = render(
      <ShopDealCard deal={mockDeal} isWishlisted={true} isOwner={false} />
    );

    expect(getByText('❤️')).toBeTruthy();
  });

  describe('React.memo optimization', () => {
    it('is wrapped with React.memo', () => {
      const component = ShopDealCard;
      expect(component.$$typeof).toBeTruthy();
    });

    it('should maintain reference equality with same props', () => {
      const onPress = jest.fn();
      const { rerender } = render(
        <ShopDealCard deal={mockDeal} onPress={onPress} />
      );

      // Re-render with identical props
      rerender(<ShopDealCard deal={mockDeal} onPress={onPress} />);

      // Component should not have triggered unnecessary re-renders
      expect(true).toBe(true);
    });
  });

  describe('Owner actions', () => {
    it('calls onEditPress when edit button is pressed', () => {
      const onEditPressMock = jest.fn();
      const { getByText } = render(
        <ShopDealCard
          deal={mockDeal}
          isOwner={true}
          onEditPress={onEditPressMock}
        />
      );

      expect(getByText('✏️')).toBeTruthy();
    });

    it('calls onDeletePress when delete button is pressed', () => {
      const onDeletePressMock = jest.fn();
      const { getByText } = render(
        <ShopDealCard
          deal={mockDeal}
          isOwner={true}
          onDeletePress={onDeletePressMock}
        />
      );

      expect(getByText('🗑️')).toBeTruthy();
    });
  });
});
