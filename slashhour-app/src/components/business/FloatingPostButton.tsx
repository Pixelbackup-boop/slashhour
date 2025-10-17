import React, { memo } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, LAYOUT } from '../../theme';

interface FloatingPostButtonProps {
  onPress: () => void;
}

function FloatingPostButton({ onPress }: FloatingPostButtonProps) {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <Text style={styles.floatingButtonIcon}>+</Text>
      <Text style={styles.floatingButtonText}>Post Deal</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: LAYOUT.tabBarHeight + SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    ...SHADOWS.lg,
    elevation: 8,
  },
  floatingButtonIcon: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginRight: SPACING.xs,
  },
  floatingButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

// Export with memo to prevent unnecessary re-renders
export default memo(FloatingPostButton);
