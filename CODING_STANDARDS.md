# Slashhour Coding Standards & Patterns

**Version:** 1.0
**Last Updated:** October 14, 2025
**Status:** ✅ ACTIVE - Follow for ALL new features

---

## 📋 Table of Contents
1. [The Winning Pattern](#the-winning-pattern)
2. [Backend-First Verification](#backend-first-verification)
3. [Custom Hooks Pattern](#custom-hooks-pattern)
4. [Reusable Components](#reusable-components)
5. [Error Handling](#error-handling)
6. [Analytics & Tracking](#analytics--tracking)
7. [Type Safety](#type-safety)
8. [Clean Architecture](#clean-architecture)
9. [Early Bug Detection](#early-bug-detection)
10. [Loop Detection](#loop-detection)
11. [Code Organization](#code-organization)
12. [Testing Checklist](#testing-checklist)
13. [Commit Guidelines](#commit-guidelines)
14. [Common Pitfalls](#common-pitfalls)

---

## 🎯 The Winning Pattern

### Step-by-Step Workflow:

```mermaid
Backend Verification
    ↓
Check Database Schema
    ↓
Read Backend Entity
    ↓
Check snake_case vs camelCase
    ↓
Create/Update DTO (camelCase)
    ↓
Update Backend Service
    ↓
Create Frontend Types
    ↓
Create Custom Hook
    ↓
Create Reusable Components
    ↓
Create Screen
    ↓
Add Navigation
    ↓
TypeScript Check (0 errors)
    ↓
Test Backend Build
    ↓
Test API Endpoints
    ↓
Commit with Documentation
```

---

## 🔍 Backend-First Verification

### ✅ ALWAYS Start Here:

#### 1. Check Database Schema
```bash
PGPASSWORD='' psql -h localhost -U elw -d slashhour_dev -c "\d table_name"
```

**Why?**
- Ensures we know the ACTUAL field names
- Identifies snake_case fields early
- Prevents type mismatches

#### 2. Read Backend Entity
```typescript
// Example: user.entity.ts
@Column({ type: 'varchar', length: 100 })
name?: string;  // ← Note: snake_case or camelCase?

@Column({ type: 'decimal', precision: 10, scale: 2 })
original_price: number;  // ← Snake_case!
```

**Checklist:**
- [ ] Field names match database
- [ ] Identify snake_case fields
- [ ] Note nullable fields
- [ ] Check relationships (ManyToOne, etc.)

#### 3. Check Existing API Response
```bash
# Test the endpoint
curl http://localhost:3000/api/v1/endpoint
```

**Look for:**
- ❌ Snake_case in response → Need DTO transformation
- ✅ CamelCase in response → Already fixed
- ⚠️ Missing fields → Need to add

---

## 🎣 Custom Hooks Pattern

### Why Use Custom Hooks?
- ✅ Separate logic from UI
- ✅ Reusable across screens
- ✅ Easier to test
- ✅ Easier to maintain
- ✅ Single responsibility

### Template:
```typescript
// File: src/hooks/useFeatureName.ts

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api/ApiClient';
import { logError } from '../config/sentry';
import { YourType, YourResponse } from '../types/models';

interface UseFeatureNameReturn {
  data: YourType[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
  // Add more as needed
}

export const useFeatureName = (
  param1?: string,
  param2?: number
): UseFeatureNameReturn => {
  // State
  const [data, setData] = useState<YourType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch function
  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await apiClient.get<YourResponse>(
        `/endpoint?param1=${param1}&param2=${param2}`
      );

      setData(response.data);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load';
      setError(errorMessage);
      logError(err, { context: 'useFeatureName', param1, param2 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [param1, param2]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
};
```

### Hook Best Practices:
- ✅ Use `useCallback` for functions
- ✅ Use `useMemo` for expensive calculations
- ✅ Always handle errors with Sentry
- ✅ Separate loading and refreshing states
- ✅ Return clear interface
- ✅ Add TypeScript types
- ✅ Document parameters

---

## 🧩 Reusable Components

### Why Reusable Components?
- ✅ DRY (Don't Repeat Yourself)
- ✅ Consistent UI across app
- ✅ Easier to maintain
- ✅ Easier to test
- ✅ Can use in multiple screens

### Template:
```typescript
// File: src/components/FeatureCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { YourType } from '../types/models';

interface FeatureCardProps {
  item: YourType;
  onPress?: () => void;
  showBadge?: boolean;
}

export default function FeatureCard({ item, onPress, showBadge = false }: FeatureCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
```

### Component Best Practices:
- ✅ Clear prop interface
- ✅ Optional props with defaults
- ✅ Inline styles with StyleSheet
- ✅ TypeScript for all props
- ✅ Handle optional callbacks
- ✅ Export as default

---

## 🚨 Error Handling

### Sentry Integration (MUST USE):

#### 1. Import Sentry Functions:
```typescript
import { logError, addBreadcrumb } from '../config/sentry';
```

#### 2. In Try-Catch Blocks:
```typescript
try {
  // Your code
  const data = await apiClient.get('/endpoint');

} catch (err: any) {
  // Log to Sentry
  logError(err, {
    context: 'ComponentName',
    endpoint: '/endpoint',
    userId: user?.id,
  });

  // Show user-friendly message
  const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
  setError(errorMessage);
}
```

#### 3. Add Breadcrumbs for Debugging:
```typescript
// Before important actions
addBreadcrumb('User tapped redemption button', 'user-action', {
  dealId: deal.id,
  userId: user.id,
});
```

### Error State UI:
```typescript
const renderError = () => {
  if (!error) return null;

  return (
    <View style={styles.errorState}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## 📊 Analytics & Tracking

### Track EVERY User Action:

#### 1. Screen Views:
```typescript
import { trackScreenView } from '../../services/analytics';

useEffect(() => {
  trackScreenView('ScreenName');
}, []);
```

#### 2. User Events:
```typescript
import { trackEvent } from '../../services/analytics';

// Button clicks
const handleButtonClick = () => {
  trackEvent('button_clicked', {
    buttonName: 'redeem_deal',
    dealId: deal.id,
  });
  // ... rest of logic
};

// Form submissions
trackEvent('form_submitted', {
  formName: 'registration',
  userType: 'consumer',
});

// Feature usage
trackEvent('feature_used', {
  feature: 'redemption_history',
  itemCount: redemptions.length,
});
```

### What to Track:
- ✅ Every screen view
- ✅ Every button click
- ✅ Every API call result (success/fail)
- ✅ Every form submission
- ✅ Every navigation action
- ✅ Every error encountered

---

## 🔒 Type Safety

### TypeScript EVERYWHERE:

#### 1. No `any` Types (Unless Necessary):
```typescript
// ❌ BAD
const data: any = await fetchData();

// ✅ GOOD
const data: UserRedemption[] = await fetchData();
```

#### 2. Interface for Everything:
```typescript
// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Component Props
interface MyComponentProps {
  title: string;
  count: number;
  onPress: () => void;
  optional?: boolean;
}

// Hook Return
interface UseMyHookReturn {
  data: Data[];
  isLoading: boolean;
  error: string | null;
}
```

#### 3. Match Backend Types EXACTLY:
```typescript
// Backend returns camelCase:
{
  "totalSavings": 100,
  "monthlyRedemptions": 5
}

// Frontend type MUST match:
export interface UserStats {
  totalSavings: number;
  monthlyRedemptions: number;
}
```

---

## 🏗️ Clean Architecture

### Folder Structure:
```
slashhour-app/src/
├── config/
│   ├── sentry.ts           ← Error tracking setup
│   └── ...
├── hooks/
│   ├── useRedemptionHistory.ts
│   ├── useUserProfile.ts
│   └── ...                 ← Custom hooks here
├── components/
│   ├── RedemptionCard.tsx
│   ├── DealCard.tsx
│   └── ...                 ← Reusable components
├── screens/
│   ├── home/
│   │   ├── HomeScreen.tsx
│   │   ├── FeedScreen.tsx
│   │   └── NearYouScreen.tsx
│   ├── profile/
│   │   └── ProfileScreen.tsx
│   ├── redemption/
│   │   └── RedemptionHistoryScreen.tsx
│   └── ...                 ← Feature screens
├── services/
│   ├── api/
│   │   ├── ApiClient.ts
│   │   ├── authService.ts
│   │   └── ...             ← API services
│   └── analytics.ts        ← Analytics service
├── store/
│   └── slices/             ← Redux slices
├── types/
│   └── models.ts           ← TypeScript types
├── utils/
│   └── ...                 ← Helper functions
└── navigation/
    └── AppNavigator.tsx    ← Navigation setup
```

### Separation of Concerns:
- **Hooks** → Data fetching & business logic
- **Components** → UI presentation
- **Screens** → Orchestration & layout
- **Services** → API calls
- **Types** → TypeScript definitions
- **Utils** → Helper functions

---

## 🐛 Early Bug Detection

### 1. TypeScript Compilation Check:
```bash
# Run BEFORE committing
npx tsc --noEmit

# Should return 0 errors
```

### 2. Backend Build Check:
```bash
cd slashhour-api
npm run build

# Should build successfully
```

### 3. Runtime Checks:
```typescript
// Add console.logs during development
console.log('📊 Data fetched:', data);
console.log('⚠️ Error occurred:', error);
console.log('✅ Success:', result);

// Remove before production OR use:
if (__DEV__) {
  console.log('Debug info:', debugData);
}
```

### 4. Network Debugging:
```typescript
// Add response logging in ApiClient
console.log('API Request:', method, url);
console.log('API Response:', response.status, response.data);
```

---

## 🔁 Loop Detection

### Prevent Infinite Loops:

#### 1. useEffect Dependencies:
```typescript
// ❌ BAD - Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // userId not in deps!

// ✅ GOOD - All dependencies included
useEffect(() => {
  fetchData(userId);
}, [userId, fetchData]);
```

#### 2. useCallback Dependencies:
```typescript
// ❌ BAD - Will create new function on every render
const handleClick = () => {
  doSomething(data);
};

// ✅ GOOD - Memoized with dependencies
const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);
```

#### 3. Prevent State Update Loops:
```typescript
// ❌ BAD - Updates state in render
if (data.length > 0) {
  setProcessed(true); // ← Causes infinite loop!
}

// ✅ GOOD - Update in useEffect
useEffect(() => {
  if (data.length > 0) {
    setProcessed(true);
  }
}, [data]);
```

#### 4. API Call Loops:
```typescript
// ❌ BAD - Calls API on every render
const data = await fetchData();

// ✅ GOOD - Calls once on mount
useEffect(() => {
  const fetchData = async () => {
    const data = await apiClient.get('/endpoint');
    setData(data);
  };
  fetchData();
}, []);
```

---

## 📁 Code Organization

### File Naming:
- **Screens**: `FeatureNameScreen.tsx` (PascalCase + Screen suffix)
- **Components**: `ComponentName.tsx` (PascalCase)
- **Hooks**: `useHookName.ts` (camelCase + use prefix)
- **Services**: `serviceName.ts` (camelCase)
- **Types**: `models.ts` or `featureName.types.ts`

### Component Structure:
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export default function MyComponent({ title }: Props) {
  // 4. State
  const [data, setData] = useState([]);

  // 5. Effects
  useEffect(() => {
    // ...
  }, []);

  // 6. Handlers
  const handlePress = () => {
    // ...
  };

  // 7. Render helpers
  const renderItem = () => {
    // ...
  };

  // 8. Main render
  return (
    <View>
      {/* JSX */}
    </View>
  );
}

// 9. Styles
const styles = StyleSheet.create({
  // ...
});
```

---

## ✅ Testing Checklist

### Before Committing:

#### TypeScript:
- [ ] `npx tsc --noEmit` (mobile) → 0 errors
- [ ] `npm run build` (backend) → success

#### Functionality:
- [ ] Feature works as expected
- [ ] Loading states show properly
- [ ] Error states show properly
- [ ] Empty states show properly
- [ ] Navigation works
- [ ] Back button works

#### Edge Cases:
- [ ] Test with empty data
- [ ] Test with error response
- [ ] Test with slow network
- [ ] Test navigation flow

#### Code Quality:
- [ ] No console.logs (or only in __DEV__)
- [ ] No commented code
- [ ] No TODO comments
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Analytics tracking added

---

## 📝 Commit Guidelines

### Commit Message Format:
```
Title: Short description (50 chars max)

FEATURES:
- Feature 1
- Feature 2

CLEAN ARCHITECTURE:
✅ Custom Hooks - hookName()
✅ Reusable Components - ComponentName
✅ Error Handling - Sentry integration
✅ Type Safety - Strict TypeScript

BACKEND CHANGES:
- File 1: Description
- File 2: Description

FRONTEND CHANGES:
- File 1: Description
- File 2: Description

FILES CREATED:
- path/to/file1
- path/to/file2

FILES MODIFIED:
- path/to/file1
- path/to/file2

VERIFICATION:
✅ TypeScript: 0 errors
✅ Backend build: Success
✅ Tests: Passing

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## ⚠️ Common Pitfalls

### 1. Snake_case vs CamelCase Mismatch
```typescript
// Backend returns:
{ "original_price": 29.99 }

// ❌ Frontend expects:
interface Item {
  original_price: number; // Wrong!
}

// ✅ Should be:
interface Item {
  originalPrice: number; // Correct!
}

// Solution: Transform in backend service
```

### 2. Missing Null Checks
```typescript
// ❌ Will crash if user is null
<Text>{user.name}</Text>

// ✅ Safe
<Text>{user?.name || 'Guest'}</Text>
```

### 3. Not Handling Errors
```typescript
// ❌ No error handling
const data = await fetchData();

// ✅ With error handling
try {
  const data = await fetchData();
} catch (err) {
  logError(err, { context: 'fetchData' });
  setError('Failed to load');
}
```

### 4. Forgetting Analytics
```typescript
// ❌ No tracking
const handlePress = () => {
  doSomething();
};

// ✅ With tracking
const handlePress = () => {
  trackEvent('button_pressed', { button: 'submit' });
  doSomething();
};
```

### 5. Not Using Hooks
```typescript
// ❌ Logic in component
const [data, setData] = useState([]);
useEffect(() => {
  fetch('/api/data').then(setData);
}, []);

// ✅ Logic in hook
const { data, isLoading } = useMyData();
```

---

## 🎯 Quick Reference

### Starting New Feature:
1. ✅ Check backend database schema
2. ✅ Read backend entity
3. ✅ Check for snake_case fields
4. ✅ Create/update DTO (camelCase)
5. ✅ Update backend service
6. ✅ Create frontend types
7. ✅ Create custom hook
8. ✅ Create reusable component (if needed)
9. ✅ Create screen
10. ✅ Add navigation
11. ✅ Add analytics tracking
12. ✅ Add error handling
13. ✅ Test TypeScript compilation
14. ✅ Test backend build
15. ✅ Commit with documentation

### Code Quality Checklist:
- [ ] Custom hooks for logic
- [ ] Reusable components
- [ ] Error handling (Sentry)
- [ ] Analytics tracking
- [ ] TypeScript types
- [ ] No infinite loops
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Clear variable names
- [ ] Comments for complex logic

---

## 📚 Resources

- **Sentry Docs**: https://docs.sentry.io/
- **React Hooks**: https://react.dev/reference/react
- **TypeScript**: https://www.typescriptlang.org/docs/
- **React Native**: https://reactnative.dev/docs/getting-started

---

## 🔄 Updates

**This document will be updated as new patterns emerge.**

Last updated: October 14, 2025
Version: 1.0
