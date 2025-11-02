import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface SlashhourLogoProps {
  size?: 'small' | 'medium' | 'large';
}

/**
 * Reusable Slashhour logo component
 *
 * Sizes:
 * - small: 120x21 (for compact spaces)
 * - medium: 180x32 (default, used in headers)
 * - large: 240x43 (for splash/auth screens)
 */
export default function SlashhourLogo({ size = 'medium' }: SlashhourLogoProps) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={styles[size]}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  small: {
    width: 120,
    height: 21,
  },
  medium: {
    width: 180,
    height: 32,
  },
  large: {
    width: 240,
    height: 43,
  },
});
