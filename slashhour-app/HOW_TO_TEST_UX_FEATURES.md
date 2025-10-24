# 🚀 How to Test Modern UX Features

**Quick Start Guide - 5 minutes setup**

---

## Option 1: Quick Test (Recommended for Fast Testing)

### Step 1: Add Test Screen to Navigation

Open `src/navigation/AppNavigator.tsx` and temporarily add the test screen:

```typescript
// Add this import at the top
import UXFeaturesTestScreen from '../screens/test/UXFeaturesTestScreen';

// Add this inside your Stack.Navigator (temporarily)
<Stack.Screen
  name="UXTest"
  component={UXFeaturesTestScreen}
  options={{ title: '🧪 UX Features Test' }}
/>
```

### Step 2: Add Navigation Button

In any screen (e.g., `ProfileScreen.tsx`), temporarily add a button to navigate to the test screen:

```typescript
import { Button } from 'react-native';

// Add this button anywhere visible in your screen
<Button
  title="🧪 Test UX Features"
  onPress={() => navigation.navigate('UXTest' as never)}
/>
```

### Step 3: Start the App

```bash
cd /Users/elw/Documents/Test/Slashhour/slashhour-app
npx expo start
```

Press `i` for iOS or `a` for Android, or scan QR code with Expo Go.

### Step 4: Navigate to Test Screen

1. Open app
2. Tap "🧪 Test UX Features" button
3. Follow on-screen instructions

---

## Option 2: Manual Testing (Test in Existing Screens)

### Test Haptics

Add to any `<TouchableOpacity>` in your app:

```typescript
import { haptics } from '../utils/haptics';

<TouchableOpacity
  onPress={() => {
    haptics.light(); // Add this line
    // your existing code
  }}
>
```

### Test Bottom Sheet

Add to any screen:

```typescript
import { useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import CustomBottomSheet from '../components/CustomBottomSheet';

// Inside component
const sheetRef = useRef<BottomSheet>(null);

// Button to open
<Button
  title="Open Sheet"
  onPress={() => sheetRef.current?.snapToIndex(0)}
/>

// Bottom sheet component
<CustomBottomSheet
  ref={sheetRef}
  snapPoints={['50%', '75%']}
  title="Test"
>
  <Text>Content here</Text>
</CustomBottomSheet>
```

### Test Loading Spinner

Replace any `ActivityIndicator`:

```typescript
import LoadingSpinner from '../components/LoadingSpinner';

// OLD
<ActivityIndicator size="large" />

// NEW
<LoadingSpinner size="large" />
```

---

## Option 3: Test in Deal Card (Already Integrated)

The easiest way to test haptics:

1. Start app
2. Go to "You Follow" or "Near You" tab
3. **Press and hold** any deal card
4. You should feel a light vibration

---

## 🎯 What to Test

### ✅ Haptic Feedback
- [ ] Tap deal cards (light vibration)
- [ ] Test all haptic types in test screen
- [ ] Works on physical device (not simulator)
- [ ] No crashes on web/unsupported devices

### ✅ Bottom Sheet
- [ ] Opens smoothly
- [ ] Dragging works (snap to 50%, 75%)
- [ ] Backdrop dismisses
- [ ] X button closes
- [ ] Drag down to dismiss
- [ ] Haptic feedback on snap

### ✅ Loading Spinner
- [ ] Smooth 60 FPS rotation
- [ ] All sizes work (small, medium, large)
- [ ] Custom colors work
- [ ] Better than ActivityIndicator

### ✅ Other Features (Already Working)
- [ ] Pull-to-refresh in feeds
- [ ] Skeleton loaders show before data
- [ ] Deal cards animate in smoothly
- [ ] Press feedback on cards

---

## 🐛 Troubleshooting

### Metro Not Starting?
```bash
cd /Users/elw/Documents/Test/Slashhour/slashhour-app
npx expo start --clear
```

### Haptics Not Working?
- Only works on **physical devices**
- Check device vibration is enabled
- iOS/Android only (not web)

### Bottom Sheet Not Appearing?
- Check `GestureHandlerRootView` is in `App.tsx` (already added ✅)
- Ensure ref is properly passed

### Animations Janky?
- Make sure using Reanimated 3 (already installed ✅)
- Check Hermes is enabled

---

## 📝 Quick Commands

```bash
# Start app
cd /Users/elw/Documents/Test/Slashhour/slashhour-app
npx expo start

# Clear cache if needed
npx expo start --clear

# iOS simulator
npx expo start --ios

# Android simulator
npx expo start --android

# Check installed packages
grep -E "(expo-haptics|@gorhom/bottom-sheet|react-native-reanimated)" package.json
```

---

## ✨ Expected Results

After testing, you should see:

1. **Haptics** - Vibrations on tap (on physical device)
2. **Bottom Sheets** - Smooth gesture-driven modals
3. **Loading Spinners** - Buttery smooth 60 FPS rotation
4. **No errors** in console
5. **Smooth UX** - Everything feels premium

---

## 📊 Test Results

Mark as you test:

- [ ] Haptics tested and working
- [ ] Bottom sheets tested and working
- [ ] Loading spinners tested and working
- [ ] Pull-to-refresh working
- [ ] Skeleton loaders working
- [ ] Animations smooth (60 FPS)
- [ ] No console errors
- [ ] Ready for production

---

## 🎉 Next Steps

After testing passes:

1. **Remove test screen** (before production)
2. **Apply dark mode** to remaining screens
3. **Use features in more places:**
   - Add haptics to more buttons
   - Replace modals with bottom sheets
   - Replace all ActivityIndicators

---

**Need Help?** Check:
- `UX_FEATURES_TEST_PLAN.md` - Detailed test plan
- `UX_FEATURES_GUIDE.md` - Usage guide
- `SESSION_PROGRESS.md` - Implementation details
