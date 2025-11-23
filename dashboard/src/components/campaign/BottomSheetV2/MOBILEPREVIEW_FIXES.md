# MobilePreview Fixes - Height & Width Issues

## Issues Fixed

### Issue 1: Simple Mode - Content Cut Off
**Problem**: Description and images were not visible due to insufficient height (80px default)

**Before**:
```tsx
const contentHeight = config.canvasHeight 
  ? config.canvasHeight
  : Math.max(calculatedContentHeight, 80); // Only 80px!
```

**After**:
```tsx
const contentHeight = hasComponents 
  ? (config.canvasHeight || Math.max(calculatedContentHeight, 80))
  : (config.canvasHeight || 350); // 350px default for simple mode ✅
```

**Changes**:
- Simple mode now defaults to **350px height** instead of 80px
- Added `overflow-y-auto` with `maxHeight` to allow scrolling if content exceeds height
- Content area respects handle bar (subtracts 40px from total height)

---

### Issue 2: Builder Mode - Width Not Constrained
**Problem**: Builder mode used full width instead of matching canvas width (375px)

**Before**:
```tsx
const contentWidth = undefined; // Full width
```

**After**:
```tsx
const contentWidth = hasComponents ? 375 : undefined; // Match canvas ✅

// In the render:
<div style={{ 
  width: '375px', 
  margin: '0 auto' // Center the content
}}>
```

**Changes**:
- Builder mode container now fixed at **375px width** (matches canvas)
- Content is centered with `margin: 0 auto`
- Components positioned absolutely within the 375px container
- Simple mode still uses full width for responsiveness

---

## Visual Comparison

### Simple Mode
| Before | After |
|--------|-------|
| Height: 80px (content cut off) | Height: 350px (all content visible) |
| No scrolling | Overflow scrolls if needed |
| Images/text hidden | Images/text fully visible |

### Builder Mode
| Before | After |
|--------|-------|
| Width: 100% (stretches to phone width) | Width: 375px (matches canvas) |
| Components misaligned | Perfect canvas-preview alignment |
| Inconsistent positioning | Pixel-perfect sync |

---

## Code Changes Summary

### File: `src/components/campaign/MobilePreview.tsx`

**Lines 140-156** - Height calculation:
```tsx
// ✅ FIX: Calculate proper height for simple mode
const contentHeight = hasComponents 
  ? (config.canvasHeight || Math.max(calculatedContentHeight, 80))
  : (config.canvasHeight || 350); // Default 350px for simple mode

// ✅ FIX: Use 375px width for builder mode
const contentWidth = hasComponents ? 375 : undefined;
```

**Lines 192-201** - Builder mode container:
```tsx
<div className="relative" style={{ 
  minHeight: '200px', 
  padding: 0,
  width: '375px', // Match canvas width
  margin: '0 auto' // Center the content
}}>
```

**Line 217** - Simple mode scrolling:
```tsx
<div className="space-y-4 p-6 overflow-y-auto" 
     style={{ maxHeight: `${contentHeight - 40}px` }}>
```

---

## Testing Checklist

- [x] Simple mode with title + description + image displays correctly
- [x] Simple mode with long content scrolls properly
- [x] Builder mode components stay within 375px bounds
- [x] Builder mode matches canvas positioning exactly
- [x] Handle bar (32px) accounted for in height calculations
- [x] No TypeScript compilation errors

---

## Impact

✅ **Simple Mode**: Users can now see full content (title, description, images, buttons)
✅ **Builder Mode**: Perfect 1:1 sync between Canvas and Preview
✅ **Responsive**: Simple mode still adapts to phone width, builder mode constrained

---

**Fixed**: November 12, 2025
**Files Changed**: 1 (MobilePreview.tsx)
**Lines Modified**: ~20 lines
