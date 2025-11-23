# InAppNinja SDK Integration Guide

## ✅ Integration Complete!

The InAppNinja SDK has been successfully integrated into the `untitled` Flutter app.

## 📱 What's Been Done:

### 1. **SDK Added to pubspec.yaml**
```yaml
dependencies:
  in_app_ninja:
    path: ../in_app_ninja
```

### 2. **SDK Initialized in main.dart**
```dart
await InAppNinja.initialize(
  apiKey: 'demo-api-key-123',
  baseUrl: 'http://localhost:4000/v1',
  enableLogging: true,
);
```

### 3. **User Identified**
```dart
await InAppNinja.identifyUser(
  userId: 'user_${DateTime.now().millisecondsSinceEpoch}',
  userProperties: {
    'name': 'Demo User',
    'email': 'demo@example.com',
    'app': 'untitled',
  },
);
```

### 4. **Event Tracking Implemented**
- **"homepageshown"** event fires when home page loads
- Additional event tracking on button clicks

## 🚀 How to Test:

### Step 1: Ensure Backend is Running
```bash
cd server
node index.js
```
**Expected**: Server listening on http://localhost:4000

### Step 2: Create PIP Campaign in Dashboard

1. Open dashboard: http://localhost:8080
2. Go to **Campaigns** → **Create Campaign**
3. Configure campaign:
   - **Name**: "Welcome PIP"
   - **Type**: PIP
   - **Trigger Event**: `homepageshown`
   - **Video URL**: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
   - **Button Text**: "Claim Now"
   - **Title**: "Welcome to InAppNinja!"
4. **Save** and **Activate** the campaign

### Step 3: Run Flutter App

**For Android Emulator:**
```bash
cd untitled
flutter run
```

**For Chrome (Web):**
```bash
cd untitled
flutter run -d chrome
```

**For Windows:**
```bash
cd untitled
flutter run -d windows
```

### Step 4: Watch the Magic! ✨

When the app launches:
1. ✅ SDK initializes
2. ✅ User gets identified
3. ✅ "homepageshown" event fires
4. ✅ Backend receives the event
5. ✅ Campaign matching triggers
6. ✅ **PIP nudge appears on screen!**

## 📊 Expected Behavior:

### In the App:
- Home page loads with "InAppNinja SDK Integrated!" message
- PIP video widget appears in bottom-right corner
- Video auto-plays (muted)
- Controls visible:
  - Maximize button (top-left)
  - Close button (top-right)
  - Audio mute/unmute (bottom-right)

### In Dashboard:
- User appears in user list
- Event "homepageshown" logged in analytics
- Campaign delivery recorded

## 🔍 Debugging:

### Check Console Logs:
```
✅ Event fired: homepageshown
```

### Check Backend Logs:
```
Event tracked: homepageshown for user: user_1234567890
Campaign matched: Welcome PIP
```

### Common Issues:

1. **Video not playing:**
   - Check CSP in index.html
   - Ensure video URL is accessible
   - Video must be muted for autoplay

2. **Campaign not showing:**
   - Verify backend is running on port 4000
   - Check event name matches exactly: "homepageshown"
   - Ensure campaign is active
   - Check targeting conditions

3. **SDK errors:**
   - Run `flutter clean` and `flutter pub get`
   - Ensure in_app_ninja path is correct in pubspec.yaml

## 📝 Event Tracking Reference:

### Predefined Events:
```dart
// Home page shown
InAppNinja.trackEvent(eventName: 'homepageshown');

// Button clicks
InAppNinja.trackEvent(
  eventName: 'button_clicked',
  eventProperties: {'button': 'increment'},
);

// Custom events
InAppNinja.trackEvent(
  eventName: 'product_viewed',
  eventProperties: {
    'product_id': '123',
    'category': 'electronics',
  },
);
```

## 🎯 Next Steps:

1. **Create more campaigns** for different events
2. **Test different nudge types**: Modal, Banner, Bottom Sheet, Tooltip
3. **Add more event tracking** throughout the app
4. **Configure targeting** based on user properties
5. **Test A/B campaigns** with different variants

## 📦 Files Modified:

- ✅ `untitled/pubspec.yaml` - Added SDK dependency
- ✅ `untitled/lib/main.dart` - Integrated SDK, tracking events
- ✅ `index.html` - Updated CSP for video playback

---

**🎉 You're all set! The integration is complete and ready to test!**
