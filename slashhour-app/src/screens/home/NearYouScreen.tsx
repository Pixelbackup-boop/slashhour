import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Deal } from '../../types/models';
import FeedDealCard from '../../components/FeedDealCard';
import { useNearbyDeals } from '../../hooks/useNearbyDeals';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, LAYOUT } from '../../theme';

export default function NearYouScreen() {
  const navigation = useNavigation<any>();
  const {
    deals,
    isLoading,
    error,
    radius,
    isRefreshing,
    setRadius,
    handleRefresh,
  } = useNearbyDeals();

  // Note: Location permission/services are now handled by native dialogs in LocationService
  // This screen only shows errors if user declines those native dialogs

  const handleDealPress = (deal: Deal) => {
    navigation.navigate('DealDetail', { deal });
  };

  const handleChangeRadius = () => {
    Alert.alert(
      'Search Radius',
      'Select search radius',
      [
        { text: '2 km', onPress: () => setRadius(2) },
        { text: '5 km', onPress: () => setRadius(5) },
        { text: '10 km', onPress: () => setRadius(10) },
        { text: '20 km', onPress: () => setRadius(20) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Near You</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding nearby deals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    // Check if it's a location-related error to show "Go to Settings" button
    const isLocationError =
      error.includes('location') ||
      error.includes('Location') ||
      error.includes('permission') ||
      error.includes('Permission');

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Near You</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>📍</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <View style={styles.errorButtonsContainer}>
            {isLocationError && (
              <TouchableOpacity
                style={[styles.retryButton, styles.settingsButton]}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }}
              >
                <Text style={styles.retryButtonText}>Open Settings</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (deals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Near You</Text>
          <TouchableOpacity style={styles.radiusButton} onPress={handleChangeRadius}>
            <Text style={styles.radiusButtonText}>{radius} km</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>🗺️</Text>
          <Text style={styles.emptyMessage}>No deals nearby</Text>
          <Text style={styles.emptySubtext}>
            Try increasing your search radius
          </Text>
          <TouchableOpacity style={styles.radiusButtonLarge} onPress={handleChangeRadius}>
            <Text style={styles.radiusButtonText}>Change Radius ({radius} km)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Near You</Text>
          <Text style={styles.headerSubtitle}>
            {deals.length} deal{deals.length !== 1 ? 's' : ''} within {radius} km
          </Text>
        </View>
        <TouchableOpacity style={styles.radiusButton} onPress={handleChangeRadius}>
          <Text style={styles.radiusButtonText}>{radius} km</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={deals}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[
            styles.cardWrapper,
            index % 2 === 0 ? styles.leftCard : styles.rightCard
          ]}>
            <FeedDealCard deal={item} onPress={() => handleDealPress(item)} />
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>📍 {item.distance.toFixed(1)} km away</Text>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  radiusButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  radiusButtonLarge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  radiusButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
  distanceBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.lg,
    backgroundColor: `${COLORS.secondary}E6`, // 90% opacity
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  distanceText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  errorButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  settingsButton: {
    backgroundColor: COLORS.secondary,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
