import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import SlashhourLogo from './SlashhourLogo';

interface AppHeaderProps {
  showBackButton?: boolean;
}

/**
 * AppHeader - Header component with logo and optional back button
 *
 * Use this for:
 * - Stack screens with navigation (DealDetail, BusinessProfile, etc.)
 * - Any screen that needs a back button
 *
 * For simple logo-only headers on bottom tab screens, use LogoHeader instead.
 */
export default function AppHeader({ showBackButton = false }: AppHeaderProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: colors.white }} edges={['top']}>
      <View style={[styles.header, {
        backgroundColor: colors.white,
        borderBottomColor: colors.borderLight,
      }]}>
        {showBackButton ? (
          <View style={styles.headerWithBack}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <SlashhourLogo />
            </View>
            <View style={styles.placeholder} />
          </View>
        ) : (
          <View style={styles.logoContainer}>
            <SlashhourLogo />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '400',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
});
