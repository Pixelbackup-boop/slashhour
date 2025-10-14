# Best Practices, Trends & UI/UX Guidelines

> **Purpose**: This document guides AI assistants and developers to proactively suggest and implement modern best practices, latest trends, and optimal UI/UX patterns - even when not explicitly requested.

**Last Updated**: 2025-10-15

---

## 📱 Mobile App Navigation Patterns

### Bottom Tab Bar (Recommended for Primary Navigation)
- **5 tabs maximum** - More causes cognitive overload
- **Center tab for primary action** - Middle position for create/post actions
- **Icons + labels** - Both for better accessibility and clarity
- **Active state indicators** - Clear visual feedback for current tab
- **Badge notifications** - Show counts on Profile/Inbox tabs
- **Haptic feedback** - Subtle vibration on tab switch (iOS/Android)

**Example Structure**:
```
[Home] [Search] [+ Create] [Inbox] [Profile]
```

### Navigation Stack Patterns
- **Modal presentations** - For temporary flows (create post, filters)
- **Full screen push** - For content deep-dives (deal details)
- **Back button consistency** - Always top-left, consistent label
- **Swipe to go back** - Enable gesture navigation (iOS standard)

---

## 🎨 Modern UI/UX Trends (2024-2025)

### Visual Design
1. **Glassmorphism** - Frosted glass effect for overlays (backdrop blur + transparency)
2. **Neumorphism** (use sparingly) - Soft shadows for primary cards
3. **Bold Typography** - Large, readable headings (20-32pt)
4. **High Contrast** - WCAG AAA compliance (7:1 ratio minimum)
5. **Rounded Corners** - 12-16px for cards, 8-12px for buttons
6. **Micro-interactions** - Subtle animations (spring physics, 200-300ms)
7. **Skeleton Screens** - Better than spinners for loading states
8. **Empty States with Illustrations** - Friendly, actionable empty states
9. **Dark Mode Support** - System-aware theming
10. **Spacing System** - 8pt grid (8, 16, 24, 32, 40px)

### Color Palette Best Practices
- **Primary color** - Brand color for CTAs (e.g., #FF6B6B)
- **Secondary color** - Supporting actions
- **Semantic colors** - Success (green), Warning (yellow), Error (red), Info (blue)
- **Neutral grays** - 5-7 shades (#f5f5f5, #e0e0e0, #999, #666, #333)
- **60-30-10 rule** - 60% neutral, 30% brand, 10% accent

### Typography Scale
```
Display:  32-40px (bold) - Hero sections
Heading:  20-28px (bold) - Section titles
Title:    18-20px (600)  - Card titles
Body:     14-16px (400)  - Main content
Caption:  12-14px (400)  - Meta info
Label:    10-12px (600)  - Form labels (uppercase)
```

---

## 🏗️ React Native Best Practices

### Component Architecture
1. **Custom Hooks for Logic** - Separate business logic from UI
2. **Reusable Components** - DRY principle, component library
3. **Prop Drilling Avoidance** - Context or Redux for deep state
4. **TypeScript Strict Mode** - Type safety everywhere
5. **Composition over Props** - Use children/render props for flexibility

### Performance Optimization
1. **FlatList/SectionList** - Always for scrollable lists (never ScrollView + map)
2. **useMemo/useCallback** - Memoize expensive calculations
3. **React.memo** - Prevent unnecessary re-renders
4. **Image Optimization** - Compressed images, lazy loading
5. **Code Splitting** - Lazy load screens with React.lazy()
6. **Debouncing** - Search inputs, filter changes (300ms)
7. **Virtualization** - Large lists with windowSize prop

### State Management
- **Redux Toolkit** - Global state (auth, user, app config)
- **useState** - Local component state
- **Custom Hooks** - Shared stateful logic
- **React Query/SWR** - Server state caching (consider for future)

---

## ♿ Accessibility (a11y)

### Touch Targets
- **Minimum 44x44pt** - iOS standard, Android 48x48dp
- **Spacing between targets** - 8px minimum
- **Hit slop** - Extend touch area for small icons

### Screen Readers
- **accessibilityLabel** - Descriptive labels for all interactive elements
- **accessibilityHint** - What happens when tapped
- **accessibilityRole** - button, link, header, etc.
- **accessibilityState** - disabled, selected, checked

### Visual Accessibility
- **Color contrast** - WCAG AA minimum (4.5:1 for text)
- **Don't rely on color alone** - Use icons + text
- **Focus indicators** - Visible focus for keyboard navigation
- **Text scaling support** - Support dynamic type sizes

---

## 🔄 Loading & Error States

### Loading States
1. **Skeleton Screens** - Better than spinners (shows content structure)
2. **Progressive Loading** - Load critical content first
3. **Optimistic Updates** - Show action immediately, rollback on error
4. **Pull-to-Refresh** - Standard pattern for feeds
5. **Infinite Scroll** - Load more with proper loading indicator

### Error States
1. **User-Friendly Messages** - No technical jargon
2. **Action Buttons** - "Try Again", "Go Back", "Contact Support"
3. **Contextual Errors** - Show errors inline (forms)
4. **Error Illustrations** - Friendly graphics for major errors
5. **Offline Detection** - Clear messaging when no connection

### Empty States
1. **Illustrations** - Friendly, on-brand graphics
2. **Clear Headline** - What's missing and why
3. **Primary Action** - How to populate this area
4. **Suggestions** - What user can do next

---

## 🔍 Search & Filtering Best Practices

### Search UX
1. **Debounced Search** - 300ms delay before API call
2. **Search Suggestions** - Quick access to popular searches
3. **Recent Searches** - Show user's search history
4. **Clear Button** - Easy way to reset search
5. **Search While Typing** - Instant results (if fast enough)
6. **No Results State** - Helpful suggestions, spell check

### Filters
1. **Chip-Based Filters** - Visual, easy to remove
2. **Filter Count Badge** - Show active filter count
3. **Quick Filters** - Most common filters always visible
4. **Advanced Filters** - Collapsible for power users
5. **Apply/Clear Buttons** - Batch filter changes
6. **Persistent Filters** - Remember user preferences

---

## 📝 Forms & Input Best Practices

### Input Fields
1. **Floating Labels** - Label moves up on focus
2. **Clear Icons** - X button to clear input
3. **Input Validation** - Real-time, helpful error messages
4. **Auto-Focus** - First field on screen load
5. **Keyboard Types** - email, phone, number, etc.
6. **Auto-Capitalize** - Appropriate for field type
7. **Password Toggle** - Show/hide password button

### Form Submission
1. **Disable Submit Until Valid** - Prevent errors
2. **Loading State on Button** - Show spinner while submitting
3. **Success Feedback** - Toast, checkmark, or navigation
4. **Error Handling** - Scroll to first error, highlight fields
5. **Auto-Save** - Save drafts automatically

---

## 🔔 Notifications & Messaging

### Push Notifications
1. **Permission Prompt** - Ask at the right moment (not on launch)
2. **Notification Preferences** - Granular controls
3. **Badge Counts** - Show unread count on app icon
4. **Deep Linking** - Open relevant screen from notification

### In-App Notifications
1. **Toast Messages** - 3-4 seconds, dismissible
2. **Snackbar** - Bottom notification with action button
3. **Alert Dialogs** - For critical actions (delete, logout)
4. **Notification Center** - In-app list of all notifications
5. **Read/Unread States** - Clear visual distinction

---

## 🎯 Onboarding Best Practices

### First Launch
1. **Progressive Disclosure** - Show features as needed
2. **Skip Button** - Allow users to skip intro
3. **3-5 Screens Max** - Don't overwhelm users
4. **Value-Focused** - Show benefits, not features
5. **Interactive Tutorial** - Learn by doing

### Empty States as Onboarding
- First-time users see educational empty states
- Show examples of what populated state looks like
- Primary action to get started

---

## 🚀 Performance Best Practices

### React Native Optimization
1. **Remove Console Logs** - Use __DEV__ checks
2. **Image Optimization** - WebP format, appropriate sizes
3. **Bundle Size** - Code splitting, tree shaking
4. **Memory Leaks** - Cleanup in useEffect return
5. **FlatList Optimization** - windowSize, maxToRenderPerBatch

### Network Optimization
1. **Request Batching** - Combine multiple API calls
2. **Caching** - Cache API responses, images
3. **Compression** - gzip/brotli compression
4. **CDN** - Serve static assets from CDN
5. **Pagination** - Load data in chunks

---

## 🎭 Animation & Micro-interactions

### Animation Principles
1. **Subtle & Purposeful** - Enhance UX, don't distract
2. **Consistent Timing** - 200-300ms for most interactions
3. **Spring Physics** - Natural motion (React Native Animated)
4. **Easing Functions** - easeInOut for most cases
5. **Respect Reduced Motion** - Honor system preferences

### Common Micro-interactions
1. **Button Press** - Scale down slightly (0.95)
2. **Card Tap** - Slight scale or shadow increase
3. **Pull to Refresh** - Spinner with bounce
4. **Swipe Actions** - Reveal actions on swipe
5. **Toggle Switches** - Smooth thumb slide
6. **Success Checkmark** - Animated checkmark on completion

---

## 📊 Analytics & Tracking

### Event Tracking
1. **Screen Views** - Every screen navigation
2. **User Actions** - Taps, searches, filters
3. **Conversions** - Deal redeemed, business followed
4. **Errors** - Track errors with context
5. **Performance** - App launch time, screen load time

### User Properties
- User type (consumer/business)
- Signup date
- Location
- Preferences
- App version

---

## 🎨 Component Library Standards

### Button Variants
```
Primary:   Solid background, white text
Secondary: Outlined, colored border
Tertiary:  Ghost, no border
Danger:    Red background, for destructive actions
```

### Card Patterns
```
Basic Card:     White bg, subtle shadow, 12px radius
Elevated Card:  Higher shadow, interactive
Outlined Card:  Border only, no shadow
Image Card:     Image + overlay text
```

### Modal Types
```
Bottom Sheet:   Slides up from bottom (preferred mobile)
Center Modal:   Centered overlay
Full Screen:    Takes full screen (complex forms)
Action Sheet:   List of actions (iOS style)
```

---

## 🔐 Security Best Practices

1. **Secure Storage** - Never store tokens in AsyncStorage, use secure storage
2. **API Keys** - Environment variables, never commit
3. **HTTPS Only** - All API calls over HTTPS
4. **Input Sanitization** - Validate and sanitize all inputs
5. **Token Refresh** - Auto-refresh expired tokens
6. **Biometric Auth** - Face ID / Touch ID for sensitive actions

---

## 📱 Platform-Specific Guidelines

### iOS Human Interface Guidelines
- **SF Symbols** - Use system icons
- **Navigation Bar** - Large titles for top-level screens
- **Haptic Feedback** - Use UIImpactFeedbackGenerator
- **Modal Presentation** - Card style for modals
- **System Fonts** - SF Pro for consistency

### Android Material Design
- **Material Icons** - Use Material Design icons
- **Floating Action Button** - Primary action (if applicable)
- **Ripple Effect** - Touch feedback on all interactive elements
- **Snackbar** - Preferred notification method
- **Roboto Font** - System default

---

## 🧪 Testing Best Practices

1. **Unit Tests** - Test hooks and utility functions
2. **Component Tests** - React Testing Library
3. **E2E Tests** - Detox for critical flows
4. **Visual Regression** - Screenshot testing
5. **Accessibility Testing** - Axe or similar tools

---

## 📝 Code Style & Documentation

### Code Comments
- **Why, not what** - Explain reasoning, not obvious code
- **TODOs** - Tag with context: `// TODO: Add pagination when API ready`
- **Complex Logic** - Document algorithms, formulas
- **API Documentation** - JSDoc for public functions

### File Organization
```
src/
├── components/       # Reusable UI components
│   ├── buttons/
│   ├── cards/
│   └── inputs/
├── screens/         # Full screen components
├── hooks/           # Custom React hooks
├── services/        # API, analytics, etc.
├── store/           # Redux slices
├── types/           # TypeScript types
├── utils/           # Helper functions
├── config/          # App configuration
└── navigation/      # Navigation setup
```

---

## 🎯 Feature Development Checklist

When implementing a new feature, ensure:

- [ ] **TypeScript types defined** for all data structures
- [ ] **Custom hook created** for business logic (if applicable)
- [ ] **Reusable components** extracted where possible
- [ ] **Loading states** implemented
- [ ] **Error states** implemented with retry logic
- [ ] **Empty states** with helpful messaging
- [ ] **Analytics tracking** added
- [ ] **Accessibility labels** added
- [ ] **Error logging** to Sentry
- [ ] **Dark mode support** (if applicable)
- [ ] **Pull-to-refresh** (for list screens)
- [ ] **Keyboard handling** (for forms)
- [ ] **Navigation integrated** properly
- [ ] **No console warnings** in development
- [ ] **TypeScript compilation** passes

---

## 💡 Proactive Suggestions Framework

When the user asks for a feature, **always suggest**:

1. **Better UX alternatives** - "A bottom sheet would work better than a modal here"
2. **Standard patterns** - "Most apps use infinite scroll for this"
3. **Performance optimizations** - "Let's use FlatList instead of ScrollView"
4. **Accessibility improvements** - "We should add labels for screen readers"
5. **Error prevention** - "Let's add validation before submission"
6. **Future-proofing** - "Let's make this component reusable"
7. **Analytics** - "We should track when users do X"
8. **Edge cases** - "What happens when there's no data?"

---

## 📚 Resources & References

### Design Systems
- [Material Design](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Shopify Polaris](https://polaris.shopify.com/)
- [Ant Design Mobile](https://mobile.ant.design/)

### UI/UX Inspiration
- [Dribbble](https://dribbble.com/tags/mobile-app)
- [Mobbin](https://mobbin.com/) - Mobile app screenshots
- [UI Sources](https://www.uisources.com/)
- [Pttrns](https://pttrns.com/)

### React Native Resources
- [React Native Directory](https://reactnative.directory/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Best Practices](https://github.com/rantiev/react-native-best-practices)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-15 | Initial creation - Comprehensive best practices guide |

---

**Remember**: These are guidelines, not strict rules. Always consider the specific context and user needs. When in doubt, prioritize **user experience** and **accessibility** over aesthetic trends.
