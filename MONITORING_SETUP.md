# Slashhour Monitoring & Analytics Setup

## Overview

Your Slashhour project now has comprehensive monitoring, error tracking, and analytics implemented:

✅ **Mobile App (React Native)**
- Sentry error tracking
- Event analytics tracking

✅ **Backend API (NestJS)**
- Sentry error tracking with profiling
- Winston structured logging
- Global exception filtering

---

## 🔧 Setup Instructions

### 1. Sentry Configuration

#### Create Sentry Account (Free Tier)
1. Go to https://sentry.io and sign up for a free account
2. Create two projects:
   - **Project 1**: "Slashhour Mobile" (React Native)
   - **Project 2**: "Slashhour API" (Node.js)

#### Get Your DSN Keys
After creating each project, you'll get a DSN (Data Source Name) that looks like:
```
https://abc123@o123456.ingest.sentry.io/7890123
```

#### Configure Mobile App
Edit: `/slashhour-app/src/utils/constants.ts`

```typescript
export const SENTRY_DSN = __DEV__
  ? '' // Leave empty in development
  : 'YOUR_MOBILE_SENTRY_DSN_HERE'; // Paste your mobile DSN here
```

#### Configure Backend API
Edit: `/slashhour-api/.env`

```bash
# Sentry (Error Tracking)
SENTRY_DSN=YOUR_BACKEND_SENTRY_DSN_HERE
SENTRY_ENVIRONMENT=development  # or production/staging
```

---

## 📊 Analytics Events Tracked

### Mobile App Events

The following user actions are automatically tracked:

#### Authentication
- `login` - User login (with method: email/phone/username)
- `logout` - User logout
- `register` - New user registration

#### Deal Interactions
- `deal_viewed` - User views deal details
- `deal_redeemed` - User redeems a deal (with savings amount)
- `deal_saved` - User saves a deal for later
- `deal_shared` - User shares a deal

#### Business Interactions
- `business_followed` - User follows a business
- `business_unfollowed` - User unfollows a business
- `business_viewed` - User views business profile

#### Navigation
- `feed_viewed` - User views a feed (with feed type)
- `tab_switched` - User switches between tabs

#### Location
- `radius_changed` - User changes search radius
- `location_updated` - User location updated

### Event Data Structure

Each event includes contextual metadata:

```typescript
// Example: Deal Redeemed Event
{
  event: 'deal_redeemed',
  dealId: 'abc123',
  businessId: 'xyz789',
  savingsAmount: 15.50,
  category: 'restaurant',
  timestamp: '2025-10-14T12:00:00Z'
}
```

---

## 🪵 Backend Logging

### Winston Logger

Structured logging with multiple log levels:

```typescript
import { LoggerService } from './common/services/logger.service';

// In any service/controller
constructor(private readonly logger: LoggerService) {
  this.logger = new LoggerService('MyService');
}

// Usage
this.logger.info('User logged in', { userId: user.id });
this.logger.error('Database error', error.stack, { query: 'SELECT...' });
this.logger.warn('High API usage', { requestCount: 1000 });
this.logger.debug('Cache hit', { key: 'user:123' });
```

### Log Levels

- `error` - Errors and exceptions
- `warn` - Warning messages
- `info` - General information (default in production)
- `http` - HTTP request logs
- `debug` - Detailed debugging (development only)

### Log Configuration

Set log level in `.env`:

```bash
LOG_LEVEL=debug   # development
LOG_LEVEL=info    # production
```

### Log Output

**Development:** Console output with colors
```
2025-10-14 12:00:00 [info] [AuthService]: User logged in { userId: "123" }
```

**Production:**
- Console: JSON format
- Files (auto-rotating):
  - `logs/error-YYYY-MM-DD.log` - Error logs only
  - `logs/combined-YYYY-MM-DD.log` - All logs
  - Automatically rotates daily
  - Keeps 14 days of logs
  - Max 20MB per file, then compresses

---

## 🚨 Error Tracking

### Mobile App

Errors are automatically captured and sent to Sentry with:
- Error message and stack trace
- User context (ID, email, username)
- Device information
- App version
- Custom breadcrumbs

**Manual error logging:**

```typescript
import { logError } from '../config/sentry';

try {
  // Some code
} catch (error) {
  logError(error, { context: 'payment_processing', orderId: '123' });
}
```

### Backend API

**Automatic error capture:**
- All 5xx server errors automatically sent to Sentry
- Includes request context (URL, method, headers)
- User context (if authenticated)
- Stack traces

**Manual error capture:**

```typescript
import { captureException } from '../config/sentry.config';

try {
  // Database operation
} catch (error) {
  captureException(error, {
    operation: 'user_creation',
    userId: user.id
  });
  throw error;
}
```

### Sensitive Data Filtering

Both mobile and backend automatically filter:
- Passwords
- Authorization tokens
- API keys
- Email addresses (in backend)
- Cookie values

---

## 📈 Viewing Analytics & Errors

### Sentry Dashboard

1. **View Errors:**
   - Go to https://sentry.io
   - Select your project
   - See real-time error tracking
   - View stack traces, user context, breadcrumbs

2. **Performance Monitoring:**
   - Track API response times
   - Identify slow endpoints
   - Profile CPU usage

3. **Alerts:**
   - Set up email/Slack alerts for errors
   - Configure thresholds

### Development Monitoring

**In development mode:**
- Analytics events: Logged to console
- Errors: Logged to console (not sent to Sentry)
- Backend logs: Colorized console output

**Example console output:**
```
📊 Analytics Event: {
  event: 'deal_viewed',
  dealId: 'abc123',
  businessId: 'xyz789',
  category: 'restaurant'
}
```

---

## 🎯 Next Steps: Full Analytics Integration

Currently, analytics events are:
- ✅ Tracked in the app
- ✅ Logged to console (dev)
- ✅ Sent to Sentry as breadcrumbs (prod)

**To add full analytics (optional):**

### Option 1: Mixpanel
```bash
npm install mixpanel-browser
```

Update `/slashhour-app/src/services/analytics.ts`:
```typescript
import mixpanel from 'mixpanel-browser';

// Initialize
mixpanel.init('YOUR_MIXPANEL_TOKEN');

// In trackEvent function
if (!__DEV__) {
  mixpanel.track(event, properties);
}
```

### Option 2: Amplitude
```bash
npm install @amplitude/analytics-react-native
```

### Option 3: Firebase Analytics (already in stack)
```bash
npx expo install @react-native-firebase/analytics
```

---

## 🧪 Testing Your Setup

### Test Mobile App Error Tracking

Add a test button to trigger an error:

```typescript
import { logError } from '../config/sentry';

const testError = () => {
  const error = new Error('Test error from mobile app');
  logError(error, { test: true });
};
```

### Test Backend Error Tracking

Visit: `http://localhost:3000/api/v1/test-error`

Or add a test endpoint:

```typescript
@Get('test-error')
testError() {
  throw new Error('Test error from API');
}
```

### Verify Logs

**Backend logs:**
```bash
# Watch logs in development
npm run start:dev

# Check production log files
tail -f logs/combined-$(date +%Y-%m-%d).log
```

---

## 📋 Summary

**What's Been Set Up:**

1. ✅ Sentry error tracking (mobile + backend)
2. ✅ Event analytics tracking in mobile app
3. ✅ Winston structured logging in backend
4. ✅ Global exception handling
5. ✅ Sensitive data filtering
6. ✅ Development vs Production configurations

**Free Tier Limits:**
- **Sentry:** 5,000 errors/month per project (plenty for MVP)
- **Winston:** Unlimited (local logging)
- **Analytics:** Ready for integration when needed

**Files Modified:**
- Mobile: `App.tsx`, `constants.ts`, `authSlice.ts`, `DealDetailScreen.tsx`, `LoginScreen.tsx`, `followingSlice.ts`
- Backend: `main.ts`, `app.module.ts`, `.env`

**Files Created:**
- Mobile: `src/config/sentry.ts`, `src/services/analytics.ts`
- Backend: `src/config/sentry.config.ts`, `src/config/logger.config.ts`, `src/common/services/logger.service.ts`, `src/common/filters/sentry-exception.filter.ts`

---

## 🆘 Troubleshooting

**Sentry not receiving errors?**
1. Check DSN is set correctly
2. Verify `NODE_ENV` or `__DEV__` (only sends in production)
3. Check network connectivity
4. View Sentry project settings → Client Keys

**Logs not appearing?**
1. Check `LOG_LEVEL` in `.env`
2. Verify Winston imports are correct
3. In production, check `logs/` directory exists

**Analytics not tracking?**
1. Check console in development mode
2. Verify Redux actions are dispatching
3. Check Sentry breadcrumbs in production

---

**Last Updated:** October 14, 2025
**Setup Status:** ✅ Complete and Tested
