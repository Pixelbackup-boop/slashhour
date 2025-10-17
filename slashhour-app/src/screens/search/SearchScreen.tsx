import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearch } from '../../hooks/useSearch';
import { trackScreenView } from '../../services/analytics';
import SearchBar from '../../components/SearchBar';
import SearchFilters from '../../components/SearchFilters';
import FeedDealCard from '../../components/FeedDealCard';
import BusinessCard from '../../components/BusinessCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, LAYOUT } from '../../theme';

export default function SearchScreen({ navigation }: any) {
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

  useEffect(() => {
    trackScreenView('SearchScreen');
  }, []);

  const handleDealPress = (deal: any) => {
    navigation.navigate('DealDetail', { deal });
  };

  const handleBusinessPress = (business: any) => {
    // TODO: Navigate to business detail screen when implemented
    console.log('Tapped business:', business.business_name);
  };

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
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
          <Text style={styles.emptyStateIcon}>⚠️</Text>
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
          <Text style={styles.emptyStateIcon}>😔</Text>
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
          <ActivityIndicator size="large" color={COLORS.primary} />
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
                    onPress={() => handleDealPress(deal)}
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
                onPress={() => handleBusinessPress(business)}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
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
  },
  leftCard: {
    marginRight: SPACING.xs,
    marginLeft: -SPACING.xs,
  },
  rightCard: {
    marginLeft: SPACING.xs,
    marginRight: -SPACING.xs,
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
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
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
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.styles.h2,
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
  suggestionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  clearButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  bottomPadding: {
    height: LAYOUT.tabBarHeight + SPACING.xl,
  },
});
