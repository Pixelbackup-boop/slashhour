# 🧪 Modern UX Features - Testing Plan

**Date:** October 23, 2025
**Purpose:** Systematically test all modern UX features implemented on October 17, 2025
**Status:** Ready for Testing

---

## ✅ Pre-Test Checklist

- [x] All packages installed:
  - `expo-haptics`: ~15.0.7
  - `@gorhom/bottom-sheet`: ^4.6.4
  - `react-native-reanimated`: ~4.1.1
- [x] GestureHandlerRootView wrapper added to App.tsx
- [x] Haptic feedback integrated into DealCard
- [x] Bottom sheet component created
- [x] Loading spinner component created
- [ ] Metro server running
- [ ] App loaded in Expo Go

---

## 🧪 Test Suite

### Test 1: Haptic Feedback ✅

**Feature:** Tactile vibration feedback on user interactions
**Integrated In:** `DealCard.tsx` (line 47)

#### Test Steps:
1. Open the app in Expo Go
2. Navigate to "You Follow" or "Near You" tab
3. **Tap on a deal card** and hold briefly
4. **Expected Result:** You should feel a light vibration on press

#### Testing Different Haptic Types:
Create a temporary test button in any screen to test all haptic types:

```typescript
import { haptics } from '../utils/haptics';

// Add to any screen for testing
<View>
  <Button onPress={() => haptics.light()}>Test Light</Button>
  <Button onPress={() => haptics.medium()}>Test Medium</Button>
  <Button onPress={() => haptics.heavy()}>Test Heavy</Button>
  <Button onPress={() => haptics.success()}>Test Success</Button>
  <Button onPress={() => haptics.warning()}>Test Warning</Button>
  <Button onPress={() => haptics.error()}>Test Error</Button>
  <Button onPress={() => haptics.selection()}>Test Selection</Button>
</View>
```

#### Pass Criteria:
- ✅ Light vibration felt when tapping deal cards
- ✅ No errors in console
- ✅ Works on both iOS and Android
- ✅ Fails gracefully on web (no crash)

#### Known Limitations:
- Only works on physical devices (not simulators)
- Requires device vibration to be enabled
- Web browsers don't support haptics

---

### Test 2: Bottom Sheet Component ✅

**Feature:** Modern modal alternative with gesture support
**Component:** `CustomBottomSheet.tsx`

#### Test Steps:

**Step 1: Create Test Screen**
Add this test component to test the bottom sheet:

```typescript
// Add to any screen (e.g., ProfileScreen.tsx)
import React, { useRef } from 'react';
import { View, Button, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../components/CustomBottomSheet';

function TestBottomSheet() {
  const sheetRef = useRef<BottomSheet>(null);

  const openSheet = () => {
    sheetRef.current?.snapToIndex(0);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Open Bottom Sheet" onPress={openSheet} />

      <CustomBottomSheet
        ref={sheetRef}
        snapPoints={['50%', '75%']}
        title="Test Bottom Sheet"
      >
        <View>
          <Text style={{ fontSize: 18, marginBottom: 16 }}>
            This is a bottom sheet test!
          </Text>
          <Text style={{ color: '#666' }}>
            • Try dragging it up and down{'\n'}
            • Try tapping the backdrop to close{'\n'}
            • Try tapping the X button{'\n'}
            • Try dragging down to dismiss
          </Text>
        </View>
      </CustomBottomSheet>
    </View>
  );
}
```

**Step 2: Test Gestures**
1. Tap "Open Bottom Sheet" button
2. **Drag the handle up** (should snap to 75%)
3. **Drag the handle down** (should snap to 50%)
4. **Drag down further** (should dismiss completely)
5. Reopen sheet
6. **Tap the backdrop** (should dismiss)
7. Reopen sheet
8. **Tap the X button** (should dismiss)

#### Pass Criteria:
- ✅ Sheet opens smoothly with animation
- ✅ Dragging gesture works smoothly
- ✅ Snaps to defined points (50%, 75%)
- ✅ Backdrop appears and dismisses sheet on tap
- ✅ X button closes the sheet
- ✅ Haptic feedback occurs on snap
- ✅ No console errors

#### Recommended Use Cases:
- Filter menus (deal filters, category filters)
- Sort options (distance, price, discount)
- Action sheets (share, report, save)
- Quick actions (follow, bookmark)

---

### Test 3: Loading Spinner (Reanimated) ✅

**Feature:** 60 FPS smooth loading animation
**Component:** `LoadingSpinner.tsx`

#### Test Steps:

**Step 1: Replace ActivityIndicator**
Find any screen using `ActivityIndicator` and replace it:

```typescript
// OLD
import { ActivityIndicator } from 'react-native';
<ActivityIndicator size="large" color={COLORS.primary} />

// NEW
import LoadingSpinner from '../components/LoadingSpinner';
<LoadingSpinner size="large" />
```

**Step 2: Test All Sizes**
Add this test to any screen:

```typescript
import LoadingSpinner from '../components/LoadingSpinner';

<View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center' }}>
  <LoadingSpinner size="small" />
  <LoadingSpinner size="medium" />
  <LoadingSpinner size="large" />
  <LoadingSpinner size="large" color="#FF6B6B" />
</View>
```

**Step 3: Visual Test**
1. Watch the spinner rotate
2. Should be **perfectly smooth** (60 FPS)
3. No jank or stuttering
4. Consistent rotation speed

#### Pass Criteria:
- ✅ Spinner rotates smoothly at 60 FPS
- ✅ All three sizes work (small, medium, large)
- ✅ Custom colors work
- ✅ Runs on UI thread (check Reanimated profiler)
- ✅ Better than ActivityIndicator

#### Where to Use:
- Replace all `ActivityIndicator` components
- Loading states in screens
- Button loading states
- Full-screen loading overlays

---

### Test 4: Pull-to-Refresh (Already Implemented) ✅

**Feature:** Swipe down to refresh feed
**Already Working In:** FeedScreen.tsx, NearYouScreen.tsx

#### Test Steps:
1. Navigate to "You Follow" tab
2. **Swipe down from the top**
3. Release when you see the loading indicator
4. Feed should refresh and show updated data

#### Pass Criteria:
- ✅ Smooth pull gesture
- ✅ Loading indicator appears
- ✅ Data refreshes
- ✅ TanStack Query refetches data
- ✅ No console errors

---

### Test 5: Skeleton Loaders (Already Implemented) ✅

**Feature:** Loading placeholders that look like content
**Components:** `DealCardSkeleton.tsx`, `BusinessProfileSkeleton.tsx`

#### Test Steps:
1. Clear app cache (force quit and reopen)
2. Navigate to "You Follow" tab
3. **Before data loads**, you should see skeleton cards
4. Skeleton should **shimmer/pulse**
5. After data loads, skeleton should be **replaced** with real content

#### Pass Criteria:
- ✅ Skeleton cards appear during loading
- ✅ Match the shape of real deal cards
- ✅ Smooth transition to real content
- ✅ Better UX than blank screen or spinner

---

### Test 6: Micro-animations (Already Implemented) ✅

**Feature:** Smooth entry animations and press feedback
**Already Working In:** DealCard.tsx, AnimatedButton.tsx

#### Test Steps:
1. Navigate to any feed
2. Watch deal cards as they appear
3. Cards should **slide up** with fade-in effect
4. **Tap and hold** a card - should scale down to 0.95
5. **Release** - should spring back to 1.0

#### Pass Criteria:
- ✅ Cards animate in smoothly (FadeInDown)
- ✅ Press feedback with scale animation
- ✅ Spring physics feels natural
- ✅ No jank or lag
- ✅ 60 FPS animation

---

### Test 7: Dark Mode (Partial - Infrastructure Ready) ⚠️

**Feature:** Dark theme with system detection
**Status:** Infrastructure complete, needs screen integration

#### What's Working:
- ✅ ThemeContext created
- ✅ Dark colors defined (OLED-optimized)
- ✅ Paper dark theme configured
- ✅ System detection (`useColorScheme`)

#### What's Missing:
- ❌ Custom screens not using `useTheme()` hook
- ❌ Manual theme toggle in settings

#### Test Steps (After Integration):
1. Change device to dark mode (iOS: Settings → Display, Android: Settings → Display)
2. Reopen app
3. App should automatically switch to dark theme
4. Pure black backgrounds (#000000)
5. High contrast text
6. All Paper components should be dark

#### Where to Apply Dark Mode:
Update these screens to use `useTheme()`:
- `LoginScreen.tsx`
- `FeedScreen.tsx`
- `NearYouScreen.tsx`
- `DealDetailScreen.tsx`
- `ProfileScreen.tsx`

---

## 📊 Testing Matrix

| Feature | Status | Integrated | Tested | Pass |
|---------|--------|------------|--------|------|
| Haptic Feedback | ✅ Complete | ✅ DealCard | ⏳ Pending | ⏳ |
| Bottom Sheets | ✅ Complete | ⚠️ Example Needed | ⏳ Pending | ⏳ |
| Loading Spinner | ✅ Complete | ⚠️ Not Used Yet | ⏳ Pending | ⏳ |
| Pull-to-Refresh | ✅ Complete | ✅ Feed Screens | ✅ Tested | ✅ |
| Skeleton Loaders | ✅ Complete | ✅ Feed Screens | ✅ Tested | ✅ |
| Micro-animations | ✅ Complete | ✅ DealCard | ✅ Tested | ✅ |
| Dark Mode | ⚠️ 85% | ❌ Needs Integration | ⏳ Pending | ⏳ |

---

## 🚀 How to Start Testing

### Step 1: Start Metro Server
```bash
cd /Users/elw/Documents/Test/Slashhour/slashhour-app
npx expo start
```

### Step 2: Open in Expo Go
- iOS: Scan QR code with Camera app
- Android: Scan QR code with Expo Go app

### Step 3: Run Test Suite
Follow tests 1-7 above in order

---

## 🐛 Issues to Watch For

### Common Issues:
1. **Haptics not working**
   - Solution: Test on physical device, not simulator
   - Check device vibration is enabled

2. **Bottom sheet not appearing**
   - Solution: Check GestureHandlerRootView is in App.tsx
   - Ensure ref is properly passed

3. **Animations janky**
   - Solution: Check using Reanimated 3, not Animated API
   - Enable Hermes engine

4. **Dark mode not working**
   - Solution: Screens need to use `useTheme()` hook
   - Check ThemeContext is wrapping app

---

## 📝 Test Results Log

Fill this out as you test:

### Haptic Feedback
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] All haptic types work
- [ ] No crashes
- **Notes:** _________________

### Bottom Sheets
- [ ] Opens smoothly
- [ ] Gesture dragging works
- [ ] Snaps to points correctly
- [ ] Backdrop dismisses
- **Notes:** _________________

### Loading Spinner
- [ ] Smooth 60 FPS rotation
- [ ] All sizes work
- [ ] Better than ActivityIndicator
- **Notes:** _________________

### Dark Mode
- [ ] Not yet integrated
- **Notes:** _Needs screen updates_

---

## ✅ Next Steps After Testing

1. **If tests pass:**
   - Mark features as production-ready
   - Update PROJECT_STATUS.md
   - Move to "Apply Dark Mode" task

2. **If tests fail:**
   - Document issues in this file
   - Fix bugs
   - Re-test

3. **Feature requests:**
   - Add more components using bottom sheets
   - Add more haptic feedback points
   - Use loading spinner everywhere

---

**Testing Started:** _____________
**Testing Completed:** _____________
**Tester:** _____________
**Overall Status:** ⏳ Pending
