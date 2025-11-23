import {
  Type, Image as ImageIcon, Video, Square, Mail, Container as ContainerIcon,
  Images, Star, Minus, Space, Activity, Circle as CircleIcon, ListOrdered, Link2, Clock
} from 'lucide-react';
import type { PaletteItem, ComponentType } from './types';

// ============================================================================
// Canvas Constraints
// ============================================================================

export const CANVAS_CONSTANTS = {
  WIDTH: 375, // iPhone SE width (standard mobile width)
  MIN_HEIGHT: 50,
  MAX_HEIGHT: 800,
  DEFAULT_HEIGHT: 80,
  HANDLE_BAR_HEIGHT: 32,
  GRID_SIZE: 0.5, // ✅ 0.5px grid for ULTRA PRECISION - pixel-perfect design!
  MIN_ZOOM: 50,
  MAX_ZOOM: 200,
  DEFAULT_ZOOM: 100,
} as const;

// ============================================================================
// Component Constraints
// ============================================================================

export const COMPONENT_CONSTRAINTS = {
  MIN_WIDTH: 4, // ✅ FIX: 4px minimum (was 20px) - allows tiny elements like dots, lines
  MAX_WIDTH: 800,
  MIN_HEIGHT: 4, // ✅ FIX: 4px minimum (was 20px) - enables 1px divider lines!
  MAX_HEIGHT: 800,
  MIN_Z_INDEX: 1,
  MAX_Z_INDEX: 100,
  MIN_ROTATION: -180,
  MAX_ROTATION: 180,
  
  // ✅ NEW: Component-specific minimum sizes (for better UX)
  MIN_SIZES: {
    text: { width: 8, height: 8 },      // Text needs readability
    image: { width: 10, height: 10 },   // Images need visibility
    button: { width: 40, height: 24 },  // Touch target 44x44 recommended (Apple HIG)
    shape: { width: 1, height: 1 },     // Shapes can be 1px lines!
    video: { width: 100, height: 100 }, // Videos need minimum size
    input: { width: 80, height: 32 },   // Inputs need touch target
    container: { width: 40, height: 40 },
    carousel: { width: 100, height: 100 },
    rating: { width: 80, height: 20 },
    countdown: { width: 80, height: 40 },
    lottie: { width: 50, height: 50 },
  },
} as const;

// ============================================================================
// Template Padding
// ============================================================================

export const TEMPLATE_PADDING = {
  TOP: 40,
  BOTTOM: 40,
  TOTAL: 80, // TOP + BOTTOM
} as const;

// ============================================================================
// Component Palette Configuration
// ============================================================================

export const COMPONENT_PALETTE: PaletteItem[] = [
  {
    type: 'text' as ComponentType,
    icon: Type,
    label: 'Text',
    color: '#3B82F6',
    description: 'Add text content',
  },
  {
    type: 'image' as ComponentType,
    icon: ImageIcon,
    label: 'Image',
    color: '#10B981',
    description: 'Add an image',
  },
  {
    type: 'video' as ComponentType,
    icon: Video,
    label: 'Video',
    color: '#EF4444',
    description: 'Add video player',
  },
  {
    type: 'button' as ComponentType,
    icon: Square,
    label: 'Button',
    color: '#8B5CF6',
    description: 'Add action button',
  },
  {
    type: 'input' as ComponentType,
    icon: Mail,
    label: 'Input',
    color: '#F59E0B',
    description: 'Add input field',
  },
  {
    type: 'shape' as ComponentType,
    icon: Square,
    label: 'Shape',
    color: '#EC4899',
    description: 'Add shapes',
  },
  {
    type: 'container' as ComponentType,
    icon: ContainerIcon,
    label: 'Container',
    color: '#14B8A6',
    description: 'Add container',
  },
  {
    type: 'carousel' as ComponentType,
    icon: Images,
    label: 'Carousel',
    color: '#06B6D4',
    description: 'Add image slider',
  },
  {
    type: 'rating' as ComponentType,
    icon: Star,
    label: 'Rating',
    color: '#FBBF24',
    description: 'Add star rating',
  },
  {
    type: 'divider' as ComponentType,
    icon: Minus,
    label: 'Divider',
    color: '#6B7280',
    description: 'Add separator line',
  },
  {
    type: 'spacer' as ComponentType,
    icon: Space,
    label: 'Spacer',
    color: '#9CA3AF',
    description: 'Add spacing',
  },
  {
    type: 'badge' as ComponentType,
    icon: Star,
    label: 'Badge',
    color: '#EF4444',
    description: 'Add label badge',
  },
  {
    type: 'richtext' as ComponentType,
    icon: Type,
    label: 'Rich Text',
    color: '#8B5CF6',
    description: 'Add HTML text',
  },
  {
    type: 'buttongroup' as ComponentType,
    icon: Square,
    label: 'Button Group',
    color: '#6366F1',
    description: 'Add button group',
  },
  {
    type: 'progressbar' as ComponentType,
    icon: Activity,
    label: 'Progress Bar',
    color: '#10B981',
    description: 'Linear progress with milestones',
  },
  {
    type: 'progresscircle' as ComponentType,
    icon: CircleIcon,
    label: 'Progress Circle',
    color: '#06B6D4',
    description: 'Circular progress ring',
  },
  {
    type: 'stepper' as ComponentType,
    icon: ListOrdered,
    label: 'Stepper',
    color: '#8B5CF6',
    description: 'Step-by-step indicator',
  },
  {
    type: 'list' as ComponentType,
    icon: ListOrdered,
    label: 'List',
    color: '#3B82F6',
    description: 'Bullet/numbered lists',
  },
  {
    type: 'countdown' as ComponentType,
    icon: Clock,
    label: 'Countdown',
    color: '#EF4444',
    description: 'Countdown timer',
  },
  {
    type: 'link' as ComponentType,
    icon: Link2,
    label: 'Link',
    color: '#0EA5E9',
    description: 'Hyperlink with icon',
  },
];

// ============================================================================
// Default Styles by Component Type
// ============================================================================

export const DEFAULT_STYLES: Record<string, Record<string, any>> = {
  text: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
    fontStyle: 'normal',
    textDecoration: 'none',
    fontFamily: 'Inter',
    lineHeight: 1.5,
    textAlign: 'left',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    objectFit: 'cover',
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6366F1',
    textColor: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    textAlign: 'center',
    marginBottom: 12,
    borderWidth: 0,
    borderColor: '#000000',
  },
  input: {
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  shape: {
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
    borderWidth: 2,
    borderRadius: 0,
    marginBottom: 12,
  },
  container: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  carousel: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  rating: {
    starColor: '#FBBF24',
    emptyStarColor: '#D1D5DB',
    size: 28,
    spacing: 4,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    color: '#E5E7EB',
    marginTop: 12,
    marginBottom: 12,
  },
  spacer: {
    height: 24,
  },
  badge: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  richtext: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  buttongroup: {
    gap: 12,
    marginBottom: 16,
  },
  progressbar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    color: '#10B981',
    marginBottom: 16,
  },
  progresscircle: {
    size: 120,
    strokeWidth: 8,
    color: '#3B82F6',
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  stepper: {
    orientation: 'horizontal',
    circleSize: 40,
    lineWidth: 2,
    completedColor: '#10B981',
    currentColor: '#3B82F6',
    futureColor: '#D1D5DB',
    marginBottom: 16,
  },
  list: {
    itemSpacing: 8,
    iconColor: '#3B82F6',
    fontSize: 14,
    lineHeight: 1.5,
    marginBottom: 16,
  },
  countdown: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  link: {
    fontSize: 14,
    color: '#3B82F6',
    hoverColor: '#1E40AF',
    underline: true,
    marginBottom: 8,
  },
};

// ============================================================================
// Default Content by Component Type
// ============================================================================

export const DEFAULT_CONTENT: Record<string, Record<string, any>> = {
  text: {
    text: 'Click to edit text',
  },
  image: {
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
    alt: 'Placeholder Image',
  },
  video: {
    url: '',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
  },
  button: {
    text: 'Click Me',
    action: 'primary_action',
  },
  input: {
    name: 'input_field',
    label: 'Input Label',
    placeholder: 'Enter your text here...',
  },
  shape: {
    shapeType: 'rectangle',
  },
  container: {
    direction: 'column',
    alignment: 'start',
    spacing: 8,
    children: [],
  },
  carousel: {
    items: [
      { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400' },
      { url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400' },
    ],
    autoplay: false,
    interval: 3000,
  },
  rating: {
    stars: 5,
    value: 0,
    allowHalf: false,
  },
  divider: {},
  spacer: {},
  badge: {
    text: 'LIVE NOW',
    variant: 'danger',
    size: 'sm',
    shape: 'rounded',
  },
  richtext: {
    html: 'Up to <b>30% OFF*</b> on <span style="color: #3B82F6;">International Hotels</span>',
  },
  buttongroup: {
    buttons: [
      { label: 'DISMISS', variant: 'outline' },
      { label: 'BOOK NOW', variant: 'default' },
    ],
    layout: 'horizontal',
    sticky: 'bottom',
  },
  progressbar: {
    value: 150,
    max: 300,
    showPercentage: true,
    milestones: [
      { value: 100, label: '₹50 off', color: '#10B981' },
      { value: 200, label: '₹100 off', color: '#3B82F6' },
      { value: 300, label: '₹200 off', color: '#8B5CF6' },
    ],
  },
  progresscircle: {
    value: 65,
    max: 100,
    showPercentage: true,
    label: 'Daily Goal',
  },
  stepper: {
    currentStep: 2,
    steps: [
      { label: 'Sign Up', description: 'Create your account', completed: true },
      { label: 'Verify', description: 'Verify your email', completed: false },
      { label: 'Complete', description: 'Setup complete', completed: false },
    ],
    orientation: 'horizontal',
  },
  list: {
    items: [
      { text: 'Free cancellation up to 24 hours before check-in', icon: 'Check' },
      { text: 'Best price guarantee - We will match any lower price', icon: 'Check' },
      { text: 'Instant confirmation on your booking', icon: 'Check' },
    ],
    type: 'checkmark',
    style: 'default',
  },
  countdown: {
    targetDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    format: 'short',
    urgentThreshold: 60,
    showIcon: true,
  },
  link: {
    text: 'Learn more',
    href: '#',
    variant: 'primary',
    size: 'md',
    showIcon: true,
    iconType: 'arrow',
    iconPosition: 'right',
  },
};

// ============================================================================
// Font Families
// ============================================================================

export const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Georgia',
  'Arial',
] as const;

// ============================================================================
// Font Weights
// ============================================================================

export const FONT_WEIGHTS = [
  { value: '100', label: 'Thin (100)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '600', label: 'Semibold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '900', label: 'Black (900)' },
] as const;

// ============================================================================
// Image Filters
// ============================================================================

export const IMAGE_FILTERS = [
  { value: 'none', label: 'None' },
  { value: 'grayscale(100%)', label: 'Grayscale' },
  { value: 'sepia(100%)', label: 'Sepia' },
  { value: 'brightness(150%)', label: 'Bright' },
  { value: 'brightness(50%)', label: 'Dark' },
  { value: 'blur(3px)', label: 'Blur' },
  { value: 'contrast(200%)', label: 'High Contrast' },
  { value: 'saturate(200%)', label: 'Saturated' },
] as const;

// ============================================================================
// Shape Types
// ============================================================================

export const SHAPE_TYPES = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'triangle', label: 'Triangle' },
] as const;

// ============================================================================
// Object Fit Options
// ============================================================================

export const OBJECT_FIT_OPTIONS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
] as const;

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  DELETE: ['Delete', 'Backspace'],
  DUPLICATE: 'd',
  COPY: 'c',
  PASTE: 'v',
  UNDO: 'z',
  REDO: 'y',
  SAVE: 's',
  TOGGLE_GRID: 'g',
  ARROW_STEP: 1,
  ARROW_STEP_SHIFT: 10,
} as const;

// ============================================================================
// Animation Durations (ms)
// ============================================================================

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  TEMPLATE_LOAD: 350,
} as const;

// ============================================================================
// Z-Index Layers
// ============================================================================

export const Z_INDEX = {
  CANVAS_BACKGROUND: 0,
  COMPONENT_BASE: 1,
  COMPONENT_SELECTED: 10,
  FLOATING_TOOLBAR: 50,
  DIALOG_OVERLAY: 100,
  DIALOG_CONTENT: 101,
  TOOLTIP: 200,
} as const;

// ============================================================================
// Color Presets
// ============================================================================

export const COLOR_PRESETS = {
  PRIMARY: '#6366F1',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  NEUTRAL: '#6B7280',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_900: '#1F2937',
} as const;
