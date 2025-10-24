# Slashhour Coding Standards & Patterns

**Version:** 1.1
**Last Updated:** October 15, 2025
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
15. [Dependency Management & 2025 Best Practices](#-dependency-management--2025-best-practices)

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

## 🎓 TypeScript 2025 Best Practices

### Our Codebase Audit Results (January 2025):

**Overall Grade: C+**
- React Native App: B-
- NestJS API: D+

**Critical Issues Found:**
- ❌ NestJS API has strict mode DISABLED
- ❌ 100+ uses of `any` type in React Native app
- ❌ 12+ uses of `any` type in NestJS API
- ❌ Type assertions (`as any`) instead of type guards
- ❌ Missing discriminated unions for API responses

**Good Practices Found:**
- ✅ Consistent snake_case usage (avoiding transformation bugs)
- ✅ React Native app has strict mode enabled
- ✅ Good utility types usage (Partial, Omit, Record)
- ✅ Proper literal union types for status fields

---

### ✅ 1. Strict Mode (MUST HAVE)

**Why It Matters:**
Strict mode catches bugs at compile time instead of runtime. It's the #1 TypeScript best practice for 2025.

**Best Practice:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Our Status:**
- ✅ React Native app: `"strict": true` enabled
- ❌ NestJS API: Missing `"strict": true` - **CRITICAL FIX NEEDED**

**Action Required:**
Add to `slashhour-api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

---

### ✅ 2. Use `unknown` Over `any` (Type Safety)

**Why It Matters:**
`any` disables ALL type checking. `unknown` forces you to check types before using values.

**❌ BAD - Found 100+ times in our codebase:**
```typescript
function processData(data: any) {
  return data.value; // No type safety! Runtime error if data.value doesn't exist
}

// Real example from our code:
const handleError = (error: any) => {
  console.error(error.message); // What if error is null?
};
```

**✅ GOOD - 2025 way:**
```typescript
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: string }).value);
  }
  throw new Error('Invalid data');
}

// Better error handling:
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else if (typeof error === 'string') {
    console.error(error);
  } else {
    console.error('Unknown error occurred');
  }
};
```

**Our Violations:**
```typescript
// slashhour-app/src/hooks/useEditDeal.ts:266
catch (err: any) {  // ❌ Should be: catch (err: unknown)
  if (err.message) {
    errorMessage = err.message;
  }
}

// slashhour-api/src/deals/deals.service.ts:73
async createWithMultipart(userId: string, businessId: string, body: any, files: Express.Multer.File[]) {
  // ❌ body should be typed, not any
}
```

**Fix Examples:**
```typescript
// BEFORE (BAD):
catch (err: any) {
  console.error(err.message);
}

// AFTER (GOOD):
catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error('Unknown error:', err);
  }
}
```

---

### ✅ 3. Avoid Type Assertions (Use Type Guards)

**Why It Matters:**
Type assertions (`as any`, `as User`) bypass TypeScript's type checking and can cause runtime errors.

**❌ BAD - Found 10+ times in our codebase:**
```typescript
const user = data as User; // Unsafe! What if data isn't a User?

// Real example from our code:
const category = formData.category as BusinessCategory;
```

**✅ GOOD - Use Type Guards:**
```typescript
// Create a type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    'username' in data
  );
}

// Use it safely
if (isUser(data)) {
  console.log(data.email); // Type-safe!
} else {
  throw new Error('Invalid user data');
}
```

**Create Type Guards for Common Types:**
```typescript
// slashhour-app/src/types/guards.ts (NEW FILE to create)
export function isBusinessCategory(value: unknown): value is BusinessCategory {
  const validCategories = ['food', 'shopping', 'services', 'entertainment'];
  return typeof value === 'string' && validCategories.includes(value);
}

export function isDeal(data: unknown): data is Deal {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data &&
    'original_price' in data &&
    'discounted_price' in data
  );
}

export function isApiError(error: unknown): error is { message: string; status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error
  );
}
```

---

### ✅ 4. Discriminated Unions (Pattern Matching)

**Why It Matters:**
TypeScript can narrow types automatically when you use discriminated unions.

**❌ BAD - Current in our codebase:**
```typescript
// Current ApiResponse allows invalid states:
interface ApiResponse<T> {
  success: boolean;
  data?: T;      // Can be undefined even when success is true!
  error?: string; // Can be undefined even when success is false!
}

// This is INVALID but TypeScript allows it:
const response: ApiResponse<User> = {
  success: true,
  // Missing data! Runtime error waiting to happen
};
```

**✅ GOOD - 2025 way:**
```typescript
// Discriminated union - success determines which properties exist
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; message?: string };

// TypeScript enforces correctness:
function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    // TypeScript KNOWS data exists here
    return response.data;
  } else {
    // TypeScript KNOWS error exists here
    throw new Error(response.error);
  }
}

// This would fail to compile (good!):
const invalid: ApiResponse<User> = {
  success: true,
  // Error: Property 'data' is missing
};
```

**Action Required:**
Update `slashhour-app/src/types/models.ts` and `slashhour-api/src/common/interfaces/api-response.interface.ts`

---

### ✅ 5. Advanced Utility Types

**Why It Matters:**
Utility types help you derive new types from existing ones, maintaining type safety.

**Common Utility Types:**
```typescript
// Partial - Make all properties optional
type PartialUser = Partial<User>;
// Use for: Update operations where not all fields are required

// Pick - Select specific properties
type UserCredentials = Pick<User, 'email' | 'password'>;
// Use for: Login forms, DTOs

// Omit - Exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;
// Use for: API responses

// Required - Make all properties required
type RequiredConfig = Required<AppConfig>;
// Use for: Validation

// Record - Create object type with specific keys
type UserMap = Record<string, User>;
// Use for: Dictionaries, caches

// ReturnType - Extract return type
type ApiResult = ReturnType<typeof apiClient.getUser>;
// Use for: Type inference from functions
```

**Our Usage (Good!):**
```typescript
// slashhour-app/src/hooks/useEditDeal.ts
interface EditDealFormData {
  // ... fields
}

// In dealService.ts
export interface UpdateDealData extends Partial<CreateDealData> {
  imageUris?: string[];
}
// ✅ Good use of Partial for updates
```

**More Examples:**
```typescript
// Extract specific fields for a form
type DealFormData = Pick<Deal, 'title' | 'description' | 'original_price' | 'discounted_price'>;

// Omit sensitive data from API response
type PublicUser = Omit<User, 'password' | 'refresh_token'>;

// Create a map of deals by ID
type DealCache = Record<string, Deal>;
```

---

### ✅ 6. Template Literal Types (2025 Feature)

**Why It Matters:**
Enforce specific string patterns at compile time.

**Best Practice:**
```typescript
// Enforce specific string patterns
type DealStatus = 'pending' | 'active' | 'expired' | 'sold_out';
type DealId = `deal_${string}`;
type UserId = `user_${string}`;
type ApiRoute = `/api/v1/${string}`;

// Template literal types for type safety
function getDeal(id: DealId): Promise<Deal> {
  // TypeScript ensures id follows the pattern
  return fetch(`/api/deals/${id}`);
}

// ✅ Valid
getDeal('deal_123');

// ❌ Compile error
getDeal('123'); // Type '"123"' is not assignable to type '`deal_${string}`'
```

**Our Current Usage (Good!):**
```typescript
// slashhour-app/src/types/models.ts
export type DealStatus = 'pending' | 'active' | 'expired' | 'sold_out';
export type BusinessCategory = 'food' | 'shopping' | 'services' | 'entertainment';
// ✅ Good use of literal types
```

**Enhancement Opportunity:**
```typescript
// Add template literal types for IDs:
type UUID = `${string}-${string}-${string}-${string}-${string}`;
type DealId = UUID;
type BusinessId = UUID;

// Enforce in function signatures:
async function getDealById(id: DealId): Promise<Deal> {
  // ...
}
```

---

### ✅ 7. Type Inference (Let TypeScript Work)

**Why It Matters:**
Over-annotating reduces readability and makes refactoring harder.

**❌ BAD - Over-annotating:**
```typescript
const name: string = "John"; // Redundant
const age: number = 25; // Redundant
const active: boolean = true; // Redundant
const users: User[] = await getUsers(); // Redundant if getUsers() is properly typed
```

**✅ GOOD - Leverage inference:**
```typescript
const name = "John"; // TypeScript infers string
const age = 25; // TypeScript infers number
const active = true; // TypeScript infers boolean
const users = await getUsers(); // Inferred from function return type

// Only annotate when necessary:
const data: User[] = []; // Good - can't infer empty array type
const result: ApiResponse<Deal> = await api.post(...); // Good - helps with generic types

// Annotate function parameters (required):
function processUser(user: User, options: ProcessOptions) {
  // ...
}

// Annotate function return types (best practice):
async function fetchDeals(): Promise<Deal[]> {
  // ...
}
```

**When to Annotate:**
1. ✅ Function parameters (always)
2. ✅ Function return types (best practice)
3. ✅ Empty arrays/objects
4. ✅ Complex generic types
5. ❌ Variable assignments where type is obvious

---

### 🔧 TypeScript Error Patterns in Our Codebase

#### Error Pattern 1: Type Inference Failure
**Symptom:**
```
Type '{ url: string; order: number; }[]' is not assignable to type 'never[]'
```

**Root Cause:**
```typescript
// TypeScript infers this as never[]
let existingImages = [];
existingImages.push({ url: 'test.jpg', order: 0 }); // ❌ Error!
```

**Fix:**
```typescript
// Add explicit type annotation
let existingImages: Array<{ url: string; order: number }> = [];
existingImages.push({ url: 'test.jpg', order: 0 }); // ✅ Works!
```

**Real Example from Our Code:**
```typescript
// slashhour-api/src/deals/deals.service.ts:277-278 (BEFORE FIX)
let existingImages = [];  // ❌ Inferred as never[]
let newImages = [];       // ❌ Inferred as never[]

// AFTER FIX:
let existingImages: Array<{ url: string; order: number }> = [];
let newImages: Array<{ url: string; order: number }> = [];
```

#### Error Pattern 2: Property Access on `any`
**Symptom:**
No compile error, but runtime error: `Cannot read property 'x' of undefined`

**Root Cause:**
```typescript
function handleData(data: any) {
  console.log(data.user.name); // No compile error, but crashes if data.user is undefined
}
```

**Fix:**
```typescript
function handleData(data: unknown) {
  if (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof data.user === 'object' &&
    data.user !== null &&
    'name' in data.user
  ) {
    console.log(data.user.name); // Type-safe!
  }
}

// Or use optional chaining with proper typing:
interface DataWithUser {
  user?: {
    name: string;
  };
}

function handleData(data: DataWithUser) {
  console.log(data.user?.name); // Type-safe with optional chaining
}
```

---

### 📊 TypeScript Best Practices Checklist

#### Before Writing Code:
- [ ] Is `"strict": true` enabled in tsconfig.json?
- [ ] Have I read the TypeScript section of TYPESCRIPT_NEXTJS_2025_BEST_PRACTICES.md?

#### While Writing Code:
- [ ] Am I using `unknown` instead of `any` for error handling?
- [ ] Am I using `unknown` for uncertain external data?
- [ ] Are my function parameters properly typed?
- [ ] Are my function return types explicitly defined?
- [ ] Am I using type guards instead of type assertions?
- [ ] Am I using utility types (Partial, Pick, Omit) where appropriate?
- [ ] Are my empty arrays/objects explicitly typed?
- [ ] Am I avoiding over-annotation where TypeScript can infer?

#### Before Committing:
- [ ] Run `npx tsc --noEmit` to check for type errors
- [ ] Search for `any` in files I modified - can they be `unknown`?
- [ ] Search for `as any` or `as Type` - can I use type guards instead?
- [ ] Are all new API response types using discriminated unions?
- [ ] Have I created type guards for new complex types?

#### Code Review Checklist:
- [ ] No new `any` types introduced (use `unknown`)
- [ ] No type assertions without justification
- [ ] All functions have return type annotations
- [ ] All error handling uses proper type guards
- [ ] API responses use discriminated unions
- [ ] Complex validations use type guard functions

---

### 🎯 Priority Actions for Our Codebase

#### HIGH PRIORITY (Do First):
1. ❌ **Enable strict mode in NestJS API**
   - Add `"strict": true` to `slashhour-api/tsconfig.json`
   - Fix compilation errors that arise

2. ❌ **Replace `any` with `unknown` in error handling**
   - Search for `catch (err: any)` → replace with `catch (err: unknown)`
   - Add proper type guards in catch blocks

3. ❌ **Update ApiResponse to discriminated union**
   - Update all API response interfaces
   - Ensures compile-time safety for API responses

#### MEDIUM PRIORITY:
4. ❌ **Create type guards file**
   - `slashhour-app/src/types/guards.ts`
   - Add guards for: User, Deal, Business, Category

5. ❌ **Replace type assertions with type guards**
   - Search for `as User`, `as Deal`, etc.
   - Replace with proper type guard checks

6. ❌ **Add return type annotations to all functions**
   - Especially async functions
   - Makes refactoring safer

#### LOW PRIORITY:
7. Template literal types for IDs
8. More comprehensive use of utility types
9. Stricter tsconfig options (noUncheckedIndexedAccess, etc.)

---

### 📚 TypeScript 2025 References

- [TypeScript 2025 Best Practices](https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Guards and Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- Our internal doc: `TYPESCRIPT_NEXTJS_2025_BEST_PRACTICES.md`

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

## 📦 Dependency Management & 2025 Best Practices

### When to Research Latest Versions:

#### 🚨 Triggers for Dependency Updates:
1. **Deprecation warnings** in console
2. **Performance issues** (slow uploads, laggy UI)
3. **Error messages** mentioning outdated APIs
4. **Security vulnerabilities** in dependencies
5. **New features needed** that old versions don't support
6. **Build failures** due to compatibility issues

### Research Process:

#### Step 1: Identify the Problem
```bash
# Example symptoms:
# - "Module X is deprecated"
# - "Slow image upload (3-5 seconds)"
# - "Location API not working on Android 14+"
```

#### Step 2: Web Search for Latest Solutions
**Search Pattern:**
```
"[package-name] 2025 latest stable version"
"[feature-name] React Native Expo 2025 best practice"
"[problem] React Native 2025 solution"
```

**Example Searches:**
- ✅ "image upload React Native Expo 2025 best practice"
- ✅ "location services Expo 2025 native dialog"
- ✅ "FormData file upload Expo 2025"

#### Step 3: Check Official Documentation
1. **Expo Docs**: https://docs.expo.dev/
2. **React Native Docs**: https://reactnative.dev/
3. **NPM Registry**: https://www.npmjs.com/package/[package-name]
4. **GitHub Releases**: Check latest releases and changelogs

#### Step 4: Verify Compatibility
```bash
# Check current versions
npm list [package-name]

# Check available versions
npm view [package-name] versions --json

# Check latest version info
npm view [package-name] time
```

### Real-World Examples from Our Codebase:

#### Example 1: Image Upload Modernization (October 2025)

**Problem:**
```typescript
// OLD METHOD (deprecated, slow)
const base64 = await FileSystem.readAsStringAsync(uri, {
  encoding: FileSystem.EncodingType.Base64,
});
// 3-5 seconds for 5 images, 33% larger payload
```

**Research:** Searched "image upload Expo 2025 best practice"

**Solution Found:**
```typescript
// NEW METHOD (2025 best practice)
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

const file = new File(uri);
formData.append('images', file);
// < 1 second upload, binary streaming, 67% smaller payload
```

**Key Changes:**
- ✅ Used `expo-file-system` File class (native-like)
- ✅ Used `expo/fetch` polyfill (supports File objects)
- ✅ Multipart/form-data instead of base64 JSON
- ✅ Server-side image processing

**Performance Improvement:**
- Upload time: 3-5s → < 1s (5x faster)
- Payload size: 133% → 100% (33% reduction)
- Memory usage: Lower peak usage

#### Example 2: Location Services (October 2025)

**Problem:**
```typescript
// OLD METHOD (poor UX)
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  // User has to manually go to Settings
  Alert.alert('Please enable location in Settings');
}
```

**Research:** Searched "location services Expo 2025 native dialog Android"

**Solution Found:**
```typescript
// NEW METHOD (2025 Expo feature)
import * as Location from 'expo-location';

// Shows native "Turn on location?" dialog (like Google Maps)
await Location.enableNetworkProviderAsync();

// One-tap enable, no Settings navigation needed
```

**Key Changes:**
- ✅ Used `Location.enableNetworkProviderAsync()` (Expo 2025)
- ✅ Native Android dialog (better UX)
- ✅ One-tap location enable
- ✅ Same experience as Instagram/Uber

**UX Improvement:**
- User flow: 3 steps → 1 tap
- Conversion rate: Significantly higher
- Native system integration

### Dependency Update Checklist:

#### Before Updating:
- [ ] Search for "package-name 2025 best practice"
- [ ] Check official Expo/React Native docs
- [ ] Read changelog and breaking changes
- [ ] Check compatibility with current dependencies
- [ ] Look for migration guides

#### During Update:
```bash
# 1. Update package
npm install [package-name]@latest

# or for Expo packages
npx expo install [package-name]

# 2. Check for peer dependency issues
npm install

# 3. Update TypeScript types if needed
npm install --save-dev @types/[package-name]@latest
```

#### After Update:
- [ ] Test TypeScript compilation: `npx tsc --noEmit`
- [ ] Test backend build: `npm run build`
- [ ] Run the app and test affected features
- [ ] Check for console warnings
- [ ] Update code to use new APIs (if needed)
- [ ] Remove deprecated code
- [ ] Update documentation

### Package-Specific Guidelines:

#### Expo Packages:
```bash
# ALWAYS use expo install for Expo packages
npx expo install expo-file-system
npx expo install expo-location
npx expo install expo-image-picker

# This ensures compatibility with your Expo SDK version
```

#### React Native Packages:
```bash
# Check compatibility with React Native version
npm info [package-name] peerDependencies

# Install compatible version
npm install [package-name]@[compatible-version]
```

### Common Modernization Patterns:

#### 1. File Operations
- ❌ Old: Base64 string conversion
- ✅ New: `File` class from `expo-file-system`

#### 2. Network Requests
- ❌ Old: `fetch()` (doesn't support File)
- ✅ New: `expo/fetch` (supports File + streaming)

#### 3. Location Services
- ❌ Old: Manual Settings navigation
- ✅ New: `Location.enableNetworkProviderAsync()`

#### 4. Image Uploads
- ❌ Old: JSON with base64 strings
- ✅ New: `multipart/form-data` with File objects

#### 5. Form Handling
- ❌ Old: Manual FormData construction
- ✅ New: Utility functions (e.g., `buildDealFormData()`)

### Warning Signs of Outdated Code:

```typescript
// 🚨 Red flags that indicate outdated approaches:

// 1. Base64 conversion for file uploads
FileSystem.readAsStringAsync(uri, { encoding: 'base64' })

// 2. Manual Settings navigation for permissions
Linking.openSettings()

// 3. Deprecated APIs with warnings
somePackage.oldMethod() // ⚠️ Deprecated warning in console

// 4. Performance issues (slow, laggy, high memory)

// 5. Compatibility issues with latest OS versions

// 6. Security vulnerabilities in npm audit
```

### Best Practices:

1. **Stay Current**: Review dependencies quarterly
2. **Security First**: Run `npm audit` regularly
3. **Test Thoroughly**: Test on both iOS and Android
4. **Read Changelogs**: Understand breaking changes
5. **Use LTS Versions**: Prefer stable over bleeding edge
6. **Document Changes**: Update CODING_STANDARDS.md
7. **Backwards Compatibility**: Support older devices when possible
8. **Performance Metrics**: Measure before/after improvements

### Resources for 2025 Best Practices:

- **Expo Blog**: https://blog.expo.dev/ (New features & best practices)
- **React Native Blog**: https://reactnative.dev/blog
- **NPM Trends**: https://npmtrends.com/ (Compare package popularity)
- **Can I Use**: https://caniuse.com/ (Browser/platform compatibility)
- **Expo SDK Changelog**: https://github.com/expo/expo/blob/main/CHANGELOG.md

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

### Version History:
- **v1.1** (October 15, 2025): Added Dependency Management & 2025 Best Practices
- **v1.0** (October 14, 2025): Initial version with core coding standards

Last updated: October 15, 2025
Version: 1.1
