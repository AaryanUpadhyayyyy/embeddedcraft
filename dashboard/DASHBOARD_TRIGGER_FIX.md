# ✅ Dashboard Campaign Creation - Event & Screen Selection Fixed

## 🔍 Issue Identified

The campaign creation dashboard was missing:
1. ❌ **No trigger event selection** - couldn't specify which event triggers the campaign
2. ❌ **No screen/page selection** - couldn't target specific screens
3. ❌ **Old event names** - using outdated PascalCase events instead of industry-standard snake_case
4. ❌ **No campaign status** - couldn't set active/draft/paused

## ✅ Changes Made

### **1. Enhanced CampaignEditor Data Model** 
`src/store/useEditorStore.ts`

Added new fields to store campaign trigger configuration:

```typescript
export interface CampaignEditor {
  id: string;
  name: string;
  // ... existing fields ...
  
  // ✅ NEW: Trigger configuration
  trigger?: string; // e.g., 'screen_viewed', 'button_clicked'
  screen?: string;  // e.g., 'home', 'checkout'
  status?: 'active' | 'paused' | 'draft';
  
  layers: Layer[];
  targeting: TargetingRule[];
  displayRules: DisplayRules;
  // ...
}
```

### **2. Added Store Actions**
`src/store/useEditorStore.ts`

New methods to update trigger, screen, and status:

```typescript
interface EditorStore {
  // ... existing methods ...
  
  // ✅ NEW: Update trigger configuration
  updateTrigger: (trigger: string) => void;
  updateScreen: (screen: string) => void;
  updateStatus: (status: 'active' | 'paused' | 'draft') => void;
}
```

**Implementation:**
```typescript
// Update trigger event
updateTrigger: (trigger) => {
  const { currentCampaign } = get();
  if (!currentCampaign) return;
  
  set({
    currentCampaign: {
      ...currentCampaign,
      trigger,
      updatedAt: new Date().toISOString(),
      isDirty: true,
    },
  });
},

// Update screen (conditional targeting)
updateScreen: (screen) => {
  const { currentCampaign } = get();
  if (!currentCampaign) return;
  
  set({
    currentCampaign: {
      ...currentCampaign,
      screen,
      updatedAt: new Date().toISOString(),
      isDirty: true,
    },
  });
},

// Update campaign status
updateStatus: (status) => {
  const { currentCampaign } = get();
  if (!currentCampaign) return;
  
  set({
    currentCampaign: {
      ...currentCampaign,
      status,
      updatedAt: new Date().toISOString(),
      isDirty: true,
    },
  });
},
```

### **3. Updated TargetingBuilder Component**
`src/components/campaign/TargetingBuilder.tsx`

**Before:**
```tsx
<SelectContent>
  <SelectItem value="App_Opened">App_Opened</SelectItem>
  <SelectItem value="HomeScreen_Viewed">HomeScreen_Viewed</SelectItem>
  <SelectItem value="Checkout_Started">Checkout_Started</SelectItem>
  <SelectItem value="Product_Viewed">Product_Viewed</SelectItem>
</SelectContent>
```

**After:**
```tsx
<SelectContent>
  <SelectItem value="app_opened">app_opened - App launch</SelectItem>
  <SelectItem value="screen_viewed">screen_viewed - Screen navigation</SelectItem>
  <SelectItem value="session_start">session_start - Session begins</SelectItem>
  <SelectItem value="button_clicked">button_clicked - Button interaction</SelectItem>
  <SelectItem value="product_viewed">product_viewed - Product page view</SelectItem>
  <SelectItem value="product_added">product_added - Add to cart</SelectItem>
  <SelectItem value="cart_viewed">cart_viewed - Cart page view</SelectItem>
  <SelectItem value="checkout_started">checkout_started - Checkout begins</SelectItem>
  <SelectItem value="payment_info_entered">payment_info_entered - Payment details</SelectItem>
  <SelectItem value="order_completed">order_completed - Purchase complete</SelectItem>
  <SelectItem value="search_performed">search_performed - Search query</SelectItem>
  <SelectItem value="form_submitted">form_submitted - Form completion</SelectItem>
  <SelectItem value="link_clicked">link_clicked - Link interaction</SelectItem>
  <SelectItem value="video_played">video_played - Video started</SelectItem>
  <SelectItem value="share_clicked">share_clicked - Share action</SelectItem>
</SelectContent>
```

### **4. Redesigned Campaign Builder Targeting Tab**
`src/pages/CampaignBuilder.tsx`

Added comprehensive trigger and screen selection UI in the "Targeting" tab:

#### **A. Trigger Event Selection**
```tsx
<div style={{ 
  padding: '20px', 
  backgroundColor: colors.gray[50], 
  borderRadius: '12px', 
  border: `2px solid ${colors.primary[100]}` 
}}>
  <h4>🔥 Trigger Event *</h4>
  <p>Select the event that will trigger this campaign</p>
  
  <select 
    value={currentCampaign?.trigger || 'screen_viewed'} 
    onChange={(e) => updateTrigger(e.target.value)}
  >
    <optgroup label="Lifecycle Events">
      <option value="app_opened">app_opened - App launch</option>
      <option value="screen_viewed">screen_viewed - Screen navigation</option>
      <option value="session_start">session_start - Session begins</option>
    </optgroup>
    <optgroup label="Ecommerce Events">
      <option value="product_viewed">product_viewed - Product page view</option>
      <option value="checkout_started">checkout_started - Checkout begins</option>
      <option value="order_completed">order_completed - Purchase complete</option>
    </optgroup>
    <optgroup label="Engagement Events">
      <option value="button_clicked">button_clicked - Button interaction</option>
      <option value="search_performed">search_performed - Search query</option>
      <option value="form_submitted">form_submitted - Form completion</option>
    </optgroup>
  </select>
</div>
```

#### **B. Screen Selection (Conditional)**
Only shows when trigger is `screen_viewed`:

```tsx
{currentCampaign?.trigger === 'screen_viewed' && (
  <div style={{ 
    padding: '20px', 
    backgroundColor: colors.blue[50], 
    borderRadius: '12px' 
  }}>
    <h4>📱 Target Screen (Optional)</h4>
    <p>Leave empty to trigger on any screen, or specify screen name</p>
    
    <input 
      type="text"
      value={currentCampaign?.screen || ''} 
      onChange={(e) => updateScreen(e.target.value)}
      placeholder="e.g., home, checkout, profile"
    />
    
    <div>
      <strong>How it works:</strong> 
      Campaign will show when screen_viewed event is tracked with 
      property screen_name matching this value.
    </div>
  </div>
)}
```

#### **C. Campaign Status Selection**
```tsx
<div>
  <h4>Campaign Status</h4>
  <p>Set the campaign status to control its visibility</p>
  
  <div style={{ display: 'flex', gap: '12px' }}>
    <label>
      <input 
        type="radio" 
        value="draft"
        checked={currentCampaign?.status === 'draft'}
        onChange={(e) => updateStatus('draft')}
      />
      <div>Draft - Not visible to users</div>
    </label>
    
    <label>
      <input 
        type="radio" 
        value="active"
        checked={currentCampaign?.status === 'active'}
        onChange={(e) => updateStatus('active')}
      />
      <div>Active - Live to users</div>
    </label>
    
    <label>
      <input 
        type="radio" 
        value="paused"
        checked={currentCampaign?.status === 'paused'}
        onChange={(e) => updateStatus('paused')}
      />
      <div>Paused - Temporarily disabled</div>
    </label>
  </div>
</div>
```

---

## 🎯 How It Works Now

### **Creating a Campaign:**

1. **Open Campaign Builder** → Click "Create New Campaign"

2. **Design Tab** → Build your campaign UI (bottom sheet, modal, etc.)

3. **Targeting Tab** → Configure when it appears:

   **a. Select Trigger Event:**
   - Choose from dropdown: `screen_viewed`, `button_clicked`, `product_viewed`, etc.
   - Events are grouped by category (Lifecycle, Ecommerce, Engagement)
   - All events use snake_case naming (matching backend)

   **b. Specify Screen (if trigger = screen_viewed):**
   - Input field appears automatically
   - Enter screen name: "home", "checkout", "profile"
   - Leave empty to trigger on ALL screens
   - Shows helpful explanation of how matching works

   **c. Set Status:**
   - Draft: Campaign won't show (for testing)
   - Active: Campaign is live
   - Paused: Temporarily disabled

4. **Save** → Campaign is persisted with trigger configuration

5. **Backend Matching:**
   - When user tracks `screen_viewed` with `{screen_name: 'home'}`
   - Backend matches campaigns where:
     - `trigger === 'screen_viewed'`
     - `status === 'active'`
     - `screen` is empty OR `screen === 'home'`
   - Returns matched campaigns to SDK
   - SDK auto-renders bottom sheet/modal

---

## 📊 Event Options Available

### **Lifecycle Events:**
- `app_opened` - App launch
- `screen_viewed` - Screen navigation ⭐ (with screen targeting)
- `session_start` - Session begins
- `app_backgrounded` - App goes to background

### **Ecommerce Events:**
- `product_viewed` - Product page view
- `product_added` - Add to cart
- `cart_viewed` - Cart page view
- `checkout_started` - Checkout begins
- `payment_info_entered` - Payment details
- `order_completed` - Purchase complete

### **Engagement Events:**
- `button_clicked` - Button interaction
- `search_performed` - Search query
- `form_submitted` - Form completion
- `link_clicked` - Link interaction
- `video_played` - Video started
- `share_clicked` - Share action

---

## ✅ What's Fixed

| Before | After |
|--------|-------|
| ❌ No trigger selection | ✅ Dropdown with 15+ event options |
| ❌ Old event names (PascalCase) | ✅ Industry-standard snake_case |
| ❌ No screen targeting | ✅ Conditional screen input (for screen_viewed) |
| ❌ No status control | ✅ Draft/Active/Paused radio buttons |
| ❌ Hardcoded demo UI | ✅ Fully functional controlled components |
| ❌ Not saved to backend | ✅ Persisted in campaign data |

---

## 🧪 Testing the Fix

### **Test Case 1: Create Campaign for Home Screen**

1. **Campaign Builder** → Targeting Tab
2. **Trigger Event** → Select `screen_viewed`
3. **Target Screen** → Enter "home"
4. **Status** → Select "Active"
5. **Save** → Check `server/data.json`

**Expected Result:**
```json
{
  "id": "campaign_123",
  "name": "Welcome to Home",
  "type": "bottomsheet",
  "trigger": "screen_viewed",
  "screen": "home",
  "status": "active",
  "config": {...}
}
```

### **Test Case 2: Create Campaign for Any Button Click**

1. **Trigger Event** → Select `button_clicked`
2. Notice: Screen field doesn't appear (only for screen_viewed)
3. **Status** → Active
4. **Save**

**Expected Result:**
```json
{
  "trigger": "button_clicked",
  "screen": "",  // Not applicable
  "status": "active"
}
```

### **Test Case 3: Draft Campaign**

1. Create campaign
2. **Status** → Draft
3. **Save**
4. In Flutter app, trigger the event
5. Campaign should NOT appear (status is draft)

---

## 🔄 Integration with Backend

The saved campaign data flows to backend:

```typescript
// CampaignBuilder saves
const campaignData = {
  id: 'campaign_123',
  name: 'Welcome Campaign',
  trigger: 'screen_viewed',
  screen: 'home',
  status: 'active',
  type: 'bottomsheet',
  config: {...}
};

// Backend /v1/track matches
const matched = campaigns.filter(c => 
  c.status === 'active' &&
  c.trigger === event && // 'screen_viewed'
  (!c.screen || c.screen === properties.screen_name) // 'home'
);

// Returns matched campaigns to SDK
// SDK auto-renders via _autoShowCampaign()
```

---

## 📝 Summary

**Files Changed:**
- ✅ `src/store/useEditorStore.ts` - Added trigger/screen/status fields and methods
- ✅ `src/components/campaign/TargetingBuilder.tsx` - Updated event names to snake_case
- ✅ `src/pages/CampaignBuilder.tsx` - Added complete trigger/screen/status UI

**New Features:**
- ✅ Trigger event dropdown with 15+ industry-standard events
- ✅ Conditional screen targeting (for screen_viewed events)
- ✅ Campaign status selection (draft/active/paused)
- ✅ Grouped event options (Lifecycle/Ecommerce/Engagement)
- ✅ Helpful descriptions and examples
- ✅ Fully controlled components synced with store
- ✅ Auto-save support with dirty state tracking

**The dashboard now has complete trigger and screen selection! 🎉**
