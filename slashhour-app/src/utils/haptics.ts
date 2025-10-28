/**
 * Haptic Feedback Utilities
 *
 * Provides tactile feedback for user interactions
 * Enhances UX with physical responses to touches
 *
 * Usage:
 *   import { haptics } from '@/utils/haptics';
 *   haptics.light();  // On button press
 *   haptics.success(); // On successful action
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Check if haptics are supported on this device
 */
const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Haptic feedback utilities
 */
export const haptics = {
  /**
   * Light impact - for button presses, toggles
   * Most common feedback type
   */
  light: async () => {
    if (isHapticsSupported) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        if (__DEV__) {
          console.warn('Haptic feedback failed:', error);
        }
      }
    }
  },

  /**
   * Medium impact - for tab switches, card swipes
   */
  medium: async () => {
    if (isHapticsSupported) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        if (__DEV__) {
          console.warn('Haptic feedback failed:', error);
        }
      }
    }
  },

  /**
   * Heavy impact - for important actions, deletions
   */
  heavy: async () => {
    if (isHapticsSupported) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (error) {
        if (__DEV__) {
          console.warn('Haptic feedback failed:', error);
        }
      }
    }
  },

  /**
   * Success notification - for successful operations
   * (Booking confirmed, deal redeemed, etc.)
   */
  success: async () => {
    if (isHapticsSupported) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        if (__DEV__) {
          console.warn('Haptic feedback failed:', error);
        }
      }
    }
  },

  /**
   * Warning notification - for warnings
   * (Form validation errors, etc.)
   */
  warning: async () => {
    if (isHapticsSupported) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        if (__DEV__) {
          console.warn('Haptic feedback failed:', error);
        }
      }
    }
  },

  /**
   * Error notification - for errors
   * (Failed requests, etc.)
   */
  error: async () => {
    if (isHapticsSupported) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        if (__DEV__) {
          console.warn('Haptic feedback failed:', error);
        }
      }
    }
  },

  /**
   * Selection feedback - for picker/dropdown changes
   */
  selection: async () => {
    if (isHapticsSupported) {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        if (__DEV__) {
          console.warn('Haptic feedback failed:', error);
        }
      }
    }
  },
};

/**
 * Hook for using haptics in components
 * Returns haptic functions
 */
export const useHaptics = () => {
  return haptics;
};
