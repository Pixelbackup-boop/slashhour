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
import { ProgressChart } from 'react-native-chart-kit';
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

export default function DealPerformanceScreen({ navigation, route }: any) {
  const { dealId, title } = route.params;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [analytics, setAnalytics] = useState<DealAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    trackScreenView('DealPerformanceScreen');
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.get<DealAnalytics>(`/deals/${dealId}/analytics`);
      setAnalytics(response);
    } catch (error) {
      console.error('Failed to load deal analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  if (!analytics) {
    return (
      <View style={[styles.container, dynamicStyles.container, styles.centerContent]}>
        <Text style={dynamicStyles.label}>Failed to load analytics</Text>
      </View>
    );
  }

  const daysRemaining = getDaysRemaining(analytics.dates.expiresAt);
  const viewBreakdown = [
    {
      label: 'Followers',
      value: analytics.metrics.viewsFromFollowers,
      percentage:
        analytics.metrics.totalViews > 0
          ? ((analytics.metrics.viewsFromFollowers / analytics.metrics.totalViews) * 100).toFixed(
              1
            )
          : '0',
    },
    {
      label: 'Nearby Users',
      value: analytics.metrics.viewsFromNearby,
      percentage:
        analytics.metrics.totalViews > 0
          ? ((analytics.metrics.viewsFromNearby / analytics.metrics.totalViews) * 100).toFixed(1)
          : '0',
    },
  ];

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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]} numberOfLines={1}>
          Deal Performance
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Deal Info Card */}
        <View style={styles.section}>
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.dealTitle, dynamicStyles.value]}>{analytics.title}</Text>
            <View style={styles.dealInfoRow}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{analytics.discountPercentage}% OFF</Text>
              </View>
              {analytics.isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              )}
            </View>
            <View style={styles.dateRow}>
              <Text style={[styles.dateLabel, dynamicStyles.label]}>Starts:</Text>
              <Text style={[styles.dateValue, dynamicStyles.value]}>
                {formatDate(analytics.dates.startsAt)}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={[styles.dateLabel, dynamicStyles.label]}>Expires:</Text>
              <Text style={[styles.dateValue, dynamicStyles.value]}>
                {formatDate(analytics.dates.expiresAt)}
              </Text>
            </View>
            {analytics.isActive && daysRemaining > 0 && (
              <View style={styles.daysRemainingContainer}>
                <Icon name="clock" size={16} color={colors.primary} style="solid" />
                <Text style={[styles.daysRemaining, { color: colors.primary }]}>
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Key Metrics</Text>
          <View style={[styles.card, dynamicStyles.card]}>
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, dynamicStyles.metricValue]}>
                  {analytics.metrics.totalViews.toLocaleString()}
                </Text>
                <Text style={[styles.metricLabel, dynamicStyles.metricLabel]}>Total Views</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, dynamicStyles.metricValue]}>
                  {analytics.metrics.shares.toLocaleString()}
                </Text>
                <Text style={[styles.metricLabel, dynamicStyles.metricLabel]}>Shares</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, dynamicStyles.metricValue]}>
                  {analytics.metrics.saves.toLocaleString()}
                </Text>
                <Text style={[styles.metricLabel, dynamicStyles.metricLabel]}>Saves</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, dynamicStyles.metricValue]}>
                  {analytics.metrics.redemptions.toLocaleString()}
                </Text>
                <Text style={[styles.metricLabel, dynamicStyles.metricLabel]}>Redeemed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* View Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>View Breakdown</Text>
          <View style={[styles.card, dynamicStyles.card]}>
            {analytics.metrics.totalViews > 0 && (
              <>
                <ProgressChart
                  data={{
                    labels: ['Followers', 'Nearby'],
                    data: [
                      analytics.metrics.viewsFromFollowers / analytics.metrics.totalViews,
                      analytics.metrics.viewsFromNearby / analytics.metrics.totalViews,
                    ],
                  }}
                  width={SCREEN_WIDTH - SPACING.md * 4}
                  height={200}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    backgroundColor: colors.white,
                    backgroundGradientFrom: colors.white,
                    backgroundGradientTo: colors.white,
                    decimalPlaces: 0,
                    color: (opacity = 1, index) => {
                      const chartColors = [
                        `rgba(255, 107, 107, ${opacity})`, // Primary color for followers
                        `rgba(107, 179, 255, ${opacity})`, // Blue for nearby
                      ];
                      return chartColors[index || 0];
                    },
                    labelColor: (opacity = 1) => colors.textSecondary,
                  }}
                  hideLegend={false}
                  style={{
                    marginVertical: SPACING.sm,
                    borderRadius: RADIUS.md,
                  }}
                />
                <View style={styles.divider} />
              </>
            )}
            {viewBreakdown.map((item, index) => (
              <View key={index}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <Text style={[styles.breakdownLabel, dynamicStyles.label]}>{item.label}</Text>
                    <Text style={[styles.breakdownValue, dynamicStyles.value]}>
                      {item.value.toLocaleString()} views
                    </Text>
                  </View>
                  <Text style={[styles.breakdownPercentage, { color: colors.primary }]}>
                    {item.percentage}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Engagement Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Engagement</Text>
          <View style={[styles.card, dynamicStyles.card]}>
            <View style={styles.engagementRow}>
              <Text style={[styles.engagementLabel, dynamicStyles.label]}>Total Engagement</Text>
              <Text style={[styles.engagementValue, dynamicStyles.value]}>
                {analytics.metrics.totalEngagement.toLocaleString()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.engagementRow}>
              <Text style={[styles.engagementLabel, dynamicStyles.label]}>Conversion Rate</Text>
              <Text style={[styles.conversionRate, { color: colors.primary }]}>
                {analytics.metrics.conversionRate}%
              </Text>
            </View>
            <Text style={[styles.conversionHelp, dynamicStyles.label]}>
              Percentage of views that resulted in redemptions
            </Text>
          </View>
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
  dealTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.sm,
  },
  dealInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  discountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.sm,
  },
  discountText: {
    ...TYPOGRAPHY.small,
    color: COLORS.white,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.sm,
  },
  activeBadgeText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.white,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  dateLabel: {
    ...TYPOGRAPHY.body,
  },
  dateValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  daysRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xs,
  },
  daysRemaining: {
    ...TYPOGRAPHY.small,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricBox: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  metricValue: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    ...TYPOGRAPHY.small,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownLabel: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.xs / 2,
  },
  breakdownValue: {
    ...TYPOGRAPHY.small,
  },
  breakdownPercentage: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  engagementLabel: {
    ...TYPOGRAPHY.body,
  },
  engagementValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
  },
  conversionRate: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
  },
  conversionHelp: {
    ...TYPOGRAPHY.tiny,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
});
