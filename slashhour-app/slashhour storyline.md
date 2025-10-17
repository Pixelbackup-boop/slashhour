Slashhour User Stories for Development

Epic 1: User Onboarding & Authentication

US-1.1: Quick Registration for Deal Seekers

As a cost-conscious consumer dealing with inflation
I want to sign up quickly without many steps
So that I can start saving money on essentials immediately

Acceptance Criteria:
- Sign up with phone, email, or social (Google/Facebook/Apple)
- Auto-detect location for "Near You" tab
- Select preferred essential categories (restaurants, grocery, fashion, etc.)
- Show immediate value: "247 deals near you in essential categories"
- Skip lengthy profile setup (progressive profiling)
- See sample deals before completing registration

US-1.2: Small Business Owner Registration

As a small business owner in essential categories
I want to create a business account easily
So that I can reach my customers when I have excess inventory

Acceptance Criteria:
- Choose business type: Restaurant/Grocery/Fashion/Electronics/Home/Beauty/Health
- **Precise GPS location capture:**
  * "Use My Current Location" button during registration
  * Request location permission with clear explanation
  * Capture precise GPS coordinates (latitude, longitude)
  * Auto-fill address fields using reverse geocoding
  * Show detected address for shop owner verification
  * Allow manual adjustment if detected address is incorrect
  * Store exact coordinates for accurate "Near You" matching
- Verify ownership (phone/email verification)
- Minimal fields: Name, Category, Location (GPS + Address), Phone
- Post first deal within 2 minutes of signup
- Free tier clearly marked (no credit card required)

US-1.3: Precise Business Location Capture

As a business owner registering my shop
I want my exact location automatically detected
So that my deals show up accurately for nearby customers

Acceptance Criteria:
- "Use My Current Location" button prominently displayed
- Request location permission with explanation: "We need your shop's exact location to show your deals to nearby customers"
- Capture high-accuracy GPS coordinates (latitude/longitude)
- Display loading state while getting location
- Reverse geocode GPS to human-readable address
- Auto-fill all address fields:
  * Street address
  * City
  * State/Province
  * Country (2-letter code)
  * Postal/ZIP code
- Show detected address for verification
- Allow manual editing if address needs correction
- Fallback to manual entry if GPS fails
- Store both coordinates and formatted address
- Validation: Ensure coordinates are within reasonable bounds

US-1.4: Location Permission with Value Proposition

As a user concerned about privacy
I want to understand why location is needed
So that I feel comfortable granting permission

Acceptance Criteria:
- Clear explanation: "Find deals at essential shops within 2-10km"
- Show map preview of nearby deals before permission
- Option to manually enter location
- Adjustable radius settings (2/3/5/10 km)
- "Location only while using app" option prominent

---
Epic 2: Core Two-Tab Interface

US-2.1: "You Follow" Tab - Personalized Essential Deals

As a user who shops at specific local stores
I want to see all deals from shops I follow in one feed
So that I never miss discounts on my regular essentials

Acceptance Criteria:
YOU FOLLOW Tab Requirements:
- Default home screen tab on app open
- Chronological feed (newest deals first)
- Shows ONLY deals from followed essential shops
- Each deal shows:
  * Shop name and category icon
  * Discount percentage (prominent)
  * Original vs sale price
  * Savings amount highlighted
  * Time remaining
  * "NEW" badge for deals < 2 hours old
- Empty state: "Follow your favorite essential shops"
- Pull-to-refresh functionality
- Infinite scroll with pagination
- Unread indicator when new deals posted

US-2.2: "Near You" Tab - Local Essential Discovery

As a user looking for nearby savings on essentials
I want to see all deals within my chosen radius
So that I can save money on groceries, meals, and necessities nearby

Acceptance Criteria:
NEAR YOU Tab Requirements:
- Radius selector: [2km] [3km] [5km] [10km]
- **Accurate distance calculations using GPS coordinates:**
  * Uses precise shop location from GPS registration
  * Real-time distance calculation from user's current location
  * Ensures accurate "Near You" results based on actual distances
- Shows all deals from essential shops in radius
- Each deal displays:
  * Distance (e.g., "0.8 km away")
  * Direction indicator (N, NE, E, etc.)
  * Walking/driving time estimate
  * Shop category badge
- Sort options:
  * Nearest first (default)
  * Biggest discount
  * Ending soon
  * Category filter
- Map toggle button (switch to map view)
- Real-time updates when location changes
- "23 grocery deals within 3km" counter

US-2.3: Tab Switching and State Management

As a user browsing deals
I want to seamlessly switch between my followed shops and nearby deals
So that I can find the best savings options

Acceptance Criteria:
- Single tap to switch tabs
- Visual indicator for active tab
- Preserve scroll position when switching
- Badge showing new deals count per tab
- Swipe gesture to switch tabs
- Remember last active tab on app restart
- Loading states preserved per tab

---
Epic 3: Essential Categories & Explore

US-3.1: Browse by Essential Categories

As a user looking for specific types of deals
I want to browse deals by essential categories
So that I can find exactly what I need

Acceptance Criteria:
Categories Screen:
┌─────────────────────────────┐
│     ESSENTIAL CATEGORIES    │
├─────────────────────────────┤
│ 🍕 Restaurants (142 deals)  │
│ 🛒 Grocery (89 deals)       │
│ 👗 Fashion (67 deals)       │
│ 👟 Shoes (45 deals)         │
│ 📱 Electronics (38 deals)   │
│ 🏠 Home & Living (52 deals) │
│ 💄 Beauty (41 deals)        │
│ ⚕️ Health (29 deals)        │
└─────────────────────────────┘

- Tap category to see filtered deals
- Show deal count per category
- Combine with location filters
- Recently viewed categories at top

US-3.2: Smart Category Suggestions

As a regular user
I want to get suggested deals based on my shopping patterns
So that I discover relevant savings on essentials

Acceptance Criteria:
- Track frequently viewed categories
- "Recommended for you" section
- Based on: followed shops, saved deals, redemption history
- Seasonal suggestions (winter clothing, summer groceries)
- Time-based (lunch deals at noon, grocery deals evening)

---
Epic 4: Following System for Essential Shops

US-4.1: Follow Essential Shops

As a user with favorite local stores
I want to follow essential shops I regularly visit
So that I see all their deals in my "You Follow" tab

Acceptance Criteria:
- Follow button on shop profiles
- Follow directly from deal cards
- Quick follow from map pins
- Instant addition to "You Follow" feed
- "Following ✓" confirmation
- Suggest similar essential shops after following
- "Follow all nearby groceries" quick action

US-4.2: Manage Following List by Category

As a user following many shops
I want to organize my followed shops by category
So that I can manage my essential shop preferences

Acceptance Criteria:
Following Management:
- View by category:
  * Restaurants (12 following)
  * Grocery stores (5 following)
  * Fashion shops (8 following)
- Bulk actions per category
- See last deal posted date
- "Most active" and "Inactive" filters
- Notification preferences per shop
- Unfollow with confirmation

US-4.3: Import Existing Social Media Follows

As a user who follows shops on social media
I want to import my existing shop follows
So that I don't have to manually search and follow again

Acceptance Criteria:
- Connect Instagram/Facebook
- Scan for business pages user follows
- Match with Slashhour businesses
- One-tap import all matches
- Show "23 of your Instagram follows are on Slashhour"
- Privacy-conscious (read-only access)

---
Epic 5: Deal Creation for Small Businesses

US-5.1: Quick Deal Post for Essential Items

As a restaurant owner with daily specials
I want to post deals in under 30 seconds
So that I can quickly attract customers during slow periods

Acceptance Criteria:
Quick Post Flow:
1. Tap "+" button
2. Choose template:
   - Restaurant: Lunch Special, Happy Hour, End of Day
   - Grocery: Fresh Produce, Bulk Discount, Expiring Today
   - Fashion: Seasonal Sale, Clearance, New Arrival Discount
3. Take/upload photo
4. Set discount: [20%] [30%] [40%] [50%] or custom
5. Set duration: [2 hrs] [4 hrs] [Today] [2 days]
6. Auto-calculate savings
7. **Deal automatically inherits shop's precise GPS location**
8. Post immediately

US-5.2: Inventory-Based Deal Creation

As a grocery store owner
I want to create deals based on inventory levels
So that I reduce waste on perishables

Acceptance Criteria:
- Mark items as "Expiring Soon"
- Suggested discount based on expiry date
- Bulk quantity options
- "Fresh Today" badge
- Pickup time slots
- Quantity available counter
- Auto-expire when sold out

US-5.3: Recurring Deal Templates

As a small business with regular promotions
I want to save and reuse deal templates
So that I can post consistent offers quickly

Acceptance Criteria:
- Save as template after posting
- Schedule recurring deals (daily/weekly)
- "Taco Tuesday" type recurring events
- Edit template library
- Category-specific templates provided
- One-tap duplicate previous deal

---
Epic 6: Deal Discovery & Search

US-6.1: Search Essential Deals

As a user looking for specific items
I want to search for deals on essential products
So that I can find exactly what I need at a discount

Acceptance Criteria:
- Search by: product, shop name, category
- Auto-complete suggestions
- Recent searches saved
- Filter results by:
  - Category
  - Distance
  - Discount percentage
  - Price range
- "grocery near me" type searches
- Voice search option

US-6.2: Map View for Essential Shops

As a user walking/driving around
I want to see essential deals on a map
So that I can find savings near my current location

Acceptance Criteria:
Map Features:
- Toggle from "Near You" list to map
- Color-coded pins by category:
  * Red: Restaurants
  * Green: Grocery
  * Blue: Fashion
  * Orange: Electronics
- Cluster pins when zoomed out
- Tap pin for deal preview
- Filter by category on map
- Route to shop button
- Show closing time on pins

US-6.3: Price Range Filters for Budget Shopping

As a budget-conscious shopper
I want to filter deals by price range
So that I stay within my budget for essentials

Acceptance Criteria:
- Quick filters: Under $10, $10-25, $25-50, $50+
- See original and discounted price
- Sort by biggest savings amount
- "Meals under $5" type presets
- Calculate total savings in cart
- Budget tracker integration

---
Epic 7: Redemption Flow

US-7.1: One-Tap Redemption for Essentials

As a customer ready to buy essentials
I want to redeem deals instantly at checkout
So that I save money without hassle

Acceptance Criteria:
- Big "REDEEM" button on deal
- Generate unique QR code
- Show backup numeric code
- 5-minute validity timer
- Automatic savings tracking
- Success confirmation
- Add to purchase history

US-7.2: Bulk Deal Redemption for Groceries

As a grocery shopper
I want to redeem multiple deals in one transaction
So that I can save on my entire shopping trip

Acceptance Criteria:
- "Add to Cart" for multiple deals
- Combined QR code for checkout
- Show total savings amount
- List all active deals at store
- Maximum quantities enforced
- Single scan at register

US-7.3: Merchant Validation System

As a small business owner
I want to quickly validate customer redemptions
So that checkout stays efficient

Acceptance Criteria:
- Scan QR with any smartphone camera
- Manual code entry backup
- Show deal details and discount
- Auto-apply in POS if integrated
- Mark as redeemed (one-time use)
- Daily redemption report

---
Epic 8: Notifications & Alerts

US-8.1: Essential Shop Deal Alerts

As a follower of essential shops
I want to get notified of new deals
So that I can save on necessities

Acceptance Criteria:
- Instant push for followed shops
- Category-specific notifications
- "Grocery deals near you" alerts
- Morning digest of restaurant lunch specials
- Evening grocery end-of-day deals
- Customizable quiet hours
- Rich notifications with images

US-8.2: Inflation-Fighting Alerts

As a user trying to reduce spending
I want to get alerts for high-discount essential deals
So that I maximize savings on necessities

Acceptance Criteria:
- Alert when deals > 40% off
- "Beat inflation" notifications
- Price drop alerts on saved items
- Weekly savings summary
- "You saved $X this month" updates
- Compare to average inflation rate

US-8.3: Expiry Reminders for Saved Deals

As a user who saves deals
I want to be reminded before deals expire
So that I don't miss out on savings

Acceptance Criteria:
- 2-hour warning for saved deals
- "Use it or lose it" messaging
- Snooze option
- Group expiry notifications
- Quick action to redeem
- Auto-remove expired deals

---
Epic 9: Social Features

US-9.1: Share Essential Deals

As a user finding great deals
I want to share deals with friends and family
So that we can save money together on essentials

Acceptance Criteria:
- Share to WhatsApp, Messages, social media
- "Family Grocery Deals" groups
- Share with Slashhour users directly
- Include shop name, discount, expiry
- Deep link to deal in app
- Track shares for shops

US-9.2: Review Essential Shops

As a customer who redeemed deals
I want to review shops and deals
So that others know which offers are genuine

Acceptance Criteria:
- 5-star rating system
- "Deal as advertised?" Yes/No
- Photo uploads
- Review after redemption only
- Helpful/Not helpful votes
- Shop owner responses
- Filter by verified purchases

US-9.3: Community Savings Leaderboard

As a competitive saver
I want to see how my savings compare
So that I feel motivated to find more deals

Acceptance Criteria:
- Monthly savings leaderboard
- Neighborhood rankings
- Category-specific leaders
- Badges for milestones
- Share achievements
- Opt-in/privacy controls

---
Epic 10: Business Analytics

US-10.1: Small Business Dashboard

As a small business owner
I want to see how my deals perform
So that I can optimize my promotions

Acceptance Criteria:
Dashboard Metrics:
- Real-time views
- Redemption rate
- Revenue generated
- Peak view times
- Customer demographics
- Distance traveled
- Category performance
- Compare to similar shops

US-10.2: Inventory Impact Tracking

As a grocery/restaurant owner
I want to track inventory movement from deals
So that I reduce waste and maximize revenue

Acceptance Criteria:
- Before/after inventory levels
- Waste reduction percentage
- Optimal discount calculator
- Expiry prediction
- Demand forecasting
- ROI per deal type
- Suggested posting times

US-10.3: Follower Analytics

As a business building loyalty
I want to understand my followers
So that I can create relevant deals

Acceptance Criteria:
- Follower growth chart
- Demographics breakdown
- Active vs inactive followers
- Preferred deal types
- Shopping patterns
- Engagement rates
- Export follower insights

---
Epic 11: Savings & Budget Features

US-11.1: Inflation Savings Tracker

As a user fighting inflation
I want to track my monthly savings
So that I see how I'm offsetting price increases

Acceptance Criteria:
Savings Dashboard:
- Monthly savings total
- Savings by category:
  * Food: $142 saved
  * Grocery: $89 saved
  * Clothing: $67 saved
- YTD savings
- "You beat inflation by 12%"
- Graph of savings over time
- Share monthly report

US-11.2: Essential Budget Planner

As a family budget manager
I want to plan essential purchases around deals
So that I maximize our budget

Acceptance Criteria:
- Set monthly budget by category
- See available deals within budget
- "Meal planning" with restaurant deals
- Grocery list with deal matching
- Clothing budget optimizer
- Track spending vs savings

US-11.3: Group Buying Coordination

As a user wanting bulk savings
I want to coordinate group purchases
So that we get bulk discounts on essentials

Acceptance Criteria:
- Create buying group
- Invite family/friends
- See bulk deal requirements
- Split payment calculator
- Group chat feature
- Coordinate pickup times

---
Epic 12: Multi-Language & Currency (Global)

US-12.1: Multi-Language Support

As a user in Europe/SEA/LATAM
I want to use the app in my language
So that I can easily navigate and save

Acceptance Criteria:
- Languages: English, Spanish, Portuguese, German, French, Japanese, Korean, Thai
- Auto-detect from device settings
- Language switcher in settings
- Localized deal descriptions
- Right-to-left support (Arabic - future)
- Localized categories

US-12.2: Multi-Currency Display

As a international user
I want to see prices in my local currency
So that I understand the value

Acceptance Criteria:
- Auto-detect from location
- Currency selector
- Original price in local currency
- Savings calculated correctly
- Symbol positioning (€, ¥, R$)
- Exchange rate updates

---
Development Priority Matrix

Phase 1 (Weeks 1-4): Core MVP

Must Have (P0):
- User registration (US-1.1)
- Business registration (US-1.2)
- Two-tab interface (US-2.1, US-2.2)
- Follow system (US-4.1)
- Quick deal posting (US-5.1)
- Basic redemption (US-7.1)
- Essential categories (US-3.1)

Phase 2 (Weeks 5-8): Engagement

Should Have (P1):
- Push notifications (US-8.1)
- Search functionality (US-6.1)
- Map view (US-6.2)
- Business dashboard (US-10.1)
- Share deals (US-9.1)
- Savings tracker (US-11.1)

Phase 3 (Weeks 9-12): Growth

Nice to Have (P2):
- Reviews (US-9.2)
- Templates (US-5.3)
- Import social follows (US-4.3)
- Advanced filters (US-6.3)
- Bulk redemptions (US-7.2)
- Budget planner (US-11.2)

Phase 4 (Post-MVP): Scale

Future (P3):
- Multi-language (US-12.1)
- Group buying (US-11.3)
- Community features (US-9.3)
- Advanced analytics (US-10.2)
- Inventory management (US-5.2)

---
Success Metrics

User Engagement KPIs

- Both tabs usage rate: > 80%
- Follow rate: > 60% follow 3+ shops
- Category coverage: Users engage with 3+ categories
- Deal view rate: 85% of followed shop deals viewed
- Redemption rate: > 35%

Business Success KPIs

- Deal posting frequency: 3+ per week
- Follower growth: 20% monthly
- Redemption/view ratio: > 20%
- Revenue per shop: $500+ monthly
- Retention: 90% monthly

Platform Growth KPIs

- User acquisition: 50K monthly
- Shop acquisition: 1K monthly
- Geographic density: 50+ shops per sq km
- Category balance: No category > 40% of deals
- Viral coefficient: 0.8+

✅ Comprehensive User Stories Complete

These user stories cover all aspects of your Slashhour platform with focus on:
- Essential categories (grocery, restaurants, fashion, etc.)
- Two-tab interface (You Follow / Near You)
- Inflation-fighting features
- Small business support
- Global expansion readiness
