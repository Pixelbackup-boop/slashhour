/**
 * UX Features Test Screen
 *
 * Quick testing screen for all modern UX features
 * Remove this file before production deployment
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../../components/CustomBottomSheet';
import LoadingSpinner from '../../components/LoadingSpinner';
import { haptics } from '../../utils/haptics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

export default function UXFeaturesTestScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🧪 UX Features Test</Text>
      <Text style={styles.subtitle}>
        Test all modern UX features implemented on Oct 17, 2025
      </Text>

      {/* Haptic Feedback Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Haptic Feedback</Text>
        <Text style={styles.description}>
          Tap each button to feel different vibration intensities
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.lightButton]}
          onPress={() => haptics.light()}
        >
          <Text style={styles.buttonText}>Light Haptic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.mediumButton]}
          onPress={() => haptics.medium()}
        >
          <Text style={styles.buttonText}>Medium Haptic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.heavyButton]}
          onPress={() => haptics.heavy()}
        >
          <Text style={styles.buttonText}>Heavy Haptic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={() => haptics.success()}
        >
          <Text style={styles.buttonText}>✅ Success Haptic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={() => haptics.warning()}
        >
          <Text style={styles.buttonText}>⚠️ Warning Haptic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={() => haptics.error()}
        >
          <Text style={styles.buttonText}>❌ Error Haptic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.selectionButton]}
          onPress={() => haptics.selection()}
        >
          <Text style={styles.buttonText}>Selection Haptic</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          ℹ️ Note: Haptics only work on physical devices, not simulators
        </Text>
      </View>

      {/* Bottom Sheet Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Bottom Sheet</Text>
        <Text style={styles.description}>
          Modern modal alternative with gesture support
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={openBottomSheet}
        >
          <Text style={styles.buttonText}>Open Bottom Sheet</Text>
        </TouchableOpacity>

        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>What to test:</Text>
          <Text style={styles.instructionsText}>
            • Drag the handle up and down{'\n'}
            • Tap backdrop to dismiss{'\n'}
            • Tap X button to close{'\n'}
            • Drag down to dismiss{'\n'}
            • Feel haptic feedback on snap
          </Text>
        </View>
      </View>

      {/* Loading Spinner Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Loading Spinners</Text>
        <Text style={styles.description}>
          60 FPS smooth animations (Reanimated 3)
        </Text>

        <View style={styles.spinnerRow}>
          <View style={styles.spinnerItem}>
            <LoadingSpinner size="small" />
            <Text style={styles.spinnerLabel}>Small</Text>
          </View>

          <View style={styles.spinnerItem}>
            <LoadingSpinner size="medium" />
            <Text style={styles.spinnerLabel}>Medium</Text>
          </View>

          <View style={styles.spinnerItem}>
            <LoadingSpinner size="large" />
            <Text style={styles.spinnerLabel}>Large</Text>
          </View>
        </View>

        <View style={styles.spinnerRow}>
          <View style={styles.spinnerItem}>
            <LoadingSpinner size="medium" color="#FF6B6B" />
            <Text style={styles.spinnerLabel}>Red</Text>
          </View>

          <View style={styles.spinnerItem}>
            <LoadingSpinner size="medium" color="#4ECDC4" />
            <Text style={styles.spinnerLabel}>Cyan</Text>
          </View>

          <View style={styles.spinnerItem}>
            <LoadingSpinner size="medium" color="#FFD93D" />
            <Text style={styles.spinnerLabel}>Yellow</Text>
          </View>
        </View>

        <Text style={styles.note}>
          ℹ️ These should rotate smoothly at 60 FPS with no jank
        </Text>
      </View>

      {/* Feature Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Other Features</Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Pull-to-Refresh:</Text>
          <Text style={styles.statusValue}>✅ Already working in feeds</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Skeleton Loaders:</Text>
          <Text style={styles.statusValue}>✅ Already working in feeds</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Micro-animations:</Text>
          <Text style={styles.statusValue}>✅ Already in DealCard</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Dark Mode:</Text>
          <Text style={styles.statusValue}>⚠️ Infrastructure ready, needs integration</Text>
        </View>
      </View>

      {/* Bottom Sheet Content */}
      <CustomBottomSheet
        ref={bottomSheetRef}
        snapPoints={['50%', '75%']}
        title="Bottom Sheet Test"
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetText}>
            🎉 Bottom Sheet is working!
          </Text>
          <Text style={styles.sheetDescription}>
            This is a modern modal alternative with gesture support.
          </Text>

          <View style={styles.sheetFeatures}>
            <Text style={styles.featureItem}>✅ Smooth animations</Text>
            <Text style={styles.featureItem}>✅ Gesture dragging</Text>
            <Text style={styles.featureItem}>✅ Snap points (50%, 75%)</Text>
            <Text style={styles.featureItem}>✅ Backdrop dismissal</Text>
            <Text style={styles.featureItem}>✅ Haptic feedback</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <Text style={styles.buttonText}>Close Sheet</Text>
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  button: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
  },
  lightButton: {
    backgroundColor: '#3498db',
  },
  mediumButton: {
    backgroundColor: '#2ecc71',
  },
  heavyButton: {
    backgroundColor: '#e74c3c',
  },
  successButton: {
    backgroundColor: '#27ae60',
  },
  warningButton: {
    backgroundColor: '#f39c12',
  },
  errorButton: {
    backgroundColor: '#c0392b',
  },
  selectionButton: {
    backgroundColor: '#9b59b6',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  note: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  instructionsBox: {
    backgroundColor: COLORS.gray100,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  spinnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  spinnerItem: {
    alignItems: 'center',
  },
  spinnerLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  statusValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  sheetContent: {
    flex: 1,
  },
  sheetText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  sheetDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sheetFeatures: {
    backgroundColor: COLORS.gray100,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  featureItem: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
});
