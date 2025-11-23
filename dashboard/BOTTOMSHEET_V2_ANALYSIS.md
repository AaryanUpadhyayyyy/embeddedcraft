# Bottom Sheet Rebuild - Bug Analysis & Architecture

## Critical Issues Found in Current Implementation

### 1. **BottomSheetVisualBuilder.tsx** (2138 lines - too large)

#### Layout & Rendering Bugs
- **Line 631-1295**: Single monolithic component with 7+ responsibilities mixed together
- **Line 883-959**: Canvas height state desync - `canvasHeight` not properly synced with `config.canvasHeight`
- **Line 1012-1147**: Component rendering without proper error boundaries per component type
- **Line 920-960**: Drag bounds calculation doesn't account for handle bar (32px)
- **Line 1100-1120**: ResizableBox constraints hardcoded, not responsive to canvas changes

#### State Management Issues
- **Line 62-70**: 10+ useState hooks with interdependent state (race conditions)
- **Line 193-196**: `updateConfig` called directly in render path - potential infinite loops
- **Line 812-824**: Height slider uses stale closure - fixed with direct `onChange` but hacky
- **Line 287-338**: `applyTemplate` mutates state in 3 different ways based on mode

#### Component Position Logic
- **Line 110-132**: Position validation has type coercion bugs (`typeof === 'number'` checks everywhere)
- **Line 980-1000**: ReactDraggable bounds don't update when canvas height changes
- **Line 1050-1070**: Rotation transform applied but NOT accounted for in collision/bounds
- **Line 261-285**: Template height calculation doesn't handle rotated components properly

#### Performance Issues
- **Line 1000-1150**: Every component renders with inline style objects (re-created each render)
- **Line 1230-1260**: Quick Edit panel re-renders entire tree when ANY field changes
- **Line 1400-1800**: Properties panel 400 lines of repeated Input/Select patterns
- No React.memo, no useMemo for expensive calculations

### 2. **MobilePreview.tsx** (825 lines)

#### Preview Sync Bugs
- **Line 138-178**: Rotation bounding box calculation works BUT not used consistently
- **Line 147**: 80px padding hardcoded - should be dynamic from config
- **Line 156-176**: Width calculation rotation-aware but height sometimes uses old value
- **Line 200-220**: `canvasHeight` from config but fallback to 80px is wrong default
- **Line 300-400**: Component rendering duplicated from BottomSheetVisualBuilder (DRY violation)

#### Type Mismatches
- **Line 15-30**: `NudgeConfig` type doesn't match actual config shape from Visual Builder
- **Line 200**: `config.components` typed as `any[]` - no validation
- **Line 400-600**: Simple mode vs Visual Builder mode has completely different code paths

#### Visual Inconsistencies
- **Line 700-750**: Phone frame dimensions (280x560) don't match actual mobile (375x667 iPhone SE)
- **Line 210-230**: Content height calculation OFF BY 40px from canvas (missing handle bar)
- **Line 350-400**: Components rendered without same transforms as canvas (rotation, scale)

### 3. **Architectural Problems**

#### Separation of Concerns
- Visual Builder mixes: UI layout + component logic + template system + drag/drop + properties panel
- Preview duplicates 80% of component rendering logic
- No shared component registry or renderer
- State lives in parent, no context/provider pattern

#### Type Safety
- Component interfaces use `Record<string, any>` for style/content (no validation)
- Position can be `string | number` causing runtime errors
- No Zod/validation schema for templates

#### Testability
- Zero unit tests (2000+ lines untested)
- Tightly coupled to UI libraries (DnD, Resizable)
- No pure functions for geometry/bounds calculations
- Mock data hardcoded in component

---

## V2 Architecture Design

### Component Breakdown

```
BottomSheetV2/
├── index.tsx                    # Main export + feature flag logic
├── BottomSheetEditor.tsx        # Orchestrator (200 lines max)
├── core/
│   ├── types.ts                 # All TypeScript interfaces + Zod schemas
│   ├── geometry.ts              # Pure functions: rotation, bounds, collision
│   ├── validation.ts            # Component validation + sanitization
│   └── constants.ts             # Defaults, constraints, palette config
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx           # Drop zone + grid + zoom container
│   │   ├── CanvasComponent.tsx  # Single draggable/resizable component
│   │   └── ComponentRenderer.tsx # Shared rendering logic (used by Canvas + Preview)
│   ├── Toolbar/
│   │   ├── Toolbar.tsx          # Top bar with actions
│   │   ├── HeightControl.tsx    # Slider + dialog
│   │   └── AlignmentTools.tsx   # Align left/center/right
│   ├── Panels/
│   │   ├── ComponentPalette.tsx # Left sidebar
│   │   ├── LayersPanel.tsx      # Layer management
│   │   ├── PropertiesPanel.tsx  # Right sidebar (auto-generated from schema)
│   │   └── QuickEditPanel.tsx   # Template field editor
│   └── Templates/
│       ├── TemplateGallery.tsx  # Modal with search/filter
│       └── TemplateManager.tsx  # Load/apply/export logic
├── hooks/
│   ├── useBottomSheetState.ts   # Centralized state management
│   ├── useComponentDrag.ts      # Drag logic extracted
│   ├── useTemplates.ts          # Template loading/caching
│   └── useKeyboardShortcuts.ts  # Keyboard nav
└── utils/
    ├── componentDefaults.ts     # getDefaultStyle/Content (type-safe)
    ├── exportImport.ts          # JSON export/import
    └── heightCalculator.ts      # Template height + auto-resize logic
```

### Key Improvements

#### 1. Pure Geometry Functions (`core/geometry.ts`)
```typescript
export function getRotatedBounds(
  x: number, y: number, 
  width: number, height: number, 
  rotation: number
): { x: number; y: number; width: number; height: number } {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  
  return {
    x,
    y,
    width: width * cos + height * sin,
    height: height * cos + width * sin,
  };
}

export function clampPosition(
  x: number, y: number,
  width: number, height: number,
  canvasWidth: number, canvasHeight: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(canvasWidth - width, x)),
    y: Math.max(0, Math.min(canvasHeight - height, y)),
  };
}
```

#### 2. Shared Component Renderer (`components/Canvas/ComponentRenderer.tsx`)
- Single source of truth for rendering
- Used by both Canvas and MobilePreview
- Props: `component`, `isPreview: boolean`
- No duplication, consistent visuals

#### 3. Type-Safe State (`core/types.ts`)
```typescript
import { z } from 'zod';

export const PositionSchema = z.object({
  type: z.enum(['absolute', 'flex']),
  x: z.number().min(0).optional(),
  y: z.number().min(0).optional(),
  width: z.number().min(20).max(800),
  height: z.number().min(20).max(800),
  zIndex: z.number().min(1).max(100).default(1),
  rotation: z.number().min(-180).max(180).default(0),
  order: z.number().min(0).optional(),
});

export const ComponentSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'button', 'shape', 'video', /* ... */]),
  position: PositionSchema,
  style: z.record(z.unknown()),
  content: z.record(z.unknown()),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
});

export type Component = z.infer<typeof ComponentSchema>;
```

#### 4. Centralized State Hook (`hooks/useBottomSheetState.ts`)
```typescript
export function useBottomSheetState(initialConfig: any) {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(80);
  const [layoutType, setLayoutType] = useState<'absolute' | 'flex'>('absolute');

  // Derived state
  const selectedComponent = useMemo(
    () => components.find(c => c.id === selectedId),
    [components, selectedId]
  );

  // Actions
  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    setComponents(prev => prev.map(c => {
      if (c.id !== id) return c;
      const merged = { ...c, ...updates };
      // Validate + clamp
      return validateComponent(merged);
    }));
  }, []);

  const addComponent = useCallback((type: ComponentType) => {
    const newComp = createDefaultComponent(type, components.length);
    setComponents(prev => [...prev, newComp]);
    setSelectedId(newComp.id);
  }, [components.length]);

  return {
    // State
    components,
    selectedId,
    selectedComponent,
    canvasHeight,
    layoutType,
    // Actions
    addComponent,
    updateComponent,
    deleteComponent,
    setCanvasHeight,
    setLayoutType,
    setSelectedId,
  };
}
```

#### 5. Auto-Height Calculator (`utils/heightCalculator.ts`)
```typescript
export function calculateRequiredHeight(
  components: Component[],
  padding = 80
): number {
  if (components.length === 0) return 80;

  const maxBottom = components.reduce((max, comp) => {
    const bounds = getRotatedBounds(
      comp.position.x || 0,
      comp.position.y || 0,
      comp.position.width,
      comp.position.height,
      comp.position.rotation || 0
    );
    return Math.max(max, bounds.y + bounds.height);
  }, 0);

  return Math.ceil(maxBottom + padding);
}
```

---

## Implementation Plan

### Phase 1: Core Foundation (Tasks 2-3)
1. Create `core/types.ts` with Zod schemas
2. Create `core/geometry.ts` with tested pure functions
3. Create `hooks/useBottomSheetState.ts` with centralized state
4. Scaffold `BottomSheetEditor.tsx` with 4-column layout

### Phase 2: Component Rendering (Task 4)
1. Extract `ComponentRenderer.tsx` (shared by Canvas + Preview)
2. Build `Canvas.tsx` with drag/drop integration
3. Build `CanvasComponent.tsx` wrapper with bounds/validation
4. Migrate component defaults to type-safe factories

### Phase 3: Preview Integration (Task 5)
1. Refactor `MobilePreview.tsx` to use `ComponentRenderer`
2. Fix height sync using `calculateRequiredHeight`
3. Ensure rotation-aware bounding in preview
4. Add visual regression tests (screenshot comparison)

### Phase 4: Polish & Testing (Tasks 6-9)
1. Wire V2 into app with feature flag
2. Add unit tests for geometry/validation/height
3. Manual QA checklist
4. Document breaking changes + migration guide

---

## Success Criteria

✅ **Bug Fixes**
- Canvas height syncs perfectly with preview (no 40px offset)
- Rotated components have correct bounding boxes
- No type coercion errors in position validation
- Template height auto-detection works for all edge cases

✅ **Code Quality**
- Main component < 300 lines
- 90%+ test coverage for pure functions
- Zero `any` types in public APIs
- All components React.memo optimized

✅ **Performance**
- < 16ms render time for 20 components
- Drag/resize feels instant (no lag)
- Template loading < 100ms

✅ **Developer Experience**
- Add new component type in < 10 lines
- Zod validation catches errors at dev time
- Clear separation: UI vs logic vs state
