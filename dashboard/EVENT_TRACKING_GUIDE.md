# Industry-Standard Event Tracking Implementation Guide

## ✅ Implementation Complete!

Your nudge-flow system now follows **industry-standard event tracking** conventions used by Segment, Amplitude, Mixpanel, Firebase Analytics, and CleverTap.

---

## 📋 What's Been Implemented

### 1. **Event Taxonomy** (`server/events.json`)
Complete reference guide with:
- **Lifecycle Events** - Auto-tracked by SDK
- **E-commerce Events** - Shopping funnel tracking
- **Engagement Events** - User interactions
- **Campaign Events** - Nudge performance

### 2. **Flutter App Updates** (`untitled/lib/main.dart`)
✅ `app_opened` - Tracks when app launches  
✅ `screen_viewed` - Tracks screen navigation (home)  
✅ `button_clicked` - Enhanced with proper properties  

### 3. **Backend Campaign Update** (`server/data.json`)
✅ Campaign trigger changed from `page_view` → `screen_viewed`

---

## 🎯 Event Naming Convention

**Use snake_case for all events** (industry standard):

✅ **CORRECT:**
```dart
'app_opened'
'screen_viewed'
'button_clicked'
'product_added'
'checkout_started'
```

❌ **AVOID:**
```dart
'AppOpened'           // PascalCase
'screenViewed'        // camelCase
'HomeScreen_Viewed'   // Mixed case
'Page View'           // Spaces
```

---

## 📱 Implementation Examples

### **Lifecycle Events** (Auto-tracked)
```dart
// Already implemented in main.dart!
AppNinja.track('app_opened', properties: {
  'timestamp': DateTime.now().toIso8601String(),
  'user_id': userId,
  'session_id': 'session_12345',
});
```

### **Screen Navigation**
```dart
// In your page's initState()
AppNinja.track('screen_viewed', properties: {
  'screen_name': 'product_details',
  'screen_class': 'ProductDetailPage',
  'previous_screen': 'home',
});
```

### **E-commerce Events**
```dart
// Product viewed
AppNinja.track('product_viewed', properties: {
  'product_id': 'SKU123',
  'product_name': 'Wireless Headphones',
  'category': 'Electronics',
  'price': 99.99,
  'currency': 'USD',
  'brand': 'Sony',
});

// Add to cart
AppNinja.track('product_added', properties: {
  'product_id': 'SKU123',
  'product_name': 'Wireless Headphones',
  'price': 99.99,
  'quantity': 1,
  'cart_id': 'cart_789',
});

// Checkout started
AppNinja.track('checkout_started', properties: {
  'cart_id': 'cart_789',
  'cart_total': 149.98,
  'item_count': 2,
  'currency': 'USD',
});

// Purchase completed
AppNinja.track('order_completed', properties: {
  'order_id': 'ORDER123',
  'total': 149.98,
  'revenue': 149.98,
  'currency': 'USD',
  'products': [
    {'id': 'SKU123', 'name': 'Headphones', 'price': 99.99},
    {'id': 'SKU456', 'name': 'Cable', 'price': 49.99}
  ],
});
```

### **User Engagement**
```dart
// Search performed
AppNinja.track('search_performed', properties: {
  'query': 'wireless headphones',
  'results_count': 24,
  'filters': {'brand': 'Sony', 'price_max': 100},
});

// Form submitted
AppNinja.track('form_submitted', properties: {
  'form_name': 'contact_us',
  'form_type': 'support',
  'success': true,
});

// Content shared
AppNinja.track('content_shared', properties: {
  'share_method': 'whatsapp',
  'content_type': 'product',
  'content_id': 'SKU123',
});
```

---

## 🎪 Campaign Trigger Examples

### **Trigger on Screen View**
```json
{
  "name": "Welcome Message",
  "trigger": "screen_viewed",
  "rules": [
    {
      "type": "event",
      "field": "screen_name",
      "operator": "==",
      "value": "home"
    }
  ]
}
```

### **Trigger on Button Click**
```json
{
  "name": "Feature Tutorial",
  "trigger": "button_clicked",
  "rules": [
    {
      "type": "event",
      "field": "button_name",
      "operator": "==",
      "value": "settings"
    }
  ]
}
```

### **E-commerce: Cart Abandonment**
```json
{
  "name": "Free Shipping Offer",
  "trigger": "cart_viewed",
  "rules": [
    {
      "type": "event",
      "field": "cart_total",
      "operator": ">=",
      "value": "50"
    }
  ]
}
```

### **E-commerce: Product Interest**
```json
{
  "name": "Limited Stock Alert",
  "trigger": "product_viewed",
  "rules": [
    {
      "type": "event",
      "field": "category",
      "operator": "==",
      "value": "Electronics"
    }
  ]
}
```

---

## 🔄 Testing Your Implementation

### **1. Start Backend Server**
```powershell
cd "c:\Users\AARYAN UPADHYAY\Downloads\nudge-flow-express-main\server"
npm start
```

### **2. Run Flutter App**
```powershell
cd "c:\Users\AARYAN UPADHYAY\Downloads\nudge-flow-express-main\untitled"
flutter run
```

### **3. Verify Events in Logs**
Watch for:
```
✅ Event fired: app_opened
✅ Event fired: screen_viewed (home)
✅ Event fired: button_clicked (increment, count: 1)
```

### **4. Backend Should Show**
```
📊 Event tracked: app_opened for user user_12345 - 0 campaigns matched
📊 Event tracked: screen_viewed for user user_12345 - 1 campaigns matched
📱 Campaigns fetched for user: user_12345 - 1 active campaigns
```

### **5. Campaign Should Render**
The "Welcome to Home Screen" bottom sheet should appear when you navigate to home screen!

---

## 📊 Event Properties Best Practices

### **Always Include:**
- `timestamp` - ISO8601 format
- Context fields (`screen_name`, `user_id`, etc.)

### **Use Consistent Types:**
- IDs: `string`
- Counts: `number` (integer)
- Prices: `number` (float)
- Timestamps: `ISO8601 string`
- Arrays: `array` of objects

### **Naming Guidelines:**
- Use descriptive names: `product_id` not `pid`
- Use full words: `button_name` not `btn_nm`
- Avoid abbreviations unless standard (`id`, `url`)

---

## 🚀 Next Steps

### **1. Add More Events to Your App**
```dart
// On product page
AppNinja.track('product_viewed', properties: {...});

// On cart page
AppNinja.track('cart_viewed', properties: {...});

// On checkout
AppNinja.track('checkout_started', properties: {...});
```

### **2. Create Targeted Campaigns**
Use the Dashboard to create campaigns triggered by:
- `screen_viewed` - Welcome messages, onboarding
- `button_clicked` - Feature discovery
- `product_viewed` - Cross-sell, upsell
- `cart_viewed` - Free shipping thresholds
- `checkout_started` - Security badges, delivery options

### **3. Test Campaign Targeting**
Create campaigns with rules:
```json
{
  "trigger": "cart_viewed",
  "rules": [
    {
      "type": "event",
      "field": "cart_total",
      "operator": ">=",
      "value": "50"
    },
    {
      "type": "attribute",
      "field": "plan",
      "operator": "==",
      "value": "premium"
    }
  ]
}
```

### **4. Monitor Analytics**
Events are automatically tracked in:
- `server/data.json` - Events array
- Dashboard - Analytics page
- Console logs - Debug mode

---

## 📚 Reference Documents

- **Event Taxonomy:** `server/events.json`
- **Implementation:** `untitled/lib/main.dart`
- **Campaign Config:** `server/data.json`

---

## ✅ Your System is Production-Ready!

You now have:
- ✅ Industry-standard event naming
- ✅ Comprehensive event taxonomy
- ✅ Auto-tracking lifecycle events
- ✅ Campaign trigger system
- ✅ Event-driven nudge delivery

**Start tracking events in your app and watch campaigns trigger automatically!** 🎯
