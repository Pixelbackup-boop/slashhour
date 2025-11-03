import { renderHook, act } from '@testing-library/react-native';
import { useDealNavigation } from '../useDealNavigation';
import { Deal, Business } from '../../types/models';

// Mock useNavigation from React Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('useDealNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('navigateToDeal', () => {
    it('should navigate to DealDetail screen with deal object', () => {
      const { result } = renderHook(() => useDealNavigation());
      const mockDeal = {
        id: 'deal-123',
        title: 'Test Deal',
      } as Deal;

      act(() => {
        result.current.navigateToDeal(mockDeal);
      });

      expect(mockNavigate).toHaveBeenCalledWith('DealDetail', { deal: mockDeal });
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should handle deals with all properties', () => {
      const { result } = renderHook(() => useDealNavigation());
      const completeDeal = {
        id: 'deal-456',
        title: 'Complete Deal',
        description: 'Full description',
        original_price: 100,
        discounted_price: 50,
        business: {
          id: 'business-789',
          business_name: 'Test Business',
        },
      } as unknown as Deal;

      act(() => {
        result.current.navigateToDeal(completeDeal);
      });

      expect(mockNavigate).toHaveBeenCalledWith('DealDetail', { deal: completeDeal });
    });
  });

  describe('navigateToBusiness', () => {
    it('should navigate to BusinessProfile with businessId and businessName', () => {
      const { result } = renderHook(() => useDealNavigation());

      act(() => {
        result.current.navigateToBusiness('business-123', 'Test Business');
      });

      expect(mockNavigate).toHaveBeenCalledWith('BusinessProfile', {
        businessId: 'business-123',
        businessName: 'Test Business',
      });
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should handle empty business name', () => {
      const { result } = renderHook(() => useDealNavigation());

      act(() => {
        result.current.navigateToBusiness('business-456', '');
      });

      expect(mockNavigate).toHaveBeenCalledWith('BusinessProfile', {
        businessId: 'business-456',
        businessName: '',
      });
    });
  });

  describe('navigateToBusinessFromDeal', () => {
    it('should navigate to business when deal has business data', () => {
      const { result } = renderHook(() => useDealNavigation());
      const dealWithBusiness = {
        id: 'deal-789',
        title: 'Deal with Business',
        business: {
          id: 'business-123',
          business_name: 'Associated Business',
        },
      } as Deal;

      act(() => {
        result.current.navigateToBusinessFromDeal(dealWithBusiness);
      });

      expect(mockNavigate).toHaveBeenCalledWith('BusinessProfile', {
        businessId: 'business-123',
        businessName: 'Associated Business',
      });
    });

    it('should not navigate when deal has no business data', () => {
      const { result } = renderHook(() => useDealNavigation());
      const dealWithoutBusiness = {
        id: 'deal-no-business',
        title: 'Deal Without Business',
        business: undefined,
      } as Deal;

      act(() => {
        result.current.navigateToBusinessFromDeal(dealWithoutBusiness);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate when deal has business without id', () => {
      const { result } = renderHook(() => useDealNavigation());
      const dealWithIncompleteBusiness = {
        id: 'deal-incomplete',
        title: 'Deal with Incomplete Business',
        business: {
          id: undefined,
          business_name: 'Business Name',
        },
      } as unknown as Deal;

      act(() => {
        result.current.navigateToBusinessFromDeal(dealWithIncompleteBusiness);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate when business object is null', () => {
      const { result } = renderHook(() => useDealNavigation());
      const dealWithNullBusiness = {
        id: 'deal-null',
        title: 'Deal With Null Business',
        business: null,
      } as unknown as Deal;

      act(() => {
        result.current.navigateToBusinessFromDeal(dealWithNullBusiness);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('navigateToBusinessFromObject', () => {
    it('should navigate to business profile from business object', () => {
      const { result } = renderHook(() => useDealNavigation());
      const businessObject = {
        id: 'business-999',
        business_name: 'Direct Business Navigation',
      } as Business;

      act(() => {
        result.current.navigateToBusinessFromObject(businessObject);
      });

      expect(mockNavigate).toHaveBeenCalledWith('BusinessProfile', {
        businessId: 'business-999',
        businessName: 'Direct Business Navigation',
      });
    });

    it('should handle business with all properties', () => {
      const { result } = renderHook(() => useDealNavigation());
      const completeBusiness = {
        id: 'business-complete',
        business_name: 'Complete Business',
        slug: 'complete-business',
        category: 'restaurant',
        location: { lat: 40.7128, lng: -74.006 },
      } as unknown as Business;

      act(() => {
        result.current.navigateToBusinessFromObject(completeBusiness);
      });

      expect(mockNavigate).toHaveBeenCalledWith('BusinessProfile', {
        businessId: 'business-complete',
        businessName: 'Complete Business',
      });
    });
  });

  describe('hook stability', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useDealNavigation());

      const firstRender = {
        navigateToDeal: result.current.navigateToDeal,
        navigateToBusiness: result.current.navigateToBusiness,
        navigateToBusinessFromDeal: result.current.navigateToBusinessFromDeal,
        navigateToBusinessFromObject: result.current.navigateToBusinessFromObject,
      };

      rerender({});

      expect(result.current.navigateToDeal).toBe(firstRender.navigateToDeal);
      expect(result.current.navigateToBusiness).toBe(firstRender.navigateToBusiness);
      expect(result.current.navigateToBusinessFromDeal).toBe(firstRender.navigateToBusinessFromDeal);
      expect(result.current.navigateToBusinessFromObject).toBe(firstRender.navigateToBusinessFromObject);
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple sequential navigations', () => {
      const { result } = renderHook(() => useDealNavigation());
      const deal1 = { id: 'deal-1', title: 'First Deal' } as Deal;
      const deal2 = { id: 'deal-2', title: 'Second Deal' } as Deal;

      act(() => {
        result.current.navigateToDeal(deal1);
        result.current.navigateToDeal(deal2);
      });

      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, 'DealDetail', { deal: deal1 });
      expect(mockNavigate).toHaveBeenNthCalledWith(2, 'DealDetail', { deal: deal2 });
    });

    it('should handle navigation from deal to business', () => {
      const { result } = renderHook(() => useDealNavigation());
      const deal = {
        id: 'deal-with-biz',
        title: 'Deal',
        business: {
          id: 'business-xyz',
          business_name: 'Business XYZ',
        },
      } as Deal;

      act(() => {
        result.current.navigateToDeal(deal);
        result.current.navigateToBusinessFromDeal(deal);
      });

      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, 'DealDetail', { deal });
      expect(mockNavigate).toHaveBeenNthCalledWith(2, 'BusinessProfile', {
        businessId: 'business-xyz',
        businessName: 'Business XYZ',
      });
    });
  });
});
