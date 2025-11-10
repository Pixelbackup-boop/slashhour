/**
 * Reusable Icon Wrapper Component
 *
 * Centralizes icon management using Expo Vector Icons (Ionicons)
 * Supports outline and filled styles
 *
 * Usage:
 * <Icon name="heart" size={24} color="#FF0000" />
 * <Icon name="heart" style="solid" size={24} color="#FF0000" />
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Available icon styles
 */
export type IconStyle = 'line' | 'solid' | 'duotone' | 'duocolor';

/**
 * Available icon names - mapped to Ionicons
 */
export type IconName =
  | 'home'
  | 'search'
  | 'bell'
  | 'message'
  | 'user'
  | 'heart'
  | 'marker'
  | 'cart'
  | 'star'
  | 'alert'
  | 'edit'
  | 'trash'
  | 'building'
  | 'dollar'
  | 'gift'
  | 'chart'
  | 'target'
  | 'calendar'
  | 'phone'
  | 'mail'
  | 'lock'
  | 'info'
  | 'lightbulb'
  | 'lightning'
  | 'check'
  | 'eye'
  | 'eye-off'
  | 'map'
  | 'navigation'
  | 'shopping-bag'
  | 'home-simple'
  | 'settings'
  | 'shield'
  | 'pen'
  | 'x-circle'
  | 'clock'
  | 'ticket'
  | 'face-frown'
  | 'help-circle'
  | 'logout'
  | 'award'
  | 'users'
  | 'globe'
  | 'camera'
  | 'package'
  | 'clipboard'
  | 'inbox'
  | 'image'
  | 'list';

export interface IconProps {
  /**
   * Icon name from the predefined set
   */
  name: IconName;

  /**
   * Icon size in pixels (default: 24)
   */
  size?: number;

  /**
   * Icon color (default: 'currentColor')
   * Supports hex codes, rgb, rgba, or theme colors
   */
  color?: string;

  /**
   * Icon style variant (default: 'line')
   * - line: Outline/stroke style (most common)
   * - solid: Filled style
   * Note: duotone and duocolor fallback to solid for Ionicons
   */
  style?: IconStyle;

  /**
   * Additional styles for the icon container
   */
  containerStyle?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Icon name mapping from our custom names to Ionicons names
 */
const ICON_MAP: Record<IconName, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
  home: { outline: 'home-outline', filled: 'home' },
  search: { outline: 'search-outline', filled: 'search' },
  bell: { outline: 'notifications-outline', filled: 'notifications' },
  message: { outline: 'chatbubble-outline', filled: 'chatbubble' },
  user: { outline: 'person-outline', filled: 'person' },
  heart: { outline: 'heart-outline', filled: 'heart' },
  marker: { outline: 'location-outline', filled: 'location' },
  cart: { outline: 'cart-outline', filled: 'cart' },
  star: { outline: 'star-outline', filled: 'star' },
  alert: { outline: 'alert-circle-outline', filled: 'alert-circle' },
  edit: { outline: 'create-outline', filled: 'create' },
  trash: { outline: 'trash-outline', filled: 'trash' },
  building: { outline: 'business-outline', filled: 'business' },
  dollar: { outline: 'cash-outline', filled: 'cash' },
  gift: { outline: 'gift-outline', filled: 'gift' },
  chart: { outline: 'bar-chart-outline', filled: 'bar-chart' },
  target: { outline: 'flag-outline', filled: 'flag' },
  calendar: { outline: 'calendar-outline', filled: 'calendar' },
  phone: { outline: 'call-outline', filled: 'call' },
  mail: { outline: 'mail-outline', filled: 'mail' },
  lock: { outline: 'lock-closed-outline', filled: 'lock-closed' },
  info: { outline: 'information-circle-outline', filled: 'information-circle' },
  lightbulb: { outline: 'bulb-outline', filled: 'bulb' },
  lightning: { outline: 'flash-outline', filled: 'flash' },
  check: { outline: 'checkmark-circle-outline', filled: 'checkmark-circle' },
  eye: { outline: 'eye-outline', filled: 'eye' },
  'eye-off': { outline: 'eye-off-outline', filled: 'eye-off' },
  map: { outline: 'map-outline', filled: 'map' },
  navigation: { outline: 'navigate-outline', filled: 'navigate' },
  'shopping-bag': { outline: 'bag-outline', filled: 'bag' },
  'home-simple': { outline: 'home-outline', filled: 'home' },
  settings: { outline: 'settings-outline', filled: 'settings' },
  shield: { outline: 'shield-outline', filled: 'shield' },
  pen: { outline: 'pencil-outline', filled: 'pencil' },
  'x-circle': { outline: 'close-circle-outline', filled: 'close-circle' },
  clock: { outline: 'time-outline', filled: 'time' },
  ticket: { outline: 'ticket-outline', filled: 'ticket' },
  'face-frown': { outline: 'sad-outline', filled: 'sad' },
  'help-circle': { outline: 'help-circle-outline', filled: 'help-circle' },
  logout: { outline: 'log-out-outline', filled: 'log-out' },
  award: { outline: 'trophy-outline', filled: 'trophy' },
  users: { outline: 'people-outline', filled: 'people' },
  globe: { outline: 'globe-outline', filled: 'globe' },
  camera: { outline: 'camera-outline', filled: 'camera' },
  package: { outline: 'cube-outline', filled: 'cube' },
  clipboard: { outline: 'clipboard-outline', filled: 'clipboard' },
  inbox: { outline: 'mail-outline', filled: 'mail' },
  image: { outline: 'image-outline', filled: 'image' },
  list: { outline: 'list-outline', filled: 'list' },
};

/**
 * Icon Component
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  style = 'line',
  containerStyle,
  testID,
}) => {
  const iconMapping = ICON_MAP[name];

  if (!iconMapping) {
    if (__DEV__) {
      console.warn(`[Icon] Icon "${name}" not found in ICON_MAP`);
    }
    return null;
  }

  // Map style to outline/filled
  // line -> outline, solid/duotone/duocolor -> filled
  const iconName = (style === 'line') ? iconMapping.outline : iconMapping.filled;

  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
      style={containerStyle}
      testID={testID}
    />
  );
};
