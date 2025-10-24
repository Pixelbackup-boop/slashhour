import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/useAuthStore';
import { authService } from '../../services/api/authService';
import { trackScreenView } from '../../services/analytics';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useMyBusinesses } from '../../hooks/useMyBusinesses';
import { useProfileEdit } from '../../hooks/useProfileEdit';
import { useTheme } from '../../context/ThemeContext';
import StatCard from '../../components/StatCard';
import InfoRow from '../../components/InfoRow';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES, LAYOUT, COLORS } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, updateUser, logout } = useAuthStore();
  const { stats, isLoading, error } = useUserProfile();
  const { businesses, isLoading: businessesLoading } = useMyBusinesses();
  const { isUpdating, error: updateError, updateName, pickAndUploadAvatar } = useProfileEdit();

  // Local state for inline editing
  const [editableName, setEditableName] = useState(user?.name || user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    trackScreenView('ProfileScreen');
  }, []);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setEditableName(user.name || user.username || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleAvatarPress = async () => {
    const newAvatarUrl = await pickAndUploadAvatar();
    if (newAvatarUrl) {
      setAvatarUrl(newAvatarUrl);
      // Update Zustand store
      updateUser({ avatar_url: newAvatarUrl });
    } else if (updateError) {
      Alert.alert('Error', updateError);
    }
  };

  const handleNameSubmit = async () => {
    if (!editableName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      setEditableName(user?.name || user?.username || '');
      setIsEditingName(false);
      return;
    }

    if (editableName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    const success = await updateName(editableName.trim());
    if (success) {
      setIsEditingName(false);
      // Update Zustand store
      updateUser({ name: editableName.trim() });
    } else if (updateError) {
      Alert.alert('Error', updateError);
      setEditableName(user?.name || user?.username || '');
      setIsEditingName(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            authService.logout();
            logout();
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleBusinessPress = (businessId: string, businessName: string) => {
    navigation.navigate('BusinessProfile', { businessId, businessName });
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: colors.backgroundSecondary,
    },
    header: {
      backgroundColor: colors.white,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      color: colors.textPrimary,
    },
    userCard: {
      backgroundColor: colors.white,
      borderBottomColor: colors.borderLight,
    },
    userName: {
      color: colors.textPrimary,
    },
    userEmail: {
      color: colors.textSecondary,
    },
    userUsername: {
      color: colors.textTertiary,
    },
    nameInput: {
      color: colors.textPrimary,
      borderBottomColor: colors.primary,
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
    actionButton: {
      backgroundColor: colors.white,
    },
    actionText: {
      color: colors.textPrimary,
    },
    logoutButton: {
      backgroundColor: colors.error,
    },
    testButton: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primary,
    },
    testButtonTitle: {
      color: colors.textPrimary,
    },
    testButtonSubtitle: {
      color: colors.textSecondary,
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={[styles.userCard, dynamicStyles.userCard]}>
          {/* Avatar with Edit */}
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
            disabled={isUpdating}
            activeOpacity={0.7}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              {isUpdating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.avatarEditIcon}>✏️</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Editable Name */}
          {isEditingName ? (
            <TextInput
              style={[styles.nameInput, dynamicStyles.nameInput]}
              value={editableName}
              onChangeText={setEditableName}
              onBlur={handleNameSubmit}
              onSubmitEditing={handleNameSubmit}
              autoFocus
              placeholder="Enter your name"
              placeholderTextColor={colors.textTertiary}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)} activeOpacity={0.7}>
              <Text style={[styles.userName, dynamicStyles.userName]}>{user?.name || user?.username || 'User'}</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.userEmail, dynamicStyles.userEmail]}>{user?.email || user?.phone || user?.username}</Text>
          {user?.username && (
            <Text style={[styles.userUsername, dynamicStyles.userUsername]}>@{user.username}</Text>
          )}
        </View>

        {/* UX Features Test Button (Remove before production) */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.testButton, dynamicStyles.testButton]}
            onPress={() => navigation.navigate('UXTest')}
          >
            <Text style={styles.testButtonIcon}>🧪</Text>
            <View style={styles.testButtonContent}>
              <Text style={[styles.testButtonTitle, dynamicStyles.testButtonTitle]}>Test UX Features</Text>
              <Text style={[styles.testButtonSubtitle, dynamicStyles.testButtonSubtitle]}>
                Haptics, Bottom Sheets, Loading Spinners
              </Text>
            </View>
            <Text style={[styles.actionArrow, dynamicStyles.actionArrow]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* My Shop or Create Your Shop */}
        {!businessesLoading && (
          <View style={styles.section}>
            {businesses.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>🏪 My Shop</Text>
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
                            <Text style={styles.businessIconText}>
                              {business.business_name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.businessInfo}>
                            <Text style={[styles.businessName, dynamicStyles.businessName]}>{business.business_name}</Text>
                            <Text style={[styles.businessCategory, dynamicStyles.businessCategory]}>{business.category}</Text>
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
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>🏪 Business</Text>
                <View style={[styles.createShopCard, dynamicStyles.createShopCard]}>
                  <View style={styles.createShopIcon}>
                    <Text style={styles.createShopIconText}>🏪</Text>
                  </View>
                  <Text style={[styles.createShopTitle, dynamicStyles.createShopTitle]}>Own a Business?</Text>
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

        {/* Statistics Section */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your stats...</Text>
          </View>
        ) : stats ? (
          <>
            {/* Savings Summary */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>💰 Your Savings</Text>
              <View style={styles.statsGrid}>
                <StatCard value={formatCurrency(stats.totalSavings)} label="Total Saved" />
                <StatCard value={formatCurrency(stats.monthlySavings)} label="This Month" />
              </View>
            </View>

            {/* Redemptions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>🎉 Deals Redeemed</Text>
              <View style={styles.statsGrid}>
                <StatCard value={stats.totalRedemptions} label="Total Deals" />
                <StatCard value={stats.monthlyRedemptions} label="This Month" />
              </View>
            </View>

            {/* Activity */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>📊 Your Activity</Text>
              <View style={[styles.infoCard, dynamicStyles.infoCard]}>
                <InfoRow
                  label="Categories Explored"
                  value={`${stats.categoriesUsed} / ${stats.totalCategories}`}
                />
                <InfoRow label="Businesses Following" value={stats.followingCount} />
                <InfoRow
                  label="Average Savings"
                  value={
                    stats.totalRedemptions > 0
                      ? formatCurrency(stats.totalSavings / stats.totalRedemptions)
                      : '$0.00'
                  }
                />
              </View>
            </View>

            {/* Savings Impact */}
            {stats.totalSavings > 0 && (
              <View style={styles.impactCard}>
                <Text style={styles.impactTitle}>🎯 You're Fighting Inflation!</Text>
                <Text style={styles.impactText}>
                  You've saved {formatCurrency(stats.totalSavings)} on essential goods through Slashhour.
                  That's money back in your pocket!
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No statistics available yet.</Text>
            <Text style={styles.emptyStateSubtext}>Start redeeming deals to see your savings!</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>📋 Quick Actions</Text>
          <View style={[styles.infoCard, dynamicStyles.infoCard]}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('FollowingList')}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>❤️</Text>
                <Text style={[styles.actionLabel, dynamicStyles.actionText]}>Following</Text>
              </View>
              <Text style={[styles.actionArrow, dynamicStyles.actionArrow]}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('RedemptionHistory')}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🎫</Text>
                <Text style={[styles.actionLabel, dynamicStyles.actionText]}>Redemption History</Text>
              </View>
              <Text style={[styles.actionArrow, dynamicStyles.actionArrow]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>⚙️ Account</Text>
          <View style={[styles.infoCard, dynamicStyles.infoCard]}>
            <InfoRow
              label="Member Since"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'N/A'
              }
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, dynamicStyles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0 - MVP</Text>

        {/* Bottom padding for tab bar */}
        <View style={{ height: LAYOUT.tabBarHeight + SPACING.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.displayMedium,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  userName: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  nameInput: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    textAlign: 'center',
    minWidth: 200,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userUsername: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
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
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: SIZES.icon.md,
    marginRight: SPACING.md,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  actionArrow: {
    fontSize: 24,
    color: COLORS.gray300,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  impactCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.md,
    marginTop: 0,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  impactTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  impactText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDisabled,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    margin: SPACING.md,
    marginTop: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  version: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    padding: SPACING.md,
    paddingTop: 0,
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
  businessIconText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
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
  createShopIconText: {
    fontSize: 40,
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
  // Test Button Styles (Remove before production)
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  testButtonIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  testButtonContent: {
    flex: 1,
  },
  testButtonTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#1E40AF',
    marginBottom: 2,
  },
  testButtonSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#3B82F6',
  },
});
