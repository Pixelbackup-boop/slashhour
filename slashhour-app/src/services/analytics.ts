import { addBreadcrumb } from '../config/sentry';

/**
 * Analytics event types
 */
export enum AnalyticsEvent {
  // Auth events
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',

  // Deal events
  DEAL_VIEWED = 'deal_viewed',
  DEAL_REDEEMED = 'deal_redeemed',
  DEAL_SAVED = 'deal_saved',
  DEAL_SHARED = 'deal_shared',

  // Business events
  BUSINESS_FOLLOWED = 'business_followed',
  BUSINESS_UNFOLLOWED = 'business_unfollowed',
  BUSINESS_VIEWED = 'business_viewed',

  // Feed events
  FEED_VIEWED = 'feed_viewed',
  TAB_SWITCHED = 'tab_switched',

  // Location events
  RADIUS_CHANGED = 'radius_changed',
  LOCATION_UPDATED = 'location_updated',

  // Search events
  SEARCH_PERFORMED = 'search_performed',
  CATEGORY_FILTERED = 'category_filtered',
}

/**
 * Track analytics event
 * In development, logs to console
 * In production, sends to analytics service
 */
export const trackEvent = (
  event: AnalyticsEvent,
  properties?: Record<string, any>
) => {
  const timestamp = new Date().toISOString();

  if (__DEV__) {
    console.log('📊 Analytics Event:', {
      event,
      properties,
      timestamp,
    });
  } else {
    // In production, send to your analytics service (e.g., Mixpanel, Amplitude)
    // For now, we'll use Sentry breadcrumbs for tracking
    addBreadcrumb(event, 'analytics', properties);

    // TODO: Integrate with analytics service
    // Example: Analytics.track(event, properties);
  }
};

/**
 * Track login event
 */
export const trackLogin = (method: 'email' | 'phone' | 'username') => {
  trackEvent(AnalyticsEvent.LOGIN, { method });
};

/**
 * Track logout event
 */
export const trackLogout = () => {
  trackEvent(AnalyticsEvent.LOGOUT);
};

/**
 * Track deal viewed
 */
export const trackDealViewed = (dealId: string, businessId: string, category: string) => {
  trackEvent(AnalyticsEvent.DEAL_VIEWED, {
    dealId,
    businessId,
    category,
  });
};

/**
 * Track deal redeemed
 */
export const trackDealRedeemed = (
  dealId: string,
  businessId: string,
  savingsAmount: number,
  category: string
) => {
  trackEvent(AnalyticsEvent.DEAL_REDEEMED, {
    dealId,
    businessId,
    savingsAmount,
    category,
  });
};

/**
 * Track business followed
 */
export const trackBusinessFollowed = (businessId: string, businessName: string, category: string) => {
  trackEvent(AnalyticsEvent.BUSINESS_FOLLOWED, {
    businessId,
    businessName,
    category,
  });
};

/**
 * Track business unfollowed
 */
export const trackBusinessUnfollowed = (businessId: string, businessName: string) => {
  trackEvent(AnalyticsEvent.BUSINESS_UNFOLLOWED, {
    businessId,
    businessName,
  });
};

/**
 * Track feed viewed
 */
export const trackFeedViewed = (feedType: 'you_follow' | 'near_you', dealsCount: number) => {
  trackEvent(AnalyticsEvent.FEED_VIEWED, {
    feedType,
    dealsCount,
  });
};

/**
 * Track tab switched
 */
export const trackTabSwitched = (fromTab: string, toTab: string) => {
  trackEvent(AnalyticsEvent.TAB_SWITCHED, {
    fromTab,
    toTab,
  });
};

/**
 * Track radius changed
 */
export const trackRadiusChanged = (newRadius: number, previousRadius: number) => {
  trackEvent(AnalyticsEvent.RADIUS_CHANGED, {
    newRadius,
    previousRadius,
  });
};

/**
 * Track search performed
 */
export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent(AnalyticsEvent.SEARCH_PERFORMED, {
    query,
    resultsCount,
  });
};

/**
 * Track category filter
 */
export const trackCategoryFilter = (category: string, dealsCount: number) => {
  trackEvent(AnalyticsEvent.CATEGORY_FILTERED, {
    category,
    dealsCount,
  });
};

/**
 * Track screen view
 */
export const trackScreenView = (screenName: string, params?: Record<string, any>) => {
  if (__DEV__) {
    if (params) {
      console.log('📱 Screen View:', screenName, params);
    } else {
      console.log('📱 Screen View:', screenName);
    }
  } else {
    addBreadcrumb(`Screen: ${screenName}`, 'navigation', params);
  }
};

/**
 * Set user properties for analytics
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (__DEV__) {
    console.log('👤 User Properties:', properties);
  } else {
    // TODO: Set user properties in analytics service
    // Example: Analytics.setUserProperties(properties);
  }
};

export default {
  trackEvent,
  trackLogin,
  trackLogout,
  trackDealViewed,
  trackDealRedeemed,
  trackBusinessFollowed,
  trackBusinessUnfollowed,
  trackFeedViewed,
  trackTabSwitched,
  trackRadiusChanged,
  trackSearch,
  trackCategoryFilter,
  trackScreenView,
  setUserProperties,
};
