# 🎨 Frontend Redesign Plan - Complete Implementation Guide

## 📋 Overview
Complete frontend redesign to match provided screenshots pixel-perfectly while preserving all existing backend logic and functionality.

---

## 🎯 Design System Specification

### Colors
```typescript
const colors = {
  // Primary
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',  // Main blue
    600: '#2563EB',
    700: '#1D4ED8',
  },
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  // Neutrals
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
}
```

### Typography
```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
}
```

### Spacing
```typescript
const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
}
```

---

## 🏗️ New Component Structure

### Phase 1: Core Layout Components
1. **AppLayout.tsx** - Main app shell with sidebar
2. **Sidebar.tsx** - Navigation sidebar with logo, menu items, user profile
3. **PageHeader.tsx** - Page title + action buttons
4. **DataTable.tsx** - Reusable table component with sorting, filtering, pagination

### Phase 2: Feature Components
5. **CampaignsList.tsx** - Campaigns table page
6. **EventsLog.tsx** - Real-time events page
7. **UsersList.tsx** - Users table page
8. **UserDetailPanel.tsx** - User details side panel
9. **SettingsPage.tsx** - Settings page

### Phase 3: Campaign Creation Flow
10. **CreateCampaignModal.tsx** - Multi-step modal
11. **CampaignBasicInfo.tsx** - Step 1: Name, description, type
12. **TargetingBuilder.tsx** - Step 2: Visual query builder (already exists, needs redesign)
13. **NudgeDesigner.tsx** - Step 3: Bottom sheet preview

### Phase 4: Bottom Sheet Editor (V3 - Complete Redesign)
14. **EditorLayout.tsx** - 3-column layout container
15. **ComponentPalette.tsx** - Left panel with categorized components (redesigned)
16. **CanvasArea.tsx** - Center mobile preview + canvas (redesigned)
17. **PropertiesPanel.tsx** - Right panel with tabs (redesigned)
18. **VariablesPanel.tsx** - Variables tab (already exists, needs styling update)

### Phase 5: Shared UI Components
19. **StatusBadge.tsx** - Status indicators (Active/Draft/Paused)
20. **IconButton.tsx** - Icon-only buttons
21. **Modal.tsx** - Base modal component
22. **SearchInput.tsx** - Search with icon
23. **FilterBar.tsx** - Advanced filters
24. **EmptyState.tsx** - Empty state illustrations

---

## 📁 New File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx          ✨ NEW
│   │   ├── Sidebar.tsx            ✨ NEW
│   │   ├── PageHeader.tsx         ✨ NEW
│   │   └── PageContainer.tsx      ✨ NEW
│   │
│   ├── editor/
│   │   ├── EditorLayout.tsx       ✨ NEW (3-column)
│   │   ├── ComponentPalette.tsx   🔄 REDESIGN
│   │   ├── CanvasArea.tsx         ✨ NEW
│   │   ├── PropertiesPanel.tsx    🔄 REDESIGN
│   │   ├── VariablesPanel.tsx     🔄 RESTYLE
│   │   └── MobilePreview.tsx      🔄 REDESIGN
│   │
│   ├── campaign/
│   │   ├── CampaignsList.tsx      ✨ NEW
│   │   ├── CampaignCard.tsx       ✨ NEW
│   │   ├── CreateCampaignModal.tsx ✨ NEW
│   │   ├── CampaignBasicInfo.tsx  ✨ NEW
│   │   ├── TargetingBuilder.tsx   🔄 REDESIGN (exists)
│   │   └── NudgeDesigner.tsx      ✨ NEW
│   │
│   ├── events/
│   │   ├── EventsLog.tsx          ✨ NEW
│   │   ├── EventRow.tsx           ✨ NEW
│   │   └── EventFilters.tsx       ✨ NEW
│   │
│   ├── users/
│   │   ├── UsersList.tsx          ✨ NEW
│   │   ├── UserRow.tsx            ✨ NEW
│   │   ├── UserDetailPanel.tsx    ✨ NEW
│   │   └── UserPropertyEditor.tsx ✨ NEW
│   │
│   ├── shared/
│   │   ├── DataTable.tsx          ✨ NEW
│   │   ├── StatusBadge.tsx        ✨ NEW
│   │   ├── IconButton.tsx         ✨ NEW
│   │   ├── SearchInput.tsx        ✨ NEW
│   │   ├── FilterBar.tsx          ✨ NEW
│   │   ├── EmptyState.tsx         ✨ NEW
│   │   └── Modal.tsx              ✨ NEW
│   │
│   └── ui/                        ✅ KEEP (existing shadcn components)
│
├── pages/
│   ├── Campaigns.tsx              🔄 REDESIGN
│   ├── Events.tsx                 ✨ NEW
│   ├── Users.tsx                  ✨ NEW
│   ├── Settings.tsx               🔄 REDESIGN
│   └── CampaignEditor.tsx         🔄 REDESIGN
│
├── styles/
│   ├── design-tokens.ts           ✨ NEW
│   └── global.css                 🔄 UPDATE
│
└── hooks/
    ├── useTable.ts                ✨ NEW
    └── useFilters.ts              ✨ NEW
```

---

## 🎬 Implementation Phases

### **Week 1: Foundation (Days 1-3)**
- [ ] Create design tokens file (`design-tokens.ts`)
- [ ] Build AppLayout + Sidebar components
- [ ] Build DataTable component (reusable)
- [ ] Build shared components (StatusBadge, IconButton, SearchInput, Modal)
- [ ] Update global styles

### **Week 1: Pages (Days 4-5)**
- [ ] Implement Campaigns list page
- [ ] Implement Events log page
- [ ] Implement Users list page
- [ ] Build user detail panel

### **Week 2: Campaign Flow (Days 6-8)**
- [ ] Build CreateCampaignModal (multi-step)
- [ ] Redesign TargetingBuilder component
- [ ] Build NudgeDesigner preview component
- [ ] Wire campaign creation flow to backend

### **Week 2: Editor Redesign (Days 9-10)**
- [ ] Build EditorLayout (3-column)
- [ ] Redesign ComponentPalette (left panel)
- [ ] Redesign CanvasArea (center)
- [ ] Redesign PropertiesPanel (right panel)
- [ ] Restyle VariablesPanel

### **Week 3: Integration & Testing (Days 11-15)**
- [ ] Integrate all pages with existing store (useStore.ts)
- [ ] Test all CRUD operations
- [ ] Test targeting, variables, templates
- [ ] Responsive testing
- [ ] Bug fixes and polish
- [ ] Documentation

---

## 🔗 Backend Integration Points

### Existing Store (useStore.ts)
```typescript
// Already implemented - keep using these:
- campaigns: Campaign[]
- addCampaign, updateCampaign, deleteCampaign
- events: Event[]
- logEvent
- users: User[]
- segments: Segment[]
```

### New Features to Wire
1. **Campaigns Page**
   - List campaigns from store
   - Filter by status (active/draft/paused)
   - Search by name
   - Sorting by created date, name, status

2. **Events Page**
   - Real-time event log from store
   - Filter by event type, user, campaign
   - Live updates (use store subscription)

3. **Users Page**
   - List users from store
   - Show user properties
   - Segment membership
   - User event history

4. **Editor**
   - Preserve all existing component logic
   - Keep ComponentRenderer.tsx
   - Keep variable evaluation system
   - Keep templates system

---

## 🎨 Visual Fidelity Checklist

### Layout
- [x] Sidebar: 260px width, fixed left
- [x] Main content: Flex-grow with 24px padding
- [x] Page header: 64px height, flex between title and actions
- [x] Table row height: 48px

### Colors (from screenshots)
- [x] Primary blue: #3B82F6
- [x] Active status: #10B981 green
- [x] Draft status: #6B7280 gray
- [x] Paused status: #F59E0B orange
- [x] Background: #F9FAFB
- [x] Borders: #E5E7EB

### Typography
- [x] Page titles: 24px, semibold
- [x] Table headers: 14px, medium, uppercase
- [x] Table cells: 14px, regular
- [x] Button text: 14px, medium

### Spacing
- [x] Container padding: 24px
- [x] Section gap: 24px
- [x] Component gap: 16px
- [x] Table cell padding: 12px 16px

### Interactions
- [x] Hover states on table rows (background: gray-50)
- [x] Button hover states (darker shade)
- [x] Smooth transitions (200ms ease)
- [x] Loading states
- [x] Empty states

---

## 📊 Screenshot-to-Component Mapping

| Screenshot | Page/Component | Priority |
|------------|----------------|----------|
| 224754 | Campaigns List | P0 |
| 224813 | Campaigns Table | P0 |
| 225614 | Events Log | P0 |
| 225642 | Events Detail | P0 |
| 225718 | Users List | P0 |
| 225818 | User Detail | P1 |
| 225904 | Create Modal Step 1 | P0 |
| 225931 | Targeting Builder | P0 |
| 225947 | Nudge Preview | P1 |
| 230006 | Editor Layout | P0 |
| 230035 | Component Palette | P0 |
| 230100 | Properties Panel | P0 |

---

## ✅ Success Criteria

1. **Visual Fidelity**: 95%+ match to screenshots
2. **Functionality**: 100% of existing features preserved
3. **Performance**: No regressions, smooth interactions
4. **Responsiveness**: Works on laptop screens (1280px+)
5. **Code Quality**: TypeScript strict mode, no errors
6. **Testing**: All flows manually tested and validated

---

## 🚀 Next Steps

1. ✅ Analysis complete
2. ⏳ Create design tokens file
3. ⏳ Build AppLayout + Sidebar
4. ⏳ Build DataTable component
5. ⏳ Implement Campaigns page
6. ⏳ Continue with Events, Users, Editor...

Let's start building! 🎉
