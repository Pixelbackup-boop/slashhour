# Code Refactoring Status - Clean Architecture Pattern

**Last Updated:** October 14, 2025

## Overview
This document tracks which screens/components follow the clean architecture pattern from CODING_STANDARDS.md (hooks, reusable components, error handling, analytics).

---

## ✅ Fully Refactored Screens

### 1. HomeScreen (44 lines) ✅
**Status:** COMPLETE
- **Components Used:** AppHeader, TabBar
- **Pattern:** Orchestration → Reusable UI
- **Benefits:** Reduced from 115 to 44 lines, removed 80+ lines of duplicate styles
- **Location:** `src/screens/home/HomeScreen.tsx`

### 2. ProfileScreen (290 lines) ✅
**Status:** COMPLETE
- **Hook:** `useUserProfile` - Manages stats fetching, loading, error states
- **Components Used:** StatCard, InfoRow
- **Error Handling:** ✅ Sentry integration
- **Analytics:** ✅ Screen view tracking
- **Benefits:** Reduced from 369 to 290 lines, extracted reusable components
- **Location:** `src/screens/profile/ProfileScreen.tsx`

### 3. RedemptionHistoryScreen ✅
**Status:** COMPLETE
- **Hook:** `useRedemptionHistory` - Manages history fetching, pagination, refresh
- **Components Used:** RedemptionCard
- **Error Handling:** ✅ Sentry integration
- **Analytics:** ✅ Screen view tracking
- **Pattern:** Logic (hook) → Orchestration (screen) → UI (components)
- **Location:** `src/screens/redemption/RedemptionHistoryScreen.tsx`

---

## ⚠️ Screens Needing Refactoring

### 1. DealDetailScreen (449 lines) 🔴 HIGH PRIORITY
**Status:** NEEDS REFACTORING
**Current Issues:**
- ❌ No custom hook (all logic in component)
- ❌ No Sentry error logging
- ✅ Analytics tracking (dealViewed, dealRedeemed)
- ❌ Multiple state management directly in component
- ❌ Complex calculation logic (time remaining, savings)
- ❌ No reusable components extracted

**Refactoring Plan:**
1. Create `useDealDetail` hook:
   - Time remaining calculation
   - Deal redemption logic
   - Error handling with Sentry
   - Loading states
2. Extract reusable components:
   - `PriceCard` - Original/deal price display
   - `CountdownBox` - Time remaining display
   - `StockBar` - Availability progress bar
   - `TermsList` - Terms & conditions display
3. Benefits:
   - Reduce from 449 to ~250 lines
   - Reusable components for other deal screens
   - Better testability

**Location:** `src/screens/deal/DealDetailScreen.tsx`

---

### 2. NearYouScreen (316 lines) 🟡 MEDIUM PRIORITY
**Status:** NEEDS REFACTORING
**Current Issues:**
- ❌ No custom hook (all logic in component)
- ❌ No Sentry error logging
- ❌ No analytics tracking
- ❌ Complex location permission logic in component
- ❌ API fetching directly in component
- ❌ Multiple state variables (deals, loading, error, location, radius)

**Refactoring Plan:**
1. Create `useNearbyDeals` hook:
   - Location permission handling
   - GPS location fetching
   - Nearby deals API call
   - Radius management
   - Error handling with Sentry
   - Loading/refresh states
2. Add analytics:
   - Track screen view
   - Track radius changes
   - Track location permission status
3. Consider extracting:
   - `RadiusSelector` component
   - `LocationErrorState` component
4. Benefits:
   - Reduce from 316 to ~200 lines
   - Reusable location logic
   - Better error handling

**Location:** `src/screens/home/NearYouScreen.tsx`

---

### 3. FeedScreen (184 lines) 🟡 MEDIUM PRIORITY
**Status:** NEEDS REFACTORING
**Current Issues:**
- ❌ No custom hook (all logic in component)
- ❌ No Sentry error logging
- ❌ No analytics tracking
- ❌ API fetching directly in component
- ❌ Multiple state variables (deals, loading, error, refreshing)

**Refactoring Plan:**
1. Create `useFeed` hook:
   - Feed data fetching
   - Pagination logic
   - Refresh functionality
   - Error handling with Sentry
   - Loading states
2. Add analytics:
   - Track screen view
   - Track refresh actions
   - Track deal impressions
3. Consider extracting:
   - `EmptyState` component (reusable)
   - `ErrorState` component (reusable)
4. Benefits:
   - Reduce from 184 to ~120 lines
   - Hook can be reused for other feed types
   - Consistent error handling

**Location:** `src/screens/home/FeedScreen.tsx`

---

### 4. LoginScreen (173 lines) 🟢 LOW PRIORITY
**Status:** NEEDS MINOR REFACTORING
**Current Issues:**
- ❌ No custom hook (login logic in component)
- ❌ No Sentry error logging
- ✅ Analytics tracking (login events)
- ✅ Redux integration (good pattern)
- ❌ Form validation in component

**Refactoring Plan:**
1. Create `useLogin` hook:
   - Form validation
   - Login API call
   - Error handling with Sentry
   - Redux dispatch abstraction
2. Extract reusable components (optional):
   - `FormInput` component
   - `PrimaryButton` component
3. Benefits:
   - Reduce from 173 to ~130 lines
   - Testable login logic
   - Reusable form components

**Location:** `src/screens/auth/LoginScreen.tsx`

---

## 📊 Statistics

### Overall Progress
- **Total Screens:** 7
- **Refactored:** 3 (43%)
- **Pending:** 4 (57%)

### Lines of Code Impact
| Screen | Before | After (Estimated) | Savings |
|--------|--------|-------------------|---------|
| HomeScreen | 115 | 44 | -71 lines ✅ |
| ProfileScreen | 369 | 290 | -79 lines ✅ |
| RedemptionHistory | N/A | N/A | Clean from start ✅ |
| DealDetailScreen | 449 | ~250 | -199 lines 🔴 |
| NearYouScreen | 316 | ~200 | -116 lines 🟡 |
| FeedScreen | 184 | ~120 | -64 lines 🟡 |
| LoginScreen | 173 | ~130 | -43 lines 🟢 |
| **Total Potential Savings** | | | **-572 lines** |

### Custom Hooks Created
- ✅ `useUserProfile` - Profile stats fetching
- ✅ `useRedemptionHistory` - Redemption history with pagination
- ⏳ `useDealDetail` - Deal details and redemption
- ⏳ `useNearbyDeals` - Location-based deals
- ⏳ `useFeed` - Following feed
- ⏳ `useLogin` - Authentication logic

### Reusable Components Created
- ✅ `AppHeader` - Branded header with profile button
- ✅ `TabBar` - Generic tab navigation
- ✅ `StatCard` - Statistics display
- ✅ `InfoRow` - Label-value pairs
- ✅ `RedemptionCard` - Redemption history item
- ⏳ `PriceCard` - Price comparison display
- ⏳ `CountdownBox` - Time remaining
- ⏳ `StockBar` - Availability indicator
- ⏳ `EmptyState` - Generic empty state
- ⏳ `ErrorState` - Generic error state

---

## 🎯 Recommended Refactoring Order

### Phase 1: Critical Refactoring
1. **DealDetailScreen** - Largest file, most complexity
   - Estimated time: 2-3 hours
   - Impact: High (449 → ~250 lines)

### Phase 2: Medium Priority
2. **NearYouScreen** - Complex location logic
   - Estimated time: 1-2 hours
   - Impact: Medium (316 → ~200 lines)

3. **FeedScreen** - Similar pattern to NearYouScreen
   - Estimated time: 1 hour
   - Impact: Medium (184 → ~120 lines)

### Phase 3: Polish
4. **LoginScreen** - Minor improvements
   - Estimated time: 30 minutes
   - Impact: Low (173 → ~130 lines)

---

## 📋 Checklist for Each Refactoring

Before starting any refactoring, ensure you:
- [ ] Read CODING_STANDARDS.md
- [ ] Identify all API calls to extract into hooks
- [ ] Identify all calculations/logic to move to hooks
- [ ] Identify reusable UI patterns for components
- [ ] Add Sentry error logging
- [ ] Add analytics tracking
- [ ] Test TypeScript compilation
- [ ] Test functionality
- [ ] Commit with detailed message

---

## 🚀 Benefits of Complete Refactoring

When all screens are refactored:
- **~572 fewer lines** of duplicate/complex code
- **Consistent architecture** across entire app
- **Better testability** - hooks can be tested independently
- **Reusable components** - faster future development
- **Better error handling** - Sentry integration everywhere
- **Better analytics** - track user behavior consistently
- **Easier onboarding** - new developers see consistent patterns
- **Maintainability** - changes isolated to hooks/components
