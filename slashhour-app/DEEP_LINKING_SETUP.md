# Deep Linking & SEO-Friendly URL Setup

This document explains how to set up your website (slashhour.com) to work with the mobile app's deep linking and sharing features.

## URL Structure

### Deal URLs (SEO-Friendly)
```
https://slashhour.com/deals/{discount}-{title}-{business}-{city}-{uuid}
```

**Example:**
```
https://slashhour.com/deals/50-off-pizza-margherita-joes-pizzeria-new-york-a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Business URLs (SEO-Friendly)
```
https://slashhour.com/businesses/{business-name}-{city}-{uuid}
```

**Example:**
```
https://slashhour.com/businesses/joes-pizzeria-new-york-a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Required Website Files

### 1. iOS Universal Links - Apple App Site Association

Create file: `https://slashhour.com/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.anonymous.slashhourapp",
        "paths": [
          "/deals/*",
          "/businesses/*"
        ]
      }
    ]
  }
}
```

**Important:**
- Replace `TEAM_ID` with your Apple Developer Team ID
- Must be served with HTTPS
- Must have `Content-Type: application/json`
- No file extension required
- Must be publicly accessible

### 2. Android App Links - Asset Links

Create file: `https://slashhour.com/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.anonymous.slashhourapp",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_CERT_FINGERPRINT"
      ]
    }
  }
]
```

**Important:**
- Replace `YOUR_SHA256_CERT_FINGERPRINT` with your app's signing certificate SHA-256 fingerprint
- Must be served with HTTPS
- Must have `Content-Type: application/json`
- Must be publicly accessible

**To get your SHA-256 fingerprint:**
```bash
# For debug builds
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For production builds (from Google Play Console)
# Go to: Setup > App signing > App signing key certificate > SHA-256 certificate fingerprint
```

## Website Deal Page Structure

### Parsing the URL

Your website needs to extract the deal ID from the SEO-friendly URL:

```javascript
// Example: 50-off-pizza-margherita-joes-pizzeria-new-york-a1b2c3d4-e5f6-7890-abcd-ef1234567890
function extractDealId(urlSlug) {
  // UUID format: 8-4-4-4-12 characters separated by hyphens
  // Extract the UUID from the end of the slug
  const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
  const match = urlSlug.match(uuidRegex);

  if (match) {
    return match[1]; // This is the full UUID
  }

  return null;
}
```

### Meta Tags for Social Sharing

When someone shares a deal, add these meta tags to your deal page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>50% OFF: Pizza Margherita at Joe's Pizzeria, New York | Slashhour</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="Save 50% on Pizza Margherita at Joe's Pizzeria in New York. Limited time offer! Download Slashhour to claim this deal.">
  <meta name="keywords" content="pizza deals, Joe's Pizzeria, New York deals, discount pizza, Slashhour">

  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:title" content="50% OFF: Pizza Margherita at Joe's Pizzeria">
  <meta property="og:description" content="Save $10 on this amazing deal! Valid until Dec 31, 2025">
  <meta property="og:image" content="https://slashhour.com/deals/images/abc123.jpg">
  <meta property="og:url" content="https://slashhour.com/deals/50-off-pizza-margherita-joes-pizzeria-new-york-abc123">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Slashhour">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="50% OFF: Pizza Margherita at Joe's Pizzeria">
  <meta name="twitter:description" content="Save $10 on this amazing deal!">
  <meta name="twitter:image" content="https://slashhour.com/deals/images/abc123.jpg">

  <!-- App Deep Link Detection -->
  <script>
    // Attempt to open the app, fallback to staying on website
    const dealId = 'full-uuid-here'; // Extract from URL
    const deepLink = `slashhour://deals/${dealId}`;

    // Try to open the app
    setTimeout(() => {
      window.location = deepLink;
    }, 25);

    // If app doesn't open in 2 seconds, user doesn't have it
    setTimeout(() => {
      // Show download app banner or deal details
    }, 2000);
  </script>
</head>
<body>
  <!-- Your deal page content -->
  <h1>Pizza Margherita - 50% OFF</h1>
  <p>Joe's Pizzeria, New York</p>

  <!-- App Download Buttons -->
  <a href="https://apps.apple.com/app/slashhour">
    <img src="/badges/app-store.png" alt="Download on App Store">
  </a>
  <a href="https://play.google.com/store/apps/slashhour">
    <img src="/badges/google-play.png" alt="Get it on Google Play">
  </a>
</body>
</html>
```

## Testing Deep Links

### iOS Testing
1. Deploy the apple-app-site-association file
2. Build and install the app on your device
3. Send yourself a link via Messages: `https://slashhour.com/deals/50-off-test-deal-a1b2c3d4-e5f6-7890-abcd-ef1234567890`
4. Long-press the link → Should show "Open in Slashhour"

### Android Testing
1. Deploy the assetlinks.json file
2. Build and install the app on your device
3. Verify with: `adb shell pm get-app-links com.anonymous.slashhourapp`
4. Click a link in Chrome → Should prompt to open in Slashhour app

### Online Validators
- iOS: https://branch.io/resources/aasa-validator/
- Android: https://developers.google.com/digital-asset-links/tools/generator

## Database Schema Recommendation

The current implementation uses full UUIDs in URLs for simplicity. If you want shorter URLs in the future, you can add a short ID mapping:

```sql
-- Optional: Add a short ID for even more SEO-friendly URLs
ALTER TABLE deals ADD COLUMN short_id VARCHAR(8) UNIQUE;
CREATE INDEX idx_deals_short_id ON deals(short_id);

-- Or use a separate mapping table
CREATE TABLE deal_slugs (
  short_id VARCHAR(8) PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_deal_slugs_deal_id ON deal_slugs(deal_id);

-- You would then need to create an API endpoint to resolve short IDs to UUIDs
```

**Note**: The app currently uses full UUIDs for compatibility, so this is optional for future optimization.

## URL Redirect Logic

When someone visits a deal URL:

1. **Parse the slug** to extract the short ID
2. **Look up the deal** in your database
3. **If deal found:**
   - If mobile browser → Show "Open in App" banner
   - If desktop → Show deal details + download app CTAs
4. **If deal not found or expired:**
   - Redirect to homepage or show "Deal expired" page

## Next Steps

1. ✅ App configuration complete (already done)
2. ⏳ Create `.well-known/apple-app-site-association` file
3. ⏳ Create `.well-known/assetlinks.json` file
4. ⏳ Build deal pages with proper meta tags
5. ⏳ Add slug/short ID to database
6. ⏳ Deploy website with deep linking support
7. ⏳ Test on both iOS and Android devices

## Support

For issues with deep linking:
- iOS Universal Links: https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app
- Android App Links: https://developer.android.com/training/app-links
