# InAppNinja SDK - Industry Standard Auto-Render Guide 🚀

## Overview

This is the **INDUSTRY STANDARD** implementation of InAppNinja SDK. With auto-render enabled, you need **ZERO manual code** to show campaigns - just initialize the SDK and you're done!

## ✨ What's Industry Standard?

Most SDKs like:
- **CleverTap** - Initialize → Campaigns show automatically
- **MoEngage** - Initialize → Campaigns show automatically  
- **WebEngage** - Initialize → Campaigns show automatically
- **Braze** - Initialize → Campaigns show automatically

**InAppNinja** now works the SAME WAY! No stream listeners, no manual fetch, no manual show() calls.

---

## 🎯 Quick Start (3 Simple Steps)

### Step 1: Initialize SDK with `autoRender: true`

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await AppNinja.init(
    'your-api-key',
    baseUrl: 'https://your-server.com',
    autoRender: true, // 🔥 This enables magic!
  );

  await AppNinja.identify({
    'user_id': 'user_123',
    'email': 'user@example.com',
  });

  runApp(const MyApp());
}
```

### Step 2: Add `NinjaAutoObserver` to MaterialApp

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorObservers: [NinjaAutoObserver()], // 🔥 Auto screen tracking
      home: NinjaApp(child: HomePage()),
    );
  }
}
```

### Step 3: Wrap your home page with `NinjaApp`

```dart
home: NinjaApp(
  child: HomePage(), // 🔥 Provides context for auto-rendering
),
```

**THAT'S IT!** PIP campaigns will now show automatically. No more code needed.

---

## 📦 What Happens Automatically?

### ✅ Auto Screen Tracking
`NinjaAutoObserver` automatically tracks:
- When user navigates to a new screen
- When user goes back
- Screen names and transitions
- Fires `Screen_Viewed` events automatically

### ✅ Auto Campaign Fetch
- SDK fetches campaigns on startup (500ms delay)
- Re-fetches when app resumes from background
- Caches campaigns for offline use

### ✅ Auto Campaign Display
- PIP campaigns show automatically when fetched
- Only one PIP shows at a time (smart queue)
- Impression tracking happens automatically
- No duplicate PIPs (single stream subscription)

---

## 🆚 Comparison: Manual vs Industry Standard

### ❌ OLD WAY (Manual Integration)

```dart
class _MyPageState extends State<MyPage> {
  StreamSubscription<List<Campaign>>? _campaignSubscription;

  @override
  void initState() {
    super.initState();
    
    // 😫 Manual stream listener
    _campaignSubscription = AppNinja.onCampaigns.listen((campaigns) {
      final pipCampaigns = campaigns.where((c) => c.type == 'pip').toList();
      if (pipCampaigns.isNotEmpty) {
        // 😫 Manual show call
        NinjaCampaignRenderer.show(
          campaign: pipCampaigns.first,
          context: context,
          onImpression: () {
            // 😫 Manual impression tracking
            AppNinja.track('campaign_impression', properties: {...});
          },
          // ... more manual callbacks
        );
      }
    });

    // 😫 Manual fetch
    _fireHomePageEvent();
  }

  @override
  void dispose() {
    // 😫 Manual cleanup
    _campaignSubscription?.cancel();
    super.dispose();
  }

  Future<void> _fireHomePageEvent() async {
    await AppNinja.track('HomeScreen_Viewed', properties: {...});
    
    // 😫 Manual fetch call
    await AppNinja.fetchCampaigns();
  }
}
```

**Total manual code:** ~60 lines of boilerplate per screen!

### ✅ NEW WAY (Industry Standard)

```dart
void main() async {
  await AppNinja.init('key', baseUrl: '...', autoRender: true);
  await AppNinja.identify({...});
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorObservers: [NinjaAutoObserver()],
      home: NinjaApp(child: HomePage()),
    );
  }
}

// Your page - ZERO integration code!
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Home')),
      body: Center(child: Text('Hello World')),
    );
  }
}
```

**Total manual code:** 0 lines! 🎉

---

## 🏗️ Architecture: How It Works

```
┌─────────────────────────────────────────────────────┐
│  1. AppNinja.init(autoRender: true)                 │
│     - Sets up auto-render system                     │
│     - Creates campaign stream subscription           │
│     - Schedules auto-fetch (500ms delay)             │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  2. NinjaAutoObserver (in navigatorObservers)       │
│     - Watches route changes (push/pop/replace)       │
│     - Auto-fires "Screen_Viewed" events              │
│     - Tracks screen names automatically              │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  3. NinjaApp (wraps your home widget)               │
│     - Provides global BuildContext to SDK            │
│     - Updates context on dependency changes          │
│     - Listens to app lifecycle (resume/pause)        │
│     - Auto-fetches campaigns on resume               │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  4. Auto-Render System (internal)                   │
│     - Listens to campaign stream                     │
│     - Filters PIP campaigns                          │
│     - Shows ONE campaign at a time                   │
│     - Tracks impressions automatically               │
│     - No duplicates (single subscription)            │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Advanced Configuration

### Enable Debug Logging

```dart
await AppNinja.init(
  'your-api-key',
  baseUrl: 'https://your-server.com',
  autoRender: true,
);

AppNinja.debug(true); // See all auto-render logs
```

Debug logs you'll see:
```
🎯 Setting up auto-rendering system
🌍 Global context set for auto-rendering
🔄 Auto-fetching campaigns...
📦 Auto-render received 7 campaigns
🚀 Auto-showing PIP campaign: campaign_123
✅ PIP campaign ready to auto-show: campaign_123
👁️ Auto-tracked impression
```

### Disable Auto-Render (Use Manual Mode)

```dart
await AppNinja.init(
  'your-api-key',
  baseUrl: 'https://your-server.com',
  autoRender: false, // Manual mode
);

// Then use manual stream listeners like before
```

### Track Additional Events

```dart
// Auto screen tracking is already happening!
// But you can track custom events too:

AppNinja.track('button_clicked', properties: {
  'button_name': 'signup',
  'screen': 'home',
});
```

---

## 📱 Components Reference

### 1. `NinjaAutoObserver`

**Purpose:** Automatically track screen navigation

**Where to use:** Add to `MaterialApp.navigatorObservers`

**What it does:**
- Listens to `didPush`, `didPop`, `didReplace`, `didRemove` events
- Extracts screen names from routes
- Fires `Screen_Viewed` event with metadata
- Includes previous screen name for journey tracking

**Example:**
```dart
MaterialApp(
  navigatorObservers: [
    NinjaAutoObserver(), // Add this line
  ],
  home: HomePage(),
)
```

### 2. `NinjaApp`

**Purpose:** Provide global context for auto-rendering

**Where to use:** Wrap your home widget

**What it does:**
- Sets global BuildContext using `AppNinja.setGlobalContext()`
- Listens to app lifecycle (foreground/background)
- Auto-fetches campaigns when app resumes
- Updates context when dependencies change

**Example:**
```dart
MaterialApp(
  home: NinjaApp(
    child: HomePage(), // Your actual home widget
  ),
)
```

### 3. `AppNinja.init()` with `autoRender`

**Purpose:** Initialize SDK with auto-rendering

**Parameters:**
- `apiKey` (required): Your InAppNinja API key
- `baseUrl` (required): Your backend URL
- `autoRender` (optional): Enable auto-rendering (default: false)

**What it does when `autoRender: true`:**
- Creates internal campaign stream listener
- Sets up auto-show logic for PIP campaigns
- Auto-fetches campaigns 500ms after init
- Tracks impressions automatically

**Example:**
```dart
await AppNinja.init(
  'demo-api-key-123',
  baseUrl: 'http://192.168.31.237:4000',
  autoRender: true, // 🔥 Enable magic!
);
```

---

## 🐛 Troubleshooting

### PIP not showing automatically?

**Check 1:** Is `autoRender: true` in init?
```dart
await AppNinja.init('key', baseUrl: '...', autoRender: true);
```

**Check 2:** Did you add `NinjaAutoObserver`?
```dart
navigatorObservers: [NinjaAutoObserver()]
```

**Check 3:** Did you wrap with `NinjaApp`?
```dart
home: NinjaApp(child: HomePage())
```

**Check 4:** Enable debug logs to see what's happening
```dart
AppNinja.debug(true);
```

### Getting duplicate PIPs?

This should NOT happen with auto-render. If you see duplicates:

**Cause:** You might have BOTH auto-render AND manual stream listeners

**Fix:** Remove all manual stream listeners from your code:
```dart
// ❌ Remove this if autoRender: true
_campaignSubscription = AppNinja.onCampaigns.listen(...);
```

### Screen tracking not working?

**Check:** Route names are being set properly
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => DetailsPage(),
    settings: RouteSettings(name: '/details'), // 👈 Set route name
  ),
);
```

---

## 📝 Migration Guide

### From Manual Integration → Industry Standard

**Step 1:** Update `main.dart` init call
```dart
// Before
await AppNinja.init('key', baseUrl: '...');

// After
await AppNinja.init('key', baseUrl: '...', autoRender: true);
```

**Step 2:** Add `NinjaAutoObserver` and `NinjaApp`
```dart
MaterialApp(
  navigatorObservers: [NinjaAutoObserver()],
  home: NinjaApp(child: HomePage()),
)
```

**Step 3:** Delete ALL manual campaign code
```dart
// ❌ DELETE these from your StatefulWidget:
// - StreamSubscription<List<Campaign>>? _campaignSubscription
// - AppNinja.onCampaigns.listen(...)
// - AppNinja.fetchCampaigns()
// - NinjaCampaignRenderer.show(...)
// - _campaignSubscription?.cancel()
```

**Step 4:** Run and enjoy! 🎉

---

## ✅ Benefits of Industry Standard

### For Developers:
- **80% less code** - No boilerplate per screen
- **Zero maintenance** - SDK handles updates
- **Faster integration** - 3 steps vs 60+ lines
- **No bugs** - Less code = fewer bugs
- **Consistent behavior** - Same as CleverTap, MoEngage

### For Users:
- **Faster app launches** - Optimized fetching
- **Better UX** - No duplicate campaigns
- **Smart timing** - Shows campaigns at right time
- **Reliable tracking** - Auto impression events

---

## 🔮 What's Next?

Future auto-render features coming soon:

- ✅ Auto PIP display (DONE)
- 🚧 Auto banner display
- 🚧 Auto modal display
- 🚧 Auto story carousels
- 🚧 Auto survey forms
- 🚧 Smart campaign queue (multiple campaigns)
- 🚧 Auto A/B testing
- 🚧 Predictive campaign timing

---

## 📚 Complete Example

See `main_simplified.dart` for a complete working example with industry-standard implementation.

---

## 🆘 Support

Having issues? Enable debug mode:

```dart
AppNinja.debug(true);
```

Then check console logs for:
- 🎯 Auto-render setup
- 🌍 Context registration
- 🔄 Campaign fetching
- 📦 Campaign reception
- 🚀 Campaign display
- ✅ Impression tracking

---

**Made with ❤️ by InAppNinja Team**

**Happy Coding! 🚀**
