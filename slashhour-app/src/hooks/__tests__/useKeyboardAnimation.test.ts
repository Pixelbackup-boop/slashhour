import { renderHook, waitFor } from '@testing-library/react-native';
import { Keyboard, Animated, Platform } from 'react-native';
import { useKeyboardAnimation } from '../useKeyboardAnimation';

describe('useKeyboardAnimation', () => {
  let keyboardShowListeners: Array<(e: any) => void> = [];
  let keyboardHideListeners: Array<(e: any) => void> = [];
  let mockRemove: jest.Mock;

  beforeEach(() => {
    keyboardShowListeners = [];
    keyboardHideListeners = [];
    mockRemove = jest.fn();

    // Mock Keyboard.addListener
    jest.spyOn(Keyboard, 'addListener').mockImplementation((event, callback) => {
      if (event === 'keyboardWillShow' || event === 'keyboardDidShow') {
        keyboardShowListeners.push(callback);
      } else if (event === 'keyboardWillHide' || event === 'keyboardDidHide') {
        keyboardHideListeners.push(callback);
      }
      return {
        remove: mockRemove,
        emitter: {} as any,
        listener: callback,
        context: undefined,
        eventType: event,
        key: '',
        subscriber: {} as any,
      } as any;
    });

    // Mock Animated.timing
    jest.spyOn(Animated, 'timing').mockReturnValue({
      start: jest.fn((callback) => callback && callback()),
      stop: jest.fn(),
      reset: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('iOS platform', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('should initialize with keyboard offset value of 0', () => {
      const { result } = renderHook(() => useKeyboardAnimation());

      expect(result.current).toBeInstanceOf(Animated.Value);
    });

    it('should register keyboardWillShow listener on iOS', () => {
      renderHook(() => useKeyboardAnimation());

      expect(Keyboard.addListener).toHaveBeenCalledWith(
        'keyboardWillShow',
        expect.any(Function)
      );
    });

    it('should register keyboardWillHide listener on iOS', () => {
      renderHook(() => useKeyboardAnimation());

      expect(Keyboard.addListener).toHaveBeenCalledWith(
        'keyboardWillHide',
        expect.any(Function)
      );
    });

    it('should animate to keyboard height when keyboard shows on iOS', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const keyboardEvent = {
        endCoordinates: { height: 350 },
        duration: 250,
      };

      // Trigger keyboard show
      keyboardShowListeners.forEach((listener) => listener(keyboardEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledWith(
          result.current,
          expect.objectContaining({
            toValue: 350,
            duration: 250,
            useNativeDriver: false,
          })
        );
      });
    });

    it('should animate to 0 when keyboard hides on iOS', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const keyboardEvent = {
        endCoordinates: { height: 0 },
        duration: 200,
      };

      // Trigger keyboard hide
      keyboardHideListeners.forEach((listener) => listener(keyboardEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledWith(
          result.current,
          expect.objectContaining({
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          })
        );
      });
    });

    it('should use event duration for iOS animations', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const customDuration = 300;
      const keyboardEvent = {
        endCoordinates: { height: 400 },
        duration: customDuration,
      };

      keyboardShowListeners.forEach((listener) => listener(keyboardEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledWith(
          result.current,
          expect.objectContaining({
            duration: customDuration,
          })
        );
      });
    });
  });

  describe('Android platform', () => {
    beforeEach(() => {
      Platform.OS = 'android';
    });

    it('should register keyboardDidShow listener on Android', () => {
      renderHook(() => useKeyboardAnimation());

      expect(Keyboard.addListener).toHaveBeenCalledWith(
        'keyboardDidShow',
        expect.any(Function)
      );
    });

    it('should register keyboardDidHide listener on Android', () => {
      renderHook(() => useKeyboardAnimation());

      expect(Keyboard.addListener).toHaveBeenCalledWith(
        'keyboardDidHide',
        expect.any(Function)
      );
    });

    it('should animate to keyboard height when keyboard shows on Android', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const keyboardEvent = {
        endCoordinates: { height: 300 },
        duration: 0, // Android events may have 0 duration
      };

      keyboardShowListeners.forEach((listener) => listener(keyboardEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledWith(
          result.current,
          expect.objectContaining({
            toValue: 300,
            duration: 250, // Default duration on Android
            useNativeDriver: false,
          })
        );
      });
    });

    it('should use default duration of 250ms for Android', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const keyboardEvent = {
        endCoordinates: { height: 350 },
        duration: 0,
      };

      keyboardShowListeners.forEach((listener) => listener(keyboardEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledWith(
          result.current,
          expect.objectContaining({
            duration: 250,
          })
        );
      });
    });
  });

  describe('cleanup', () => {
    it('should remove keyboard listeners on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardAnimation());

      unmount();

      // Should have called remove twice (once for show, once for hide)
      expect(mockRemove).toHaveBeenCalledTimes(2);
    });

    it('should register exactly 2 listeners (show and hide)', () => {
      renderHook(() => useKeyboardAnimation());

      expect(Keyboard.addListener).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = renderHook(() => useKeyboardAnimation());
      unmount1();

      const { unmount: unmount2 } = renderHook(() => useKeyboardAnimation());
      unmount2();

      expect(mockRemove).toHaveBeenCalledTimes(4); // 2 per mount
    });
  });

  describe('animation properties', () => {
    it('should use native driver false for layout animations', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const keyboardEvent = {
        endCoordinates: { height: 300 },
        duration: 250,
      };

      keyboardShowListeners.forEach((listener) => listener(keyboardEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledWith(
          result.current,
          expect.objectContaining({
            useNativeDriver: false,
          })
        );
      });
    });

    it('should handle rapid keyboard show/hide events', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const showEvent = { endCoordinates: { height: 350 }, duration: 250 };
      const hideEvent = { endCoordinates: { height: 0 }, duration: 250 };

      // Rapid fire events
      keyboardShowListeners.forEach((listener) => listener(showEvent));
      keyboardHideListeners.forEach((listener) => listener(hideEvent));
      keyboardShowListeners.forEach((listener) => listener(showEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle keyboard event with zero height', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const keyboardEvent = {
        endCoordinates: { height: 0 },
        duration: 250,
      };

      keyboardShowListeners.forEach((listener) => listener(keyboardEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledWith(
          result.current,
          expect.objectContaining({
            toValue: 0,
          })
        );
      });
    });

    it('should handle very large keyboard heights', async () => {
      const { result } = renderHook(() => useKeyboardAnimation());
      const keyboardEvent = {
        endCoordinates: { height: 800 }, // Very large keyboard (e.g., iPad)
        duration: 250,
      };

      keyboardShowListeners.forEach((listener) => listener(keyboardEvent));

      await waitFor(() => {
        expect(Animated.timing).toHaveBeenCalledWith(
          result.current,
          expect.objectContaining({
            toValue: 800,
          })
        );
      });
    });

    it('should maintain stable animated value reference', () => {
      const { result, rerender } = renderHook(() => useKeyboardAnimation());
      const firstValue = result.current;

      rerender({});

      expect(result.current).toBe(firstValue);
    });
  });
});
