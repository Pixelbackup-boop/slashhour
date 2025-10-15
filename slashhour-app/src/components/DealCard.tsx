import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Deal } from '../types/models';
import { getCategoryImage } from '../utils/categoryImages';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

interface DealCardProps {
  deal: Deal;
  onPress?: () => void;
  onBusinessPress?: () => void;
}

export default function DealCard({ deal, onPress, onBusinessPress }: DealCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

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
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={
          deal.images && deal.images.length > 0
            ? { uri: deal.images[0].url }
            : getCategoryImage(deal.category)
        }
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onBusinessPress?.()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Text style={styles.businessName}>{deal.business?.business_name}</Text>
        </TouchableOpacity>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{getDiscountText()}</Text>
        </View>
      </View>

      <Text style={styles.title}>{deal.title}</Text>

      {deal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {deal.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          {deal.original_price && (
            <Text style={styles.originalPrice}>${deal.original_price}</Text>
          )}
          {deal.discounted_price && (
            <Text style={styles.dealPrice}>${deal.discounted_price}</Text>
          )}
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.gray100,
  },
  header: {
    padding: SPACING.md,
    paddingBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  businessName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  discountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  discountText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  title: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
    marginRight: SPACING.sm,
  },
  dealPrice: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.secondary,
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
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  limitText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
