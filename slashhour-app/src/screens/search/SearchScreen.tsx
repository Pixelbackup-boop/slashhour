import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearch } from '../../hooks/useSearch';
import { useDealNavigation } from '../../hooks/useDealNavigation';
import { trackScreenView } from '../../services/analytics';
import SearchBar from '../../components/SearchBar';
import SearchFilters from '../../components/SearchFilters';
import FeedDealCard from '../../components/FeedDealCard';
import BusinessCard from '../../components/BusinessCard';
import LogoHeader from '../../components/LogoHeader';
import { Icon } from '../../components/icons';
import { useTheme } from '../../context/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, LAYOUT } from '../../theme';

export default function SearchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Search hook
  const {
    query,
    setQuery,
    searchType,
    setSearchType,
    filters,
    setFilters,
    results,
    isSearching,
    error,
    search,
    clearSearch,
    hasSearched,
  } = useSearch();

  // Navigation hook
  const { navigateToDeal, navigateToBusinessFromDeal, navigateToBusinessFromObject } = useDealNavigation();

  // Analytics tracking
  useEffect(() => {
    trackScreenView('Search');
  }, []);

  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    resultsContainer: {
      flex: 1,
    },
    resultsSection: {
      paddingTop: SPACING.md,
    },
    dealsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: SPACING.xs,
    },
    cardWrapper: {
      marginBottom: SPACING.md,
      width: '50%',
    },
    leftCard: {
      paddingRight: SPACING.xs,
    },
    rightCard: {
      paddingLeft: SPACING.xs,
    },
    resultsSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.md,
    },
    resultsSectionTitle: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.textPrimary,
    },
    seeAllText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xxl,
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xxl,
    },
    emptyStateTitle: {
      ...TYPOGRAPHY.styles.h2,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    emptyStateText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: SPACING.lg,
    },
    suggestionsContainer: {
      width: '100%',
      alignItems: 'center',
    },
    suggestionsTitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textSecondary,
      marginBottom: SPACING.md,
    },
    suggestionChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: SPACING.sm,
    },
    suggestionChip: {
      backgroundColor: colors.primaryBackground,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.round,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    suggestionText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.primary,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.md,
    },
    retryButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    clearButton: {
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearButtonText: {
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    bottomPadding: {
      height: LAYOUT.tabBarHeight + SPACING.xl,
    },
  }), [colors]);

  // Memoize container style to prevent recreation on every render
  const containerStyle = useMemo(() => [
    styles.container,
    {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }
  ], [styles.container, insets.top, insets.left, insets.right]);

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Icon name="search" size={64} color={colors.textSecondary} style="line" />
          <Text style={styles.emptyStateTitle}>Search Slashhour</Text>
          <Text style={styles.emptyStateText}>
            Find amazing deals and businesses near you
          </Text>
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Try searching for:</Text>
            <View style={styles.suggestionChips}>
              {['Pizza', 'Coffee', 'Electronics', 'Beauty'].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setQuery(suggestion);
                    setTimeout(() => search(), 100);
                  }}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Icon name="alert" size={64} color={colors.error} style="line" />
          <Text style={styles.emptyStateTitle}>Search Error</Text>
          <Text style={styles.emptyStateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={search}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const hasNoResults =
      results.deals.length === 0 && results.businesses.length === 0;

    if (hasNoResults) {
      return (
        <View style={styles.emptyState}>
          <Icon name="face-frown" size={64} color={COLORS.textSecondary} style="line" />
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filters
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              clearSearch();
            }}
          >
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderResults = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    const hasNoResults =
      results.deals.length === 0 && results.businesses.length === 0;

    if (!hasSearched || hasNoResults || error) {
      return renderEmptyState();
    }

    return (
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {/* Deals Results */}
        {results.deals.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsSectionHeader}>
              <Text style={styles.resultsSectionTitle}>
                Deals ({results.totals.deals})
              </Text>
              {results.totals.deals > results.deals.length && (
                <TouchableOpacity onPress={() => setSearchType('deals')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.dealsGrid}>
              {results.deals.map((deal, index) => (
                <View key={deal.id} style={[
                  styles.cardWrapper,
                  index % 2 === 0 ? styles.leftCard : styles.rightCard
                ]}>
                  <FeedDealCard
                    deal={deal}
                    onPress={() => navigateToDeal(deal)}
                    onBusinessPress={() => navigateToBusinessFromDeal(deal)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Businesses Results */}
        {results.businesses.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsSectionHeader}>
              <Text style={styles.resultsSectionTitle}>
                Businesses ({results.totals.businesses})
              </Text>
              {results.totals.businesses > results.businesses.length && (
                <TouchableOpacity onPress={() => setSearchType('businesses')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            {results.businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onPress={() => navigateToBusinessFromObject(business)}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  return (
    <View style={containerStyle}>
      <LogoHeader />
      {/* Search Bar */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSearch={search}
        onClear={clearSearch}
        autoFocus={true}
      />

      {/* Filters */}
      <SearchFilters
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Results */}
      {renderResults()}
    </View>
  );
}
