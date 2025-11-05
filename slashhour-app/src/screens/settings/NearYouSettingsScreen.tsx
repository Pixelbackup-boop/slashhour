import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import { TYPOGRAPHY, SPACING, COLORS, LAYOUT } from '../../theme';

export default function NearYouSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  useEffect(() => {
    trackScreenView('NearYouSettings');
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + LAYOUT.tabBarHeight }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Near You Settings
        </Text>
      </View>

      {/* Coming Soon Content */}
      <View style={styles.content}>
        <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
          Nearby deals settings coming soon...
        </Text>
        <Text style={[styles.descriptionText, { color: colors.textTertiary }]}>
          Customize your location radius and preferences for nearby deals
        </Text>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  comingSoonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
