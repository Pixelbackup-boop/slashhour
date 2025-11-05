import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import { TYPOGRAPHY, SPACING, COLORS } from '../../theme';

interface SettingsMenuItem {
  id: string;
  title: string;
  screen: string;
}

const SETTINGS_MENU: SettingsMenuItem[] = [
  { id: 'account', title: 'ACCOUNT', screen: 'AccountSettings' },
  { id: 'notifications', title: 'NOTIFICATIONS', screen: 'NotificationSettings' },
  { id: 'you-follow', title: 'YOU FOLLOW', screen: 'YouFollowSettings' },
  { id: 'near-you', title: 'NEAR YOU', screen: 'NearYouSettings' },
];

// Navigation props type (following TypeScript guidelines - no 'any')
interface SettingsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  useEffect(() => {
    trackScreenView('Settings');
  }, []);

  const handleMenuPress = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Settings
        </Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {SETTINGS_MENU.map((item, index) => (
          <React.Fragment key={item.id}>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.white }]}
              onPress={() => handleMenuPress(item.screen)}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {item.title}
              </Text>
              <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
            </TouchableOpacity>
            {index < SETTINGS_MENU.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            )}
          </React.Fragment>
        ))}

        {/* Coming Soon Message */}
        <View style={styles.comingSoonContainer}>
          <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
            More settings coming soon...
          </Text>
        </View>
      </ScrollView>
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: 0.5,
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
  comingSoonContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
});
