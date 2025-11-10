# Complete Emoji Icon Audit - Slashhour App

**Generated**: 2025-01-08
**Purpose**: Comprehensive list of every emoji used for icons in the UI (excluding console logs)
**Total Emojis Found**: 100+ instances across 36 files

---

## 🎯 Quick Stats

| Emoji | Usage Count | Purpose |
|-------|-------------|---------|
| ⚠️ | 12 | Error/warning states |
| ❤️ / 🤍 | 10 | Bookmark/wishlist (filled/outline) |
| 📍 | 8 | Location/distance |
| 🔔 | 4 | Notifications |
| 🏪 | 4 | Business/shop |
| 🔍 | 3 | Search |
| 💬 | 3 | Chat/messages |
| ⭐ / ☆ | 3 | Star ratings (filled/outline) |
| ✏️ | 6 | Edit action |
| 🗑️ | 3 | Delete action |
| 💰 | 2 | Pricing/savings |
| 📅 | 2 | Calendar/schedule |
| 🎉 | 3 | Celebration/deals |
| ✅ | 2 | Success/checkmark |
| 💡 | 1 | Tips/hints |
| 🔒 | 3 | Locked/security |
| ⚡ | 2 | Flash deals |
| 🍕 | 2 | App logo |
| 👤 | 1 | Profile |
| 🏠 | 1 | Home tab |

---

## 📱 Navigation Components

### `src/navigation/AppNavigator.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 363 | 🏠 | Home tab icon | `Home01` or `Home05` |
| 373 | 🔍 | Search tab icon | `SearchMd` or `SearchLg` |
| 383 | 🔔 | Notifications tab icon | `Bell01` or `Bell02` |
| 406 | 💬 | Messages tab icon | `MessageChatCircle` or `MessageSquare02` |
| 429 | 👤 | Profile tab icon | `User01` or `UserCircle` |

**Priority**: 🔥 **CRITICAL** - Bottom navigation is always visible

---

## 🏠 Screen Components

### `src/screens/auth/LoginScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 168 | 🍕 | Slashhour app logo | Custom logo or `Store01` |
| 202 | 👁️ / 👁️‍🗨️ | Show/hide password toggle | `Eye` / `EyeOff` |

### `src/screens/auth/SignUpScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 51 | 🍕 | Slashhour app logo | Custom logo or `Store01` |
| 105 | 👁️ / 👁️‍🗨️ | Show password | `Eye` / `EyeOff` |
| 125 | 👁️ / 👁️‍🗨️ | Show confirm password | `Eye` / `EyeOff` |

---

### `src/screens/home/NearYouScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 208 | 📍 | Location error icon | `MapPinOff` or `AlertCircle` |
| 243 | 🗺️ | Empty state map | `Map02` or `MapUnfold` |

---

### `src/screens/deal/DealDetailScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 414 | ❤️ | Bookmarked (filled) | `Heart` (filled) |
| 414 | 🤍 | Not bookmarked (outline) | `Heart` (outline) |

**Priority**: 🔥 **HIGH** - Core user action

---

### `src/screens/post/CreateDealScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 142 | ⚠️ | Error icon | `AlertTriangle` or `AlertCircle` |
| 213 | 💰 | Pricing section header | `CurrencyDollar` or `Tag03` |
| 298 | 📅 | Availability section header | `Calendar` or `CalendarDate` |

---

### `src/screens/post/EditDealScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 146 | ⚠️ | Error icon | `AlertTriangle` |
| 217 | 💰 | Pricing section | `CurrencyDollar` |
| 317 | 📅 | Availability section | `Calendar` |

---

### `src/screens/post/PostScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 106 | 🏪 | Empty state - no shop | `Store01` or `Building07` |

---

### `src/screens/inbox/ConversationsListScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 138 | 💬 | Empty state - no conversations | `MessageChatCircle` |
| 148 | ⚠️ | Error state | `AlertTriangle` |

---

### `src/screens/inbox/InboxScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 18 | ✏️ | Compose new message | `Edit03` or `PenTool01` |
| 24 | 💬 | Empty state | `MessageSquare02` |

---

### `src/screens/inbox/ChatScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 285 | ⚠️ | Error state | `AlertCircle` |

---

### `src/screens/search/SearchScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 198 | 🔍 | Empty state - no results | `SearchLg` |
| 227 | ⚠️ | Error state | `AlertTriangle` |

---

### `src/screens/bookmarks/BookmarksScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 81 | ⚠️ | Error state | `AlertTriangle` |
| 93 | 🤍 | Empty state - no bookmarks | `Heart` (outline) |

---

### `src/screens/followers/FollowersListScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 67 | ⚠️ | Empty state | `Users01` or `UserPlus02` |

---

### `src/screens/following/FollowingListScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 36 | ⚠️ | Error state | `AlertTriangle` |

---

### `src/screens/redemption/RedemptionHistoryScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 60 | 🎉 | Empty state - no redemptions | `Gift01` or `Award01` |
| 80 | ⚠️ | Error state | `AlertTriangle` |

---

### `src/screens/notifications/NotificationsScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 186 | 🗑️ | Delete notification action | `Trash01` or `Trash02` |
| 246 | 🔔 | Empty state - no notifications | `Bell01` or `BellOff01` |

---

### `src/screens/profile/ProfileScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 120 | ⚙️ | Settings menu item | `Settings01` or `Settings02` |
| 125 | 🔒 | Privacy/Security menu | `Lock01` or `Shield01` |
| 141 | 💬 | Feedback menu | `MessageChatCircle` |
| 149 | ℹ️ | About menu | `InfoCircle` or `HelpCircle` |
| 275 | ✏️ | Edit avatar | `Edit03` |
| 327 | 🏪 | My Shop section | `Store01` |
| 355 | 🏪 | Business section | `Store01` |
| 358 | 🏪 | Create shop button | `Store01` |
| 386 | 💰 | Your Savings section | `CurrencyDollar` or `PiggyBank01` |
| 395 | 🎉 | Deals Redeemed section | `Gift01` |
| 404 | 📊 | Your Activity section | `BarChart07` or `TrendUp02` |
| 425 | 🎯 | Impact title | `Target04` or `Award01` |
| 449 | 🤍 | Action icon (not liked) | `Heart` (outline) |
| 462 | ❤️ | Action icon (liked) | `Heart` (filled) |
| 485 | ⚙️ | Account section | `Settings01` |

**Priority**: 🔥 **HIGH** - Profile screen has many icons

---

### `src/screens/settings/NotificationSettingsScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 367 | 📍 | Location-based notifications | `MapPin` |
| 495 | 🔔 | Push notifications | `Bell01` |
| 619 | ⚡ | Flash deals toggle | `Zap` or `Lightning01` |

---

### `src/screens/settings/VerifyEmailScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| (text) | 💡 | Tip/hint message | `Lightbulb01` or `InfoCircle` |

---

### `src/screens/settings/VerifyPhoneScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| (text) | 💡 | Tip/hint message | `Lightbulb01` |

---

### `src/screens/settings/AccountSettingsScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| (text) | ⚠️ | Important warning | `AlertTriangle` |
| (text) | 💡 | Tip message | `Lightbulb01` |

---

### `src/screens/business/BusinessProfileScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 466 | ⚠️ | Error state | `AlertTriangle` |

---

### `src/screens/business/RegisterBusinessScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 264 | 📍 | Get location button | `MapPin` or `Navigation01` |

---

### `src/screens/business/EditBusinessProfileScreen.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 237 | ⚠️ | Error message | `AlertTriangle` |
| 255 | 🔒 | Locked slug field | `Lock01` |
| 275 | 🔒 | Slug locked message | `Lock01` |
| 303 | 🔒 | Locked category field | `Lock01` |
| 363 | 📞 | Contact information section | `Phone` or `PhoneCall01` |
| 401 | 📍 | Location section | `MapPin` |
| 411 | 📍 | Auto-fill location button | `MapPin` or `Navigation01` |

---

### `src/screens/test/` (Multiple Test Screens)

**Note**: Test screens contain many emojis for development/testing purposes. These can be replaced but are lower priority since they're not user-facing in production.

---

## 🧩 Component Files

### `src/components/SearchBar.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 30 | 🔍 | Search icon in input | `SearchMd` or `SearchLg` |

**Priority**: 🔥 **HIGH** - Used throughout app

---

### `src/components/SearchFilters.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 131 | ⚡ | Flash deals filter toggle | `Zap` or `Lightning01` |

---

### `src/components/FeedDealCard.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 200 | ❤️ | Bookmarked (filled) | `Heart` (filled) |
| 200 | 🤍 | Not bookmarked (outline) | `Heart` (outline) |
| (text) | 📍 | Distance badge | `MapPin` (small, 16px) |

**Priority**: 🔥 **CRITICAL** - Core feed component, highly visible

---

### `src/components/ShopDealCard.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 177 | ✏️ | Edit deal button (owner) | `Edit03` or `PenTool01` |
| 187 | 🗑️ | Delete deal button (owner) | `Trash01` or `Trash02` |
| 197 | ❤️ | Wishlisted (filled) | `Heart` (filled) |
| 197 | 🤍 | Not wishlisted (outline) | `Heart` (outline) |

**Priority**: 🔥 **HIGH** - Business owner interface

---

### `src/components/RedemptionCard.tsx`

**Category Icon Mapping** (lines 34-44):

| Category | Emoji | Suggested Icon |
|----------|-------|----------------|
| restaurant | 🍕 | `ChefHat` or `CakeSlice` |
| grocery | 🛒 | `ShoppingCart01` |
| fashion | 👗 | `Shirt01` |
| shoes | 👟 | `Footprints` |
| electronics | 📱 | `Smartphone01` or `Laptop01` |
| home_living | 🏠 | `Home01` or `Building01` |
| beauty | 💄 | `Heart02` or `Sparkles` |
| health | ⚕️ | `Heart04` or `Activity` |
| (fallback) | 🎉 | `Gift01` |

---

### `src/components/RedemptionModal.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 40 | ✅ | Success state | `CheckCircle` or `Check` |

---

### `src/components/CountdownBox.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 21 | ⚡ | Flash deal badge | `Zap` or `Lightning01` |

---

### `src/components/reviews/ReviewList.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 123 | ⭐⭐⭐⭐⭐ | Star rating display (5 stars) | `Star01` (filled) |
| 158 | ⭐ | Empty state - no reviews | `Star01` |

---

### `src/components/reviews/ReviewCard.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| (loop) | ⭐ | Filled star (rating) | `Star01` (filled) |
| (loop) | ☆ | Empty star (rating) | `Star01` (outline) |

---

### `src/components/reviews/ReviewForm.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 127 | ⭐ | Selected star (interactive) | `Star01` (filled) |
| 127 | ☆ | Unselected star (interactive) | `Star01` (outline) |

**Priority**: 🔥 **HIGH** - Interactive rating component

---

### `src/components/business/BusinessHeader.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 73 | ✏️ | Edit badge | `Edit03` |
| 110 | 🔔 | Follow/notification button | `Bell01` or `BellRinging01` |
| 119 | ✉️ | Message button | `Mail01` or `MessageSquare02` |
| 142 | ✏️ | Edit icon | `Edit03` |

---

### `src/components/business/BusinessTabs.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 106 | 📞 | Phone contact icon | `Phone` or `PhoneCall01` |
| 117 | ✉️ | Email contact icon | `Mail01` |
| (text) | 💡 | Tip message | `Lightbulb01` |
| (text) | 📍 | Location prompt | `MapPin` |
| (text) | 📞 | Contact info prompt | `Phone` |

---

### `src/components/business/BusinessCoverImage.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 34 | ✏️ | Edit cover image badge | `Edit03` or `Camera01` |

---

### `src/components/BusinessHoursEditor.tsx`

| Line | Emoji | Context | Suggested Icon |
|------|-------|---------|----------------|
| 114 | 📅 | Set Mon-Fri button | `Calendar` |
| (text) | 💡 | Tip message | `Lightbulb01` |

---

## 📦 Constants & Configuration

### `src/constants/categories.ts`

**Category Icon Definitions** (lines 27-76):

| Category | Line | Emoji | Suggested Icon |
|----------|------|-------|----------------|
| restaurant | 31 | 🍽️ | `ChefHat` or `CakeSlice` |
| grocery | 37 | 🛒 | `ShoppingCart01` |
| fashion | 43 | 👕 | `Shirt01` |
| shoes | 49 | 👟 | `Footprints` |
| electronics | 55 | 📱 | `Smartphone01` |
| home_living | 61 | 🏠 | `Home01` |
| beauty | 67 | 💄 | `Heart02` or `Sparkles` |
| health | 73 | ⚕️ | `Heart04` or `Activity` |

**Priority**: 🔥 **CRITICAL** - Used throughout entire app for categories

---

## 📊 Summary by Priority

### 🔥 **CRITICAL** (Must Fix First):

1. **Bottom Navigation** (`AppNavigator.tsx`) - Always visible
   - 🏠 Home, 🔍 Search, 🔔 Notifications, 💬 Messages, 👤 Profile

2. **Category System** (`constants/categories.ts`) - Used everywhere
   - 🍽️ Restaurant, 🛒 Grocery, 👕 Fashion, 👟 Shoes, 📱 Electronics, 🏠 Home, 💄 Beauty, ⚕️ Health

3. **Heart/Bookmark Icons** (10+ uses across multiple components)
   - ❤️ Filled heart, 🤍 Outline heart

4. **FeedDealCard** - Core content component
   - ❤️/🤍 Bookmark, 📍 Distance

### 🔥 **HIGH** (Fix Second):

5. **SearchBar** - Used in multiple screens
   - 🔍 Search icon

6. **Review System** - User-generated content
   - ⭐ Star rating (filled/outline)

7. **Profile Screen** - Many icons
   - 🏪 Shop, 💰 Savings, 🎉 Deals, 📊 Activity, ⚙️ Settings, etc.

8. **Business Management** - Owner interface
   - ✏️ Edit, 🗑️ Delete, 📍 Location, 📞 Contact

### 🟡 **MEDIUM** (Fix Third):

9. **Error/Warning States** - User feedback
   - ⚠️ Alert triangle (12+ uses)

10. **Empty States** - Various screens
    - Screen-specific empty state icons

11. **Section Headers** - Content organization
    - 💰 Pricing, 📅 Calendar, 💡 Tips

### 🟢 **LOW** (Optional):

12. **Test Screens** - Development only
13. **Console Logs** - Not visible to users

---

## 🎨 Icon Specifications

### Sizing Guidelines:

- **Bottom Navigation**: 24px (default), 28px (focused)
- **Headers**: 20-24px
- **Buttons**: 20-24px
- **List Items**: 18-20px
- **Distance Badges**: 14-16px (small)
- **Empty States**: 48-64px (large)

### Color Guidelines:

- Use `currentColor` for theme compatibility
- Filled hearts: Primary color
- Outline hearts: Secondary/gray color
- Active states: Accent color
- Inactive states: Muted/gray color

---

## 📝 Replacement Strategy

### Phase 1: Critical Components (Week 1)
1. Bottom navigation tabs
2. Category system constants
3. Heart/bookmark icons in feed
4. Search bar icon

### Phase 2: High-Usage Components (Week 2)
5. Review star ratings
6. Profile screen icons
7. Business management icons
8. Edit/delete actions

### Phase 3: Supporting Elements (Week 3)
9. Error/warning states
10. Empty states
11. Section headers
12. Settings icons

### Phase 4: Polish (Week 4)
13. Remaining icons
14. Test screens
15. Edge cases

---

## 🔧 Implementation Notes

### Creating Icon Component Wrapper:

```typescript
// src/components/icons/Icon.tsx
import React from 'react';
import { ViewStyle } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  style
}) => {
  // Dynamic icon loading based on name
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      color={color}
      style={style}
    />
  );
};
```

### Usage Example:

```typescript
// Before
<Text style={styles.icon}>🔍</Text>

// After
<Icon name="search" size={24} color={colors.primary} />
```

---

## 📚 Next Steps

1. **Get Icon SVG Codes** - Request SVG/JSX for each icon from `@untitledui/icons`
2. **Create Icon Components** - Set up icon component system
3. **Start Replacement** - Follow priority order above
4. **Test Thoroughly** - Ensure all icons render correctly
5. **Update Documentation** - Document icon usage patterns

---

**Document Version**: 1.0
**Last Updated**: 2025-01-08
**Maintained By**: Development Team
