import { createNavigationContainerRef, NavigationProp } from '@react-navigation/native';

// Create navigation reference that can be used outside of NavigationContainer
export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a screen from anywhere in the app
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

/**
 * Handle deep links from notifications
 * Parses action_url and navigates to the appropriate screen
 */
export function handleDeepLink(actionUrl: string, additionalData?: any) {
  if (!actionUrl) return;

  // Parse the action URL
  // Format: /deals/{dealId}, /businesses/{businessId}, etc.
  const urlParts = actionUrl.split('/').filter(Boolean);

  if (urlParts.length === 0) return;

  const [resource, id] = urlParts;

  switch (resource) {
    case 'deals':
      if (id) {
        // Navigate to DealDetails screen with dealId
        navigate('DealDetails', { dealId: id });
      }
      break;

    case 'businesses':
      if (id) {
        // Navigate to BusinessProfile screen
        navigate('BusinessProfile', {
          businessId: id,
          businessName: additionalData?.businessName
        });
      }
      break;

    // Add more cases as needed for other screens
    default:
      if (__DEV__) {
        console.warn('Unknown deep link resource:', resource);
      }
  }
}
