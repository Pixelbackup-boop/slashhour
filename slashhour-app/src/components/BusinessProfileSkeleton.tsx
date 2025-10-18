import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { COLORS, SPACING, RADIUS } from '../theme';

export default function BusinessProfileSkeleton() {
  return (
    <View style={styles.container}>
      {/* Cover Image skeleton */}
      <Skeleton width="100%" height={200} borderRadius={0} />

      {/* Profile content */}
      <View style={styles.content}>
        {/* Profile info row */}
        <View style={styles.profileRow}>
          {/* Logo skeleton */}
          <Skeleton width={80} height={80} borderRadius={RADIUS.round} />

          {/* Stats skeleton */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Skeleton width={40} height={24} />
              <Skeleton width={60} height={14} style={{ marginTop: SPACING.xs }} />
            </View>
            <View style={styles.statItem}>
              <Skeleton width={40} height={24} />
              <Skeleton width={60} height={14} style={{ marginTop: SPACING.xs }} />
            </View>
            <View style={styles.statItem}>
              <Skeleton width={40} height={24} />
              <Skeleton width={60} height={14} style={{ marginTop: SPACING.xs }} />
            </View>
          </View>
        </View>

        {/* Business name skeleton */}
        <Skeleton width="60%" height={24} style={{ marginTop: SPACING.md }} />

        {/* Category skeleton */}
        <Skeleton width="40%" height={14} style={{ marginTop: SPACING.xs }} />

        {/* Description skeleton */}
        <View style={{ marginTop: SPACING.md }}>
          <Skeleton width="100%" height={14} style={{ marginBottom: SPACING.xs }} />
          <Skeleton width="90%" height={14} style={{ marginBottom: SPACING.xs }} />
          <Skeleton width="70%" height={14} />
        </View>

        {/* Action buttons skeleton */}
        <View style={styles.actions}>
          <Skeleton width="48%" height={44} borderRadius={RADIUS.lg} />
          <Skeleton width="48%" height={44} borderRadius={RADIUS.lg} />
        </View>

        {/* Tabs skeleton */}
        <View style={styles.tabs}>
          <Skeleton width={80} height={36} borderRadius={RADIUS.md} />
          <Skeleton width={80} height={36} borderRadius={RADIUS.md} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.lg,
    marginTop: -40,
  },
  stats: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    paddingTop: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
});
