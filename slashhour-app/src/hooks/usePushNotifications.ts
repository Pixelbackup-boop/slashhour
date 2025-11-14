import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import notificationService from '../services/api/notificationService';
import { handleDeepLink } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/useAuthStore';

// Android Notification Channels Configuration
export const NOTIFICATION_CHANNELS = {
  NEW_DEAL: {
    id: 'new_deal',
    name: 'New Deals',
    description: 'Notifications for new deals from businesses you follow',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'new_deal.wav',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#00BFA5',
  },
  FLASH_DEAL: {
    id: 'flash_deal',
    name: 'Flash Deals',
    description: 'Urgent notifications for time-sensitive flash deals',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'flash_deal.wav',
    vibrationPattern: [0, 500, 100, 500],
    lightColor: '#E63946',
  },
  EXPIRING_SOON: {
    id: 'expiring_soon',
    name: 'Expiring Deals',
    description: 'Reminders for deals that are about to expire',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'expiring_soon.wav',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FFD54F',
  },
  SAVINGS_MILESTONE: {
    id: 'savings_milestone',
    name: 'Savings Milestones',
    description: 'Celebrate your savings achievements',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'savings.wav',
    vibrationPattern: [0, 200, 200, 200],
    lightColor: '#6BCB77',
  },
  DEFAULT: {
    id: 'default',
    name: 'General Notifications',
    description: 'Other app notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E63946',
  },
} as const;

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Set up all notification channels for Android
 * Creates separate channels for different notification types with custom sounds and behaviors
 */
async function setupNotificationChannels() {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // Create all notification channels
    const channels = Object.values(NOTIFICATION_CHANNELS);

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: channel.importance,
        vibrationPattern: [...channel.vibrationPattern],
        lightColor: channel.lightColor,
        sound: channel.sound === 'default' ? 'default' : channel.sound,
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });

      logger.info(`Created notification channel: ${channel.name} (${channel.id})`);
    }

    logger.info('All notification channels created successfully');
  } catch (error) {
    logger.error('Error setting up notification channels:', error);
  }
}

/**
 * Set notification category with action buttons
 * Allows users to interact with notifications without opening the app
 */
async function setupNotificationCategories() {
  try {
    // Define notification categories with action buttons
    await Notifications.setNotificationCategoryAsync('deal_notification', [
      {
        identifier: 'view_deal',
        buttonTitle: 'View Deal',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('savings_notification', [
      {
        identifier: 'view_savings',
        buttonTitle: 'View Savings',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    logger.info('Notification categories set up successfully');
  } catch (error) {
    logger.error('Error setting up notification categories:', error);
  }
}

export const usePushNotifications = () => {
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const setAuthDeviceToken = useAuthStore((state) => state.setDeviceToken);

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Check if app was opened by tapping a notification (when app was killed)
    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (response) {
          logger.info('App opened by notification:', response);

          // Handle navigation based on notification data
          const data = response.notification.request.content.data;

          if (data?.action_url) {
            logger.info('Navigate to (from killed state):', data.action_url);
            // Add a small delay to ensure navigation is ready
            setTimeout(() => {
              handleDeepLink(data.action_url as string, data);
            }, 500);
          }
        }
      })
      .catch(error => {
        logger.error('Error checking last notification response:', error);
      });

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      logger.info('Notification received in foreground:', notification);
      setNotification(notification);
    });

    // Listener for when user taps on notification (while app is running)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      logger.info('Notification tapped (while app running):', response);

      // Handle navigation based on notification data
      const data = response.notification.request.content.data;

      if (data?.action_url) {
        logger.info('Navigate to:', data.action_url);
        // Parse and navigate to the deep link
        handleDeepLink(data.action_url as string, data);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      // Must use physical device for push notifications
      if (!Device.isDevice) {
        logger.warn('Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Push notification permission not granted');
        return null;
      }

      // Get the Expo push token (works without Firebase setup)
      // For 2025 best practice: Use Expo's managed push notification service
      // This works on both iOS and Android without additional Firebase setup
      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || 'slashhour-app';

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenData.data;

      logger.info('Expo push token:', token);
      setDeviceToken(token);

      // Store device token in auth store for logout cleanup
      setAuthDeviceToken(token);

      // Register token with backend
      try {
        await notificationService.registerDeviceToken({
          device_token: token,
          device_type: Platform.OS as 'ios' | 'android',
          device_name: `${Device.brand} ${Device.modelName}`,
        });
        logger.info('Device token registered with backend');
      } catch (error) {
        logger.error('Failed to register device token with backend:', error);
      }

      // Configure notification channels and categories
      if (Platform.OS === 'android') {
        await setupNotificationChannels();
      }
      // Categories work on both iOS and Android
      await setupNotificationCategories();

      return token;
    } catch (error) {
      // 2025 Best Practice: Detailed error logging with context
      if (error instanceof Error) {
        logger.error('Error registering for push notifications:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          platform: Platform.OS,
          isDevice: Device.isDevice,
        });

        // Specific error handling
        if (error.message.includes('Firebase')) {
          logger.warn('Firebase not initialized - using Expo push tokens instead (this is fine for most apps)');
        }
      } else {
        logger.error('Unknown error registering for push notifications:', error);
      }
      return null;
    }
  };

  return {
    deviceToken,
    notification,
  };
};
