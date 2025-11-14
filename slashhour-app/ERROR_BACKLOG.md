# Error Backlog & Resolution Tracking
**Last Updated:** 2025-11-15
**Project:** Slashhour App
**Based on:** 2025 React Native Best Practices

---

## 🔴 CRITICAL ERRORS (Must Fix)

### 1. Firebase Cloud Messaging Not Initialized
**Severity:** Critical
**Frequency:** Every app startup
**Status:** ✅ Fixed

**Error:**
```
Error registering for push notifications: Default FirebaseApp is not initialized in this process com.anonymous.slashhourapp. Make sure to call FirebaseApp.initializeApp(Context) first.
```

**Impact:**
- Push notifications completely broken
- Users cannot receive deal alerts, messages, or any notifications

**Root Cause:**
- Firebase not properly initialized in Android app
- Missing `google-services.json` or improper Firebase setup

**2025 Best Practice Solution:**
1. **Download google-services.json** from Firebase Console
2. **Place in:** `android/app/google-services.json`
3. **Install packages:**
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native
   ```
4. **Initialize in App.tsx:**
   ```typescript
   import messaging from '@react-native-firebase/messaging';
   import notifee from '@notifee/react-native';

   // Request permission on iOS
   async function requestUserPermission() {
     const authStatus = await messaging().requestPermission();
     const enabled =
       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
     return enabled;
   }

   // Fetch and store FCM token
   async function getFCMToken() {
     const token = await messaging().getToken();
     // Store token in backend for user
     await saveTokenToBackend(token);
   }
   ```

5. **Handle all app states:**
   ```typescript
   // Foreground messages
   messaging().onMessage(async remoteMessage => {
     await notifee.displayNotification({
       title: remoteMessage.notification?.title,
       body: remoteMessage.notification?.body,
     });
   });

   // Background/Quit state messages
   messaging().setBackgroundMessageHandler(async remoteMessage => {
     console.log('Background message:', remoteMessage);
   });
   ```

**References:**
- https://rnfirebase.io/messaging/usage
- https://medium.com/@chotuengineer/firebase-cloud-messaging-fcm-push-notifications-in-react-native-android-2025-guide-bf875cf074fb
- https://notifee.app/react-native/docs/integrations/fcm/

**Files to Update:**
- `android/app/google-services.json` (add)
- `src/App.tsx` or `src/index.tsx`
- `src/services/notifications/` (create service)

---

### 2. Deal Redemption Failing (400 Error)
**Severity:** Critical
**Frequency:** Intermittent
**Status:** ✅ Fixed

**Error:**
```
Failed to redeem deal: [AxiosError: Request failed with status code 400]
Context: useDealDetail
Deal ID: 67553735-f3a2-417a-965f-c7395ff30b17
```

**Impact:**
- Users cannot redeem deals
- Core business functionality broken
- Revenue impact

**Root Cause:**
- Actual error was 401 Unauthorized (expired JWT token) - discovered via backend testing
- Frontend only showed generic "status code 400" errors
- No user-friendly error messages

**2025 Best Practice Solution - IMPLEMENTED:**
1. **Added comprehensive error handling in `useDealDetail.ts`:**
   - Switch-case for all HTTP status codes (400, 401, 403, 404, 409, 410, 422, 429, 500s)
   - User-friendly error titles and messages for each scenario
   - Detailed logging with context using Sentry
   - Specific handling for:
     - 400: Invalid Request
     - 401: Session Expired (most common - expired token)
     - 403: Not Authorized
     - 404: Deal Not Found
     - 409: Already Redeemed / Out of Stock
     - 410: Deal Expired
     - 422: Cannot Redeem
     - 429: Too Many Attempts (rate limit)
     - 500-504: Server Errors

2. **Example of implemented error handling:**
   ```typescript
   switch (statusCode) {
     case 401:
       errorTitle = 'Session Expired';
       errorMessage = 'Your session has expired. Please log in again.';
       break;
     case 409:
       errorTitle = 'Already Redeemed';
       errorMessage = errorData?.message || 'You have already redeemed this deal or it is out of stock.';
       break;
     // ... all other cases
   }

   Alert.alert(errorTitle, errorMessage);

   logError(error, {
     context: 'useDealDetail.handleRedeem',
     dealId: deal.id,
     businessId: deal.business?.id,
     statusCode,
     errorMessage: errorData?.message
   });
   ```

**References:**
- https://codezup.com/react-native-error-handling-guide-best-practices/
- https://docs.expo.dev/router/error-handling/

**Files Fixed:**
- `src/hooks/useDealDetail.ts` (lines 90-179)

---

## ⚠️ HIGH PRIORITY WARNINGS (Should Fix)

### 3. Reanimated Transform Warning
**Severity:** High
**Frequency:** Very frequent
**Status:** ✅ Fixed

**Warning:**
```
[Reanimated] Property "transform" of AnimatedComponent(View) may be overwritten by a layout animation. Please wrap your component with an animated view and apply the layout animation on the wrapper.
```

**Impact:**
- Visual glitches in animations
- Performance degradation
- User experience affected

**Root Cause:**
- Applying both `transform` styles and layout animations on same component
- Reanimated limitation

**2025 Best Practice Solution:**
Wrap animated components - separate layout animation from transform:

```typescript
// ❌ BEFORE (Wrong):
<Animated.View
  style={{ transform: [{ scale: 0.85 }] }}
  entering={FadeInDown}
>
  {content}
</Animated.View>

// ✅ AFTER (Correct):
<Animated.View entering={FadeInDown}>
  <Animated.View style={{ transform: [{ scale: 0.85 }] }}>
    {content}
  </Animated.View>
</Animated.View>
```

**Files to Fix:**
- `src/components/FeedDealCard.tsx` (multiple instances)
- `src/components/ShopDealCard.tsx`
- `src/screens/feed/FeedScreen.tsx`
- Any component using `FadeInDown` + `transform`

**References:**
- https://github.com/software-mansion/react-native-reanimated/issues/2975
- https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/

---

### 4. Missing Icons in Icon Map
**Severity:** Medium
**Frequency:** Frequent
**Status:** ✅ Fixed

**Warnings:**
```
[Icon] Icon "arrow-up-from-bracket" not found in ICON_MAP
[Icon] Icon "document-text" not found in ICON_MAP
```

**Impact:**
- Icons not displaying (fallback to null)
- User confusion
- UI inconsistency

**Root Cause:**
- Icons referenced that don't exist in ICON_MAP
- Using icon names from different icon libraries

**Solution:**
1. **Find all missing icons:**
   ```bash
   grep -r "arrow-up-from-bracket" src/
   grep -r "document-text" src/
   ```

2. **Add to Icon.tsx or replace with valid icons:**
   ```typescript
   // Add to ICON_MAP in src/components/icons/Icon.tsx
   const ICON_MAP = {
     // ... existing icons
     'document-text': { outline: 'document-text-outline', filled: 'document-text' },
     // For share, use existing 'share' icon instead of arrow-up-from-bracket
   };
   ```

3. **Or use Ionicons names directly:**
   - arrow-up-from-bracket → share-outline (iOS style) or share-social-outline
   - document-text → document-text-outline

**Files to Fix:**
- `src/components/icons/Icon.tsx` (update ICON_MAP)
- Search and replace invalid icon names

---

### 5. Deprecated expo-image resizeMode Prop
**Severity:** Medium
**Frequency:** Occasional
**Status:** ✅ Fixed

**Warning:**
```
[expo-image]: Prop "resizeMode" is deprecated, use "contentFit" instead
```

**Impact:**
- Future breaking change
- Performance not optimized
- Deprecation warnings

**2025 Best Practice Solution:**
Replace all `resizeMode` with `contentFit`:

```typescript
// ❌ OLD:
<Image
  source={imageUrl}
  resizeMode="cover"
/>

// ✅ NEW (2025):
<Image
  source={imageUrl}
  contentFit="cover"
  placeholder={blurhash} // Also add placeholders
  transition={200}
/>
```

**Files to Fix:**
- Search all files for `resizeMode`
- `src/components/ImageCarousel.tsx`
- Any component using `<Image>` from expo-image

**References:**
- https://docs.expo.dev/versions/latest/sdk/image/

---

### 6. setLayoutAnimationEnabledExperimental Warning
**Severity:** Low
**Frequency:** Every app startup
**Status:** ❌ Not Fixed

**Warning:**
```
setLayoutAnimationEnabledExperimental is currently a no-op in the New Architecture.
```

**Impact:**
- No functional impact (informational only)
- Clutter in logs

**Solution:**
Remove or conditionally call based on New Architecture:

```typescript
import { Platform, UIManager } from 'react-native';

// Only enable on Old Architecture
if (Platform.OS === 'android' && !global?.nativeFabricUIManager) {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
```

**Files to Check:**
- `src/App.tsx` or entry point files

---

### 7. Socket Connection Race Condition
**Severity:** Medium
**Frequency:** Occasional
**Status:** ✅ Fixed

**Warning:**
```
⚠️ Socket not connected, cannot join conversation
```

**Impact:**
- Chat messages may fail to send
- Real-time updates delayed
- User experience degraded

**Root Cause:**
- Attempting to join conversation before socket connected
- Race condition in useChat/useSocket hooks

**2025 Best Practice Solution:**
Add connection state checking:

```typescript
const joinConversation = async (conversationId: string) => {
  // Wait for socket to connect first
  if (!socket?.connected) {
    console.warn('Waiting for socket connection...');
    await new Promise((resolve) => {
      socket?.once('connect', resolve);
      // Timeout after 5 seconds
      setTimeout(resolve, 5000);
    });
  }

  if (!socket?.connected) {
    throw new Error('Failed to connect to chat server');
  }

  socket.emit('joinConversation', { conversationId });
};
```

**Files to Fix:**
- `src/hooks/useChat.tsx`
- `src/hooks/useSocket.tsx`

---

## 📊 PERFORMANCE OPTIMIZATIONS (2025 Best Practices)

### 1. FlatList Optimization
**Current:** Default configuration
**Recommended:**

```typescript
<FlatList
  data={deals}
  renderItem={renderDealCard}
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={6}
  updateCellsBatchingPeriod={50}
  // Memoize render function
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout} // If fixed height
/>
```

**Files to Update:**
- `src/screens/feed/FeedScreen.tsx`
- `src/screens/bookmarks/BookmarksScreen.tsx`
- Any screen with FlatList

---

### 2. Image Optimization
**Current:** Using Image component
**2025 Recommendation:** Use expo-image with optimization

```typescript
import { Image } from 'expo-image';

<Image
  source={imageUrl}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  priority="high" // For above-fold images
/>
```

Convert images to WebP format where possible.

**Files to Update:**
- All components using images

---

### 3. Code Splitting & Lazy Loading
**Recommended:** Lazy load non-critical screens

```typescript
import { lazy, Suspense } from 'react';

const BusinessAnalyticsScreen = lazy(() =>
  import('./screens/business/BusinessAnalyticsScreen')
);

// In navigation:
<Suspense fallback={<LoadingScreen />}>
  <BusinessAnalyticsScreen />
</Suspense>
```

---

### 4. Memoization
**Current:** Some memoization
**Recommended:** Comprehensive memoization

```typescript
// Memoize expensive computations
const sortedDeals = useMemo(() =>
  deals.sort((a, b) => b.discount_percentage - a.discount_percentage),
  [deals]
);

// Memoize callbacks
const handleDealPress = useCallback((dealId: string) => {
  navigation.navigate('DealDetail', { dealId });
}, [navigation]);

// Memoize components
const DealCard = React.memo(DealCardComponent);
```

---

## 🎯 ERROR TRACKING SETUP (2025 Best Practice)

### Install Sentry
```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

### Initialize:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  enableNative: true,
});
```

### Add Error Boundaries:
```typescript
import { ErrorBoundary } from '@sentry/react-native';

<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

---

## 📝 PRIORITY ORDER

1. **CRITICAL (All Completed):**
   - ✅ Fix Firebase push notifications (Error #1)
   - ✅ Fix deal redemption error handling (Error #2)

2. **HIGH PRIORITY (All Completed):**
   - ✅ Fix Reanimated transform warnings (Warning #3)
   - ✅ Add missing icons to Icon map (Warning #4)

3. **MEDIUM PRIORITY (All Completed):**
   - ✅ Update expo-image props (Warning #5)
   - ✅ Fix socket connection race condition (Warning #7)

4. **LOW PRIORITY:**
   - ⏸️ Remove setLayoutAnimationEnabledExperimental (Warning #6) - No functional impact

5. **PERFORMANCE (Recommended Next):**
   - Implement FlatList optimizations
   - Add image optimization
   - Add code splitting
   - Add comprehensive memoization

6. **MONITORING:**
   - Set up Sentry error tracking
   - Add performance monitoring
   - Implement analytics for errors

---

## 📚 Resources & References

### 2025 Best Practices:
- [React Native Performance Guide 2025](https://baltech.in/blog/react-native-performance-optimization-best-practices/)
- [Expo Best Practices for Reducing Lag](https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps)
- [React Native Error Handling Guide](https://codezup.com/react-native-error-handling-guide-best-practices/)
- [Firebase Cloud Messaging 2025 Guide](https://medium.com/@chotuengineer/firebase-cloud-messaging-fcm-push-notifications-in-react-native-android-2025-guide-bf875cf074fb)

### Official Documentation:
- [Expo Error Handling](https://docs.expo.dev/router/error-handling/)
- [React Native Firebase](https://rnfirebase.io/)
- [Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [Notifee for Notifications](https://notifee.app/react-native/docs/integrations/fcm/)

---

## 🔄 Update Log

| Date | Fix | Status | Notes |
|------|-----|--------|-------|
| 2025-11-15 | Created backlog | ✅ | Initial comprehensive audit |
| 2025-11-15 | Fixed share bug | ✅ | Added defensive coding for savings_amount |
| 2025-11-15 | Firebase push notifications | ✅ | Switched to Expo push tokens |
| 2025-11-15 | Reanimated transform warnings | ✅ | Applied wrapper pattern in all card components |
| 2025-11-15 | Missing icons | ✅ | Added document-text and arrow-left to ICON_MAP |
| 2025-11-15 | expo-image resizeMode | ✅ | Updated to contentFit in NotificationsScreen |
| 2025-11-15 | Socket connection race condition | ✅ | Added async wait for connection in joinConversation |
| 2025-11-15 | Deal redemption error handling | ✅ | Comprehensive HTTP status code handling with user-friendly messages |
| 2025-11-15 | Share button visibility | ✅ | Moved share button to top action bar, always visible next to bookmark |
| 2025-11-15 | Share TypeError (toFixed) | ✅ | Changed to parseFloat() with multi-layer fallbacks for savings_amount |
| 2025-11-15 | Share discount percentage 0% bug | ✅ | Calculate discount from prices when deal.discount_percentage missing/0 |
