import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trackScreenView } from '../../services/analytics';
import { Icon } from '../../components/icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES } from '../../theme';

export default function InboxScreen({ navigation }: any) {
  useEffect(() => {
    trackScreenView('InboxScreen');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.composeButton}>
          <Icon name="edit" size={SIZES.icon.md} color={COLORS.textPrimary} style="line" />
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      <View style={styles.emptyState}>
        <Icon name="message" size={64} color={COLORS.textSecondary} style="line" />
        <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
        <Text style={styles.emptyStateText}>
          Messages from businesses and support will appear here
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Coming Soon:</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>✓</Text>
            <Text style={styles.infoText}>Chat with businesses</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>✓</Text>
            <Text style={styles.infoText}>Deal updates and notifications</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>✓</Text>
            <Text style={styles.infoText}>Support messages</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>✓</Text>
            <Text style={styles.infoText}>Order status updates</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.displayMedium,
    color: COLORS.textPrimary,
  },
  composeButton: {
    width: SIZES.button.md,
    height: SIZES.button.md,
    borderRadius: SIZES.button.md / 2,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
    paddingBottom: 120,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    marginRight: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
});
