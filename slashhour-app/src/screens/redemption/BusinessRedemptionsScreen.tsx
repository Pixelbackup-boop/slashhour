import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { redemptionService, BusinessRedemptionItem, RedemptionStatus } from '../../services/api/redemptionService';
import { trackScreenView } from '../../services/analytics';

interface BusinessRedemptionsScreenProps {
  route: {
    params: {
      businessId: string;
      businessName: string;
    };
  };
  navigation: any;
}

const STATUS_FILTERS: { label: string; value: RedemptionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Validated', value: 'validated' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function BusinessRedemptionsScreen({ route, navigation }: BusinessRedemptionsScreenProps) {
  const { businessId, businessName } = route.params;
  const { colors } = useTheme();

  const [redemptions, setRedemptions] = useState<BusinessRedemptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<RedemptionStatus | 'all'>('all');
  const [summary, setSummary] = useState({
    total_redemptions: 0,
    pending_count: 0,
    validated_count: 0,
    expired_count: 0,
    cancelled_count: 0,
  });

  useEffect(() => {
    trackScreenView('BusinessRedemptionsScreen');
  }, []);

  // Auto-refresh when screen comes into focus (e.g., after QR code validation)
  useFocusEffect(
    useCallback(() => {
      loadRedemptions();
    }, [selectedFilter, businessId])
  );

  const loadRedemptions = async () => {
    try {
      setError(null);
      const statusFilter = selectedFilter === 'all' ? undefined : selectedFilter;
      const response = await redemptionService.getBusinessRedemptions(businessId, statusFilter);
      setRedemptions(response.redemptions);
      setSummary(response.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load redemptions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRedemptions();
  }, [selectedFilter]);

  const handleValidateRedemption = async (redemptionId: string) => {
    Alert.alert(
      'Validate Redemption',
      'Confirm that the customer has shown you this redemption code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Validate',
          style: 'default',
          onPress: async () => {
            try {
              await redemptionService.validateRedemption(redemptionId);
              Alert.alert('Success', 'Redemption validated successfully!');
              handleRefresh();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to validate redemption');
            }
          },
        },
      ]
    );
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner', { businessId, businessName });
  };

  const handleExportCSV = async () => {
    try {
      if (redemptions.length === 0) {
        Alert.alert('No Data', 'There are no redemptions to export.');
        return;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Not Available', 'Sharing is not available on this device.');
        return;
      }

      // Create CSV content
      const headers = [
        'Redemption ID',
        'Customer Name',
        'Customer Email',
        'Deal Title',
        'Original Price',
        'Paid Price',
        'Savings',
        'Discount %',
        'Status',
        'Redeemed Date',
        'Validated Date',
      ];

      const csvRows = [headers.join(',')];

      redemptions.forEach((item) => {
        const row = [
          item.id,
          item.user?.username || 'Unknown',
          item.user?.email || '',
          `"${item.deal?.title?.replace(/"/g, '""') || 'Unknown Deal'}"`, // Escape quotes in title
          item.original_price.toFixed(2),
          item.paid_price.toFixed(2),
          item.savings_amount.toFixed(2),
          `${item.discount_percentage}%`,
          item.status,
          new Date(item.redeemed_at).toLocaleDateString(),
          item.validated_at ? new Date(item.validated_at).toLocaleDateString() : 'N/A',
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${businessName.replace(/[^a-z0-9]/gi, '_')}_redemptions_${timestamp}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      // Write file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Redemptions',
        UTI: 'public.comma-separated-values-text',
      });

      Alert.alert('Success', 'Redemptions exported successfully!');
    } catch (error: any) {
      console.error('Failed to export redemptions:', error);
      Alert.alert('Error', 'Failed to export redemptions. Please try again.');
    }
  };

  const renderFilterTab = (filter: typeof STATUS_FILTERS[0]) => {
    const isSelected = selectedFilter === filter.value;
    const count =
      filter.value === 'all'
        ? summary.total_redemptions
        : filter.value === 'pending'
        ? summary.pending_count
        : filter.value === 'validated'
        ? summary.validated_count
        : filter.value === 'expired'
        ? summary.expired_count
        : summary.cancelled_count;

    return (
      <TouchableOpacity
        key={filter.value}
        style={[
          styles.filterTab,
          {
            backgroundColor: isSelected ? colors.primary : colors.background,
            borderColor: isSelected ? colors.primary : colors.borderLight,
          },
        ]}
        onPress={() => setSelectedFilter(filter.value)}
      >
        <Text
          style={[
            styles.filterTabText,
            { color: isSelected ? colors.white : colors.textSecondary },
          ]}
        >
          {filter.label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRedemptionCard = ({ item }: { item: BusinessRedemptionItem }) => {
    const statusColor =
      item.status === 'validated'
        ? '#10B981'
        : item.status === 'pending'
        ? '#F59E0B'
        : item.status === 'expired'
        ? '#6B7280'
        : '#EF4444';

    return (
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        {/* Customer Info */}
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <Icon name="user" size={20} color={colors.textPrimary} style="solid" />
            <View style={styles.customerDetails}>
              <Text style={[styles.customerName, { color: colors.textPrimary }]}>
                {item.user?.username || 'Unknown User'}
              </Text>
              <Text style={[styles.customerEmail, { color: colors.textSecondary }]}>
                {item.user?.email || ''}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Deal Info */}
        <View style={styles.dealInfo}>
          <Text style={[styles.dealTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.deal?.title || 'Unknown Deal'}
          </Text>
          <Text style={[styles.dealDate, { color: colors.textTertiary }]}>
            Redeemed: {new Date(item.redeemed_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingRow}>
          <View style={styles.pricingItem}>
            <Text style={[styles.pricingLabel, { color: colors.textTertiary }]}>Original</Text>
            <Text style={[styles.pricingValue, { color: colors.textSecondary }]}>
              ${item.original_price.toFixed(2)}
            </Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={[styles.pricingLabel, { color: colors.textTertiary }]}>Paid</Text>
            <Text style={[styles.pricingValue, { color: colors.primary }]}>
              ${item.paid_price.toFixed(2)}
            </Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={[styles.pricingLabel, { color: colors.textTertiary }]}>Saved</Text>
            <Text style={[styles.pricingValue, { color: '#10B981' }]}>
              ${item.savings_amount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Validate Button (only for pending) */}
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.validateButton, { backgroundColor: colors.primary }]}
            onPress={() => handleValidateRedemption(item.id)}
          >
            <Icon name="check" size={18} color={colors.white} style="solid" />
            <Text style={[styles.validateButtonText, { color: colors.white }]}>
              Validate Redemption
            </Text>
          </TouchableOpacity>
        )}

        {/* Validation Info (for validated redemptions) */}
        {item.status === 'validated' && item.validated_at && (
          <View style={styles.validatedInfo}>
            <Icon name="check" size={16} color="#10B981" style="solid" />
            <Text style={[styles.validatedText, { color: colors.textTertiary }]}>
              Validated on {new Date(item.validated_at).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <Icon name="ticket" size={64} color={colors.textSecondary} style="line" />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          No Redemptions{selectedFilter !== 'all' ? ` (${selectedFilter})` : ''}
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {selectedFilter === 'pending'
            ? 'No pending redemptions to validate'
            : 'Redemptions will appear here once customers start redeeming your deals'}
        </Text>
      </View>
    );
  };

  const renderError = () => {
    if (!error || isLoading) return null;

    return (
      <View style={styles.errorState}>
        <Icon name="alert" size={48} color={colors.error} style="solid" />
        <Text style={[styles.errorTitle, { color: colors.error }]}>Error Loading Redemptions</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadRedemptions}>
          <Text style={[styles.retryButtonText, { color: colors.white }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{businessName}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Redemptions Management</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => renderFilterTab(item)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: colors.primary }]}
          onPress={handleScanQR}
        >
          <Icon name="camera" size={20} color={colors.white} style="solid" />
          <Text style={[styles.scanButtonText, { color: colors.white }]}>Scan QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.secondary, opacity: redemptions.length === 0 ? 0.5 : 1 }]}
          onPress={handleExportCSV}
          disabled={redemptions.length === 0}
        >
          <Icon name="download" size={20} color={colors.white} style="solid" />
          <Text style={[styles.exportButtonText, { color: colors.white }]}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading redemptions...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={redemptions}
          keyExtractor={(item) => item.id}
          renderItem={renderRedemptionCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const COLORS = {
  primary: '#FF6B6B',
  error: '#EF4444',
  white: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  background: '#F9FAFB',
  borderLight: '#E5E7EB',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  scanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
  },
  scanButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
  },
  exportButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  customerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  customerEmail: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  dealInfo: {
    marginBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  dealTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: 4,
  },
  dealDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  pricingItem: {
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginBottom: 4,
  },
  pricingValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  validateButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.xs,
  },
  validatedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  validatedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginLeft: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
