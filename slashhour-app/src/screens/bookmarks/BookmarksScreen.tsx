import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookmarksList } from '../../hooks/useBookmarksList';
import { trackScreenView } from '../../services/analytics';
import FeedDealCard from '../../components/FeedDealCard';
import { Icon } from '../../components/icons';
import { Deal } from '../../types/models';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, LAYOUT } from '../../theme';

export default function BookmarksScreen({ navigation }: any) {
  const {
    bookmarks,
    isLoading,
    isRefreshing,
    error,
    total,
    hasMore,
    fetchNextPage,
    refresh,
  } = useBookmarksList();

  useEffect(() => {
    trackScreenView('BookmarksScreen');
  }, []);

  const handleDealPress = (deal: Deal) => {
    // Only deleted and expired deals navigate to shop profile
    // Sold out deals still go to deal details (user can view but not redeem)
    const status = deal.status?.toLowerCase();
    const isDeleted = status === 'deleted';
    const isExpired = status === 'expired';

    if ((isDeleted || isExpired) && deal.business_id) {
      navigation.navigate('BusinessProfile', {
        businessId: deal.business_id,
        businessName: deal.business?.business_name || 'Shop',
      });
    } else {
      // Active and sold_out deals go to deal details
      navigation.navigate('DealDetails', { dealId: deal.id });
    }
  };

  const handleBusinessPress = (businessId: string, businessName: string) => {
    navigation.navigate('BusinessProfile', { businessId, businessName });
  };

  const renderDealItem = ({ item }: { item: Deal }) => (
    <View style={styles.dealCardWrapper}>
      <FeedDealCard
        deal={item}
        onPress={() => handleDealPress(item)}
        onBusinessPress={() => handleBusinessPress(item.business_id, item.business?.business_name || '')}
        isWishlisted={true}
        showDistance={false}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading && bookmarks.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyStateText}>Loading your saved deals...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Icon name="alert" size={64} color={COLORS.error} style="line" />
          <Text style={styles.emptyStateTitle}>Error Loading</Text>
          <Text style={styles.emptyStateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Icon name="heart" size={64} color={COLORS.gray400} style="line" />
        <Text style={styles.emptyStateTitle}>No Saved Deals</Text>
        <Text style={styles.emptyStateText}>
          Tap the heart icon on any deal to save it for later
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Deals</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || bookmarks.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Deals</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Deals List */}
      <FlatList
        data={bookmarks}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderDealItem}
        contentContainerStyle={
          bookmarks.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (hasMore && !isLoading) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Stats Footer */}
      {bookmarks.length > 0 && (
        <View style={styles.statsFooter}>
          <Text style={styles.statsText}>
            {total} {total === 1 ? 'deal' : 'deals'} saved
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: LAYOUT.tabBarHeight + SPACING.lg,
  },
  emptyListContent: {
    flex: 1,
  },
  dealCardWrapper: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  statsFooter: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'center',
  },
  statsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
