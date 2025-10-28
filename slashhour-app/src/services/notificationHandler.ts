import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import notificationService from './api/notificationService';
import { logger } from '../utils/logger';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationHandlerCallbacks {
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void;
}

class NotificationHandler {
  private notificationListener?: Notifications.Subscription;
  private responseListener?: Notifications.Subscription;
  private registeredToken: string | null = null;

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        logger.warn('Notifications only work on physical devices, not simulators');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Notification permissions not granted');
        return false;
      }

      logger.info('Notification permissions granted');
      return true;
    } catch (error) {
      logger.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get the Expo push token for this device
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        logger.warn('Cannot get push token on simulator');
        return null;
      }

      // Get projectId from env or from app.json
      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID ||
                       Constants.expoConfig?.extra?.eas?.projectId ||
                       'slashhour-app-temp-id'; // Fallback for testing

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      logger.info('Got Expo push token:', token.data);
      return token.data;
    } catch (error) {
      logger.error('Error getting Expo push token:', error);
      return null;
    }
  }

  /**
   * Register device token with the backend
   */
  async registerDeviceWithBackend(): Promise<boolean> {
    try {
      // First, request permissions
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        return false;
      }

      // Get the Expo push token
      const pushToken = await this.getExpoPushToken();
      if (!pushToken) {
        return false;
      }

      // Register with backend
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      const deviceName = Device.deviceName || `${Platform.OS} Device`;

      await notificationService.registerDeviceToken({
        device_token: pushToken,
        device_type: deviceType,
        device_name: deviceName,
      });

      this.registeredToken = pushToken;
      logger.info('Successfully registered device token with backend');
      return true;
    } catch (error) {
      logger.error('Error registering device with backend:', error);
      return false;
    }
  }

  /**
   * Deactivate device token with the backend
   */
  async deactivateDevice(): Promise<void> {
    try {
      if (!this.registeredToken) {
        logger.warn('No registered token to deactivate');
        return;
      }

      await notificationService.deactivateDeviceToken(this.registeredToken);
      this.registeredToken = null;
      logger.info('Successfully deactivated device token');
    } catch (error) {
      logger.error('Error deactivating device:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(callbacks: NotificationHandlerCallbacks): void {
    // Clean up existing listeners
    this.removeNotificationListeners();

    // Listen for notifications received while the app is in the foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        logger.info('Notification received in foreground:', notification);
        callbacks.onNotificationReceived?.(notification);
      }
    );

    // Listen for when a user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        logger.info('Notification tapped:', response);
        callbacks.onNotificationTapped?.(response);
      }
    );

    logger.info('Notification listeners set up');
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = undefined;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = undefined;
    }

    logger.info('Notification listeners removed');
  }

  /**
   * Get the notification that launched the app (if any)
   */
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      return response;
    } catch (error) {
      logger.error('Error getting last notification response:', error);
      return null;
    }
  }

  /**
   * Manually dismiss a notification
   */
  async dismissNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(notificationId);
      logger.info('Dismissed notification:', notificationId);
    } catch (error) {
      logger.error('Error dismissing notification:', error);
    }
  }

  /**
   * Dismiss all notifications
   */
  async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      logger.info('Dismissed all notifications');
    } catch (error) {
      logger.error('Error dismissing all notifications:', error);
    }
  }

  /**
   * Set the badge count on the app icon (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      logger.info('Set badge count to:', count);
    } catch (error) {
      logger.error('Error setting badge count:', error);
    }
  }

  /**
   * Get the current badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      logger.error('Error getting badge count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const notificationHandler = new NotificationHandler();
