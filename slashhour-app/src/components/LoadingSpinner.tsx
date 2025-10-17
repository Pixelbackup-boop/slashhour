/**
 * Loading Spinner Component
 *
 * Smooth animated loading indicator using Reanimated
 * Better than default ActivityIndicator
 *
 * Usage:
 *   <LoadingSpinner size="large" />
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  color = COLORS.primary,
}: LoadingSpinnerProps) {
  const rotation = useSharedValue(0);

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const spinnerSize = sizeMap[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1 // Infinite loop
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderColor: color,
            borderTopColor: 'transparent',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderWidth: 3,
  },
});
