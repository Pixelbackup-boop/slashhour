import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SlashhourLogo from './SlashhourLogo';

/**
 * Simple, clean logo header component
 * Displays the Slashhour logo at the top of screens
 * Supports optional right button (e.g., hamburger menu)
 * Optimized with React.memo and useMemo to prevent unnecessary re-renders
 *
 * Use this for:
 * - Bottom tab screens (Home, Search, Notifications, Inbox, Profile)
 * - Any screen without navigation needs
 *
 * For screens with back buttons, use AppHeader instead.
 */

interface LogoHeaderProps {
  rightButton?: React.ReactNode;
}

const LogoHeader = React.memo(({ rightButton }: LogoHeaderProps) => {
  const { colors } = useTheme();

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: colors.white }
  ], [colors.white]);

  return (
    <View style={containerStyle}>
      <View style={styles.logoContainer}>
        <SlashhourLogo />
      </View>
      {rightButton && (
        <View style={styles.rightButtonContainer}>
          {rightButton}
        </View>
      )}
    </View>
  );
});

LogoHeader.displayName = 'LogoHeader';

export default LogoHeader;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonContainer: {
    position: 'absolute',
    right: 16,
  },
});
