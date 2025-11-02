import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SlashhourLogo from './SlashhourLogo';

/**
 * Simple, clean logo header component
 * Displays the Slashhour logo centered at the top of screens
 *
 * Use this for:
 * - Bottom tab screens (Home, Search, Notifications, Inbox, Profile)
 * - Any screen without navigation needs
 *
 * For screens with back buttons, use AppHeader instead.
 */
export default function LogoHeader() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <SlashhourLogo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
