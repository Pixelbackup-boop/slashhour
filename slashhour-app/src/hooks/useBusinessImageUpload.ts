import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Sentry from '@sentry/react-native';
import { businessService } from '../services/api/businessService';
import { trackEvent, AnalyticsEvent } from '../services/analytics';

interface UseBusinessImageUploadReturn {
  isUploading: boolean;
  error: string | null;
  uploadLogo: (businessId: string) => Promise<string | null>;
  uploadCover: (businessId: string) => Promise<string | null>;
}

/**
 * Custom hook for uploading business logo and cover images
 * Follows Instagram-style inline editing pattern
 */
export function useBusinessImageUpload(): UseBusinessImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadLogo = useCallback(async (businessId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);

      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('Permission to access camera roll is required');
        trackEvent(AnalyticsEvent.BUSINESS_LOGO_UPLOAD_PERMISSION_DENIED, { businessId });
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Allow any aspect ratio without forced cropping
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      // Upload to server
      const response = await businessService.uploadLogo(businessId, result.assets[0].uri);

      trackEvent(AnalyticsEvent.BUSINESS_LOGO_UPLOADED, {
        businessId,
        imageSize: result.assets[0].fileSize,
      });

      return response.business.logo_url || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
      setError(errorMessage);
      Sentry.captureException(err, {
        tags: { feature: 'business_logo_upload' },
        extra: { businessId },
      });
      trackEvent(AnalyticsEvent.BUSINESS_LOGO_UPLOAD_FAILED, {
        businessId,
        error: errorMessage,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadCover = useCallback(async (businessId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);

      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('Permission to access camera roll is required');
        trackEvent(AnalyticsEvent.BUSINESS_COVER_UPLOAD_PERMISSION_DENIED, { businessId });
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Allow any aspect ratio without forced cropping
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      // Upload to server
      const response = await businessService.uploadCover(businessId, result.assets[0].uri);

      trackEvent(AnalyticsEvent.BUSINESS_COVER_UPLOADED, {
        businessId,
        imageSize: result.assets[0].fileSize,
      });

      return response.business.cover_image_url || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload cover image';
      setError(errorMessage);
      Sentry.captureException(err, {
        tags: { feature: 'business_cover_upload' },
        extra: { businessId },
      });
      trackEvent(AnalyticsEvent.BUSINESS_COVER_UPLOAD_FAILED, {
        businessId,
        error: errorMessage,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    error,
    uploadLogo,
    uploadCover,
  };
}
