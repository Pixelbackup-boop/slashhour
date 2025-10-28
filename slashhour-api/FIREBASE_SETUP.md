# Firebase Cloud Messaging (FCM) Setup Guide

This guide explains how to set up Firebase Cloud Messaging for push notifications in the Slashhour API.

## Prerequisites

- Google Account
- Access to [Firebase Console](https://console.firebase.google.com/)

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `slashhour` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

---

## Step 2: Generate Service Account Key

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** in the confirmation dialog
6. A JSON file will download (e.g., `slashhour-firebase-adminsdk-xxxxx.json`)

**IMPORTANT:** Keep this file secure! It contains sensitive credentials.

---

## Step 3: Configure Backend

### Option A: Using File Path (Development)

1. Move the downloaded JSON file to a secure location:
   ```bash
   mkdir -p /Users/elw/Documents/Test/Slashhour/slashhour-api/config/firebase
   mv ~/Downloads/slashhour-firebase-adminsdk-*.json /Users/elw/Documents/Test/Slashhour/slashhour-api/config/firebase/service-account.json
   ```

2. Update your `.env` file:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase/service-account.json
   ```

3. Add to `.gitignore`:
   ```
   config/firebase/*.json
   ```

### Option B: Using Environment Variable (Production)

1. Copy the entire JSON file content

2. Minify it (remove newlines/spaces):
   ```bash
   cat service-account.json | tr -d '\n' | tr -d ' '
   ```

3. Add to `.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"slashhour",...}'
   ```

**For production/cloud deployments (Heroku, AWS, etc.)**, use environment variables instead of files.

---

## Step 4: Restart Backend

```bash
npm run start:dev
```

You should see in the logs:
```
[FirebaseConfig] Firebase Admin SDK initialized successfully
```

If Firebase is NOT configured, you'll see:
```
[FirebaseConfig] Firebase credentials not configured. Push notifications will be disabled.
```

---

## Step 5: Test Push Notifications

### Get a Test Token

In your mobile app (after implementing frontend), you'll get a device token. For now, you can test with a manual API call:

```bash
# 1. Register a device token (get this from Expo/React Native app)
curl -X POST http://localhost:3000/api/v1/notifications/device-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxx]",
    "device_type": "ios",
    "device_name": "iPhone 14 Pro"
  }'

# 2. Send a test notification
curl -X POST http://localhost:3000/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": ["USER_ID_HERE"],
    "type": "system",
    "title": "Test Notification",
    "body": "This is a test push notification!",
    "data": {
      "test": true
    }
  }'
```

---

## Available API Endpoints

### User Endpoints (Authenticated)

- `POST /notifications/device-token` - Register device for push notifications
- `DELETE /notifications/device-token/:token` - Deactivate device token
- `GET /notifications` - Get user notifications (paginated)
- `GET /notifications/unread-count` - Get unread count
- `POST /notifications/mark-as-read` - Mark specific notifications as read
- `POST /notifications/mark-all-as-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Admin Endpoint (Testing)

- `POST /notifications/send` - Send custom notification (TODO: Add admin guard)

---

## Automatic Notifications

The following events trigger automatic push notifications:

### New Deal Posted
When a business posts a new deal, all followers who have `notify_new_deals: true` receive a notification.

**Trigger:** `POST /deals/business/:businessId/multipart`

**Notification:**
- **Title:** "New Deal from [Business Name]" OR "⚡ Flash Deal from [Business Name]!"
- **Body:** "[Deal Title] - Save [X]%!"
- **Image:** Deal's first image (if available)
- **Action:** Opens deal detail screen

### Flash Deal Posted
Same as above, but for `is_flash_deal: true` deals.

---

## Troubleshooting

### "Firebase not initialized" Warning

**Cause:** Missing or invalid service account credentials

**Solution:**
1. Check that `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON` is set in `.env`
2. Verify the JSON file path is correct
3. Ensure the JSON is valid (use a JSON validator)
4. Restart the server after adding credentials

### "Invalid registration token" Errors

**Cause:** Device token is expired or invalid

**Solution:**
- The system automatically deactivates invalid tokens
- Frontend should re-register token periodically

### Notifications Not Arriving

**Possible Causes:**
1. User has no active device tokens
2. Firebase project not configured for the app
3. FCM sending limits exceeded (quota)
4. Device has notifications disabled
5. Network issues

**Debug Steps:**
1. Check backend logs for FCM sending results
2. Verify device token is registered: `GET /notifications/device-token`
3. Check FCM quota in Firebase Console
4. Test with a different device

---

## Security Best Practices

1. ✅ **Never commit service account JSON to Git**
2. ✅ **Use environment variables in production**
3. ✅ **Rotate service account keys periodically**
4. ✅ **Add admin authentication to `/notifications/send` endpoint**
5. ✅ **Validate user owns device tokens before operations**
6. ✅ **Rate limit notification sending**

---

## Firebase Console Links

- **Project Dashboard:** https://console.firebase.google.com/project/YOUR_PROJECT_ID
- **Cloud Messaging:** https://console.firebase.google.com/project/YOUR_PROJECT_ID/notification
- **Usage Stats:** https://console.firebase.google.com/project/YOUR_PROJECT_ID/usage

---

## Next Steps

1. ✅ Backend notification system is complete
2. ⏳ Implement frontend (Expo Notifications)
3. ⏳ Add notification screens in mobile app
4. ⏳ Test end-to-end notification flow
5. ⏳ Configure Firebase for iOS (APNs certificate)
6. ⏳ Configure Firebase for Android (google-services.json)

---

## Support

For Firebase issues:
- [Firebase Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FCM Migration Guide](https://firebase.google.com/docs/cloud-messaging/migrate-v1)

For Slashhour API issues:
- Check backend logs
- Review this setup guide
- Contact the development team
