# 🕵️ Deep Analysis: Desire Dashboard Visual Specification

This document provides a comprehensive analysis of the "Desire Dashboard" based on the provided visual assets (video frames/screenshots). It serves as the single source of truth for the visual design, user experience, and functional flow of the application.

## 1. 🎨 Visual Identity System

The dashboard exhibits a modern, clean, and professional aesthetic, prioritizing content legibility and ease of navigation.

### **Color Palette**
The design uses a refined color system to denote hierarchy and status.
*   **Primary Brand Color:** `Blue-500` (`#3B82F6`) - Used for primary actions, active states, and key navigation elements.
*   **Backgrounds:**
    *   **App Background:** `Gray-50` (`#F9FAFB`) - A very subtle off-white for the main content area to reduce eye strain.
    *   **Surface/Card:** `White` (`#FFFFFF`) - Used for the sidebar, header, and content cards (tables, panels).
*   **Text:**
    *   **Primary:** `Gray-900` (`#111827`) - High contrast for headings and main data.
    *   **Secondary:** `Gray-500` (`#6B7280`) - For labels, metadata, and descriptions.
*   **Status Indicators:**
    *   **Active/Success:** `Emerald-500` (`#10B981`) - Used for "Active" badges and success toasts.
    *   **Draft/Inactive:** `Gray-500` (`#6B7280`) - Used for "Draft" badges.
    *   **Paused/Warning:** `Amber-500` (`#F59E0B`) - Used for "Paused" badges.
*   **Borders:** `Gray-200` (`#E5E7EB`) - Subtle dividers between sections and table rows.

### **Typography**
*   **Font Family:** `Inter` (Sans-serif) - Clean, legible, and standard for modern dashboards.
*   **Hierarchy:**
    *   **Page Titles:** ~24px, Semi-bold (600).
    *   **Section Headers:** ~18px, Medium (500).
    *   **Body Text:** 14px, Regular (400).
    *   **Labels/Captions:** 12px, Medium (500), often uppercase for table headers.

### **Spacing & Layout**
*   **Grid System:** Fluid layout with a fixed sidebar and flexible content area.
*   **Padding:** Consistent `24px` (1.5rem) padding around the main content area.
*   **Gaps:** `16px` (1rem) gap between major UI components.
*   **Corner Radius:**
    *   **Cards/Panels:** `8px` or `12px` (Rounded-lg).
    *   **Buttons:** `6px` or `8px` (Rounded-md).
    *   **Badges:** Full pill shape (`9999px`).

---

## 2. 🏗️ Structural Layout Analysis

The application follows a standard "Admin Dashboard" layout pattern.

### **A. Sidebar Navigation (Left Panel)**
*   **Width:** Fixed, approximately `260px`.
*   **Background:** White (`#FFFFFF`) with a right border (`#E5E7EB`).
*   **Elements:**
    *   **Logo Area:** Top-left, ~64px height. Contains the brand icon and name.
    *   **Navigation Menu:** Vertical list of links (Campaigns, Events, Users, Settings).
        *   **State:** Active items have a light blue background (`Blue-50`) and blue text (`Blue-600`). Inactive items are gray (`Gray-600`).
        *   **Icons:** 20px stroke icons (Feather/Lucide style) next to labels.
    *   **User Profile:** Bottom-left, fixed. Shows avatar, name, and email.

### **B. Page Header (Top Bar)**
*   **Height:** ~64px.
*   **Layout:** Flexbox, `justify-between`.
*   **Elements:**
    *   **Left:** Page Title (e.g., "Campaigns") and potentially breadcrumbs.
    *   **Right:** Global actions (e.g., "Create Campaign" button), Search bar, Notification bell.

### **C. Main Content Area**
*   **Background:** `Gray-50` (`#F9FAFB`).
*   **Behavior:** Scrollable independently of the sidebar.
*   **Content:** Contains the specific page views (Tables, Forms, Editors).

---

## 3. 📱 Key Screen Analysis

### **Screen 1: Campaigns List (Dashboard Home)**
*   **Purpose:** Overview of all marketing campaigns.
*   **Key Components:**
    *   **Data Table:** The central element.
        *   **Columns:** Name, Status, Trigger, Impressions, Clicks, Last Edited.
        *   **Rows:** 48px height, hover effect (`Gray-50`).
        *   **Status Badges:** Pill-shaped badges indicating campaign state.
    *   **Filters:** A toolbar above the table for filtering by Status or searching by Name.
    *   **Primary Action:** "Create Campaign" button (Blue, top-right).

### **Screen 2: Events Log**
*   **Purpose:** Real-time stream of user activities.
*   **Key Components:**
    *   **Log Stream:** A dense list or table of events.
    *   **Event Row:** Displays Event Name (bold), User ID (link), Timestamp (relative), and Metadata (JSON snippet).
    *   **Visual Cues:** Different icons or color markers for different event types (e.g., `screen_view`, `click`, `custom_event`).

### **Screen 3: Users Management**
*   **Purpose:** List of users and their properties.
*   **Key Components:**
    *   **User Table:** Similar to Campaigns table but focused on user attributes (ID, Email, Last Seen, Country).
    *   **Detail Panel (Slide-over):** Clicking a user row slides in a panel from the right.
        *   **Header:** User Avatar and ID.
        *   **Tabs:** "Profile", "Events", "Segments".
        *   **Content:** Key-value pairs of user properties and a timeline of their recent events.

### **Screen 4: Campaign Editor (The Core Feature)**
This is the most complex interface, divided into three distinct columns.

*   **Layout:** 3-Column "Holy Grail" layout.
    *   **Left Panel (Palette & Layers):** ~280px.
        *   **Tabs:** "Add" (Component Palette) and "Layers" (Tree view).
        *   **Palette:** Grid of draggable components (Text, Image, Button, Container).
        *   **Layers Tree:** Nested list showing the hierarchy of the nudge.
    *   **Center Panel (Canvas):** Flexible width, Gray background.
        *   **Device Frame:** A mobile phone frame (iPhone style) centered in the view.
        *   **Canvas:** The actual editing area inside the phone frame.
        *   **Overlay:** Selection outlines and resize handles on the selected element.
    *   **Right Panel (Properties):** ~320px.
        *   **Tabs:** "Content", "Style", "Actions".
        *   **Content Tab:** Inputs for text, image URLs, etc.
        *   **Style Tab:** Accordions for Typography, Spacing, Border, Effects (Shadows), Layout (Flexbox).
        *   **Actions Tab:** Configuration for click handlers (Dismiss, Link, etc.).

### **Screen 5: Campaign Creation Modal**
*   **Type:** Multi-step modal dialog.
*   **Step 1 (Basics):** Inputs for Campaign Name and Description. Selection cards for "Campaign Type" (Nudge, Banner, Modal).
*   **Step 2 (Targeting):** A visual query builder.
    *   **Logic:** "Show IF (Event = 'x') AND (User Property 'y' = 'z')".
    *   **UI:** Dropdowns for selecting properties and operators.

---

## 4. 🔄 User Flows & Interactions

### **Flow: Creating a New Campaign**
1.  **Start:** User clicks "Create Campaign" on the Campaigns list.
2.  **Setup:** Modal opens. User enters name "Welcome Nudge" and selects "Modal" type. Clicks "Next".
3.  **Targeting:** User sets rule: "Trigger on `app_open`". Clicks "Create".
4.  **Editor:** User is redirected to the full-screen Editor.
5.  **Design:**
    *   User drags a "Text" component from Left Panel to the Canvas.
    *   User selects the text on Canvas.
    *   User edits the text content in the Right Panel.
    *   User changes text color to Blue in the Style tab.
6.  **Save:** User clicks "Save Draft" in the top-right corner.

### **Flow: Analyzing User Behavior**
1.  **Start:** User navigates to "Users" page.
2.  **Search:** User types a specific email in the search bar.
3.  **Detail:** User clicks the row. The Detail Panel slides in.
4.  **History:** User switches to "Events" tab in the panel to see the user's recent actions.

---

## 5. 💎 Micro-interactions & Polish

*   **Hover Effects:**
    *   Sidebar links lighten slightly on hover.
    *   Table rows have a subtle background highlight (`Gray-50`) to guide the eye.
    *   Buttons have a standard brightness lift or shadow increase on hover.
*   **Transitions:**
    *   Page transitions are instant or have a very subtle fade.
    *   Modals fade in and scale up slightly (`ease-out`).
    *   Slide-over panels translate from off-screen right (`translateX`).
*   **Feedback:**
    *   Toast notifications appear top-right for success/error states (e.g., "Campaign Saved").
    *   Loading spinners (circular) replace content during data fetches.

---

## 6. 🧩 Component Library Breakdown (Inferred)

Based on the visual analysis, the following reusable components are required:

| Component | Description | Visual Traits |
| :--- | :--- | :--- |
| `Button` | Primary, Secondary, Ghost variants | Rounded corners, medium font weight. |
| `Input` | Text fields, Search bars | Gray border, focus ring (Blue). |
| `Select` | Dropdowns | Native or custom styled, consistent with Inputs. |
| `Badge` | Status indicators | Pill shape, pastel background, dark text. |
| `Card` | Content containers | White background, subtle shadow/border. |
| `Modal` | Dialog overlays | Centered, backdrop blur. |
| `Drawer` | Side panels | Fixed right, full height. |
| `Table` | Data display | Striped or simple rows, sortable headers. |
| `Switch` | Toggles | iOS style toggle switches. |
| `Tabs` | Navigation within panels | Underline or pill style indicators. |

---

## 7. 📝 Conclusion

The "Desire Dashboard" is a sophisticated tool that balances density of information (in tables and logs) with ease of use (in the visual editor). The implementation must strictly adhere to the **Blue/Gray/White** color scheme and the **3-Column Editor Layout** to match the provided visual references.
