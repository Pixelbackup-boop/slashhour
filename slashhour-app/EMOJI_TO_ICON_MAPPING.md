# Emoji to Icon Mapping - @untitledui/icons

**Generated**: 2025-01-08
**Package**: @untitledui/icons (Free + Pro version with 4,600+ icons)
**Status**: ✅ Package installed successfully

---

## 🎯 Phase 1: Critical Icons (Bottom Nav + Core Features)

### Bottom Navigation Icons

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 🏠 | Home tab | `Home05` | `import Home05 from "@untitledui/icons/Home05"` |
| 🔍 | Search tab | `SearchMd` | `import SearchMd from "@untitledui/icons/SearchMd"` |
| 🔔 | Notifications tab | `Bell01` | `import Bell01 from "@untitledui/icons/Bell01"` |
| 💬 | Messages tab | `MessageChatCircle` | `import MessageChatCircle from "@untitledui/icons/MessageChatCircle"` |
| 👤 | Profile tab | `User01` | `import User01 from "@untitledui/icons/User01"` |

**Usage Example**:
```jsx
import Home05 from "@untitledui/icons/Home05";

<Home05 size={24} color={focused ? "#007AFF" : "#8E8E93"} />
```

---

### Heart/Bookmark Icons (10+ uses)

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| ❤️ | Bookmarked (filled) | `Heart` | `import Heart from "@untitledui/icons/Heart"` |
| 🤍 | Not bookmarked (outline) | `Heart` | `import Heart from "@untitledui/icons/Heart"` |

**Note**: Use `color` prop or CSS to differentiate filled vs outline appearance.

---

### Location Icons (8+ uses)

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 📍 | Location/distance marker | `MarkerPin01` | `import MarkerPin01 from "@untitledui/icons/MarkerPin01"` |
| 🗺️ | Map/empty state | `Map02` | `import Map02 from "@untitledui/icons/Map02"` |

---

### Category Icons (Used in constants/categories.ts)

| Emoji | Category | Icon Name | Import |
|-------|----------|-----------|--------|
| 🍽️ | Restaurant | `Building07` | `import Building07 from "@untitledui/icons/Building07"` |
| 🛒 | Grocery | `ShoppingCart01` | `import ShoppingCart01 from "@untitledui/icons/ShoppingCart01"` |
| 👕 | Fashion | *(No direct match - use generic)* | `import ShoppingBag01 from "@untitledui/icons/ShoppingBag01"` |
| 👟 | Shoes | *(No direct match - use generic)* | `import ShoppingBag02 from "@untitledui/icons/ShoppingBag02"` |
| 📱 | Electronics | *(Use Building for now)* | `import Building02 from "@untitledui/icons/Building02"` |
| 🏠 | Home & Living | `Home01` | `import Home01 from "@untitledui/icons/Home01"` |
| 💄 | Beauty | `Heart` | `import Heart from "@untitledui/icons/Heart"` |
| ⚕️ | Health | `Heart` | `import Heart from "@untitledui/icons/Heart"` |

---

## 🔥 Phase 2: High-Usage Icons

### Search & Filters

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 🔍 | Search bar | `SearchMd` | `import SearchMd from "@untitledui/icons/SearchMd"` |
| ⚡ | Flash deals toggle | `Zap` | `import Zap from "@untitledui/icons/Zap"` |

---

### Reviews & Ratings

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| ⭐ | Star filled | `Star01` | `import Star01 from "@untitledui/icons/Star01"` |
| ☆ | Star outline | `Star01` | `import Star01 from "@untitledui/icons/Star01"` |

**Note**: Use fill/stroke styling to differentiate filled vs outline

---

### Actions (Edit, Delete, etc.)

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| ✏️ | Edit action | `Edit03` | `import Edit03 from "@untitledui/icons/Edit03"` |
| 🗑️ | Delete action | `Trash01` | `import Trash01 from "@untitledui/icons/Trash01"` |
| ✅ | Success/check | `CheckCircle` | `import CheckCircle from "@untitledui/icons/CheckCircle"` |
| ❌ | Error/close | `XCircle` | *(Need to find)* |

---

### Business & Profile

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 🏪 | Business/shop | `Building07` | `import Building07 from "@untitledui/icons/Building07"` |
| 💰 | Savings/pricing | `CurrencyDollar` | `import CurrencyDollar from "@untitledui/icons/CurrencyDollar"` |
| 🎉 | Deals/celebration | `Gift01` | `import Gift01 from "@untitledui/icons/Gift01"` |
| 📊 | Activity/stats | `BarChart07` | `import BarChart07 from "@untitledui/icons/BarChart07"` |
| 🎯 | Target/goals | `Target04` | `import Target04 from "@untitledui/icons/Target04"` |

---

## 🟡 Phase 3: Supporting Icons

### Warnings & Alerts

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| ⚠️ | Warning/alert (12+ uses) | `AlertTriangle` | `import AlertTriangle from "@untitledui/icons/AlertTriangle"` |
| ℹ️ | Info message | `InfoCircle` | `import InfoCircle from "@untitledui/icons/InfoCircle"` |
| 💡 | Tip/hint (5+ uses) | `Lightbulb01` | `import Lightbulb01 from "@untitledui/icons/Lightbulb01"` |

---

### Date & Time

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 📅 | Calendar/schedule | `Calendar` | `import Calendar from "@untitledui/icons/Calendar"` |
| 🕒 | Time/clock | `Clock` | `import Clock from "@untitledui/icons/Clock"` |

---

### Communication

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 📞 | Phone/contact | `Phone` | `import Phone from "@untitledui/icons/Phone"` |
| ✉️ | Email/mail | `Mail01` | `import Mail01 from "@untitledui/icons/Mail01"` |

---

### Security & Settings

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 🔒 | Locked field/security | `Lock01` | `import Lock01 from "@untitledui/icons/Lock01"` |
| 🔓 | Unlocked | `LockUnlocked01` | `import LockUnlocked01 from "@untitledui/icons/LockUnlocked01"` |
| ⚙️ | Settings | *(Need to find Settings icon)* | - |
| 🛡️ | Shield/protection | `Shield01` | `import Shield01 from "@untitledui/icons/Shield01"` |

---

### Authentication

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 👁️ | Show password | `Eye` | `import Eye from "@untitledui/icons/Eye"` |
| 👁️‍🗨️ | Hide password | `EyeOff` | `import EyeOff from "@untitledui/icons/EyeOff"` |

---

### Navigation & Direction

| Emoji | Context | Icon Name | Import |
|-------|---------|-----------|--------|
| 📍 | Auto-fill location | `NavigationPointer01` | `import NavigationPointer01 from "@untitledui/icons/NavigationPointer01"` |

---

## 📝 Icon Usage Pattern

### Basic Usage:
```jsx
import Home05 from "@untitledui/icons/Home05";

function MyComponent() {
  return <Home05 size={24} color="#000" />;
}
```

### With Dynamic Sizing:
```jsx
import SearchMd from "@untitledui/icons/SearchMd";

<SearchMd size={20} color={colors.primary} />
```

### With Theme Colors:
```jsx
import Heart from "@untitledui/icons/Heart";

<Heart
  size={24}
  color={isBookmarked ? colors.error : colors.textSecondary}
/>
```

### In Buttons:
```jsx
import Edit03 from "@untitledui/icons/Edit03";

<TouchableOpacity onPress={onEdit}>
  <Edit03 size={20} color={colors.primary} />
</TouchableOpacity>
```

---

## 🎨 Styling Guidelines

### Sizes:
- **Small**: 16px (badges, inline)
- **Default**: 20-24px (buttons, list items)
- **Medium**: 28-32px (tab bar active)
- **Large**: 48-64px (empty states)

### Colors:
- **Primary Actions**: Use theme primary color
- **Secondary Actions**: Use gray/muted colors
- **Active State**: Use accent color
- **Inactive State**: Use gray-400 or similar
- **Error/Danger**: Use red/error color
- **Success**: Use green/success color

---

## 🚀 Implementation Steps

### Step 1: Create Icon Wrapper Component
Create `src/components/icons/Icon.tsx` to centralize icon management:

```typescript
import React from 'react';

// Import all icons
import Home05 from "@untitledui/icons/Home05";
import SearchMd from "@untitledui/icons/SearchMd";
import Bell01 from "@untitledui/icons/Bell01";
// ... import more

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

const ICON_MAP = {
  home: Home05,
  search: SearchMd,
  bell: Bell01,
  // ... add more mappings
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor'
}) => {
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} color={color} />;
};
```

### Step 2: Replace Emojis Systematically

**Bottom Nav First** (AppNavigator.tsx):
```typescript
// Before
<Text style={styles.icon}>🏠</Text>

// After
import Home05 from "@untitledui/icons/Home05";
<Home05 size={focused ? 28 : 24} color={focused ? colors.primary : colors.gray} />
```

**Categories Next** (constants/categories.ts):
```typescript
// Before
icon: '🛒'

// After
import ShoppingCart01 from "@untitledui/icons/ShoppingCart01";
icon: ShoppingCart01
```

**Feed Cards** (FeedDealCard.tsx):
```typescript
// Before
<Text style={styles.heart}>{isBookmarked ? '❤️' : '🤍'}</Text>

// After
import Heart from "@untitledui/icons/Heart";
<Heart
  size={20}
  color={isBookmarked ? colors.error : colors.textSecondary}
/>
```

---

## 📊 Progress Tracking

### Phase 1: Critical (Week 1)
- [ ] Bottom navigation (5 icons)
- [ ] Heart/Bookmark (2 icons, 10+ uses)
- [ ] Category system (8 icons)
- [ ] Search bar (1 icon)
- [ ] Location markers (2 icons)

### Phase 2: High-Usage (Week 2)
- [ ] Star ratings (2 variants)
- [ ] Edit/Delete actions (2 icons)
- [ ] Profile screen icons (10+ icons)
- [ ] Business management (5+ icons)

### Phase 3: Supporting (Week 3)
- [ ] Alert/Warning icons (15+ uses)
- [ ] Date/Time icons (5+ uses)
- [ ] Communication icons (5+ uses)
- [ ] Security icons (5+ uses)

### Phase 4: Polish (Week 4)
- [ ] Test screens
- [ ] Edge cases
- [ ] Documentation updates

---

## 🔍 Icon Search Tips

To find more icons in the package:
```bash
# Search for specific icon types
ls node_modules/@untitledui/icons/dist/ | grep -i "search_term" | grep ".js$"

# Example: Find all "settings" icons
ls node_modules/@untitledui/icons/dist/ | grep -i "setting" | grep ".js$"

# List all available icons
ls node_modules/@untitledui/icons/dist/*.js | wc -l
```

---

## 📚 Resources

- **Package Docs**: https://www.untitledui.com/react/docs/icons
- **Icon Gallery**: https://www.untitledui.com/resources/icons
- **License**: https://www.untitledui.com/license

---

**Document Version**: 1.0
**Last Updated**: 2025-01-08
**Maintained By**: Development Team
