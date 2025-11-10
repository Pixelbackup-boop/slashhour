import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Icon, IconName } from './icons';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75; // 75% of screen width

interface MenuItem {
  icon: IconName;
  label: string;
  onPress: () => void;
}

interface RightDrawerProps {
  visible: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

/**
 * RightDrawer Component - TikTok-style side menu
 * 2025 Best Practice: Clean, simple animation using React Native Animated API
 * Slides in from RIGHT side of screen
 */
export default function RightDrawer({ visible, onClose, menuItems }: RightDrawerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Animation value: 0 = closed, 1 = open
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Open drawer: slide in from right + fade in backdrop
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close drawer: slide out to right + fade out backdrop
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.white,
            paddingTop: insets.top + SPACING.lg,
            paddingBottom: insets.bottom + SPACING.lg,
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  setTimeout(() => item.onPress(), 300); // Delay for smooth close animation
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>
                  <Icon name={item.icon} size={24} color={colors.textPrimary} style="line" />
                </View>
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>
              {index < menuItems.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
              )}
            </View>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    ...SHADOWS.xl,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: SPACING.md,
    marginLeft: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  closeIcon: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  menuContainer: {
    paddingHorizontal: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  menuIconContainer: {
    width: 32,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  menuArrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    marginLeft: SPACING.md + 32 + SPACING.md, // Align with text
  },
});
