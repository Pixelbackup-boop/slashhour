import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Deal } from '../../types/models';
import FeedDealCard from '../../components/FeedDealCard';
import { useNearbyDeals } from '../../hooks/useNearbyDeals';
import { useDealNavigation } from '../../hooks/useDealNavigation';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/icons';
import { TYPOGRAPHY, SPACING, LAYOUT } from '../../theme';
import { STATIC_RADIUS } from '../../theme/constants';

export default function NearYouScreen() {
  const { colors } = useTheme();
  const {
    deals,
    isLoading,
    error,
    radius,
    isRefreshing,
    setRadius,
    handleRefresh,
  } = useNearbyDeals();
  const { navigateToDeal, navigateToBusinessFromDeal } = useDealNavigation();

  // Note: Location permission/services are now handled by native dialogs in LocationService
  // This screen only shows errors if user declines those native dialogs

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
          showDistance={true}
        />
      </View>
    ),
    [navigateToDeal, navigateToBusinessFromDeal]
  );

  const keyExtractor = useCallback((item: Deal) => item.id, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    radiusButtonContainer: {
      backgroundColor: colors.white,
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dealCountText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    radiusButton: {
      backgroundColor: colors.secondary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: STATIC_RADIUS.round,
    },
    radiusButtonLarge: {
      backgroundColor: colors.secondary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: STATIC_RADIUS.round,
      marginTop: SPACING.md,
    },
    radiusButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
      marginBottom: SPACING.md,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    errorButtonsContainer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      alignItems: 'center',
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: STATIC_RADIUS.md,
    },
    settingsButton: {
      backgroundColor: colors.secondary,
    },
    retryButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.centerContainer}>
          <Icon name="marker" size={48} color={colors.error} style="line" />
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
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.radiusButtonContainer}>
          <TouchableOpacity style={styles.radiusButton} onPress={handleChangeRadius}>
            <Text style={styles.radiusButtonText}>{radius} km</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Icon name="map" size={64} color={colors.textSecondary} style="line" />
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
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.radiusButtonContainer}>
        <Text style={styles.dealCountText}>
          {deals.length} deal{deals.length !== 1 ? 's' : ''} near you
        </Text>
        <TouchableOpacity style={styles.radiusButton} onPress={handleChangeRadius}>
          <Text style={styles.radiusButtonText}>{radius} km</Text>
        </TouchableOpacity>
      </View>
      <FlashList
        data={deals}
        keyExtractor={keyExtractor}
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
