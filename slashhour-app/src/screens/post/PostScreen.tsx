import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { trackScreenView } from '../../services/analytics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, LAYOUT } from '../../theme';

export default function PostScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [userType, setUserType] = useState<'consumer' | 'business' | null>(null);

  useEffect(() => {
    trackScreenView('PostScreen');

    // Check user type
    // @ts-ignore - user_type might not be in type definition yet
    setUserType(user?.user_type || user?.userType || 'consumer');
  }, [user]);

  const handleCreateDeal = () => {
    // TODO: Navigate to create deal form
    Alert.alert(
      'Create Deal',
      'Deal creation form will be implemented in the next phase',
      [{ text: 'OK' }]
    );
  };

  const handleBecomeBusiness = () => {
    Alert.alert(
      'Become a Business',
      'Would you like to register your business and start posting deals?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: () => {
            // TODO: Navigate to business registration
            Alert.alert('Business Registration', 'This feature will be available soon!');
          },
        },
      ]
    );
  };

  // Business owner view
  if (userType === 'business') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Deal</Text>
            <Text style={styles.headerSubtitle}>Share great deals with your customers</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Active Deals</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Total Redemptions</Text>
            </View>
          </View>

          {/* Create Deal Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateDeal}>
            <Text style={styles.createButtonIcon}>+</Text>
            <Text style={styles.createButtonText}>Create New Deal</Text>
          </TouchableOpacity>

          {/* Deal Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deal Templates</Text>
            <View style={styles.templatesContainer}>
              <TouchableOpacity style={styles.templateCard} onPress={handleCreateDeal}>
                <Text style={styles.templateIcon}>⚡</Text>
                <Text style={styles.templateName}>Flash Deal</Text>
                <Text style={styles.templateDesc}>Limited time offer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.templateCard} onPress={handleCreateDeal}>
                <Text style={styles.templateIcon}>🎉</Text>
                <Text style={styles.templateName}>Discount</Text>
                <Text style={styles.templateDesc}>Percentage off</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Consumer view - Request to become business
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>🏪</Text>
        <Text style={styles.emptyStateTitle}>Share Your Deals</Text>
        <Text style={styles.emptyStateText}>
          Are you a business owner? Register your business to start posting deals and
          reach thousands of customers.
        </Text>

        <TouchableOpacity style={styles.registerButton} onPress={handleBecomeBusiness}>
          <Text style={styles.registerButtonText}>Register Your Business</Text>
        </TouchableOpacity>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits:</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Reach local customers instantly</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Post unlimited deals</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Track redemptions and analytics</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Build customer loyalty</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.displayMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  statValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  createButtonIcon: {
    fontSize: 32,
    color: COLORS.white,
    marginRight: SPACING.md,
    fontWeight: '300',
  },
  createButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.white,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  templatesContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  templateCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  templateIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  templateName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  templateDesc: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xxl,
    ...SHADOWS.lg,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  benefitsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.success,
    marginRight: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  bottomPadding: {
    height: LAYOUT.tabBarHeight + SPACING.xl,
  },
});
