/**
 * Location error codes for consistent error handling
 */
export const LocationErrorCode = {
  SERVICES_DISABLED: 'LOCATION_SERVICES_DISABLED',
  PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  TIMEOUT: 'LOCATION_TIMEOUT',
  GENERIC_ERROR: 'LOCATION_ERROR',
} as const;

/**
 * User-friendly error messages for location issues
 */
export const LocationErrorMessage = {
  SERVICES_DISABLED: 'Location services are required to see nearby deals. Please enable them in your device settings.',
  PERMISSION_DENIED: 'Location permission is required to discover deals near you. Please grant permission in your device settings.',
  TIMEOUT: 'Could not find your location. Please make sure you have good GPS signal and try again.',
  GENERIC_ERROR: 'Unable to get your location. Please check your location settings and try again.',
} as const;

/**
 * Check if an error is an expected user action (not a real error)
 * @param error Error object or message
 * @returns True if this is expected user behavior
 */
export function isLocationUserAction(error: any): boolean {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    errorMessage === LocationErrorCode.SERVICES_DISABLED ||
    errorMessage === LocationErrorCode.PERMISSION_DENIED ||
    errorMessage === LocationErrorCode.TIMEOUT ||
    errorMessage?.includes('Location services are required') ||
    errorMessage?.includes('Location permission is required') ||
    errorMessage?.includes('Could not find your location')
  );
}
