/**
 * Deep Linking Configuration
 * Handles both app scheme (slashhour://) and web URLs (https://slashhour.com)
 * Following React Navigation 2025 best practices
 */

import { LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';

/**
 * Extract deal ID from SEO-friendly URL
 * Format: slashhour.com/deals/50-off-pizza-margherita-joes-pizzeria-new-york-{uuid}
 * The last segments form the UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 */
function extractDealIdFromSlug(slug: string): string | null {
  if (!slug) return null;

  // UUID format: 8-4-4-4-12 characters separated by hyphens
  // Match the UUID at the end of the slug
  const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
  const match = slug.match(uuidRegex);

  if (match) {
    return match[1];
  }

  // Fallback: if no UUID pattern found, return null
  return null;
}

/**
 * Extract business ID from SEO-friendly URL
 * Format: slashhour.com/businesses/joes-pizzeria-new-york-{uuid}
 */
function extractBusinessIdFromSlug(slug: string): string | null {
  if (!slug) return null;

  // UUID format: 8-4-4-4-12 characters separated by hyphens
  const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
  const match = slug.match(uuidRegex);

  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Linking configuration for React Navigation
 * Maps URLs to screens
 */
export const linking: LinkingOptions<any> = {
  prefixes: [
    'slashhour://',
    'https://slashhour.com',
    'https://www.slashhour.com',
  ],

  config: {
    screens: {
      // Auth screens (not authenticated)
      Login: 'login',
      SignUp: 'signup',

      // Main app (authenticated)
      MainTabs: {
        screens: {
          Home: {
            screens: {
              HomeScreen: '',
              DealDetail: 'deals/:dealId',
              DealDetails: 'deals/:dealId',
              BusinessProfile: 'businesses/:businessId',
            },
          },
          Search: {
            screens: {
              SearchScreen: 'search',
              DealDetail: 'deals/:dealId',
              DealDetails: 'deals/:dealId',
              BusinessProfile: 'businesses/:businessId',
            },
          },
          Notifications: {
            screens: {
              NotificationsScreen: 'notifications',
              DealDetail: 'deals/:dealId',
              DealDetails: 'deals/:dealId',
              BusinessProfile: 'businesses/:businessId',
            },
          },
          Inbox: {
            screens: {
              InboxScreen: 'inbox',
              Chat: 'chat/:conversationId',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'profile',
              Settings: 'settings',
              DealDetail: 'deals/:dealId',
              DealDetails: 'deals/:dealId',
              BusinessProfile: 'businesses/:businessId',
            },
          },
        },
      },
    },
  },

  // Custom function to parse URLs
  async getInitialURL() {
    // First, check if the app was opened from a deep link
    const url = await Linking.getInitialURL();

    if (url != null) {
      return url;
    }

    // Handle notification-related links if needed
    // This is where you'd check for notification deeplinks

    return null;
  },

  // Subscribe to URL changes (when app is already open)
  subscribe(listener) {
    // Listen for deep links when app is already open
    const onReceiveURL = ({ url }: { url: string }) => {
      listener(url);
    };

    // Listen to incoming links from deep linking
    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      subscription.remove();
    };
  },

  // Custom getStateFromPath to handle SEO-friendly URLs
  getStateFromPath(path, config) {
    // Handle SEO-friendly deal URLs
    // Example: /deals/50-off-pizza-margherita-joes-pizzeria-new-york-abc123
    const dealMatch = path.match(/^\/deals\/(.+)$/);
    if (dealMatch) {
      const slug = dealMatch[1];
      const dealId = extractDealIdFromSlug(slug);

      if (dealId) {
        // Navigate to DealDetail screen
        return {
          routes: [
            {
              name: 'MainTabs',
              state: {
                routes: [
                  {
                    name: 'Home',
                    state: {
                      routes: [
                        { name: 'HomeScreen' },
                        {
                          name: 'DealDetails',
                          params: { dealId },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        };
      }
    }

    // Handle SEO-friendly business URLs
    // Example: /businesses/joes-pizzeria-new-york-abc123
    const businessMatch = path.match(/^\/businesses\/(.+)$/);
    if (businessMatch) {
      const slug = businessMatch[1];
      const businessId = extractBusinessIdFromSlug(slug);

      if (businessId) {
        // Navigate to BusinessProfile screen
        return {
          routes: [
            {
              name: 'MainTabs',
              state: {
                routes: [
                  {
                    name: 'Home',
                    state: {
                      routes: [
                        { name: 'HomeScreen' },
                        {
                          name: 'BusinessProfile',
                          params: { businessId },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        };
      }
    }

    // For all other paths, use default behavior
    // This will use the config defined above
    return undefined; // Let React Navigation handle it
  },
};
