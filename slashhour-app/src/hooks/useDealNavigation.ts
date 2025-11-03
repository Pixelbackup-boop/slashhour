import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Deal, Business } from '../types/models';

/**
 * Custom hook for handling navigation to deal and business screens
 *
 * Centralizes navigation logic to avoid duplication across screens
 * Used in: FeedScreen, SearchScreen, NearYouScreen, etc.
 *
 * @example
 * ```tsx
 * const { navigateToDeal, navigateToBusinessFromDeal } = useDealNavigation();
 *
 * <FeedDealCard
 *   deal={deal}
 *   onPress={() => navigateToDeal(deal)}
 *   onBusinessPress={() => navigateToBusinessFromDeal(deal)}
 * />
 * ```
 */
export const useDealNavigation = () => {
  const navigation = useNavigation<any>();

  /**
   * Navigate to deal detail screen
   * @param deal - The deal object to display
   */
  const navigateToDeal = useCallback((deal: Deal) => {
    navigation.navigate('DealDetail', { deal });
  }, [navigation]);

  /**
   * Navigate to business profile screen
   * @param businessId - The business ID
   * @param businessName - The business name (for display)
   */
  const navigateToBusiness = useCallback((businessId: string, businessName: string) => {
    navigation.navigate('BusinessProfile', {
      businessId,
      businessName,
    });
  }, [navigation]);

  /**
   * Navigate to business profile from a deal object
   * Extracts business info from deal and navigates
   * @param deal - The deal object containing business info
   */
  const navigateToBusinessFromDeal = useCallback((deal: Deal) => {
    if (deal.business?.id) {
      navigateToBusiness(deal.business.id, deal.business.business_name);
    }
  }, [navigateToBusiness]);

  /**
   * Navigate to business profile from a business object
   * @param business - The business object
   */
  const navigateToBusinessFromObject = useCallback((business: Business) => {
    navigateToBusiness(business.id, business.business_name);
  }, [navigateToBusiness]);

  return {
    navigateToDeal,
    navigateToBusiness,
    navigateToBusinessFromDeal,
    navigateToBusinessFromObject,
  };
};
