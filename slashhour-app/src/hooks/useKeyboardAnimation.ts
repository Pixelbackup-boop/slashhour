import { useEffect, useRef } from 'react';
import { Keyboard, Animated, Platform } from 'react-native';

/**
 * Custom hook for animating components in response to keyboard show/hide events
 *
 * Handles platform-specific keyboard event listeners and provides smooth animations
 * for keyboard appearance and dismissal.
 *
 * @returns Animated value that represents the keyboard offset height
 *
 * @example
 * ```tsx
 * const keyboardOffset = useKeyboardAnimation();
 *
 * <Animated.View
 *   style={{
 *     transform: [{
 *       translateY: keyboardOffset.interpolate({
 *         inputRange: [0, 1],
 *         outputRange: [0, -1],
 *       })
 *     }]
 *   }}
 * >
 *   // Form content
 * </Animated.View>
 * ```
 */
export const useKeyboardAnimation = () => {
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Platform-specific event names
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    // Keyboard show listener
    const keyboardWillShow = Keyboard.addListener(
      showEvent,
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    // Keyboard hide listener
    const keyboardWillHide = Keyboard.addListener(
      hideEvent,
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [keyboardOffset]);

  return keyboardOffset;
};
