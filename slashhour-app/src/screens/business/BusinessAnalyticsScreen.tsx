import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import { Icon } from '../../components/icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, COLORS } from '../../theme';
import apiClient from '../../services/api/ApiClient';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DealAnalytics {
  dealId: string;
  title: string;
  status: string;
  isActive: boolean;
  discountPercentage: number;
  metrics: {
    viewsFromFollowers: number;
    viewsFromNearby: number;
    totalViews: number;
    shares: number;
    saves: number;
    redemptions: number;
    totalEngagement: number;
    conversionRate: number;
  };
  dates: {
    startsAt: string;
    expiresAt: string;
    createdAt: string;
  };
}

interface BusinessStats {
  activeDealCount: number;
  followerCount: number;
  totalDealsSold: number;
  totalMetrics: {
    totalViews: number;
    totalShares: number;
    totalSaves: number;
    totalRedemptions: number;
    totalEngagement: number;
    overallConversionRate: number;
  };
  dealAnalytics: DealAnalytics[];
}

export default function BusinessAnalyticsScreen({ navigation, route }: any) {
  const { businessId, businessName } = route.params;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    trackScreenView('BusinessAnalyticsScreen');
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiClient.get<BusinessStats>(`/businesses/${businessId}/stats`);
      setStats(response);
    } catch (error) {
      console.error('Failed to load business stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleDealPress = (dealId: string, title: string) => {
    navigation.navigate('DealPerformance', { dealId, title });
  };

  // Dynamic styles based on theme
  const dynamicStyles = useMemo(
    () => ({
      container: {
        backgroundColor: colors.backgroundSecondary,
      },
      header: {
        backgroundColor: colors.white,
      },
      headerTitle: {
        color: colors.textPrimary,
      },
      card: {
        backgroundColor: colors.white,
      },
      sectionTitle: {
        color: colors.textPrimary,
      },
      label: {
        color: colors.textSecondary,
      },
      value: {
        color: colors.textPrimary,
      },
      dealCard: {
        backgroundColor: colors.white,
      },
      dealTitle: {
        color: colors.textPrimary,
      },
      metricLabel: {
        color: colors.textSecondary,
      },
      metricValue: {
        color: colors.textPrimary,
      },
    }),
    [colors]
  );

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centerContent]}>
        <Text style={dynamicStyles.label}>Failed to load analytics</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        dynamicStyles.container,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} style="bold" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>{businessName} Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Overview</Text>

          <View style={[styles.card, dynamicStyles.card]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, dynamicStyles.value]}>
                  {stats.activeDealCount}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.label]}>Active Deals</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, dynamicStyles.value]}>
                  {stats.followerCount}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.label]}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, dynamicStyles.value]}>
                  {stats.totalDealsSold}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.label]}>Total Sales</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Total Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Total Engagement</Text>

          <View style={[styles.card, dynamicStyles.card]}>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, dynamicStyles.label]}>Total Views</Text>
              <Text style={[styles.metricValue, dynamicStyles.value]}>
                {stats.totalMetrics.totalViews.toLocaleString()}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, dynamicStyles.label]}>Total Shares</Text>
              <Text style={[styles.metricValue, dynamicStyles.value]}>
                {stats.totalMetrics.totalShares.toLocaleString()}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, dynamicStyles.label]}>Total Saves (Bookmarks)</Text>
              <Text style={[styles.metricValue, dynamicStyles.value]}>
                {stats.totalMetrics.totalSaves.toLocaleString()}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, dynamicStyles.label]}>Total Redemptions</Text>
              <Text style={[styles.metricValue, dynamicStyles.value]}>
                {stats.totalMetrics.totalRedemptions.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.metricRow, styles.metricRowHighlight]}>
              <Text style={[styles.metricLabel, dynamicStyles.label, styles.boldText]}>
                Conversion Rate
              </Text>
              <Text style={[styles.metricValue, dynamicStyles.value, styles.boldText]}>
                {stats.totalMetrics.overallConversionRate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Chart */}
        {stats.dealAnalytics.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Performance Comparison
            </Text>
            <View style={[styles.card, dynamicStyles.card]}>
              <BarChart
                data={{
                  labels: stats.dealAnalytics
                    .slice(0, 5)
                    .map((deal) => deal.title.substring(0, 10) + (deal.title.length > 10 ? '...' : '')),
                  datasets: [
                    {
                      data: stats.dealAnalytics.slice(0, 5).map((deal) => deal.metrics.redemptions),
                    },
                  ],
                }}
                width={SCREEN_WIDTH - SPACING.md * 4}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
                  labelColor: (opacity = 1) => colors.textSecondary,
                  style: {
                    borderRadius: RADIUS.md,
                  },
                  propsForLabels: {
                    fontSize: 10,
                  },
                }}
                style={{
                  marginVertical: SPACING.sm,
                  borderRadius: RADIUS.md,
                }}
                showValuesOnTopOfBars
                fromZero
              />
              <Text style={[styles.chartLabel, dynamicStyles.label]}>
                Redemptions per Deal (Top 5)
              </Text>
            </View>
          </View>
        )}

        {/* Per-Deal Analytics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Deal Performance</Text>

          {stats.dealAnalytics.length === 0 ? (
            <View style={[styles.card, dynamicStyles.card]}>
              <Text style={[styles.metricLabel, dynamicStyles.label]}>
                No deals yet. Create your first deal to start tracking analytics!
              </Text>
            </View>
          ) : (
            stats.dealAnalytics.map((deal) => (
              <TouchableOpacity
                key={deal.dealId}
                style={[styles.dealCard, dynamicStyles.dealCard]}
                onPress={() => handleDealPress(deal.dealId, deal.title)}
              >
                <View style={styles.dealHeader}>
                  <View style={styles.dealTitleContainer}>
                    <Text style={[styles.dealTitle, dynamicStyles.dealTitle]} numberOfLines={1}>
                      {deal.title}
                    </Text>
                    {deal.isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.dealDiscount, { color: colors.primary }]}>
                    {deal.discountPercentage}% OFF
                  </Text>
                </View>

                <View style={styles.dealMetrics}>
                  <View style={styles.dealMetricItem}>
                    <Text style={[styles.dealMetricValue, dynamicStyles.metricValue]}>
                      {deal.metrics.totalViews}
                    </Text>
                    <Text style={[styles.dealMetricLabel, dynamicStyles.metricLabel]}>Views</Text>
                  </View>
                  <View style={styles.dealMetricItem}>
                    <Text style={[styles.dealMetricValue, dynamicStyles.metricValue]}>
                      {deal.metrics.shares}
                    </Text>
                    <Text style={[styles.dealMetricLabel, dynamicStyles.metricLabel]}>Shares</Text>
                  </View>
                  <View style={styles.dealMetricItem}>
                    <Text style={[styles.dealMetricValue, dynamicStyles.metricValue]}>
                      {deal.metrics.saves}
                    </Text>
                    <Text style={[styles.dealMetricLabel, dynamicStyles.metricLabel]}>Saves</Text>
                  </View>
                  <View style={styles.dealMetricItem}>
                    <Text style={[styles.dealMetricValue, dynamicStyles.metricValue]}>
                      {deal.metrics.redemptions}
                    </Text>
                    <Text style={[styles.dealMetricLabel, dynamicStyles.metricLabel]}>
                      Redeemed
                    </Text>
                  </View>
                </View>

                <View style={styles.dealFooter}>
                  <Text style={[styles.conversionRate, dynamicStyles.metricLabel]}>
                    Conversion: {deal.metrics.conversionRate}%
                  </Text>
                  <Icon name="arrow-right" size={16} color={colors.textTertiary} style="bold" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.small,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricRowHighlight: {
    borderBottomWidth: 0,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  metricLabel: {
    ...TYPOGRAPHY.body,
  },
  metricValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '700',
    ...TYPOGRAPHY.h4,
  },
  dealCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dealTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  dealTitle: {
    ...TYPOGRAPHY.h4,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.xs,
  },
  activeBadgeText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.white,
    fontWeight: '700',
  },
  dealDiscount: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
  dealMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  dealMetricItem: {
    alignItems: 'center',
  },
  dealMetricValue: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    marginBottom: SPACING.xs / 2,
  },
  dealMetricLabel: {
    ...TYPOGRAPHY.tiny,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  conversionRate: {
    ...TYPOGRAPHY.small,
  },
  chartLabel: {
    ...TYPOGRAPHY.small,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});
