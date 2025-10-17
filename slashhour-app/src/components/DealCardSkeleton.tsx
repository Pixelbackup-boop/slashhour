import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';

export default function DealCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <Skeleton width="100%" height={150} borderRadius={0} />

      <View style={styles.content}>
        {/* Title skeleton */}
        <Skeleton width="80%" height={16} style={styles.title} />

        {/* Price row skeleton */}
        <View style={styles.priceRow}>
          <Skeleton width={60} height={14} />
          <Skeleton width={80} height={24} />
        </View>

        {/* Footer skeleton */}
        <View style={styles.footer}>
          <Skeleton width={80} height={24} borderRadius={RADIUS.md} />
          <Skeleton width={60} height={20} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  content: {
    padding: SPACING.sm,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
