import { useState, useCallback } from 'react';
import { userService, UpdateProfileData } from '../services/api/userService';
import { logError } from '../config/sentry';
import { trackEvent, AnalyticsEvent } from '../services/analytics';
import * as ImagePicker from 'expo-image-picker';

interface UseProfileEditReturn {
  isUpdating: boolean;
  error: string | null;
  updateName: (name: string) => Promise<boolean>;
  pickAndUploadAvatar: () => Promise<string | null>;
}

export function useProfileEdit(): UseProfileEditReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateName = useCallback(async (name: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      if (__DEV__) {
        console.log('Updating name:', name);
      }

      await userService.updateProfile({ name });

      // Track analytics event
      trackEvent(AnalyticsEvent.BUSINESS_VIEWED, {
        action: 'name_updated',
      });

      return true;
    } catch (err: any) {
      console.error('Error updating name:', err);
      const errorMessage = err.message || 'Failed to update name';
      setError(errorMessage);
      logError(err, { context: 'useProfileEdit - updateName' });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const pickAndUploadAvatar = useCallback(async (): Promise<string | null> => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access photos is required');
        return null;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Allow any aspect ratio without forced cropping
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const imageUri = result.assets[0].uri;

      setIsUpdating(true);
      setError(null);

      if (__DEV__) {
        console.log('Uploading avatar');
      }

      const response = await userService.uploadAvatar(imageUri);

      // Track analytics event
      trackEvent(AnalyticsEvent.BUSINESS_VIEWED, {
        action: 'avatar_uploaded',
      });

      return response.user.avatar_url || null;
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      const errorMessage = err.message || 'Failed to upload avatar';
      setError(errorMessage);
      logError(err, { context: 'useProfileEdit - pickAndUploadAvatar' });
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    isUpdating,
    error,
    updateName,
    pickAndUploadAvatar,
  };
}
