import React, { useEffect, useRef } from 'react';
import { useNavigationContainerRef } from '@react-navigation/native';
import { useIsAuthenticated } from '../stores/useAuthStore';
import { logger } from '../utils/logger';
import Constants from 'expo-constants';

interface NotificationProviderProps {
  children: React.ReactNode;
}

/**
 * NotificationProvider
 *
 * Wraps the app and handles:
 * - Registering device token with backend when user logs in
 * - Setting up notification listeners
 * - Handling notification taps and navigation
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const navigationRef = useNavigationContainerRef();
  const isAuthenticated = useIsAuthenticated();
  const hasInitialized = useRef(false);

  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  // Initialize notifications when user is authenticated
  useEffect(() => {
    // TEMPORARY: Allow notifications in Expo Go for testing
    // TODO: Re-enable this check when building production app
    // if (isExpoGo) {
    //   logger.warn('Push notifications require a development build. Skipping in Expo Go.');
    //   return;
    // }

    if (isAuthenticated && !hasInitialized.current) {
      hasInitialized.current = true;

      // Dynamically import notification handler
      import('../services/notificationHandler').then(({ notificationHandler }) => {
        // Register device with backend
        notificationHandler
          .registerDeviceWithBackend()
          .then((success) => {
            if (success) {
              logger.info('Device successfully registered for push notifications');
            } else {
              logger.warn('Failed to register device for push notifications');
            }
          })
          .catch((error) => {
            logger.error('Error registering device for push notifications:', error);
          });
      });
    }

    // Deactivate device when user logs out
    if (!isAuthenticated && hasInitialized.current) {
      hasInitialized.current = false;
      // if (!isExpoGo) {
        import('../services/notificationHandler').then(({ notificationHandler }) => {
          notificationHandler.deactivateDevice();
        });
      // }
    }
  }, [isAuthenticated, isExpoGo]);

  // Set up notification listeners
  useEffect(() => {
    if (!isAuthenticated /* || isExpoGo */) return;

    import('../services/notificationHandler').then(({ notificationHandler }) => {
      // Handle notification received while app is in foreground
      const handleNotificationReceived = (notification: any) => {
        logger.info('Notification received:', notification.request.content);
        // The notification will be displayed automatically due to our handler config
      };

      // Handle notification tap
      const handleNotificationTapped = (response: any) => {
        logger.info('Notification tapped:', response.notification.request.content);

        const data = response.notification.request.content.data;

        // Navigate based on notification data
        if (navigationRef.isReady()) {
          if (data?.deal_id) {
            (navigationRef.navigate as any)('DealDetails', {
              dealId: data.deal_id
            });
          } else if (data?.business_id) {
            (navigationRef.navigate as any)('BusinessProfile', {
              businessId: data.business_id
            });
          }
        }
      };

      // Set up listeners
      notificationHandler.setupNotificationListeners({
        onNotificationReceived: handleNotificationReceived,
        onNotificationTapped: handleNotificationTapped,
      });

      // Check if app was launched by tapping a notification
      notificationHandler.getLastNotificationResponse().then((response) => {
        if (response) {
          handleNotificationTapped(response);
        }
      });
    });

    // Cleanup
    return () => {
      // if (!isExpoGo) {
        import('../services/notificationHandler').then(({ notificationHandler }) => {
          notificationHandler.removeNotificationListeners();
        });
      // }
    };
  }, [isAuthenticated, navigationRef, isExpoGo]);

  // Update badge count based on unread notifications
  useEffect(() => {
    if (!isAuthenticated /* || isExpoGo */) return;

    const updateBadgeCount = async () => {
      try {
        const notificationService = require('../services/api/notificationService').default;
        const count = await notificationService.getUnreadCount();

        const { notificationHandler } = await import('../services/notificationHandler');
        await notificationHandler.setBadgeCount(count);
      } catch (error) {
        logger.error('Error updating badge count:', error);
      }
    };

    updateBadgeCount();

    // Update badge count every minute
    const interval = setInterval(updateBadgeCount, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isExpoGo]);

  return <>{children}</>;
}
