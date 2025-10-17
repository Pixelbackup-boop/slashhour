# Slashhour Debugging Patterns & Methodology

**Version:** 1.0
**Last Updated:** October 14, 2025
**Status:** ✅ ACTIVE - Follow for ALL bug investigations

---

## 📋 Table of Contents
1. [The Systematic Debugging Approach](#the-systematic-debugging-approach)
2. [Case Study: Redemption History Bug](#case-study-redemption-history-bug)
3. [Case Study: Profile Stats Loading Issue](#case-study-profile-stats-loading-issue)
4. [Backend Debugging Tools](#backend-debugging-tools)
5. [Frontend Debugging Tools](#frontend-debugging-tools)
6. [Database Debugging](#database-debugging)
7. [Network Debugging](#network-debugging)
8. [JWT & Authentication Debugging](#jwt--authentication-debugging)
9. [Common Bug Patterns](#common-bug-patterns)
10. [Debugging Checklist](#debugging-checklist)

---

## 🔍 The Systematic Debugging Approach

### Step-by-Step Methodology:

```mermaid
1. Reproduce the Bug
    ↓
2. Check Frontend Console Logs
    ↓
3. Check Backend Server Logs
    ↓
4. Verify Database State
    ↓
5. Add Strategic Logging
    ↓
6. Identify Root Cause
    ↓
7. Fix & Verify
    ↓
8. Document the Fix
```

### Key Principles:

1. **NEVER ASSUME** - Always verify with logs/data
2. **WORK BACKWARDS** - Start from symptom → trace to cause
3. **ADD LOGGING** - Strategic console.logs are your friend
4. **CHECK DATABASE** - The source of truth
5. **VERIFY JWT** - Authentication issues are common
6. **READ ERROR MESSAGES** - They tell you exactly what's wrong
7. **TEST IN ISOLATION** - Break down complex flows

---

## 📚 Case Study: Redemption History Bug

### The Problem:
User redeemed deals but redemption history showed nothing.

### Investigation Steps:

#### 1. Initial Hypothesis
"Redemptions aren't being saved to database"

#### 2. Check Backend Logs
```bash
# Looked at server logs
tail -f /tmp/nest-server.log
```

**Finding:** No INSERT queries visible initially

#### 3. Add Strategic Logging
Added detailed logging to `RedemptionsService.redeemDeal()`:

```typescript
// Added at line 70-96 in redemptions.service.ts
console.log('🔍 Creating redemption for:', {
  userId: user.id,
  dealId: deal.id,
  businessId: deal.business.id,
});

console.log('✅ Redemption entity created:', {
  hasUser: !!redemption.user,
  hasDeal: !!redemption.deal,
  hasBusiness: !!redemption.business,
});

console.log('💾 Saving redemption to database...');
const savedRedemption = await this.redemptionRepository.save(redemption);
console.log('✅ Redemption saved successfully! ID:', savedRedemption.id);
```

#### 4. Discovered Multiple Server Processes
```bash
lsof -i :3000
# Found old process still running!
```

**Learning:** Old server was handling requests without new logging code

**Fix:** Killed old process, restarted properly

#### 5. New Logs Revealed the Truth
After restarting, logs showed:
- ✅ INSERT query WAS executing successfully
- ❌ getUserRedemptions query had `WHERE "user"."id" = $1 -- PARAMETERS: [null]`

**Root Cause Identified:** User ID was NULL when fetching redemptions!

#### 6. Traced the NULL User ID
Added logging to `RedemptionsController`:

```typescript
console.log('🔍 Full req.user object:', req.user);
console.log('🔍 Extracted userId:', req.user.sub);
```

**Output:**
```
🔍 Full req.user object: { id: '2c62eaa8-...', email: 'testuser@...', ... }
🔍 Extracted userId: undefined
```

**Root Cause Found:** Code was accessing `req.user.sub` but the property was named `id`!

#### 7. The Fix
```typescript
// BEFORE (BROKEN):
const userId = req.user.sub;  // ❌ undefined!

// AFTER (FIXED):
const userId = req.user.id;   // ✅ correct property
```

Applied to all three methods in RedemptionsController.

#### 8. Verification
- Checked server recompiled successfully
- Verified database query logs now showed correct user ID
- Tested redemption history - working!

### Lessons Learned:

1. ✅ **Multiple processes** can cause confusing logs
2. ✅ **Strategic logging** reveals the actual data flow
3. ✅ **Database logs** show the actual SQL being executed
4. ✅ **Never assume property names** - always verify
5. ✅ **Log the full object** to see all available properties

---

## 📚 Case Study: Profile Stats Loading Issue

### The Problem:
Stats showed "Loading your stats..." indefinitely after analytics change.

### Investigation Steps:

#### 1. Check Backend Logs First
```bash
tail -20 /private/tmp/slashhour-api.log
```

**Finding:**
```
path: '/api/v1/users/profile/stats',
status: 401,
message: { message: 'Unauthorized', statusCode: 401 }
```

#### 2. Check Refresh Token
Logs also showed:
```
path: '/api/v1/auth/refresh',
status: 401,
message: 'Invalid refresh token'
```

**Root Cause:** JWT token had expired!

#### 3. Verification
Not related to analytics change - pure coincidence in timing.

**Solution:** Log out and log back in to get fresh token.

### Lessons Learned:

1. ✅ **Check backend logs FIRST** before debugging frontend
2. ✅ **401 errors** = authentication issue, not code issue
3. ✅ **Correlation ≠ Causation** - timing can be coincidental
4. ✅ **Token expiration** is a common issue during development

---

## 🛠️ Backend Debugging Tools

### 1. Server Logs Analysis

#### Check Live Logs:
```bash
# Follow live logs
tail -f /tmp/nest-server.log

# Filter for specific patterns
tail -f /tmp/nest-server.log | grep "ERROR"
tail -f /tmp/nest-server.log | grep "profile/stats"

# Check recent errors
tail -50 /private/tmp/slashhour-api.log | grep "Error"
```

#### Check SQL Queries:
```bash
# See actual queries being executed
tail -f /tmp/nest-server.log | grep "query:"
```

**Look for:**
- ✅ INSERT queries when creating records
- ✅ SELECT queries when fetching data
- ❌ PARAMETERS: [null] - indicates missing data
- ❌ Error messages

### 2. Check Running Processes

#### Find Port Usage:
```bash
lsof -i :3000
```

**Output:**
```
COMMAND   PID USER   FD   TYPE
node    8612  elw   23u  IPv6  ← This process
node    9234  elw   23u  IPv6  ← Another process (problem!)
```

#### Kill Old Processes:
```bash
# Kill specific PID
kill -9 8612

# Or kill all on port
lsof -ti :3000 | xargs kill -9
```

### 3. Add Strategic Logging

#### In Services:
```typescript
export class MyService {
  async myMethod(param: string) {
    console.log('🔍 Input params:', { param });

    const result = await this.repository.find({ where: { param } });
    console.log('✅ Query result:', {
      count: result.length,
      firstItem: result[0]
    });

    return result;
  }
}
```

#### In Controllers:
```typescript
@Get()
async getItems(@Req() req) {
  console.log('🔍 Full request user:', req.user);
  console.log('🔍 Extracted user ID:', req.user.id);

  const userId = req.user.id;
  return this.service.getItems(userId);
}
```

### 4. Database Query Logging

Enable in TypeORM config:
```typescript
// database.config.ts
{
  logging: true,  // Shows all SQL queries
  // OR
  logging: ['query', 'error'],  // Shows queries and errors only
}
```

---

## 🎨 Frontend Debugging Tools

### 1. Console Logging Strategy

#### Screen Entry:
```typescript
useEffect(() => {
  console.log('📱 Screen mounted:', 'ProfileScreen');
}, []);
```

#### API Calls:
```typescript
const fetchData = async () => {
  console.log('🌐 API Call starting:', endpoint);

  try {
    const response = await apiClient.get(endpoint);
    console.log('✅ API Success:', {
      status: response.status,
      dataCount: response.data?.length
    });
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
};
```

#### State Changes:
```typescript
useEffect(() => {
  console.log('📊 State updated:', { isLoading, hasData: !!data, error });
}, [isLoading, data, error]);
```

### 2. Expo Dev Tools

#### View Logs:
```bash
# In terminal where expo is running
# All logs appear automatically

# Filter logs
# Look for: ERROR, Warning, Failed
```

#### Network Inspection:
- Use React Native Debugger
- Or add logging to ApiClient:

```typescript
// In ApiClient.ts
axios.interceptors.request.use(request => {
  console.log('🌐 Request:', request.method, request.url);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message
    });
    return Promise.reject(error);
  }
);
```

### 3. React DevTools

Check component state:
- Install React Native Debugger
- Inspect component props and state
- View hooks values

### 4. Redux DevTools

Check global state:
```typescript
// In store/store.ts - already configured
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: rootReducer,
  // DevTools enabled in development automatically
});
```

---

## 🗄️ Database Debugging

### 1. Direct Database Queries

#### Connect to Database:
```bash
# Using psql
PGPASSWORD='' psql -U elw -d slashhour_dev

# Or with full connection string
psql postgresql://elw@localhost:5432/slashhour_dev
```

#### Check Table Structure:
```sql
-- Show table columns
\d user_redemptions

-- Show all tables
\dt

-- Show specific table with details
\d+ users
```

#### Query Data:
```sql
-- Check recent redemptions
SELECT id, user_id, deal_id, redeemed_at
FROM user_redemptions
ORDER BY redeemed_at DESC
LIMIT 5;

-- Count records
SELECT COUNT(*) FROM user_redemptions;

-- Check specific user's data
SELECT * FROM user_redemptions
WHERE user_id = '2c62eaa8-85cd-4fc6-bd33-eab76b015420';

-- Check with joins
SELECT
  r.id,
  r.redeemed_at,
  u.username,
  d.title as deal_title
FROM user_redemptions r
JOIN users u ON r.user_id = u.id
JOIN deals d ON r.deal_id = d.id
ORDER BY r.redeemed_at DESC
LIMIT 10;
```

### 2. Verify Data Integrity

#### Check for NULL values:
```sql
-- Find redemptions with null user_id
SELECT COUNT(*) FROM user_redemptions WHERE user_id IS NULL;

-- Find users without required fields
SELECT id, username, email FROM users WHERE email IS NULL;
```

#### Check relationships:
```sql
-- Find orphaned records
SELECT r.id
FROM user_redemptions r
LEFT JOIN users u ON r.user_id = u.id
WHERE u.id IS NULL;
```

### 3. Common Database Checks

```sql
-- Check user exists
SELECT id, username, email FROM users WHERE id = 'user-id-here';

-- Check deal exists
SELECT id, title, status FROM deals WHERE id = 'deal-id-here';

-- Check redemption count per user
SELECT user_id, COUNT(*) as redemption_count
FROM user_redemptions
GROUP BY user_id
ORDER BY redemption_count DESC;

-- Check total savings per user
SELECT user_id, SUM(savings_amount) as total_savings
FROM user_redemptions
GROUP BY user_id;
```

---

## 🌐 Network Debugging

### 1. Test API Endpoints with cURL

#### GET Request:
```bash
TOKEN="your-jwt-token-here"

curl -X GET "http://localhost:3000/api/v1/users/profile/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

#### POST Request:
```bash
curl -X POST "http://localhost:3000/api/v1/redemptions/deal-id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

#### Check Response Status:
```bash
curl -I http://localhost:3000/api/v1/health
```

### 2. Check API Response Format

```bash
# Pretty print JSON response
curl http://localhost:3000/api/v1/endpoint | python3 -m json.tool

# Or use jq
curl http://localhost:3000/api/v1/endpoint | jq .
```

### 3. Common Network Issues

#### Connection Refused:
```bash
# Check if server is running
lsof -i :3000

# Check if correct port
cat slashhour-api/.env | grep PORT
```

#### CORS Errors:
Check backend CORS settings:
```typescript
// In main.ts
app.enableCors({
  origin: ['http://localhost:19006', 'exp://localhost:19000'],
  credentials: true,
});
```

---

## 🔐 JWT & Authentication Debugging

### 1. Decode JWT Token

#### Using jwt.io:
1. Copy token from logs
2. Paste into https://jwt.io
3. Check payload for user data

#### Using Command Line:
```bash
TOKEN="eyJhbGc..."

# Decode payload (base64)
echo $TOKEN | cut -d'.' -f2 | base64 -d | python3 -m json.tool
```

### 2. Check Token Expiration

```typescript
// In frontend
const token = await authService.getToken();
const decoded = jwtDecode(token);
console.log('Token expires:', new Date(decoded.exp * 1000));
console.log('Is expired:', Date.now() > decoded.exp * 1000);
```

### 3. Verify req.user Object

```typescript
// In backend controller
@Get('endpoint')
async getEndpoint(@Req() req) {
  // Log EVERYTHING about the user object
  console.log('🔍 req.user full object:', JSON.stringify(req.user, null, 2));
  console.log('🔍 req.user keys:', Object.keys(req.user));
  console.log('🔍 req.user.id:', req.user.id);
  console.log('🔍 req.user.sub:', req.user.sub);

  // Use the correct property!
  const userId = req.user.id; // or req.user.sub - verify first!
  return this.service.getData(userId);
}
```

### 4. Common JWT Issues

#### Issue: "Unauthorized" errors
**Check:**
- Token exists in request headers
- Token format is correct (Bearer token)
- Token hasn't expired
- Secret key matches between sign/verify

#### Issue: req.user is undefined
**Check:**
- JwtAuthGuard is applied
- JWT strategy is configured
- Token is being validated

#### Issue: Wrong user property name
**Check:**
```typescript
// In jwt.strategy.ts - what does validate() return?
async validate(payload: any) {
  return {
    id: payload.sub,  // ← Check this!
    email: payload.email
  };
}

// This determines req.user shape!
// If returns { id: ... }, use req.user.id
// If returns { sub: ... }, use req.user.sub
```

---

## 🐛 Common Bug Patterns

### 1. Null/Undefined Property Access

#### Symptom:
```
TypeError: Cannot read property 'id' of undefined
```

#### Root Cause:
```typescript
const userId = req.user.sub;  // req.user exists but .sub doesn't
const name = user.profile.name;  // user exists but .profile doesn't
```

#### Fix:
```typescript
// Check the actual object
console.log('Full object:', req.user);

// Use optional chaining
const name = user?.profile?.name;

// Or check first
if (user && user.profile) {
  const name = user.profile.name;
}
```

### 2. Snake_case vs CamelCase Mismatch

#### Symptom:
Frontend shows `undefined` for values that exist in backend.

#### Root Cause:
```typescript
// Backend returns:
{ "original_price": 29.99 }

// Frontend tries to access:
item.originalPrice  // undefined!
```

#### Fix:
Transform in backend service:
```typescript
// In service, map the response
return {
  originalPrice: item.original_price,
  paidPrice: item.paid_price,
  // ... etc
};
```

### 3. Infinite Re-render Loop

#### Symptom:
- App freezes
- Logs repeat endlessly
- "Maximum update depth exceeded"

#### Root Cause:
```typescript
// Setting state in render
if (data.length > 0) {
  setProcessed(true);  // ← Causes re-render, loops forever!
}
```

#### Fix:
```typescript
// Set state in useEffect
useEffect(() => {
  if (data.length > 0) {
    setProcessed(true);
  }
}, [data]);
```

### 4. Missing useCallback Dependencies

#### Symptom:
Function called with stale data.

#### Root Cause:
```typescript
const fetchData = useCallback(async () => {
  await api.get(`/data/${userId}`);  // userId from props
}, []); // ← Missing userId dependency!
```

#### Fix:
```typescript
const fetchData = useCallback(async () => {
  await api.get(`/data/${userId}`);
}, [userId]); // ← Include all dependencies
```

### 5. Async State Updates Not Reflected

#### Symptom:
State doesn't update after API call.

#### Root Cause:
```typescript
const data = await fetchData();
console.log(myState);  // Shows old value!
```

#### Why:
setState is async, log runs before state updates.

#### Fix:
```typescript
const data = await fetchData();
setMyState(data);

// Use useEffect to react to state changes
useEffect(() => {
  console.log('State updated:', myState);
}, [myState]);
```

### 6. React Native FlatList Duplicate Key Error

#### Symptom:
```
ERROR  Encountered two children with the same key, `%s`.
Keys should be unique so that components maintain their identity across updates.
Non-unique keys may cause children to be duplicated and/or omitted
```

Shows a UUID like: `.$48e413c6-5805-4dcd-a3c9-692be1e4940f`

#### Root Cause:
Backend returning duplicate records OR FlatList keyExtractor not generating unique keys.

```typescript
// Backend returns duplicate business IDs
[
  { id: '48e413c6-...' },  // Same ID
  { id: '48e413c6-...' },  // Same ID again!
]

// FlatList uses ID as key
<FlatList
  data={businesses}
  keyExtractor={(item) => item.id}  // ← Not unique!
/>
```

#### Fix Approach 1: Update keyExtractor
Add index to ensure uniqueness:

```typescript
// BEFORE (BROKEN):
<FlatList
  data={businesses}
  keyExtractor={(item) => item.id}
  // ...
/>

// AFTER (FIXED):
<FlatList
  data={businesses}
  keyExtractor={(item, index) => `${item.id}-${index}`}
  // ...
/>
```

#### Fix Approach 2: Deduplicate Data in Hook
Prevent duplicates at the source:

```typescript
// In your custom hook (e.g., useFollowedBusinesses.ts)
const fetchData = async () => {
  const response = await apiClient.get('/endpoint');

  // Transform the response
  const transformed = response.data.map(item => ({
    ...item,
    // transform fields
  }));

  // Deduplicate by ID
  const uniqueItems = transformed.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
  );

  setData(uniqueItems);
};
```

#### Investigation Steps:
1. **Check Expo logs** - Note the UUID from error message
2. **Query database** - Check if that ID appears multiple times:
   ```sql
   SELECT id, business_name, COUNT(*)
   FROM businesses
   GROUP BY id, business_name
   HAVING COUNT(*) > 1;
   ```
3. **Check backend response** - Log the API response:
   ```typescript
   console.log('API Response:', JSON.stringify(response, null, 2));
   ```
4. **Apply both fixes** - Use index in key AND deduplicate data

#### Prevention:
- Always use `keyExtractor={(item, index) => \`${item.id}-${index}\`}` for FlatLists
- Add deduplication logic in hooks that fetch list data
- Add database constraints to prevent duplicate entries
- Log API responses during development to catch duplicates early

---

## ✅ Debugging Checklist

### When a Bug is Reported:

#### 1. Reproduction
- [ ] Can you reproduce it?
- [ ] Happens every time or intermittently?
- [ ] Specific to one user/device?

#### 2. Frontend Checks
- [ ] Check Expo dev console for errors
- [ ] Check Redux state
- [ ] Check component state
- [ ] Check network requests in logs

#### 3. Backend Checks
- [ ] Check server logs for errors
- [ ] Check SQL query logs
- [ ] Check if endpoint is being hit
- [ ] Check request parameters

#### 4. Database Checks
- [ ] Data exists in database?
- [ ] Correct user ID?
- [ ] Relationships intact?
- [ ] Any NULL values?

#### 5. Authentication Checks
- [ ] Token valid?
- [ ] Token not expired?
- [ ] req.user populated correctly?
- [ ] Correct user property name?

#### 6. Add Logging
- [ ] Log input parameters
- [ ] Log database queries
- [ ] Log API responses
- [ ] Log state changes

#### 7. Verify Fix
- [ ] Bug no longer reproduces
- [ ] All related features still work
- [ ] No new errors in logs
- [ ] TypeScript compiles
- [ ] Backend builds successfully

---

## 🎯 Quick Reference

### First Steps for Any Bug:

```bash
# 1. Check frontend logs
# Look at Expo terminal

# 2. Check backend logs
tail -f /tmp/nest-server.log

# 3. Check for 401 errors (auth issue)
tail -f /tmp/nest-server.log | grep "401"

# 4. Check database
psql -U elw -d slashhour_dev
# Run SELECT query to verify data

# 5. Check running processes
lsof -i :3000

# 6. If in doubt, add logging!
console.log('🔍 Debug:', variableName);
```

### Essential Log Emojis:

- 🔍 Debugging/Investigation
- ✅ Success/Confirmation
- ❌ Error/Failure
- 💾 Database operation
- 🌐 Network/API call
- 📱 Frontend/Screen
- 🔐 Authentication
- 📊 Data/Stats
- ⚠️ Warning

---

## 📝 Documentation Template

### When You Fix a Bug:

```markdown
## Bug: [Short Description]

### Symptom:
[What the user reported/saw]

### Investigation:
1. [Step 1 - What you checked]
   - Finding: [What you found]
2. [Step 2 - What you checked next]
   - Finding: [What you found]

### Root Cause:
[Exact cause of the bug]

### Fix:
[What you changed]

```typescript
// Before
const broken = code;

// After
const fixed = code;
```

### Verification:
- [ ] Bug no longer occurs
- [ ] Related features still work
- [ ] Tests pass

### Prevention:
[How to avoid this in future]
```

---

## 🔄 Updates

**This document will be updated as new debugging patterns emerge.**

Last updated: October 14, 2025
Version: 1.0
