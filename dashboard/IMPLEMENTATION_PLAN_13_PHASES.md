# 🚀 13-Phase Implementation Plan for Desire Dashboard

This plan is derived from the deep analysis of the provided dashboard assets and the `REDESIGN_PLAN.md`. It ensures a pixel-perfect recreation of the "Desire Dashboard" with all advanced features.

## 📅 Phase 1: Design System Foundation
**Goal:** Establish the visual language (colors, typography, spacing) to match the screenshots exactly.
- [ ] Create `src/styles/design-tokens.ts` with the specified Color Palette (Primary Blue #3B82F6, etc.).
- [ ] Define Typography constants (Inter font, sizes, weights).
- [ ] Define Spacing and Shadow constants.
- [ ] Update `src/styles/global.css` to use these tokens.
- [ ] Set up Tailwind config (if used) to map to these tokens.

## 📅 Phase 2: Core Layout Infrastructure
**Goal:** Build the main application shell that holds the dashboard.
- [ ] Create `src/components/layout/Sidebar.tsx` (Fixed 260px width, navigation items).
- [ ] Create `src/components/layout/PageHeader.tsx` (Title, Breadcrumbs, Action buttons).
- [ ] Create `src/components/layout/PageContainer.tsx` (Standard padding wrapper).
- [ ] Create `src/components/layout/AppLayout.tsx` (Combines Sidebar + Header + Content area).
- [ ] Implement responsive behavior for the layout.

## 📅 Phase 3: Shared UI Component Library
**Goal:** Build the reusable building blocks used across all pages.
- [ ] Create `src/components/shared/StatusBadge.tsx` (Active/Draft/Paused variants).
- [ ] Create `src/components/shared/IconButton.tsx` (Standardized icon buttons).
- [ ] Create `src/components/shared/SearchInput.tsx` (Search field with icon).
- [ ] Create `src/components/shared/FilterBar.tsx` (Filter dropdowns and chips).
- [ ] Create `src/components/shared/EmptyState.tsx` (Illustrations for empty lists).
- [ ] Create `src/components/shared/Modal.tsx` (Base modal with animations).

## 📅 Phase 4: Data Table Infrastructure
**Goal:** Build a robust, reusable table component for Campaigns, Events, and Users.
- [ ] Create `src/components/shared/DataTable.tsx`.
- [ ] Implement Sorting (column headers).
- [ ] Implement Pagination controls.
- [ ] Implement Row Selection (checkboxes).
- [ ] Implement Row Actions (dropdown menu).
- [ ] Style rows with hover effects (gray-50) as per screenshots.

## 📅 Phase 5: Campaigns Page Implementation
**Goal:** Build the main "Campaigns" list view (Screenshot 224754, 224813).
- [ ] Create `src/pages/Campaigns.tsx`.
- [ ] Implement `CampaignsList` component using `DataTable`.
- [ ] Connect to `useStore` to fetch campaigns.
- [ ] Implement "Create Campaign" button action.
- [ ] Implement Status filtering and Search.

## 📅 Phase 6: Events System Implementation
**Goal:** Build the Real-time Events Log (Screenshot 225614, 225642).
- [ ] Create `src/pages/Events.tsx`.
- [ ] Implement `EventsLog` component.
- [ ] Create `EventRow` for specific event styling.
- [ ] Implement `EventFilters` (by type, user, campaign).
- [ ] Connect to real-time store updates.

## 📅 Phase 7: User Management System
**Goal:** Build the Users list and detail views (Screenshot 225718, 225818).
- [ ] Create `src/pages/Users.tsx`.
- [ ] Implement `UsersList` component.
- [ ] Create `UserDetailPanel.tsx` (Slide-over panel).
- [ ] Implement `UserPropertyEditor` for editing user traits.
- [ ] Display user event history in the detail panel.

## 📅 Phase 8: Campaign Creation Flow (Part 1 - Setup)
**Goal:** Build the first steps of the Campaign Wizard (Screenshot 225904).
- [ ] Create `src/components/campaign/CreateCampaignModal.tsx`.
- [ ] Implement Step 1: `CampaignBasicInfo.tsx` (Name, Description, Type selection).
- [ ] Implement validation and state management for the wizard.

## 📅 Phase 9: Campaign Creation Flow (Part 2 - Targeting)
**Goal:** Redesign the Targeting Builder (Screenshot 225931).
- [ ] Refactor `src/components/campaign/TargetingBuilder.tsx`.
- [ ] Implement visual query builder for rules (AND/OR logic).
- [ ] Style the rule inputs to match the new design system.
- [ ] Implement `NudgeDesigner.tsx` for the preview step.

## 📅 Phase 10: Editor Redesign (Layout & Palette)
**Goal:** Overhaul the main Campaign Editor layout (Screenshot 230006, 230035).
- [ ] Create `src/components/editor/EditorLayout.tsx` (3-column layout).
- [ ] Redesign `src/components/editor/ComponentPalette.tsx` (Left panel).
- [ ] Implement categorized component list with drag-and-drop sources.
- [ ] Style the palette items to match the "Desire Dashboard".

## 📅 Phase 11: Editor Redesign (Canvas & Properties)
**Goal:** Overhaul the Canvas and Properties panels (Screenshot 230100).
- [ ] Redesign `src/components/editor/CanvasArea.tsx` (Center panel).
- [ ] Implement Mobile Preview frame with notch/device frame.
- [ ] Redesign `src/components/editor/PropertiesPanel.tsx` (Right panel).
- [ ] Implement tabbed properties (Content, Style, Actions).

## 📅 Phase 12: Advanced Features Integration
**Goal:** Integrate the advanced features from `ADVANCED_FEATURES_IMPLEMENTATION.md`.
- [ ] Integrate **Auto-Layout System** (Flexbox controls) into Properties Panel.
- [ ] Integrate **Layer Effects System** (Shadows, Gradients, Blur) into Properties Panel.
- [ ] Integrate **Component States** (Hover, Active) configuration.
- [ ] Ensure all advanced types are properly wired to the editor state.

## 📅 Phase 13: Final Integration, Testing & Polish
**Goal:** Ensure everything works together seamlessly and matches the "Desire Dashboard" perfectly.
- [ ] Wire all pages to the main navigation.
- [ ] Perform pixel-perfect visual QA against screenshots.
- [ ] Test all user flows (Create Campaign, Edit User, Filter Events).
- [ ] Optimize performance (memoization, lazy loading).
- [ ] Final bug fixes and launch.

---
**Note:** This plan assumes the existence of the `useStore` and backend logic as described in `REDESIGN_PLAN.md`. The focus is on the Frontend Redesign and Feature Integration.
