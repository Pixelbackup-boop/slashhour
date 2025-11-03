# Code Structure Review & Recommendations

## Executive Summary

Your codebase is **already well-structured** with 23+ custom hooks and good separation of concerns. However, there are opportunities to:
1. Extract repeated navigation patterns into a custom hook
2. Create reusable keyboard handling hook
3. Improve testability by isolating business logic
4. Add utility functions for common operations

---

## Current Strengths ✅

### 1. Custom Hooks Architecture
- **23 custom hooks** found in `src/hooks/`
- Good separation of concerns (business logic separated from UI)
- Proper use of `useCallback` for memoization
- Type-safe return values

**Examples:**
- `useSearch.ts` - Search functionality with filters
- `useNearbyDeals.ts` - Location-based deal fetching
- `useFeed.ts` - Feed data management
- `useBusinessProfile.ts` - Business profile data

### 2. Component Structure
- Consistent use of FlashList for performance
- Dynamic theming with `useTheme()` hook
- Memoized callbacks for event handlers
- SafeAreaView for proper spacing

### 3. Type Safety
- Proper TypeScript interfaces
- Type-safe navigation
- Model types defined in `types/models.ts`

---

## Identified Issues & Recommendations 🔧

### 1. **CRITICAL: Repeated Navigation Logic**

**Issue:** Same navigation callbacks repeated across 3+ screens

**Current Code (Repeated):**
```typescript
// FeedScreen.tsx, SearchScreen.tsx, NearYouScreen.tsx
const handleDealPress = useCallback((deal: Deal) => {
  navigation.navigate('DealDetail', { deal });
}, [navigation]);

const handleBusinessPress = useCallback((deal: Deal) => {
  if (deal.business?.id) {
    navigation.navigate('BusinessProfile', {
      businessId: deal.business.id,
      businessName: deal.business.business_name,
    });
  }
}, [navigation]);
```

**Recommendation:** Create `useDealNavigation` hook

**File:** `src/hooks/useDealNavigation.ts`
```typescript
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Deal, Business } from '../types/models';

export const useDealNavigation = () => {
  const navigation = useNavigation<any>();

  const navigateToDeal = useCallback((deal: Deal) => {
    navigation.navigate('DealDetail', { deal });
  }, [navigation]);

  const navigateToBusiness = useCallback((businessId: string, businessName: string) => {
    navigation.navigate('BusinessProfile', { businessId, businessName });
  }, [navigation]);

  const navigateToBusinessFromDeal = useCallback((deal: Deal) => {
    if (deal.business?.id) {
      navigateToBusiness(deal.business.id, deal.business.business_name);
    }
  }, [navigateToBusiness]);

  return {
    navigateToDeal,
    navigateToBusiness,
    navigateToBusinessFromDeal,
  };
};
```

**Usage:**
```typescript
// FeedScreen.tsx
const { navigateToDeal, navigateToBusinessFromDeal } = useDealNavigation();

<FeedDealCard
  deal={deal}
  onPress={() => navigateToDeal(deal)}
  onBusinessPress={() => navigateToBusinessFromDeal(deal)}
/>
```

**Benefits:**
- ✅ Eliminate 30+ lines of duplicated code
- ✅ Single source of truth for navigation
- ✅ Easier to test navigation logic
- ✅ Easier to modify navigation behavior

---

### 2. **MEDIUM: Keyboard Handling in Forms**

**Issue:** ReviewForm.tsx has complex keyboard handling that could be reused

**Current Code (ReviewForm.tsx:55-82):**
```typescript
useEffect(() => {
  const keyboardWillShow = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    (e) => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? e.duration : 250,
        useNativeDriver: false,
      }).start();
    }
  );
  // ... cleanup
}, [keyboardOffset]);
```

**Recommendation:** Create `useKeyboardAnimation` hook

**File:** `src/hooks/useKeyboardAnimation.ts`
```typescript
import { useEffect, useRef } from 'react';
import { Keyboard, Animated, Platform } from 'react-native';

export const useKeyboardAnimation = () => {
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [keyboardOffset]);

  return keyboardOffset;
};
```

**Usage:**
```typescript
// ReviewForm.tsx
const keyboardOffset = useKeyboardAnimation();

<Animated.View
  style={{
    transform: [{ translateY: keyboardOffset.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -1],
    }) }]
  }}
>
  {/* Form content */}
</Animated.View>
```

---

### 3. **MEDIUM: Pagination Logic**

**Issue:** ReviewList.tsx has pagination logic that could be reused

**Recommendation:** Create `usePagination` hook

**File:** `src/hooks/usePagination.ts`
```typescript
import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  pageSize?: number;
  onLoadMore: (page: number) => Promise<void>;
}

export const usePagination = ({ pageSize = 20, onLoadMore }: UsePaginationOptions) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      await onLoadMore(nextPage);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isLoadingMore, hasMore, onLoadMore]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  return {
    currentPage,
    isLoadingMore,
    hasMore,
    loadMore,
    reset,
    setHasMore,
  };
};
```

---

### 4. **LOW: Style Organization**

**Issue:** StyleSheet.create() inside components for dynamic theming is correct but verbose

**Current Pattern (All Screens):**
```typescript
export default function FeedScreen() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundSecondary,
    },
    // ... many more styles
  });

  return <View style={styles.container}>...</View>;
}
```

**Recommendation:** Keep current approach (no change needed)

**Reasoning:**
- This is the correct pattern for dynamic theming in React Native
- Alternative (extracting styles) would break theme switching
- StyleSheet.create() is memoized internally by React Native
- No performance impact

---

### 5. **TESTABILITY: Business Logic Isolation**

**Current:** Business logic mixed with UI components

**Recommendation:** Already following best practices with custom hooks!

Your hooks like `useSearch.ts` and `useNearbyDeals.ts` are perfect examples:
- ✅ Pure business logic
- ✅ No UI concerns
- ✅ Easy to unit test
- ✅ Reusable across components

**Testing Example:**
```typescript
// __tests__/hooks/useSearch.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useSearch } from '../hooks/useSearch';

describe('useSearch', () => {
  it('should initialize with empty results', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.results.deals).toEqual([]);
    expect(result.current.results.businesses).toEqual([]);
    expect(result.current.hasSearched).toBe(false);
  });

  it('should update query', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('pizza');
    });

    expect(result.current.query).toBe('pizza');
  });
});
```

---

## Implementation Priority 🎯

### High Priority (Do Now)
1. **Create `useDealNavigation` hook** - Will eliminate 30+ lines of duplication
   - Impact: 3 screens (Feed, Search, NearYou)
   - Time: 30 minutes
   - Benefit: Immediate code reduction + easier maintenance

### Medium Priority (Next Sprint)
2. **Create `useKeyboardAnimation` hook** - Reusable keyboard handling
   - Impact: ReviewForm + future forms
   - Time: 20 minutes
   - Benefit: Cleaner form components

3. **Create `usePagination` hook** - Reusable pagination logic
   - Impact: ReviewList + future paginated lists
   - Time: 30 minutes
   - Benefit: Consistent pagination behavior

### Low Priority (Future)
4. **Add Unit Tests** - Test custom hooks
   - Impact: Better code quality
   - Time: 2-3 hours
   - Benefit: Catch bugs early

---

## Utility Functions to Consider

### File: `src/utils/navigation.ts`
```typescript
export const getDealDetailRoute = (deal: Deal) => ({
  screen: 'DealDetail',
  params: { deal },
});

export const getBusinessProfileRoute = (businessId: string, businessName: string) => ({
  screen: 'BusinessProfile',
  params: { businessId, businessName },
});
```

### File: `src/utils/validation.ts`
```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};
```

### File: `src/utils/formatting.ts`
```typescript
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const formatDiscount = (percentage: number): string => {
  return `${percentage}% OFF`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};
```

---

## Testing Strategy 🧪

### 1. Hook Testing
```bash
npm install --save-dev @testing-library/react-hooks
```

**Test File Structure:**
```
src/
  hooks/
    __tests__/
      useDealNavigation.test.ts
      useSearch.test.ts
      useNearbyDeals.test.ts
```

### 2. Component Testing
```bash
npm install --save-dev @testing-library/react-native
```

**Test File Structure:**
```
src/
  components/
    __tests__/
      SearchFilters.test.tsx
      FeedDealCard.test.tsx
```

### 3. Snapshot Testing
For components that don't change often:
```typescript
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer.create(<SearchFilters {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

---

## Code Quality Metrics 📊

### Current State
- **Custom Hooks:** 23+ ✅
- **Code Duplication:** Medium ⚠️ (navigation logic)
- **Type Safety:** Excellent ✅
- **Component Organization:** Good ✅
- **Test Coverage:** Unknown ⚠️ (no tests found)

### Target State
- **Custom Hooks:** 26+ (add 3 new hooks)
- **Code Duplication:** Low ✅
- **Type Safety:** Excellent ✅
- **Component Organization:** Excellent ✅
- **Test Coverage:** 70%+ ✅

---

## Next Steps 🚀

1. **Week 1:** Implement `useDealNavigation` hook
   - Create the hook
   - Update FeedScreen, SearchScreen, NearYouScreen
   - Test on device

2. **Week 2:** Implement `useKeyboardAnimation` and `usePagination`
   - Create both hooks
   - Update ReviewForm and ReviewList
   - Test on device

3. **Week 3:** Add utility functions
   - Create utils/ directory structure
   - Add validation, formatting, navigation utils
   - Update components to use utils

4. **Week 4:** Add unit tests
   - Set up testing framework
   - Write tests for custom hooks
   - Write tests for utility functions
   - Target: 70% coverage

---

## Conclusion

Your codebase is **already in good shape** with proper use of custom hooks and separation of concerns. The recommended changes are **incremental improvements** that will:

1. ✅ Reduce code duplication by ~30%
2. ✅ Improve maintainability
3. ✅ Make testing easier
4. ✅ Provide reusable utilities

**Priority:** Focus on `useDealNavigation` first for immediate impact.
