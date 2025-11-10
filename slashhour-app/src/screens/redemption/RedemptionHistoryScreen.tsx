import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRedemptionHistory } from '../../hooks/useRedemptionHistory';
import RedemptionCard from '../../components/RedemptionCard';
import { trackScreenView } from '../../services/analytics';
import { Icon } from '../../components/icons';

export default function RedemptionHistoryScreen({ navigation }: any) {
  const {
    redemptions,
    isLoading,
    error,
    hasMore,
    totalRedemptions,
    loadMore,
    refresh,
    isRefreshing,
  } = useRedemptionHistory();

  useEffect(() => {
    trackScreenView('RedemptionHistoryScreen');
  }, []);

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.subtitle}>
        {totalRedemptions === 0
          ? 'No redemptions yet'
          : totalRedemptions === 1
          ? '1 redemption'
          : `${totalRedemptions} redemptions`}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF6B6B" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <Icon name="award" size={64} color={COLORS.textSecondary} style="line" />
        <Text style={styles.emptyTitle}>No Redemptions Yet</Text>
        <Text style={styles.emptyText}>
          Start exploring deals and redeem your first offer to see it here!
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.exploreButtonText}>Explore Deals</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderError = () => {
    if (!error || isLoading) return null;

    return (
      <View style={styles.errorState}>
        <Icon name="alert" size={64} color="#F38181" style="line" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && redemptions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redemption History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading your redemptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redemption History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Error State */}
      {error && redemptions.length === 0 ? (
        renderError()
      ) : (
        <FlatList
          data={redemptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RedemptionCard
              redemption={item}
              onPress={() => {
                // Navigate to deal detail screen
                if (item.deal) {
                  navigation.navigate('DealDetail', { dealId: item.deal.id });
                }
              }}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={[
            styles.listContent,
            redemptions.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={['#FF6B6B']}
              tintColor="#FF6B6B"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  headerSection: {
    padding: 16,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F38181',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
