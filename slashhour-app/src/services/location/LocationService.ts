import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { LocationErrorCode } from './locationConstants';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * LocationService handles GPS location capture and permissions
 * Uses native dialogs to prompt users to enable location services and grant permissions
 */
class LocationService {
  /**
   * Request location permissions from the user
   * @returns Permission status
   */
  async requestPermissions(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('Error requesting location permissions:', error);
      }
      throw new Error('Failed to request location permissions');
    }
  }

  /**
   * Check if location permissions are already granted
   * @returns Permission status
   */
  async checkPermissions(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('Error checking location permissions:', error);
      }
      throw new Error('Failed to check location permissions');
    }
  }

  /**
   * Check if location services are enabled on the device
   * @returns True if location services are enabled
   */
  async isLocationServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      if (__DEV__) {
        console.error('Error checking location services:', error);
      }
      return false;
    }
  }

  /**
   * Prompt user to enable location services with native dialog (Android only)
   * On Android: Shows native "Turn on location?" dialog
   * On iOS: Location services are handled automatically by the permission request
   * @returns True if location services were enabled
   */
  async promptToEnableLocationServices(): Promise<boolean> {
    try {
      // On Android, show native dialog to enable location services
      if (Platform.OS === 'android') {
        if (__DEV__) {
          console.log('📍 Prompting user to enable location services (Android)...');
        }
        await Location.enableNetworkProviderAsync();
        if (__DEV__) {
          console.log('✅ Location services enabled');
        }
        return true;
      }

      // On iOS, check if services are enabled (iOS handles this automatically)
      return await this.isLocationServicesEnabled();
    } catch (error: any) {
      // User declined - this is expected behavior, not an error
      if (__DEV__) {
        console.log('ℹ️ User declined to enable location services');
      }
      return false;
    }
  }

  /**
   * Get current GPS coordinates with high accuracy
   * Uses native dialogs to prompt user if location services are disabled or permissions not granted
   * @returns Current location coordinates
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    try {
      // Step 1: Check if location services are enabled
      const servicesEnabled = await this.isLocationServicesEnabled();

      if (!servicesEnabled) {
        // Show native dialog to enable location services
        if (__DEV__) {
          console.log('📍 Location services disabled, prompting user...');
        }
        const enabled = await this.promptToEnableLocationServices();

        if (!enabled) {
          throw new Error(LocationErrorCode.SERVICES_DISABLED);
        }
      }

      // Step 2: Check permissions
      let permissions = await this.checkPermissions();

      if (!permissions.granted) {
        // Show native permission dialog
        if (__DEV__) {
          console.log('📍 Requesting location permissions...');
        }
        permissions = await this.requestPermissions();

        if (!permissions.granted) {
          throw new Error(LocationErrorCode.PERMISSION_DENIED);
        }
      }

      if (__DEV__) {
        console.log('📍 Getting current location with high accuracy...');
      }

      // Step 3: Get location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 0,
      });

      if (__DEV__) {
        console.log('✅ Location obtained:', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy,
        });
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error: any) {
      // Check if this is an expected user action vs actual error
      const isExpectedUserAction =
        error.message === LocationErrorCode.SERVICES_DISABLED ||
        error.message === LocationErrorCode.PERMISSION_DENIED ||
        error.message?.toLowerCase().includes('timeout');

      if (!isExpectedUserAction && __DEV__) {
        // Only log unexpected errors in development
        console.error('❌ Error getting current location:', error);
      }

      // Re-throw with specific error codes for better handling
      if (error.message === LocationErrorCode.SERVICES_DISABLED) {
        throw error;
      }

      if (error.message === LocationErrorCode.PERMISSION_DENIED) {
        throw error;
      }

      if (error.message?.toLowerCase().includes('timeout')) {
        throw new Error(LocationErrorCode.TIMEOUT);
      }

      if (error.message?.toLowerCase().includes('permission')) {
        throw new Error(LocationErrorCode.PERMISSION_DENIED);
      }

      // Generic error for other cases
      throw new Error(LocationErrorCode.GENERIC_ERROR);
    }
  }

  /**
   * Get last known location (faster but may be less accurate)
   * @returns Last known location coordinates
   */
  async getLastKnownLocation(): Promise<LocationCoordinates | null> {
    try {
      const permissions = await this.checkPermissions();

      if (!permissions.granted) {
        return null;
      }

      const location = await Location.getLastKnownPositionAsync();

      if (!location) {
        return null;
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting last known location:', error);
      }
      return null;
    }
  }
}

export default new LocationService();
