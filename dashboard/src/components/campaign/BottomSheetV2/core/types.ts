import { z } from 'zod';

// ============================================================================
// Position & Layout Schemas
// ============================================================================

export const PositionSchema = z.object({
  type: z.enum(['absolute', 'flex']),
  x: z.number().min(0).optional(),
  y: z.number().min(0).optional(),
  width: z.number().min(20).max(800),
  height: z.number().min(20).max(800),
  zIndex: z.number().int().min(1).max(100).default(1),
  rotation: z.number().min(-180).max(180).default(0),
  order: z.number().int().min(0).optional(),
});

export type Position = z.infer<typeof PositionSchema>;

// ============================================================================
// Auto-Layout (Flexbox) Schemas
// ============================================================================

export const FlexLayoutSchema = z.object({
  enabled: z.boolean().default(false),
  direction: z.enum(['row', 'column', 'row-reverse', 'column-reverse']).default('column'),
  gap: z.number().min(0).max(100).default(12),
  padding: z.object({
    top: z.number().min(0).max(100).default(16),
    right: z.number().min(0).max(100).default(16),
    bottom: z.number().min(0).max(100).default(16),
    left: z.number().min(0).max(100).default(16),
  }).optional(),
  alignItems: z.enum(['flex-start', 'center', 'flex-end', 'stretch', 'baseline']).default('flex-start'),
  justifyContent: z.enum(['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']).default('flex-start'),
  flexWrap: z.enum(['nowrap', 'wrap', 'wrap-reverse']).default('nowrap'),
});

export type FlexLayout = z.infer<typeof FlexLayoutSchema>;

// Child sizing modes for flex items
export const FlexChildSchema = z.object({
  sizingMode: z.enum(['hug', 'fill', 'fixed']).default('fixed'),
  minWidth: z.number().min(0).optional(),
  maxWidth: z.number().min(0).optional(),
  minHeight: z.number().min(0).optional(),
  maxHeight: z.number().min(0).optional(),
  flexGrow: z.number().min(0).max(10).default(0),
  flexShrink: z.number().min(0).max(10).default(1),
  alignSelf: z.enum(['auto', 'flex-start', 'center', 'flex-end', 'stretch', 'baseline']).default('auto'),
});

export type FlexChild = z.infer<typeof FlexChildSchema>;

// ============================================================================
// Component Type Definitions
// ============================================================================

export const ComponentType = z.enum([
  'text',
  'image',
  'video',
  'button',
  'input',
  'shape',
  'container',
  'carousel',
  'rating',
  'divider',
  'spacer',
  'badge',
  'richtext',
  'buttongroup',
  'progressbar',
  'progresscircle',
  'stepper',
  'list',
  'countdown',
  'link',
]);

export type ComponentType = z.infer<typeof ComponentType>;

// ============================================================================
// Style & Content Schemas (by component type)
// ============================================================================

export const TextStyleSchema = z.object({
  fontSize: z.number().min(8).max(72).default(16),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1F2937'),
  fontWeight: z.enum(['100', '300', '400', '600', '700', '900']).default('400'),
  fontStyle: z.enum(['normal', 'italic']).default('normal'),
  textDecoration: z.enum(['none', 'underline', 'line-through']).default('none'),
  fontFamily: z.string().default('Inter'),
  lineHeight: z.number().min(1).max(3).default(1.5),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  marginBottom: z.number().min(0).max(100).default(12),
});

export const ImageStyleSchema = z.object({
  width: z.union([z.number(), z.string()]).default('100%'),
  height: z.number().min(50).max(600).default(200),
  borderRadius: z.number().min(0).max(50).default(12),
  objectFit: z.enum(['cover', 'contain', 'fill', 'none']).default('cover'),
  filter: z.string().optional(),
  marginBottom: z.number().min(0).max(100).default(16),
});

export const ButtonStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  fontSize: z.number().min(10).max(32).default(16),
  fontWeight: z.enum(['400', '600', '700']).default('600'),
  borderRadius: z.number().min(0).max(50).default(8),
  paddingVertical: z.number().min(8).max(32).default(14),
  paddingHorizontal: z.number().min(12).max(64).default(24),
  width: z.union([z.number(), z.string()]).default('100%'),
  textAlign: z.enum(['left', 'center', 'right']).default('center'),
  marginBottom: z.number().min(0).max(100).default(12),
  borderWidth: z.number().min(0).max(10).default(0),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
});

export const ShapeStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#4F46E5'),
  borderWidth: z.number().min(0).max(20).default(2),
  borderRadius: z.number().min(0).max(50).default(0),
  marginBottom: z.number().min(0).max(100).default(12),
});

// Union type for all possible styles
export const StyleSchema = z.union([
  TextStyleSchema,
  ImageStyleSchema,
  ButtonStyleSchema,
  ShapeStyleSchema,
  z.record(z.unknown()), // Fallback for other types
]);

export type ComponentStyle = z.infer<typeof StyleSchema>;

// ============================================================================
// Content Schemas
// ============================================================================

export const TextContentSchema = z.object({
  text: z.string().default('Click to edit text'),
});

export const ImageContentSchema = z.object({
  url: z.string().url().default('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400'),
  alt: z.string().default('Placeholder Image'),
});

export const ButtonContentSchema = z.object({
  text: z.string().default('Click Me'),
  action: z.string().default('primary_action'),
});

export const ShapeContentSchema = z.object({
  shapeType: z.enum(['rectangle', 'circle', 'rounded', 'triangle']).default('rectangle'),
});

export const ContentSchema = z.union([
  TextContentSchema,
  ImageContentSchema,
  ButtonContentSchema,
  ShapeContentSchema,
  z.record(z.unknown()),
]);

export type ComponentContent = z.infer<typeof ContentSchema>;

// ============================================================================
// Layer Effects (Shadows, Gradients, Blur)
// ============================================================================

export const ShadowEffectSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  type: z.enum(['drop-shadow', 'inner-shadow']).default('drop-shadow'),
  x: z.number().min(-100).max(100).default(0),
  y: z.number().min(-100).max(100).default(4),
  blur: z.number().min(0).max(100).default(8),
  spread: z.number().min(-50).max(50).default(0),
  color: z.string().default('rgba(0, 0, 0, 0.2)'),
});

export type ShadowEffect = z.infer<typeof ShadowEffectSchema>;

export const GradientStopSchema = z.object({
  position: z.number().min(0).max(100),
  color: z.string(),
});

export const GradientEffectSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  type: z.enum(['linear', 'radial', 'angular']).default('linear'),
  angle: z.number().min(0).max(360).default(0),
  stops: z.array(GradientStopSchema).min(2),
});

export type GradientEffect = z.infer<typeof GradientEffectSchema>;

export const BlurEffectSchema = z.object({
  enabled: z.boolean().default(false),
  amount: z.number().min(0).max(100).default(0),
  type: z.enum(['layer', 'background']).default('layer'),
});

export type BlurEffect = z.infer<typeof BlurEffectSchema>;

export const StrokeEffectSchema = z.object({
  enabled: z.boolean().default(false),
  width: z.number().min(0).max(20).default(1),
  color: z.string().default('#000000'),
  position: z.enum(['inside', 'center', 'outside']).default('center'),
  style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
});

export type StrokeEffect = z.infer<typeof StrokeEffectSchema>;

export const LayerEffectsSchema = z.object({
  shadows: z.array(ShadowEffectSchema).default([]),
  gradient: GradientEffectSchema.optional(),
  blur: BlurEffectSchema.optional(),
  stroke: StrokeEffectSchema.optional(),
  opacity: z.number().min(0).max(100).default(100),
  blendMode: z.enum(['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten']).default('normal'),
});

export type LayerEffects = z.infer<typeof LayerEffectsSchema>;

// ============================================================================
// Component States (Hover, Active, Disabled)
// ============================================================================

export const ComponentStateSchema = z.object({
  default: z.record(z.unknown()),
  hover: z.record(z.unknown()).optional(),
  active: z.record(z.unknown()).optional(),
  disabled: z.record(z.unknown()).optional(),
  focused: z.record(z.unknown()).optional(),
});

export type ComponentState = z.infer<typeof ComponentStateSchema>;

// ============================================================================
// Interactions & Triggers
// ============================================================================

export const ActionSchema = z.object({
  id: z.string().optional(), // For UI tracking
  type: z.enum(['navigate', 'close', 'toggle_visibility', 'submit_form', 'open_url', 'set_variable', 'close-modal', 'show-notification']),
  target: z.string().optional(),
  value: z.unknown().optional(),
  url: z.string().optional(),
  variableName: z.string().optional(),
  config: z.record(z.unknown()).optional(), // Generic config object
});

export type Action = z.infer<typeof ActionSchema>;

export const TriggerSchema = z.object({
  id: z.string().optional(), // For UI tracking
  event: z.enum(['click', 'hover', 'input', 'focus', 'blur', 'submit', 'on-click', 'on-hover', 'on-input', 'on-focus', 'on-blur', 'on-submit']),
  actions: z.array(ActionSchema),
  condition: z.string().optional(), // Expression: "rating > 3"
});

export type Trigger = z.infer<typeof TriggerSchema>;

export const InteractionsSchema = z.object({
  triggers: z.array(TriggerSchema).default([]),
});

export type Interactions = z.infer<typeof InteractionsSchema>;

// ============================================================================
// Variables & Conditional Logic
// ============================================================================

export const VariableSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  defaultValue: z.unknown(),
  currentValue: z.unknown().optional(),
});

export type Variable = z.infer<typeof VariableSchema>;

export const ConditionSchema = z.object({
  type: z.enum(['visibility', 'style', 'content']),
  expression: z.string(), // "userName !== ''"
  trueValue: z.unknown(),
  falseValue: z.unknown().optional(),
});

export type Condition = z.infer<typeof ConditionSchema>;

// ============================================================================
// Responsive Design & Constraints
// ============================================================================

export const BreakpointSchema = z.enum(['mobile', 'tablet', 'desktop']);
export type Breakpoint = z.infer<typeof BreakpointSchema>;

export const ConstraintsSchema = z.object({
  horizontal: z.enum(['left', 'right', 'left-right', 'center', 'scale']).default('left'),
  vertical: z.enum(['top', 'bottom', 'top-bottom', 'center', 'scale']).default('top'),
});

export type Constraints = z.infer<typeof ConstraintsSchema>;

export const ResponsiveOverrideSchema = z.object({
  breakpoint: BreakpointSchema,
  position: PositionSchema.partial().optional(),
  style: z.record(z.unknown()).optional(),
  visible: z.boolean().optional(),
});

export type ResponsiveOverride = z.infer<typeof ResponsiveOverrideSchema>;

// ============================================================================
// Animations
// ============================================================================

export const KeyframeSchema = z.object({
  id: z.string().optional(), // For UI tracking
  time: z.number().min(0).max(100), // Percentage 0-100
  properties: z.record(z.unknown()),
  easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'spring']).optional(),
});

export type Keyframe = z.infer<typeof KeyframeSchema>;

export const AnimationSchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger: z.enum(['on-enter', 'on-exit', 'on-hover', 'on-click', 'on-scroll', 'timeline']).default('on-enter'),
  duration: z.number().min(0).max(10000).default(300), // ms
  delay: z.number().min(0).max(5000).default(0),
  keyframes: z.array(KeyframeSchema).min(2),
  loop: z.boolean().default(false),
  easing: z.string().default('ease-out'), // CSS easing function
  enabled: z.boolean().default(true),
  direction: z.enum(['normal', 'reverse', 'alternate', 'alternate-reverse']).default('normal'),
});

export type Animation = z.infer<typeof AnimationSchema>;
export type AnimationTrigger = Animation['trigger'];

// ============================================================================
// Component Library & Design System
// ============================================================================

export const ComponentInstanceSchema = z.object({
  isMaster: z.boolean().default(false),
  masterComponentId: z.string().optional(),
  overrides: z.record(z.unknown()).optional(),
  detached: z.boolean().default(false), // Detached from master
});

export type ComponentInstance = z.infer<typeof ComponentInstanceSchema>;

export const ColorStyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
});

export type ColorStyle = z.infer<typeof ColorStyleSchema>;

export const TextStyleSchema2 = z.object({
  id: z.string(),
  name: z.string(),
  fontFamily: z.string(),
  fontSize: z.number(),
  fontWeight: z.string(),
  lineHeight: z.number(),
  letterSpacing: z.number().optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
});

export type TextStyle2 = z.infer<typeof TextStyleSchema2>;

export const EffectStyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  effects: LayerEffectsSchema,
});

export type EffectStyle = z.infer<typeof EffectStyleSchema>;

export const DesignSystemSchema = z.object({
  colors: z.array(ColorStyleSchema).default([]),
  textStyles: z.array(TextStyleSchema2).default([]),
  effectStyles: z.array(EffectStyleSchema).default([]),
  spacing: z.record(z.number()).optional(),
});

export type DesignSystem = z.infer<typeof DesignSystemSchema>;

// ============================================================================
// Asset Management
// ============================================================================

export const AssetSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'icon', 'logo']),
  name: z.string(),
  url: z.string(),
  thumbnail: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  uploadedAt: z.string().datetime(),
  tags: z.array(z.string()).default([]),
});

export type Asset = z.infer<typeof AssetSchema>;

export const BrandKitSchema = z.object({
  logos: z.array(AssetSchema).default([]),
  colors: z.array(ColorStyleSchema).default([]),
  fonts: z.array(z.string()).default([]),
});

export type BrandKit = z.infer<typeof BrandKitSchema>;

// ============================================================================
// Comments & Collaboration
// ============================================================================

export const CommentSchema = z.object({
  id: z.string(),
  componentId: z.string(),
  userId: z.string(),
  userName: z.string(),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  createdAt: z.string().datetime(),
  resolved: z.boolean().default(false),
  replies: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    userName: z.string(),
    text: z.string(),
    createdAt: z.string().datetime(),
  })).default([]),
});

export type Comment = z.infer<typeof CommentSchema>;

// ============================================================================
// Export Settings
// ============================================================================

export const ExportSettingsSchema = z.object({
  format: z.enum(['png', 'svg', 'pdf', 'react', 'flutter', 'json']),
  scale: z.enum(['1x', '2x', '3x']).optional(),
  includeBackground: z.boolean().default(true),
  trimTransparent: z.boolean().default(false),
  flatten: z.boolean().default(false),
});

export type ExportSettings = z.infer<typeof ExportSettingsSchema>;

// ============================================================================
// Component Schema (Extended with all features)
// ============================================================================

export const ComponentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: ComponentType,
  position: PositionSchema,
  style: z.record(z.unknown()), // Allow flexibility but validate per type
  content: z.record(z.unknown()),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  
  // Auto-Layout (Flexbox)
  flexLayout: FlexLayoutSchema.optional(),
  flexChild: FlexChildSchema.optional(),
  
  // Layer Effects
  effects: LayerEffectsSchema.optional(),
  
  // Component States
  states: ComponentStateSchema.optional(),
  currentState: z.enum(['default', 'hover', 'active', 'disabled', 'focused']).default('default'),
  
  // Interactions
  interactions: InteractionsSchema.optional(),
  
  // Conditions
  conditions: z.array(ConditionSchema).optional(),
  
  // Responsive Design
  constraints: ConstraintsSchema.optional(),
  responsiveOverrides: z.array(ResponsiveOverrideSchema).optional(),
  
  // Animations
  animations: z.array(AnimationSchema).optional(),
  
  // Component Library
  componentInstance: ComponentInstanceSchema.optional(),
  
  // Parent-Child Relationship
  parentId: z.string().optional(),
  childIds: z.array(z.string()).optional(),
});

export type Component = z.infer<typeof ComponentSchema>;

// ============================================================================
// Bottom Sheet Config Schema
// ============================================================================

export const BottomSheetLayoutSchema = z.object({
  type: z.enum(['absolute', 'flex']),
  width: z.number().default(375),
  height: z.number().min(50).max(800),
  padding: z.number().min(0).max(48).optional(),
  scrollable: z.boolean().optional(),
});

export const BottomSheetConfigSchema = z.object({
  type: z.literal('bottom_sheet'),
  layout: BottomSheetLayoutSchema,
  canvasHeight: z.number().min(50).max(800),
  components: z.array(ComponentSchema),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1F2937'),
  // Additional bottom sheet customization
  sheetType: z.enum(['draggable', 'modal', 'persistent']).default('draggable'),
  initialHeight: z.enum(['peek', 'half', 'full']).default('half'),
  cornerRadius: z.number().min(0).max(50).default(20),
  handleBarVisible: z.boolean().default(true),
  handleBarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#CCCCCC'),
  backgroundDimOpacity: z.number().min(0).max(1).default(0.5),
  contentType: z.enum(['announcement', 'form', 'product', 'carousel', 'media']).default('announcement'),
  animationDuration: z.number().min(100).max(1000).default(350),
});

export type BottomSheetConfig = z.infer<typeof BottomSheetConfigSchema>;

// ============================================================================
// Template Schema
// ============================================================================

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  thumbnail: z.string().url(),
  tags: z.array(z.string()),
  config: BottomSheetConfigSchema,
  editableFields: z.array(z.object({
    componentId: z.string(),
    property: z.string(),
    label: z.string(),
    type: z.enum(['text', 'image', 'color', 'number']),
  })).optional(),
});

export type Template = z.infer<typeof TemplateSchema>;

// ============================================================================
// Height Adjustment Mode
// ============================================================================

export type HeightAdjustMode = 'resize' | 'scale' | 'scroll' | 'none';

export interface HeightAdjustmentDialog {
  isOpen: boolean;
  requiredHeight: number;
  currentHeight: number;
  mode: HeightAdjustMode;
  pendingTemplate: Template | null;
}

// ============================================================================
// Editor State (Extended with all features)
// ============================================================================

export interface BottomSheetEditorState {
  // Core State
  components: Component[];
  selectedId: string | null;
  canvasHeight: number;
  layoutType: 'absolute' | 'flex';
  showGrid: boolean;
  zoom: number;
  showJSON: boolean;
  loadedTemplate: Template | null;
  showQuickEdit: boolean;
  showTemplateGallery: boolean;
  heightDialog: HeightAdjustmentDialog;
  
  // Design System
  designSystem: DesignSystem;
  
  // Variables
  variables: Variable[];
  
  // Assets
  uploadedAssets: Asset[];
  brandKit: BrandKit;
  
  // Comments
  comments: Comment[];
  
  // Responsive Design
  currentBreakpoint: Breakpoint;
  
  // Animations
  animationPreview: boolean;
  
  // Component Library
  masterComponents: Component[];
  
  // Collaboration
  activeUsers: Array<{
    id: string;
    name: string;
    color: string;
    cursor: { x: number; y: number } | null;
  }>;
}

// ============================================================================
// Bounding Box
// ============================================================================

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// Drag Constraints
// ============================================================================

export interface DragBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// ============================================================================
// Component Palette Item
// ============================================================================

export interface PaletteItem {
  type: ComponentType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  description: string;
}

// ============================================================================
// Validation Result
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    field?: string;
  };
}
