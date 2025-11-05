import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SearchType, SearchFilters as ISearchFilters } from '../hooks/useSearch';
import { CATEGORIES } from '../constants/categories';

interface SearchFiltersProps {
  searchType: SearchType;
  onSearchTypeChange: (type: SearchType) => void;
  filters: ISearchFilters;
  onFiltersChange: (filters: ISearchFilters) => void;
}

// Build category filter options from centralized CATEGORIES
// Includes "All" option + all categories from constants
const CATEGORY_OPTIONS = [
  { label: 'All', value: undefined },
  ...CATEGORIES.map(cat => ({ label: cat.label, value: cat.id })),
];

const DISCOUNT_FILTERS = [
  { label: 'Any', value: undefined },
  { label: '20%+', value: 20 },
  { label: '30%+', value: 30 },
  { label: '50%+', value: 50 },
];

export default function SearchFilters({
  searchType,
  onSearchTypeChange,
  filters,
  onFiltersChange,
}: SearchFiltersProps) {
  const updateFilter = (key: keyof ISearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <View style={styles.container}>
      {/* Search Type Tabs */}
      <View style={styles.section}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, searchType === 'all' && styles.tabActive]}
            onPress={() => onSearchTypeChange('all')}
          >
            <Text style={[styles.tabText, searchType === 'all' && styles.tabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, searchType === 'deals' && styles.tabActive]}
            onPress={() => onSearchTypeChange('deals')}
          >
            <Text style={[styles.tabText, searchType === 'deals' && styles.tabTextActive]}>
              Deals
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, searchType === 'businesses' && styles.tabActive]}
            onPress={() => onSearchTypeChange('businesses')}
          >
            <Text style={[styles.tabText, searchType === 'businesses' && styles.tabTextActive]}>
              Businesses
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.label}
              style={[
                styles.chip,
                filters.category === category.id && styles.chipActive,
              ]}
              onPress={() => updateFilter('category', category.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.category === category.id && styles.chipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Deals-specific Filters */}
      {(searchType === 'deals' || searchType === 'all') && (
        <>
          {/* Discount Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minimum Discount</Text>
            <View style={styles.chipRow}>
              {DISCOUNT_FILTERS.map((discount) => (
                <TouchableOpacity
                  key={discount.label}
                  style={[
                    styles.chip,
                    filters.minDiscount === discount.value && styles.chipActive,
                  ]}
                  onPress={() => updateFilter('minDiscount', discount.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.minDiscount === discount.value && styles.chipTextActive,
                    ]}
                  >
                    {discount.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Flash Deals Toggle */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => updateFilter('flashOnly', !filters.flashOnly)}
            >
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>⚡</Text>
                <Text style={styles.toggleLabel}>Flash Deals Only</Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  filters.flashOnly && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    filters.flashOnly && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Business-specific Filters */}
      {(searchType === 'businesses' || searchType === 'all') && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => updateFilter('verified', !filters.verified)}
          >
            <View style={styles.toggleLeft}>
              <Text style={styles.toggleIcon}>✓</Text>
              <Text style={styles.toggleLabel}>Verified Businesses Only</Text>
            </View>
            <View
              style={[
                styles.toggle,
                filters.verified && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  filters.verified && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFE8E8',
    borderColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FF6B6B',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipActive: {
    backgroundColor: '#FFE8E8',
    borderColor: '#FF6B6B',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: '#FF6B6B',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#FF6B6B',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
