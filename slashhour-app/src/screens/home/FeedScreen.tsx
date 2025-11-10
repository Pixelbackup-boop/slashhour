import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Deal } from '../../types/models';
import FeedDealCard from '../../components/FeedDealCard';
import DealCardSkeleton from '../../components/DealCardSkeleton';
import { useFeed } from '../../hooks/useFeed';
import { useDealNavigation } from '../../hooks/useDealNavigation';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/icons';
import { TYPOGRAPHY, SPACING, LAYOUT } from '../../theme';
import { STATIC_RADIUS } from '../../theme/constants';

export default function FeedScreen() {
  const { colors } = useTheme();
  const { deals, isLoading, error, isRefreshing, handleRefresh } = useFeed();
  const { navigateToDeal, navigateToBusinessFromDeal } = useDealNavigation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    header: {
      backgroundColor: colors.white,
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      ...TYPOGRAPHY.styles.h1,
      color: colors.textPrimary,
    },
    headerSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
    },
    listContent: {
      paddingHorizontal: SPACING.xs,
      paddingBottom: LAYOUT.tabBarHeight + SPACING.xxl,
    },
    cardWrapper: {
      marginBottom: SPACING.md,
    },
    leftCard: {
      marginRight: SPACING.xs,
      marginLeft: -SPACING.xs,
    },
    rightCard: {
      marginLeft: SPACING.xs,
      marginRight: -SPACING.xs,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xxl,
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
    },
    errorMessage: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.white,
      backgroundColor: colors.error,
      padding: SPACING.md,
      borderRadius: STATIC_RADIUS.md,
      textAlign: 'center',
      marginBottom: SPACING.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    emptyMessage: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    emptySubtext: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  // Memoize renderItem for FlashList (after styles is created)
  const renderDealItem = useCallback(
    ({ item, index }: { item: Deal; index: number }) => (
      <View
        style={[
          styles.cardWrapper,
          index % 2 === 0 ? styles.leftCard : styles.rightCard,
        ]}
      >
        <FeedDealCard
          deal={item}
          onPress={() => navigateToDeal(item)}
          onBusinessPress={() => navigateToBusinessFromDeal(item)}
        />
      </View>
    ),
    [navigateToDeal, navigateToBusinessFromDeal, styles]
  );

  // Memoize keyExtractor for FlashList
  const feedKeyExtractor = useCallback((item: Deal) => item.id, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <FlashList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(item) => `skeleton-${item}`}
          renderItem={() => <DealCardSkeleton />}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centerContainer}>
          <Icon name="face-frown" size={48} color={colors.textSecondary} style="line" />
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (deals.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centerContainer}>
          <Icon name="inbox" size={64} color={colors.textSecondary} style="line" />
          <Text style={styles.emptyMessage}>No deals yet!</Text>
          <Text style={styles.emptySubtext}>
            Follow some businesses to see their deals here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlashList
        data={deals}
        keyExtractor={feedKeyExtractor}
        renderItem={renderDealItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}
