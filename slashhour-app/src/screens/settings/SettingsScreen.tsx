import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, COLORS, LAYOUT } from '../../theme';

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Notification Settings State
  const [notifyNearbyDeals, setNotifyNearbyDeals] = useState(false);
  const [notifyNewDeals, setNotifyNewDeals] = useState(true);
  const [notifyFlashDeals, setNotifyFlashDeals] = useState(true);

  useEffect(() => {
    trackScreenView('Settings');
    // TODO: Load user's notification settings from API
  }, []);

  const handleNearbyDealsToggle = (value: boolean) => {
    setNotifyNearbyDeals(value);
    // TODO: Save to API and request location permission if enabling
    if (value) {
      Alert.alert(
        'Location Access',
        'Allow Slashhour to access your location to notify you about nearby deals?',
        [
          { text: 'Not Now', style: 'cancel', onPress: () => setNotifyNearbyDeals(false) },
          {
            text: 'Allow',
            onPress: () => {
              // TODO: Request location permission
              // TODO: Save setting to API
            }
          },
        ]
      );
    }
  };

  // Dynamic styles (memoized for performance)
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.backgroundSecondary,
    },
    mainTitle: {
      color: colors.textPrimary,
    },
    sectionTitle: {
      color: colors.textPrimary,
    },
    sectionDescription: {
      color: colors.textSecondary,
    },
    settingCard: {
      backgroundColor: colors.white,
    },
    settingLabel: {
      color: colors.textPrimary,
    },
    settingDescription: {
      color: colors.textTertiary,
    },
    divider: {
      backgroundColor: colors.borderLight,
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Settings Title */}
        <View style={styles.headerSection}>
          <Text style={[styles.mainTitle, dynamicStyles.mainTitle]}>Settings</Text>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            🔔 Notifications
          </Text>
          <Text style={[styles.sectionDescription, dynamicStyles.sectionDescription]}>
            Manage how you receive notifications from Slashhour
          </Text>

          <View style={[styles.settingCard, dynamicStyles.settingCard]}>
            {/* Nearby Deals Notification */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  Nearby Deals
                </Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  Get notified when new deals are posted near you
                </Text>
              </View>
              <Switch
                value={notifyNearbyDeals}
                onValueChange={handleNearbyDealsToggle}
                trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
                thumbColor={notifyNearbyDeals ? colors.primary : colors.gray400}
              />
            </View>

            <View style={[styles.divider, dynamicStyles.divider]} />

            {/* New Deals from Following */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  New Deals from Following
                </Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  Notifications from businesses you follow
                </Text>
              </View>
              <Switch
                value={notifyNewDeals}
                onValueChange={setNotifyNewDeals}
                trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
                thumbColor={notifyNewDeals ? colors.primary : colors.gray400}
              />
            </View>

            <View style={[styles.divider, dynamicStyles.divider]} />

            {/* Flash Deals */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  Flash Deals
                </Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  Time-sensitive deals expiring soon
                </Text>
              </View>
              <Switch
                value={notifyFlashDeals}
                onValueChange={setNotifyFlashDeals}
                trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
                thumbColor={notifyFlashDeals ? colors.primary : colors.gray400}
              />
            </View>
          </View>
        </View>

        {/* Placeholder for future sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionDescription, dynamicStyles.sectionDescription, { textAlign: 'center', paddingVertical: SPACING.xl }]}>
            More settings coming soon...
          </Text>
        </View>

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
  headerSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  mainTitle: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  settingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
});
