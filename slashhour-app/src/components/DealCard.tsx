import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Deal } from '../types/models';
import { getCategoryImage } from '../utils/categoryImages';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import ImageCarousel from './ImageCarousel';
import { haptics } from '../utils/haptics';

interface DealCardProps {
  deal: Deal;
  onPress?: () => void;
  onBusinessPress?: () => void;
}

export default React.memo(function DealCard({ deal, onPress, onBusinessPress }: DealCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  // Animation values
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(scale.value, {
            damping: 15,
            stiffness: 150,
          })
        }
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.95;
    pressed.value = withTiming(1, { duration: 150 });
    haptics.light(); // Tactile feedback on press
  };

  const handlePressOut = () => {
    scale.value = 1;
    pressed.value = withTiming(0, { duration: 150 });
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
    }, 3600000); // Update every hour (3600000ms = 1 hour)

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
    const { percentage, savings } = calculateDiscount();
    if (percentage > 0) {
      return `${percentage}% OFF`;
    }
    if (savings > '0') {
      return `$${savings} OFF`;
    }
    return 'SPECIAL DEAL';
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={[styles.card, animatedStyle]}
    >
      <Animated.View
        style={styles.pressableContent}
        onTouchStart={handlePressIn}
        onTouchEnd={() => {
          handlePressOut();
          onPress?.();
        }}
      >
        <View style={styles.imageContainer}>
        <ImageCarousel
          images={deal.images || []}
          height={150}
          width={undefined}
          borderRadius={0}
          showPagination={true}
          fallbackImage={getCategoryImage(deal.category)}
        />
      </View>

      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{deal.title}</Text>

      <View style={styles.priceRow}>
        {deal.original_price && (
          <Text style={styles.originalPrice}>${deal.original_price}</Text>
        )}
        {deal.discounted_price && (
          <Text style={styles.dealPrice}>${deal.discounted_price}</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{getDiscountText()}</Text>
        </View>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownIcon}>⏰</Text>
          <Text style={styles.countdownText}>{timeRemaining}</Text>
        </View>
      </View>

        {deal.quantity_available && (
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>
              Limited: {deal.quantity_redeemed || 0}/{deal.quantity_available}
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  pressableContent: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  dealPrice: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  discountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  discountText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownIcon: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginRight: SPACING.xs,
  },
  countdownText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  limitBadge: {
    paddingTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  limitText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
