import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyBusinesses } from '../../hooks/useMyBusinesses';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import LogoHeader from '../../components/LogoHeader';
import { Icon } from '../../components/icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, COLORS, LAYOUT } from '../../theme';

export default function MyShopScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { businesses, isLoading: businessesLoading } = useMyBusinesses();

  useEffect(() => {
    trackScreenView('MyShopScreen');
  }, []);

  const handleBusinessPress = (businessId: string, businessName: string) => {
    navigation.navigate('BusinessProfile', { businessId, businessName });
  };

  // Dynamic styles based on theme
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.backgroundSecondary,
    },
    sectionTitle: {
      color: colors.textPrimary,
    },
    infoCard: {
      backgroundColor: colors.white,
    },
    businessName: {
      color: colors.textPrimary,
    },
    businessCategory: {
      color: colors.textSecondary,
    },
    actionArrow: {
      color: colors.textTertiary,
    },
    createShopCard: {
      backgroundColor: colors.white,
    },
    createShopTitle: {
      color: colors.textPrimary,
    },
    createShopDescription: {
      color: colors.textSecondary,
    },
  }), [colors]);

  const containerStyle = useMemo(() => [
    styles.container,
    dynamicStyles.container,
    {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }
  ], [insets.top, insets.left, insets.right, dynamicStyles.container]);

  return (
    <View style={containerStyle}>
      <LogoHeader />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {businessesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading your shop...
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            {businesses.length > 0 ? (
              <>
                {/* My Shop Section */}
                <View style={styles.sectionTitleRow}>
                  <Icon name="building" size={20} color={colors.textPrimary} style="line" />
                  <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>My Shop</Text>
                </View>
                <View style={[styles.infoCard, dynamicStyles.infoCard]}>
                  {businesses.map((business, index) => (
                    <View key={business.id}>
                      {index > 0 && <View style={styles.divider} />}
                      <TouchableOpacity
                        style={styles.businessRow}
                        onPress={() => handleBusinessPress(business.id, business.business_name)}
                      >
                        <View style={styles.businessLeft}>
                          <View style={styles.businessIcon}>
                            <Icon name="building" size={24} color={COLORS.white} style="line" />
                          </View>
                          <View style={styles.businessInfo}>
                            <Text style={[styles.businessName, dynamicStyles.businessName]}>
                              {business.business_name}
                            </Text>
                            <Text style={[styles.businessCategory, dynamicStyles.businessCategory]}>
                              {business.category}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.actionArrow, dynamicStyles.actionArrow]}>›</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                {/* Create Your Shop Section */}
                <View style={styles.sectionTitleRow}>
                  <Icon name="building" size={20} color={colors.textPrimary} style="line" />
                  <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Business</Text>
                </View>
                <View style={[styles.createShopCard, dynamicStyles.createShopCard]}>
                  <View style={styles.createShopIcon}>
                    <Icon name="building" size={40} color={colors.textPrimary} style="line" />
                  </View>
                  <Text style={[styles.createShopTitle, dynamicStyles.createShopTitle]}>
                    Own a Business?
                  </Text>
                  <Text style={[styles.createShopDescription, dynamicStyles.createShopDescription]}>
                    Register your shop and start posting deals to reach thousands of local customers
                  </Text>
                  <TouchableOpacity
                    style={styles.createShopButton}
                    onPress={() => navigation.navigate('RegisterBusiness')}
                  >
                    <Text style={styles.createShopButtonText}>Create Your Shop</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={{ height: LAYOUT.tabBarHeight + SPACING.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  businessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  businessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs / 2,
  },
  businessCategory: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  actionArrow: {
    fontSize: 24,
    color: COLORS.gray300,
    fontWeight: '300',
  },
  createShopCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  createShopIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  createShopTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  createShopDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  createShopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  createShopButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
