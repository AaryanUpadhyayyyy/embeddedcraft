# 🧪 Complete Integration Test Guide

## ✅ What We've Implemented

### **1. Real-Time Campaign Triggering**
- SDK now processes `matched` campaigns from `/v1/track` response
- **No delay** - campaigns display immediately when event matches trigger
- Flow: `track('screen_viewed')` → Backend matches → SDK emits → Auto-render shows

### **2. Universal Auto-Rendering**
- Supports **all campaign types**: modal, bottom_sheet, banner, pip, tooltip, scratch_card, story_carousel
- Priority-based rendering: modal > bottom_sheet > banner > pip
- Duplicate prevention with `_lastShownPipId`

### **3. Industry-Standard Event Tracking**
- **30+ events** in `server/events.json` taxonomy
- Snake_case naming: `app_opened`, `screen_viewed`, `button_clicked`
- Rich properties: session_id, screen_name, button_text, timestamps

### **4. Complete Auto-Tracking**
- Campaign impressions (`campaign_viewed`)
- Campaign dismissals (`campaign_dismissed`)
- CTA clicks (`campaign_clicked`)
- All with full context: campaign_id, campaign_name, auto_rendered flag

---

## 🚀 Testing Steps

### **Prerequisites**

1. **Backend Running:**
   ```powershell
   cd server
   npm install
   node index.js
   ```
   ✅ Should see: `Server running on port 4000`

2. **Flutter Environment:**
   ```powershell
   cd untitled
   flutter pub get
   ```
   ✅ Verify in_app_ninja SDK is in dependencies

3. **Campaign Configured:**
   Open `server/data.json` - verify campaign:
   ```json
   {
     "id": "d64ad490-5ff1-4792-b73b-65d5e312206e",
     "name": "Welcome to Home Screen",
     "type": "bottomsheet",
     "status": "active",
     "trigger": "screen_viewed"
   }
   ```

---

### **Test Case 1: App Opened Event**

**Action:**
```powershell
flutter run
```

**Expected Backend Logs:**
```
📥 Received track event: app_opened
Event tracked: app_opened for user user_... - 0 campaigns matched
```

**Expected SDK Logs:**
```
🚀 AppNinja initialized
✅ Auto-render enabled
🎯 Setting up auto-rendering system
📤 Tracking event: app_opened
ℹ️ Event "app_opened" matched 0 campaigns
```

**Result:** ✅ App starts, no campaign (correct - no trigger for app_opened)

---

### **Test Case 2: Screen Viewed Event (CRITICAL)**

**Action:**
- App loads home screen
- NinjaAutoObserver tracks `screen_viewed`

**Expected Backend Logs:**
```
📥 Received track event: screen_viewed
Properties: {"screen_name":"home","screen_class":"HomeScreen"}
Event tracked: screen_viewed for user user_... - 1 campaigns matched
📤 Returning matched campaigns: Welcome to Home Screen
```

**Expected SDK Logs:**
```
📤 Tracking event: screen_viewed
🎯 Event "screen_viewed" matched 1 campaign(s)
✅ Real-time campaigns emitted for auto-render
📦 Auto-render received 1 campaigns
🚀 Auto-showing bottomsheet campaign: Welcome to Home Screen (d64ad490-5ff1-4792-b73b-65d5e312206e)
✅ Campaign auto-rendered successfully: Welcome to Home Screen
```

**Expected UI:**
- ✅ Bottom sheet **slides up from bottom**
- ✅ Shows "Welcome Message" title
- ✅ Shows "This is a welcome message..." text
- ✅ Blue background, white text
- ✅ Drag handle at top
- ✅ Rounded corners
- ✅ Blurred background overlay

**Expected Auto-Tracking:**
Backend receives `campaign_viewed` event:
```json
{
  "event": "campaign_viewed",
  "properties": {
    "campaign_id": "d64ad490-5ff1-4792-b73b-65d5e312206e",
    "campaign_name": "Welcome to Home Screen",
    "campaign_type": "bottomsheet",
    "auto_rendered": true,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### **Test Case 3: Button Click Event**

**Action:**
- Click counter button on home screen

**Expected Backend Logs:**
```
📥 Received track event: button_clicked
Properties: {"button_name":"increment_counter","button_text":"Clicked 1 times"}
Event tracked: button_clicked for user user_... - 0 campaigns matched
```

**Expected SDK Logs:**
```
📤 Tracking event: button_clicked
ℹ️ Event "button_clicked" matched 0 campaigns
```

**Result:** ✅ Event tracked, no campaign (correct - no trigger for button_clicked)

---

### **Test Case 4: Campaign Dismissal**

**Action:**
- Swipe down on bottom sheet OR
- Tap outside overlay OR
- Press back button

**Expected SDK Logs:**
```
❌ Auto-rendered campaign dismissed: d64ad490-5ff1-4792-b73b-65d5e312206e
📤 Tracking event: campaign_dismissed
```

**Expected Backend Logs:**
```
📥 Received track event: campaign_dismissed
Properties: {"campaign_id":"d64ad490-...","campaign_name":"Welcome to Home Screen"}
```

**Expected Behavior:**
- ✅ Bottom sheet animates down and disappears
- ✅ Can be shown again on next screen_viewed event

---

### **Test Case 5: Navigate and Re-trigger**

**Action:**
1. Dismiss bottom sheet
2. Navigate away from home (if you have another screen)
3. Navigate back to home

**Expected:**
- ✅ `screen_viewed` event fires again
- ✅ Backend matches campaign again
- ✅ Bottom sheet shows again (because we cleared `_lastShownPipId` on dismiss)

---

## 🐛 Debugging

### **Campaign Not Showing?**

**Check 1: Backend Matching**
Look for this log:
```
Event tracked: screen_viewed for user X - 1 campaigns matched
```
- ❌ Says "0 campaigns matched" → Campaign trigger doesn't match event
- ❌ Says "inactive" → Campaign status is not "active"

**Fix:** Update `server/data.json`:
```json
{
  "status": "active",  // Must be "active"
  "trigger": "screen_viewed"  // Must exactly match event name
}
```

**Check 2: SDK Receiving**
Look for this log:
```
🎯 Event "screen_viewed" matched 1 campaign(s)
✅ Real-time campaigns emitted for auto-render
```
- ❌ Not present → Backend not returning matched campaigns
- ❌ Shows 0 campaigns → Response parsing failed

**Fix:** Check backend response format at `server/index.js` line 366:
```javascript
res.json({ 
  ok: true, 
  matched: matchedCampaigns,  // Must be "matched"
  event: evt 
});
```

**Check 3: Auto-Render Setup**
Look for these logs on app start:
```
✅ Auto-render enabled
🎯 Setting up auto-rendering system
```
- ❌ Not present → `autoRender: true` not passed to init
- ❌ Says "disabled" → Check `AppNinja.init(autoRender: true)`

**Fix:** In `untitled/lib/main.dart`:
```dart
await AppNinja.init(
  baseUrl: 'http://10.0.2.2:4000',
  apiKey: 'demo-api-key-123',
  enableDebugLogs: true,
  autoRender: true,  // ⭐ Required
);
```

**Check 4: Context Available**
Look for this log:
```
🚀 Auto-showing bottomsheet campaign: Welcome...
```
- ❌ Says "No global context" → NinjaApp wrapper missing

**Fix:** Wrap your app in `NinjaApp`:
```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return NinjaApp(  // ⭐ Required for auto-render
      child: MaterialApp(...),
    );
  }
}
```

---

## 📊 Success Metrics

After running all tests, you should see:

### **Event Tracking (Backend Logs):**
```
✅ app_opened - tracked
✅ screen_viewed - tracked (matched 1 campaign)
✅ button_clicked - tracked
✅ campaign_viewed - auto-tracked
✅ campaign_dismissed - auto-tracked
```

### **Campaign Display (UI):**
```
✅ Bottom sheet appears on home screen load
✅ Animation smooth (slide up)
✅ Drag handle visible
✅ Swipe to dismiss works
✅ Can re-trigger on navigate back
```

### **Data Flow (End-to-End):**
```
Flutter App → SDK track() → Backend /v1/track → Match trigger
Backend → Return matched → SDK parse → Emit to stream
Stream → Auto-render listens → _autoShowCampaign() → NinjaCampaignRenderer
Renderer → Route by type → BottomSheetNudgeRenderer → showDialog()
UI → Bottom sheet visible → User interacts → Track impression/dismiss
```

---

## 🎯 Next Steps

Once base flow works:

### **1. Add More Campaign Types**

Create modal campaign:
```json
{
  "id": "modal-welcome-001",
  "name": "Welcome Modal",
  "type": "modal",
  "status": "active",
  "trigger": "app_opened",
  "config": {
    "type": "modal",
    "title": "Welcome!",
    "description": "Thanks for using our app",
    "primaryButtonText": "Get Started",
    "primaryButtonAction": "dismiss"
  }
}
```

### **2. Add Banner Campaign**

```json
{
  "id": "banner-promo-001",
  "name": "Limited Offer",
  "type": "banner",
  "status": "active",
  "trigger": "button_clicked",
  "config": {
    "type": "banner",
    "text": "50% off this week!",
    "backgroundColor": "#FF5722",
    "position": "top"
  }
}
```

### **3. Test Multiple Campaigns**

Create 3 campaigns with same trigger:
- 1 modal (highest priority - should show)
- 1 bottom_sheet (second priority)
- 1 pip (lowest priority)

Expected: Only modal shows (priority system works)

### **4. Add Campaign Rules**

Add targeting rules to campaigns:
```json
{
  "rules": [
    {
      "property": "screen_name",
      "operator": "equals",
      "value": "home"
    }
  ]
}
```

Test: Campaign only shows on home screen, not other screens

### **5. Test Edge Cases**

- ✅ No internet → Event queued, campaign shows on reconnect
- ✅ Rapid navigation → Only one campaign shows at a time
- ✅ App backgrounded → Campaign dismissed gracefully
- ✅ Multiple taps → Duplicate prevention works

---

## 🎉 You're Done When...

✅ Home screen loads → Bottom sheet appears immediately  
✅ Backend logs show "1 campaigns matched"  
✅ SDK logs show "Real-time campaigns emitted"  
✅ UI shows draggable bottom sheet  
✅ Swipe to dismiss works  
✅ Auto-tracked events appear in backend  
✅ Navigate away and back → Campaign shows again  

**The integration is COMPLETE and PRODUCTION-READY!** 🚀
