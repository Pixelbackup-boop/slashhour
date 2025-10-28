import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { redemptionService } from '../services/api/redemptionService';
import { logError } from '../config/sentry';
import { trackDealViewed, trackDealRedeemed } from '../services/analytics';
import { Deal } from '../types/models';

interface DealSavings {
  savings: string;
  percentage: number;
}

interface UseDealDetailReturn {
  timeRemaining: string;
  isRedeeming: boolean;
  showRedemptionModal: boolean;
  redemptionCode: string;
  savings: DealSavings;
  handleRedeem: () => void;
  closeRedemptionModal: () => void;
}

export const useDealDetail = (deal: Deal | undefined): UseDealDetailReturn => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');

  // Calculate savings and discount percentage
  const calculateSavings = useCallback((): DealSavings => {
    if (!deal) {
      return { savings: '0', percentage: 0 };
    }
    const original = Number(deal.original_price) || 0;
    const discounted = Number(deal.discounted_price) || 0;
    const savingsAmount = original - discounted;
    const percentage = original > 0 ? (savingsAmount / original) * 100 : 0;
    return {
      savings: savingsAmount.toFixed(2),
      percentage: Math.round(percentage),
    };
  }, [deal?.original_price, deal?.discounted_price]);

  const savings = calculateSavings();

  // Calculate time remaining until deal expires
  const calculateTimeRemaining = useCallback(() => {
    if (!deal) {
      return '';
    }
    const now = new Date();
    const expires = new Date(deal.expires_at);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Expired';
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'} ${hours}h`;
    } else {
      return `${hours}h`;
    }
  }, [deal?.expires_at]);

  // Handle deal redemption
  const handleRedeem = useCallback(async () => {
    if (!deal) {
      return;
    }
    try {
      setIsRedeeming(true);
      const response = await redemptionService.redeemDeal(deal.id);
      setRedemptionCode(response.redemptionCode);
      setShowRedemptionModal(true);

      // Track successful redemption
      trackDealRedeemed(
        deal.id,
        deal.business?.id || '',
        parseFloat(savings.savings),
        deal.category
      );
    } catch (error: any) {
      console.error('Failed to redeem deal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to redeem deal';
      Alert.alert('Redemption Failed', errorMessage);
      logError(error, {
        context: 'useDealDetail',
        dealId: deal.id,
        businessId: deal.business?.id
      });
    } finally {
      setIsRedeeming(false);
    }
  }, [deal?.id, deal?.business?.id, deal?.category, savings.savings]);

  const closeRedemptionModal = useCallback(() => {
    setShowRedemptionModal(false);
  }, []);

  // Track deal viewed on mount
  useEffect(() => {
    if (!deal) {
      return;
    }
    trackDealViewed(deal.id, deal.business?.id || '', deal.category);
  }, [deal?.id, deal?.business?.id, deal?.category]);

  // Update countdown timer
  useEffect(() => {
    // Update countdown immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update countdown every hour
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 3600000); // Update every hour (3600000ms = 1 hour)

    return () => clearInterval(interval);
  }, [calculateTimeRemaining]);

  return {
    timeRemaining,
    isRedeeming,
    showRedemptionModal,
    redemptionCode,
    savings,
    handleRedeem,
    closeRedemptionModal,
  };
};
