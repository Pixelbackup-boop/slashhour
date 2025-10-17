import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleValue?: number; // Scale down to this value when pressed (default: 0.95)
  springConfig?: WithSpringConfig;
}

/**
 * AnimatedButton - Reusable button with smooth spring animation
 *
 * Features:
 * - 60 FPS animations (runs on UI thread)
 * - Spring physics for natural feel
 * - Configurable scale and spring behavior
 * - Drop-in replacement for TouchableOpacity
 *
 * Example:
 * <AnimatedButton onPress={handlePress} style={styles.button}>
 *   <Text>Click Me</Text>
 * </AnimatedButton>
 */
export default function AnimatedButton({
  children,
  onPress,
  onPressIn,
  onPressOut,
  scaleValue = 0.95,
  springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
  style,
  ...props
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(scale.value, springConfig),
        },
      ],
    };
  });

  const handlePressIn = (event: any) => {
    scale.value = scaleValue;
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    scale.value = 1;
    onPressOut?.(event);
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      activeOpacity={0.9}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
}
