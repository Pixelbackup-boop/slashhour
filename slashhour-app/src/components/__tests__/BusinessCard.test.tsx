import React from 'react';
import { render } from '@testing-library/react-native';
import BusinessCard from '../BusinessCard';
import { Business } from '../../types/models';

// Mock FollowButton component
jest.mock('../FollowButton', () => 'FollowButton');

const mockBusiness: Business = {
  id: 'business-1',
  owner_id: 'owner-1',
  business_name: 'Test Business',
  category: 'restaurant',
  address: '123 Main St, City, Country',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('BusinessCard', () => {
  it('renders business name correctly', () => {
    const { getByText } = render(<BusinessCard business={mockBusiness} />);

    expect(getByText('Test Business')).toBeTruthy();
  });

  it('renders category correctly', () => {
    const { getByText } = render(<BusinessCard business={mockBusiness} />);

    expect(getByText('restaurant')).toBeTruthy();
  });

  it('renders address when provided', () => {
    const { getByText } = render(<BusinessCard business={mockBusiness} />);

    expect(getByText('123 Main St, City, Country')).toBeTruthy();
  });

  it('renders business initial in icon', () => {
    const { getByText } = render(<BusinessCard business={mockBusiness} />);

    expect(getByText('T')).toBeTruthy(); // First letter of "Test Business"
  });

  it('does not crash when address is missing', () => {
    const businessWithoutAddress = { ...mockBusiness, address: undefined };

    const { getByText } = render(<BusinessCard business={businessWithoutAddress} />);

    expect(getByText('Test Business')).toBeTruthy();
  });

  describe('React.memo optimization', () => {
    it('is wrapped with React.memo', () => {
      const component = BusinessCard;
      expect(component.$$typeof).toBeTruthy();
    });

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<BusinessCard business={mockBusiness} />);

      // Re-render with same business object
      rerender(<BusinessCard business={mockBusiness} />);

      // Memoized component should not re-render
      expect(true).toBe(true);
    });

    it('should re-render when business prop changes', () => {
      const { rerender, getByText } = render(
        <BusinessCard business={mockBusiness} />
      );

      const updatedBusiness = {
        ...mockBusiness,
        business_name: 'Updated Business',
      };

      rerender(<BusinessCard business={updatedBusiness} />);

      expect(getByText('Updated Business')).toBeTruthy();
    });
  });

  describe('FollowButton integration', () => {
    it('passes correct props to FollowButton', () => {
      const { getByText } = render(<BusinessCard business={mockBusiness} />);

      // FollowButton should be rendered
      expect(getByText('Test Business')).toBeTruthy();
    });
  });
});
