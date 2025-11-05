import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import { usersApi, verificationApi } from '../../services/api';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import ChangeEmailModal from '../../components/ChangeEmailModal';
import ChangePhoneModal from '../../components/ChangePhoneModal';
import { TYPOGRAPHY, SPACING, COLORS, LAYOUT, RADIUS, SHADOWS } from '../../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Type definitions (following TypeScript 2025 guidelines)
interface AccountSettingsScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

// User data type (from API)
interface UserData {
  email: string | null;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  hasPassword: boolean;
}

export default function AccountSettingsScreen({ navigation }: AccountSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // User data state
  const [userData, setUserData] = useState<UserData>({
    email: null,
    phone: null,
    emailVerified: false,
    phoneVerified: false,
    hasPassword: true,
  });

  // Modal visibility state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    trackScreenView('AccountSettings');
  }, []);

  // Refresh user data when screen comes into focus
  // (e.g., after returning from verification screen)
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  // Load user data from API
  const loadUserData = async () => {
    try {
      const profile = await usersApi.getProfile();
      setUserData({
        email: profile.email,
        phone: profile.phone,
        emailVerified: profile.emailVerified,
        phoneVerified: profile.phoneVerified,
        hasPassword: true, // Assume user has password if authenticated
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Could not load account information',
        position: 'bottom',
      });
    }
  };

  // ============================================
  // SECURITY ACTIONS
  // ============================================

  const handleChangePassword = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPasswordModal(true);
  };

  const handleChangeEmail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEmailModal(true);
  };

  const handleChangePhone = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPhoneModal(true);
  };

  const handleEmailChanged = (newEmail: string) => {
    setUserData({ ...userData, email: newEmail, emailVerified: false });
  };

  const handlePhoneChanged = (newPhone: string) => {
    setUserData({ ...userData, phone: newPhone, phoneVerified: false });
  };

  const handleVerifyEmail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!userData.email) {
      Toast.show({
        type: 'error',
        text1: 'No Email',
        text2: 'Please add an email address first',
        position: 'bottom',
      });
      return;
    }

    try {
      await verificationApi.sendEmailVerification();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Code Sent',
        text2: 'Check your email for the verification code',
        position: 'bottom',
      });

      // Navigate to verification screen
      navigation.navigate('VerifyEmail', { email: userData.email });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: error instanceof Error ? error.message : 'Could not send verification email',
        position: 'bottom',
      });
    }
  };

  const handleVerifyPhone = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!userData.phone) {
      Toast.show({
        type: 'error',
        text1: 'No Phone',
        text2: 'Please add a phone number first',
        position: 'bottom',
      });
      return;
    }

    try {
      await verificationApi.sendPhoneVerification();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Code Sent',
        text2: 'Check your SMS for the verification code',
        position: 'bottom',
      });

      // Navigate to verification screen
      navigation.navigate('VerifyPhone', { phone: userData.phone });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: error instanceof Error ? error.message : 'Could not send verification code',
        position: 'bottom',
      });
    }
  };

  // ============================================
  // ACCOUNT DEACTIVATION (Temporary)
  // ============================================

  const handleDeactivateAccount = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Deactivate Account',
      'Your account will be hidden and you\'ll be logged out. You can reactivate anytime by logging back in.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.deactivateAccount();

              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Toast.show({
                type: 'info',
                text1: 'Account Deactivated',
                text2: 'Log in anytime to reactivate',
                position: 'bottom',
                visibilityTime: 3000,
              });

              // TODO: Implement logout - clear auth token and navigate to login
              // For now, just navigate back
              setTimeout(() => {
                navigation.goBack();
              }, 2000);
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed',
                text2: error instanceof Error ? error.message : 'Could not deactivate account',
                position: 'bottom',
              });
            }
          },
        },
      ]
    );
  };

  // ============================================
  // PERMANENT DELETION (30-day grace period)
  // ============================================

  const handleDeleteAccountPermanently = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Delete Account Permanently',
      'This will schedule your account for permanent deletion.\n\n' +
      '⚠️ Important:\n' +
      '• Your account will be deactivated immediately\n' +
      '• You have 30 days to change your mind\n' +
      '• Log in within 30 days to cancel deletion\n' +
      '• After 30 days, all data will be permanently deleted\n\n' +
      'Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmPermanentDeletion(),
        },
      ]
    );
  };

  const confirmPermanentDeletion = () => {
    Alert.prompt(
      'Confirm Deletion',
      'Type "DELETE" to confirm permanent account deletion:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async (text) => {
            if (text?.toUpperCase() !== 'DELETE') {
              Alert.alert('Error', 'You must type DELETE to confirm');
              return;
            }

            try {
              await usersApi.scheduleDeletion();

              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Toast.show({
                type: 'info',
                text1: 'Deletion Scheduled',
                text2: 'You have 30 days to cancel by logging back in',
                position: 'bottom',
                visibilityTime: 4000,
              });

              // TODO: Implement logout - clear auth token and navigate to login
              // For now, just navigate back
              setTimeout(() => {
                navigation.goBack();
              }, 3000);
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed',
                text2: error instanceof Error ? error.message : 'Could not schedule deletion',
                position: 'bottom',
              });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + LAYOUT.tabBarHeight }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Account Settings
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.intro}>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Manage your account security and preferences
          </Text>
        </View>

        {/* ============================================ */}
        {/* SECURITY SECTION                            */}
        {/* ============================================ */}

        <View style={[styles.card, { backgroundColor: colors.white }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Security</Text>

          {/* Change Password */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Password
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
                Change your password
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Change Email */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleChangeEmail}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.labelWithBadge}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Email Address
                </Text>
                {userData.emailVerified ? (
                  <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.success }]}>✓ Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.verifyButton, { backgroundColor: colors.warning + '20' }]}
                    onPress={handleVerifyEmail}
                  >
                    <Text style={[styles.badgeText, { color: colors.warning }]}>Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
                {userData.email || 'Not set'}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Change Phone */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleChangePhone}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.labelWithBadge}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Phone Number
                </Text>
                {userData.phoneVerified ? (
                  <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.success }]}>✓ Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.verifyButton, { backgroundColor: colors.warning + '20' }]}
                    onPress={handleVerifyPhone}
                  >
                    <Text style={[styles.badgeText, { color: colors.warning }]}>Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
                {userData.phone || 'Not set'}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================ */}
        {/* DANGER ZONE                                 */}
        {/* ============================================ */}

        <View style={[styles.card, { backgroundColor: colors.white, marginTop: SPACING.xl }]}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>

          {/* Deactivate Account */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleDeactivateAccount}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Deactivate Account
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
                Temporarily disable your account. Reactivate anytime by logging back in.
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Delete Account Permanently */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleDeleteAccountPermanently}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.error }]}>
                Delete Account Permanently
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
                Schedule permanent deletion. 30-day grace period to cancel.
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.error }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.info + '10' }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 Tip: Your profile information (name, avatar, etc.) can be managed in the Profile screen.
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <ChangeEmailModal
        visible={showEmailModal}
        currentEmail={userData.email}
        onClose={() => setShowEmailModal(false)}
        onSuccess={handleEmailChanged}
      />

      <ChangePhoneModal
        visible={showPhoneModal}
        currentPhone={userData.phone}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={handlePhoneChanged}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  intro: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  introText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  settingLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.md,
  },
  labelWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  verifiedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  verifyButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  infoBox: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xl,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
  },
});
