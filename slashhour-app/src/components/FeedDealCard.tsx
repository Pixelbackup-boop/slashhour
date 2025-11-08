import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Deal } from '../types/models';
import { getCategoryImage } from '../utils/categoryImages';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { STATIC_RADIUS } from '../theme/constants';
import ImageCarousel from './ImageCarousel';
import { haptics } from '../utils/haptics';
import { useBookmark } from '../hooks/useBookmarks';

interface FeedDealCardProps {
  deal: Deal;
  onPress?: () => void;
  onBusinessPress?: () => void;
  onWishlistPress?: () => void;
  isWishlisted?: boolean;
  showDistance?: boolean;  // Show distance badge (default: true)
}

export default React.memo(function FeedDealCard({
  deal,
  onPress,
  onBusinessPress,
  onWishlistPress,
  isWishlisted = false,
  showDistance = true,
}: FeedDealCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  // Bookmark state management
  const { isBookmarked, toggleBookmark, isProcessing, setIsBookmarked } = useBookmark(deal.id, isWishlisted);

  // Sync bookmark state from props when they change
  useEffect(() => {
    const bookmarkStatus = deal.isBookmarked || deal.isWishlisted || isWishlisted || false;
    setIsBookmarked(bookmarkStatus);
  }, [deal.id, deal.isBookmarked, deal.isWishlisted, isWishlisted]);

  // Animation values
  const scale = useSharedValue(1);

  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(scale.value, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.97;
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  const handleWishlistPress = async () => {
    haptics.medium();

    if (onWishlistPress) {
      // Use custom handler if provided (for backward compatibility)
      onWishlistPress();
    } else {
      // Use built-in bookmark functionality
      try {
        await toggleBookmark();
      } catch (error: any) {
        // Only log non-409 errors (409s are handled gracefully by useBookmark)
        const statusCode = error.response?.status;
        if (statusCode !== 409) {
          console.error('Failed to toggle bookmark:', error);
        }
      }
    }
  };

  const handleBusinessPress = () => {
    haptics.light();
    onBusinessPress?.();
  };

  const calculateTimeRemaining = () => {
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
      return `${days}d ${hours}h`;
    } else {
      return `${hours}h`;
    }
  };

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, [deal.expires_at]);

  const calculateDiscount = () => {
    const original = Number(deal.original_price) || 0;
    const discounted = Number(deal.discounted_price) || 0;
    const savings = original - discounted;
    const percentage = original > 0 ? (savings / original) * 100 : 0;
    return {
      savings: savings.toFixed(2),
      percentage: Math.round(percentage),
    };
  };

  const getDiscountText = () => {
    const { percentage } = calculateDiscount();
    if (percentage > 0) {
      return `${percentage}% OFF`;
    }
    return 'DEAL';
  };

  // Helper to get deal status info
  const getStatusInfo = () => {
    const status = deal.status?.toLowerCase();

    // Check if deal is deleted
    if (status === 'deleted') {
      return { badge: '🚫 Deleted', isInactive: true, color: '#757575' };
    }

    // Check if deal is expired (by status OR by expiration time)
    const now = new Date();
    const expires = new Date(deal.expires_at);
    const isExpiredByTime = expires.getTime() - now.getTime() <= 0;

    if (status === 'expired' || isExpiredByTime) {
      return { badge: '⏰ Expired', isInactive: true, color: '#FF9800' };
    }

    // Check if deal is sold out
    if (status === 'sold_out') {
      return { badge: '📦 Sold Out', isInactive: true, color: '#9C27B0' };
    }

    return { badge: null, isInactive: false, color: null };
  };

  const statusInfo = getStatusInfo();

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={[styles.card, animatedStyle]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <ImageCarousel
            images={deal.images || []}
            borderRadius={0}
            showPagination={true}
            fallbackImage={getCategoryImage(deal.category)}
          />

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={handleWishlistPress}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <Text style={styles.wishlistIcon}>{isBookmarked ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>

          {/* Distance Badge - Only show if distance exists and showDistance is true */}
          {showDistance && ((deal as any).distance != null || deal.distance_km != null) && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                📍 {(((deal as any).distance ?? deal.distance_km) as number).toFixed(1)} km away
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Title */}
          <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">
            {deal.title}
          </Text>

          {/* Shop Name - ONLY DIFFERENCE from ShopDealCard */}
          {deal.business && (
            <TouchableOpacity
              style={styles.shopNameContainer}
              onPress={handleBusinessPress}
              activeOpacity={0.7}
            >
              <Text style={styles.shopName} numberOfLines={1}>
                {deal.business.business_name}
              </Text>
            </TouchableOpacity>
          )}

          {/* Price Section */}
          <View style={styles.priceSection}>
            {deal.original_price && (
              <Text style={styles.originalPrice}>${deal.original_price}</Text>
            )}
            {deal.discounted_price && (
              <Text style={styles.discountedPrice}>${deal.discounted_price}</Text>
            )}
          </View>

          {/* Discount Badge and Timer / Status Badge */}
          <View style={styles.discountRow}>
            {statusInfo.isInactive ? (
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusText}>{statusInfo.badge}</Text>
              </View>
            ) : (
              <>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{getDiscountText()}</Text>
                </View>
                <View style={styles.timer}>
                  <Text style={styles.timerIcon}>⏰</Text>
                  <Text style={styles.timerText}>{timeRemaining}</Text>
                </View>
              </>
            )}</View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 0,
    width: '100%', // Fill wrapper width
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Square image container for consistent card height
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  wishlistIcon: {
    fontSize: 18,
  },
  productInfo: {
    padding: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 18,
    marginBottom: 2,
  },
  shopNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
  },
  shopName: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '400',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00BFA5',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  discountBadge: {
    backgroundColor: '#ff5252',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#ff5252',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerIcon: {
    fontSize: 16,
  },
  timerText: {
    fontSize: 12,
    color: '#ff5252',
    fontWeight: '500',
  },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: `${COLORS.secondary}E6`, // 90% opacity
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: STATIC_RADIUS.md,
  },
  distanceText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
