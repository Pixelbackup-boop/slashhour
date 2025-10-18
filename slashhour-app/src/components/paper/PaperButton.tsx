/**
 * Paper Button Examples
 * Reusable button components using React Native Paper
 */

import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet, ViewStyle } from 'react-native';

interface PaperButtonProps {
  children: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Primary Button (Contained)
 * Use for main actions
 */
export function PrimaryButton({ children, onPress, loading, disabled, icon, style }: Omit<PaperButtonProps, 'mode'>) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={[styles.primaryButton, style]}
      contentStyle={styles.buttonContent}
    >
      {children}
    </Button>
  );
}

/**
 * Secondary Button (Outlined)
 * Use for secondary actions
 */
export function SecondaryButton({ children, onPress, loading, disabled, icon, style }: Omit<PaperButtonProps, 'mode'>) {
  return (
    <Button
      mode="outlined"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={[styles.secondaryButton, style]}
      contentStyle={styles.buttonContent}
    >
      {children}
    </Button>
  );
}

/**
 * Text Button
 * Use for tertiary/less important actions
 */
export function TextButton({ children, onPress, loading, disabled, icon, style }: Omit<PaperButtonProps, 'mode'>) {
  return (
    <Button
      mode="text"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={style}
    >
      {children}
    </Button>
  );
}

/**
 * Icon Button
 * Use for icon-only actions
 */
interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
}

export function IconButton({ icon, onPress, size = 24, disabled }: IconButtonProps) {
  const IconButtonComponent = require('react-native-paper').IconButton;
  return (
    <IconButtonComponent
      icon={icon}
      size={size}
      onPress={onPress}
      disabled={disabled}
    />
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },
});
