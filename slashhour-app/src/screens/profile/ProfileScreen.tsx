import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useAuthStore } from '../../stores/useAuthStore';
import { authService } from '../../services/api/authService';
import { trackScreenView } from '../../services/analytics';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useProfileEdit } from '../../hooks/useProfileEdit';
import { useTheme } from '../../context/ThemeContext';
import StatCard from '../../components/StatCard';
import InfoRow from '../../components/InfoRow';
import LogoHeader from '../../components/LogoHeader';
import RightDrawer from '../../components/RightDrawer';
import { Icon } from '../../components/icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES, LAYOUT, COLORS } from '../../theme';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, updateUser, logout } = useAuthStore();
  const { stats, isLoading, error } = useUserProfile();
  const { isUpdating, error: updateError, updateName, pickAndUploadAvatar } = useProfileEdit();

  // Local state for inline editing
  const [editableName, setEditableName] = useState(user?.name || user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isEditingName, setIsEditingName] = useState(false);

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);

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

  // Drawer menu items
  const menuItems = [
    {
      icon: 'settings',
      label: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'lock',
      label: 'Privacy',
      onPress: () => {
        // TODO: Navigate to Privacy screen
        Alert.alert('Coming Soon', 'Privacy settings will be available soon');
      },
    },
    {
      icon: 'help-circle',
      label: 'Help',
      onPress: () => {
        // TODO: Navigate to Help screen
        Alert.alert('Coming Soon', 'Help center will be available soon');
      },
    },
    {
      icon: 'message',
      label: 'Support',
      onPress: () => {
        // TODO: Navigate to Support screen
        Alert.alert('Coming Soon', 'Support chat will be available soon');
      },
    },
    {
      icon: 'info',
      label: 'About',
      onPress: () => {
        // TODO: Navigate to About screen
        Alert.alert('About Slashhour', 'Version 1.0.0 - MVP\n\nSaving you money, one deal at a time.');
      },
    },
    {
      icon: 'logout',
      label: 'Logout',
      onPress: handleLogout,
    },
  ];

  // Dynamic styles based on theme (memoized to prevent layout thrashing)
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.backgroundSecondary,
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
    actionArrow: {
      color: colors.textTertiary,
    },
    actionButton: {
      backgroundColor: colors.white,
    },
    actionText: {
      color: colors.textPrimary,
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
  }), [colors]);

  // Memoize container style to prevent recreating on every render
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
      <LogoHeader
        rightButton={
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        }
      />

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
                <Icon name="edit" size={14} color={COLORS.white} style="line" />
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
              <View style={styles.sectionTitleRow}>
                <Icon name="dollar" size={20} color={colors.textPrimary} style="line" />
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Your Savings</Text>
              </View>
              <View style={styles.statsGrid}>
                <StatCard value={formatCurrency(stats.totalSavings)} label="Total Saved" />
                <StatCard value={formatCurrency(stats.monthlySavings)} label="This Month" />
              </View>
            </View>

            {/* Redemptions */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Icon name="award" size={20} color={colors.textPrimary} style="line" />
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Deals Redeemed</Text>
              </View>
              <View style={styles.statsGrid}>
                <StatCard value={stats.totalRedemptions} label="Total Deals" />
                <StatCard value={stats.monthlyRedemptions} label="This Month" />
              </View>
            </View>

            {/* Activity */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Icon name="chart" size={20} color={colors.textPrimary} style="line" />
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Your Activity</Text>
              </View>
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
                <View style={styles.impactTitleRow}>
                  <Icon name="target" size={20} color={COLORS.primary} style="line" />
                  <Text style={styles.impactTitle}>You're Fighting Inflation!</Text>
                </View>
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
          <View style={styles.sectionTitleRow}>
            <Icon name="list" size={20} color={colors.textPrimary} style="line" />
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Quick Actions</Text>
          </View>
          <View style={[styles.infoCard, dynamicStyles.infoCard]}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('Bookmarks')}
            >
              <View style={styles.actionLeft}>
                <Icon name="heart" size={24} color={colors.textPrimary} style="line" />
                <Text style={[styles.actionLabel, dynamicStyles.actionText]}>Saved Deals</Text>
              </View>
              <Text style={[styles.actionArrow, dynamicStyles.actionArrow]}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('FollowingList')}
            >
              <View style={styles.actionLeft}>
                <Icon name="heart" size={24} color={COLORS.error} style="solid" />
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
                <Icon name="ticket" size={24} color={colors.textPrimary} style="line" />
                <Text style={[styles.actionLabel, dynamicStyles.actionText]}>Redemption History</Text>
              </View>
              <Text style={[styles.actionArrow, dynamicStyles.actionArrow]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Icon name="settings" size={20} color={colors.textPrimary} style="line" />
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Account</Text>
          </View>
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

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0 - MVP</Text>

        {/* Bottom padding for tab bar */}
        <View style={{ height: LAYOUT.tabBarHeight + SPACING.lg }} />
      </ScrollView>

      {/* Right Drawer */}
      <RightDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        menuItems={menuItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  menuButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  menuIcon: {
    fontSize: 28,
    color: COLORS.textPrimary,
    fontWeight: '300',
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
    gap: SPACING.md,
  },
  actionIcon: {
    fontSize: 24,
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
  impactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  impactTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.primary,
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
