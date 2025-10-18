import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Deal } from '../../types/models';
import FeedDealCard from '../../components/FeedDealCard';
import DealCardSkeleton from '../../components/DealCardSkeleton';
import { useFeed } from '../../hooks/useFeed';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT } from '../../theme';
import { STATIC_RADIUS } from '../../theme/constants';

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const { deals, isLoading, error, isRefreshing, handleRefresh } = useFeed();

  const handleDealPress = (deal: Deal) => {
    navigation.navigate('DealDetail', { deal });
  };

  const handleBusinessPress = (deal: Deal) => {
    if (deal.business?.id) {
      navigation.navigate('BusinessProfile', {
        businessId: deal.business.id,
        businessName: deal.business.business_name,
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Deals</Text>
        </View>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Deals</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>😕</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (deals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Deals</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📭</Text>
          <Text style={styles.emptyMessage}>No deals yet!</Text>
          <Text style={styles.emptySubtext}>
            Follow some businesses to see their deals here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Deals</Text>
        <Text style={styles.headerSubtitle}>
          {deals.length} deal{deals.length !== 1 ? 's' : ''} from businesses you follow
        </Text>
      </View>
      <FlashList
        data={deals}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[
            styles.cardWrapper,
            index % 2 === 0 ? styles.leftCard : styles.rightCard
          ]}>
            <FeedDealCard
              deal={item}
              onPress={() => handleDealPress(item)}
              onBusinessPress={() => handleBusinessPress(item)}
            />
          </View>
        )}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContent: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.md,
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
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: STATIC_RADIUS.md,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyMessage: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
