import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateCampaignConfig, validateLayer } from '@/lib/configValidator';

// Layer Types - Extended for Phase 2 & 3.5
export type LayerType =
  | 'media' | 'text' | 'button' | 'container' | 'icon' | 'handle' | 'overlay' | 'arrow' | 'video' | 'controls'
  | 'progress-bar' | 'progress-circle' | 'countdown' | 'list' | 'input' | 'statistic'
  | 'rating' | 'badge' | 'gradient-overlay' | 'checkbox';

export interface LayerContent {
  // Media content
  imageUrl?: string;
  imageSize?: { width: number; height: number };
  videoUrl?: string;
  iconName?: string;

  // Text content
  text?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Button content
  label?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline' | 'ghost';
  action?: {
    type: 'close' | 'deeplink' | 'navigate' | 'custom';
    url?: string;
    trackConversion?: boolean;
    autoDismiss?: boolean;
  };

  // Progress content (Phase 2)
  value?: number;
  max?: number;
  showPercentage?: boolean;
  milestones?: { value: number; label: string; color: string }[];

  // Countdown content (Phase 2)
  endTime?: string;
  format?: 'HH:MM:SS' | 'MM:SS' | 'auto';
  urgencyThreshold?: number;
  autoHide?: boolean;

  // List content (Phase 2)
  items?: string[];
  listStyle?: 'bullet' | 'numbered' | 'checkmark' | 'icon';

  // Input content (Phase 2)
  inputType?: 'text' | 'email' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validation?: string;

  // Statistic content (Phase 2)
  prefix?: string;
  suffix?: string;
  animateOnLoad?: boolean;

  // Rating content (Phase 3.5)
  maxStars?: number; // Total stars (default: 5)
  rating?: number; // Current rating value (0-5, supports decimals like 4.5)
  reviewCount?: number; // Number of reviews
  showReviewCount?: boolean;
  interactive?: boolean; // Allow user to rate
  filledIcon?: string; // Custom filled star icon
  emptyIcon?: string; // Custom empty star icon

  // Badge content (Phase 3.5)
  badgeText?: string;
  badgeVariant?: 'success' | 'error' | 'warning' | 'info' | 'custom';
  badgeIcon?: string; // Lucide icon name
  badgeIconPosition?: 'left' | 'right';
  pulse?: boolean; // Pulse animation

  // Gradient Overlay content (Phase 3.5)
  gradientType?: 'linear' | 'radial';
  gradientDirection?: 'to-top' | 'to-bottom' | 'to-left' | 'to-right' | number;
  gradientStops?: Array<{ color: string; position: number }>;

  // Checkbox content
  checkboxLabel?: string;
  checked?: boolean;
  checkboxColor?: string;

  // Container-specific (Phase 1)
  containerPosition?: string;
  maxWidth?: number;
}

export interface LayerStyle {
  backgroundColor?: string;
  borderRadius?: number | string | { topLeft: number | string; topRight: number | string; bottomRight: number | string; bottomLeft: number | string };
  borderColor?: string;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  padding?: { top: number; right: number; bottom: number; left: number } | number;
  margin?: { top: number; right: number; bottom: number; left: number } | number;
  opacity?: number;
  boxShadow?: string; // Support for multiple shadows comma-separated

  // Layout & Display
  display?: 'flex' | 'block' | 'inline-block' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  cursor?: 'default' | 'pointer' | 'not-allowed' | 'grab' | 'text' | 'move' | 'help' | 'wait';

  // Positioning (Phase 1)
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;
  transformOrigin?: string;

  // Dimensions
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;

  // Typography Enhancements
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number | string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textDecorationColor?: string;
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
  textShadow?: string;
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap';
  color?: string; // Text color

  // Advanced Background (Phase 2)
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  backgroundAttachment?: 'scroll' | 'fixed' | 'local';
  backgroundBlendMode?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    colors: Array<{ color: string; position: number }>;
  };

  // Shapes & Geometry (Phase 1)
  clipPath?: string; // polygon, circle, ellipse, path
  maskImage?: string;

  // Badge Specific (Phase 3.5)
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  badgeBorderRadius?: number;

  // Rating Specific (Phase 3.5)
  starColor?: string;
  starSize?: number;

  // Image Specific
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;

  // Filters & Effects (Phase 2)
  filter?: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    grayscale?: number;
  };
  backdropFilter?: string; // blur for glassmorphism
  mixBlendMode?: string;

  // Transform (Phase 1)
  transform?: {
    rotate?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
    translateX?: number;
    translateY?: number;
  };
  perspective?: number | string;

  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Transitions & Animations (Phase 2)
  transition?: string;
  animation?: string;

  // Custom CSS (God Mode)
  customCss?: string;
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  parent: string | null;
  children: string[];

  // Visibility & Interaction
  visible: boolean;
  locked: boolean;
  zIndex: number;

  // Position & Size (Phase 3.5 - Enhanced for absolute positioning)
  position: {
    x: number;
    y: number;
    type?: 'absolute' | 'relative'; // Default: relative
  };
  size: {
    width: number | 'auto' | string; // Support '50%', '100px', etc
    height: number | 'auto' | string;
  };

  // Content & Style
  content: LayerContent;
  style: LayerStyle;
}

export interface TargetingRule {
  id: string;
  type: 'user_property' | 'event' | 'segment';

  // User property
  property?: string;
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value?: string | number;

  // Event
  event?: string;
  eventProperty?: string;
  count?: number;
  timeWindow?: { value: number; unit: 'hours' | 'days' | 'weeks' };

  // Nested logic
  combineWith?: 'AND' | 'OR';
  children?: TargetingRule[];
}

export interface DisplayRules {
  frequency: {
    type: 'once' | 'custom' | 'always';
    maxShows?: number;
    timeWindow?: { value: number; unit: 'hours' | 'days' };
  };

  interactionLimit: {
    type: 'unlimited' | 'limited';
    maxInteractions?: number;
  };

  sessionLimit: {
    enabled: boolean;
    maxPerSession?: number;
  };

  priority: number;

  platforms: ('web' | 'ios' | 'android')[];
}

// Bottom Sheet Configuration (Phase 1 & 3)
export interface BottomSheetConfig {
  mode?: 'container' | 'image-only'; // ✅ NEW: Image-only mode
  height: 'auto' | 'half' | 'full' | number | string; // Fix 8: Support vh/% units
  maxHeight?: number;
  minHeight?: number;
  dragHandle: boolean;
  swipeToDismiss: boolean;
  swipeThreshold?: number;
  dismissVelocity?: number;
  backgroundColor: string;
  backgroundImageUrl?: string; // ✅ NEW: For image-only mode
  backgroundSize?: 'cover' | 'contain' | 'fill'; // ✅ NEW
  backgroundPosition?: string; // ✅ NEW
  borderRadius: { topLeft: number; topRight: number; bottomRight?: number; bottomLeft?: number }; // Fix 9
  elevation: 0 | 1 | 2 | 3 | 4 | 5;
  customShadow?: string;
  overlay: {
    enabled: boolean;
    opacity: number;
    blur: number;
    color: string;
    dismissOnClick: boolean;
  };
  animation: {
    type: 'slide' | 'fade' | 'bounce';
    duration: number;
    easing: string;
  };
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'pattern';
    value: string;
    opacity?: number;
  };
  safeArea?: {
    top: boolean;
    bottom: boolean;
  };
}

// Template System (Phase 1)
export interface BottomSheetTemplate {
  id: string;
  name: string;
  category: 'ecommerce' | 'engagement' | 'onboarding' | 'notification' | 'survey' | 'promotion' | 'delivery' | 'transport'; // Fix 9
  thumbnail: string;
  description: string;
  layers: Layer[];
  config: BottomSheetConfig;
  tags?: string[];
  featured?: boolean;
}

export interface CampaignEditor {
  id: string;
  name: string;
  experienceType: 'nudges' | 'messages' | 'stories' | 'challenges' | 'streaks' | 'survey';
  nudgeType: 'modal' | 'banner' | 'bottomsheet' | 'tooltip' | 'pip' | 'scratchcard' | 'carousel' | 'inline';

  // Trigger configuration (industry-standard events)
  trigger?: string; // e.g., 'screen_viewed', 'button_clicked', 'product_viewed'
  screen?: string; // e.g., 'home', 'product_detail', 'checkout'
  status?: 'active' | 'paused' | 'draft';

  layers: Layer[];
  targeting: TargetingRule[];
  displayRules: DisplayRules;

  // Bottom sheet specific config (Phase 3)
  bottomSheetConfig?: BottomSheetConfig;
  modalConfig?: any;
  bannerConfig?: any;
  tooltipConfig?: any;

  // Editor state
  selectedLayerId: string | null;

  // History for undo/redo
  history: Layer[][];
  historyIndex: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSaved?: string;
  isDirty: boolean;
}

interface EditorStore {
  // Current campaign being edited
  currentCampaign: CampaignEditor | null;

  // UI State
  activeTab: 'design' | 'targeting';
  propertyTab: 'style' | 'actions';
  showEditor: boolean;
  isSaving: boolean;
  saveError: string | null;

  // Actions - Campaign
  createCampaign: (experienceType: CampaignEditor['experienceType'], nudgeType: CampaignEditor['nudgeType']) => void;
  loadCampaign: (campaign: CampaignEditor | string) => Promise<void>;
  loadTemplate: (layers: Layer[]) => void;
  updateCampaignName: (name: string) => void;
  updateTrigger: (trigger: string) => void;
  updateScreen: (screen: string) => void;
  updateStatus: (status: 'active' | 'paused' | 'draft') => void;
  saveCampaign: () => Promise<void>;

  // Actions - Layers
  addLayer: (type: LayerType, parent?: string) => string;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => string;
  reorderLayer: (id: string, newIndex: number) => void;
  moveLayerToParent: (layerId: string, newParentId: string | null) => void;
  selectLayer: (id: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;

  // Actions - Content
  updateLayerContent: (id: string, content: Partial<LayerContent>) => void;
  updateLayerStyle: (id: string, style: Partial<LayerStyle>) => void;

  // Actions - Bottom Sheet Config (Phase 3)
  updateBottomSheetConfig: (config: Partial<BottomSheetConfig>) => void;
  updateModalConfig: (config: any) => void;
  updateBannerConfig: (config: any) => void;
  updateTooltipConfig: (config: any) => void;

  // Actions - Targeting
  addTargetingRule: (rule: Omit<TargetingRule, 'id'>) => void;
  updateTargetingRule: (id: string, rule: Partial<TargetingRule>) => void;
  deleteTargetingRule: (id: string) => void;

  // Actions - Display Rules
  updateDisplayRules: (rules: Partial<DisplayRules>) => void;

  // Actions - History (Undo/Redo)
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions - UI
  setActiveTab: (tab: 'design' | 'targeting') => void;
  setPropertyTab: (tab: 'style' | 'actions') => void;
  setShowEditor: (show: boolean) => void;

  // Auto-save
  enableAutoSave: () => void;
  disableAutoSave: () => void;
}

// Debounced history tracker to prevent race conditions
let historyTimeout: NodeJS.Timeout | null = null;
const HISTORY_DEBOUNCE_MS = 300;

// Debounced auto-save to prevent rate limiting
let autoSaveTimeout: NodeJS.Timeout | null = null;
const AUTO_SAVE_DEBOUNCE_MS = 3000; // 3 seconds debounce

// FIX #3: Mutex lock to prevent concurrent saves
let saveMutex = false;

const saveToHistoryDebounced = (get: () => EditorStore, set: (state: Partial<EditorStore>) => void) => {
  if (historyTimeout) {
    clearTimeout(historyTimeout);
  }

  historyTimeout = setTimeout(() => {
    const { currentCampaign } = get();
    if (!currentCampaign) return;

    const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
    newHistory.push(currentCampaign.layers);

    set({
      currentCampaign: {
        ...currentCampaign,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      },
    });
    historyTimeout = null;
  }, HISTORY_DEBOUNCE_MS);
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentCampaign: null,
      activeTab: 'design',
      propertyTab: 'style',
      showEditor: false,
      isSaving: false,
      saveError: null,

      // Create new campaign
      createCampaign: (experienceType, nudgeType) => {
        const defaultLayers = getDefaultLayersForNudgeType(nudgeType);

        // FIX #4: Generate unique ID using UUID pattern
        const uniqueId = `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        const newCampaign: CampaignEditor = {
          id: uniqueId,
          name: 'New Campaign',
          experienceType,
          nudgeType,
          trigger: 'screen_viewed', // Default trigger
          screen: '', // Will be set by user
          status: 'draft',
          layers: defaultLayers,
          targeting: [],
          displayRules: {
            frequency: { type: 'once' },
            interactionLimit: { type: 'unlimited' },
            sessionLimit: { enabled: false },
            priority: 50,
            platforms: ['ios', 'android'],
          },
          // Initialize bottom sheet config for bottom sheet nudge type (Phase 3)
          bottomSheetConfig: nudgeType === 'bottomsheet' ? {
            mode: 'container', // Default to container mode
            height: 'auto',
            dragHandle: true,
            swipeToDismiss: true,
            backgroundColor: '#FFFFFF',
            backgroundImageUrl: '', // For image-only mode
            backgroundSize: 'cover', // For image-only mode
            backgroundPosition: 'center center', // For image-only mode
            borderRadius: { topLeft: 16, topRight: 16 },
            elevation: 2,
            overlay: {
              enabled: true,
              opacity: 0.5,
              blur: 0,
              color: '#000000',
              dismissOnClick: true,
            },
            animation: {
              type: 'slide',
              duration: 300,
              easing: 'ease-out',
            },
          } : undefined,
          selectedLayerId: defaultLayers[0]?.id || null,
          history: [defaultLayers],
          historyIndex: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDirty: false,
        };

        set({ currentCampaign: newCampaign, showEditor: true });
      },

      // Load existing campaign
      loadCampaign: async (campaign: CampaignEditor | string) => {
        try {
          let campaignData: CampaignEditor;

          // If string is passed, ALWAYS fetch from backend (don't use localStorage cache)
          if (typeof campaign === 'string') {
            console.log('loadCampaign: Fetching campaign from server:', campaign);
            const api = await import('@/lib/api');
            campaignData = await api.loadCampaign(campaign);
            console.log('loadCampaign: Campaign fetched from server:', campaignData.id, campaignData.name);
          } else {
            // Validate and sanitize campaign config
            const validationResult = validateCampaignConfig(campaign);

            if (!validationResult.isValid) {
              console.error('Campaign validation errors:', validationResult.errors);
              // Don't load invalid campaigns
              return;
            }

            if (validationResult.warnings.length > 0) {
              console.warn('Campaign validation warnings:', validationResult.warnings);
            }

            campaignData = validationResult.sanitized;
          }

          // FIX #1: Ensure loaded campaign has valid lastSaved to prevent duplicate creation
          if (!campaignData.lastSaved && campaignData.id) {
            campaignData.lastSaved = campaignData.updatedAt || new Date().toISOString();
          }

          // FIX #15: Reset selectedLayerId when loading new campaign
          const loadedCampaign = {
            ...campaignData,
            selectedLayerId: campaignData.layers[0]?.id || null, // Select first layer by default
            isDirty: false, // Mark as clean since we just loaded from server
          };

          console.log('loadCampaign: Setting campaign in store:', loadedCampaign.id);
          set({
            currentCampaign: loadedCampaign,
            showEditor: true
          });
        } catch (error) {
          console.error('Load campaign error:', error);
          // FIX #6: Reset to safe state on load failure
          set({ currentCampaign: null, showEditor: false });
          if (typeof window !== 'undefined' && (window as any).toast) {
            (window as any).toast.error('Failed to load campaign');
          }
          throw error;
        }
      },

      // Load template layers into current campaign
      loadTemplate: (layers) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        // Validate each layer
        const validatedLayers = layers.map(layer => {
          const result = validateLayer(layer);
          if (!result.isValid) {
            console.error(`Layer ${layer.id} validation errors:`, result.errors);
          }
          if (result.warnings.length > 0) {
            console.warn(`Layer ${layer.id} warnings:`, result.warnings);
          }
          return result.sanitized;
        });

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(validatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: validatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedLayerId: layers[0]?.id || null,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update campaign name
      updateCampaignName: (name) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            name,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

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

      // Update screen
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

      // Update status
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

      updateModalConfig: (config) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;
        set({
          currentCampaign: {
            ...currentCampaign,
            modalConfig: { ...currentCampaign.modalConfig, ...config },
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      updateBannerConfig: (config) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;
        set({
          currentCampaign: {
            ...currentCampaign,
            bannerConfig: { ...currentCampaign.bannerConfig, ...config },
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      updateTooltipConfig: (config) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;
        set({
          currentCampaign: {
            ...currentCampaign,
            tooltipConfig: { ...currentCampaign.tooltipConfig, ...config },
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Save campaign
      saveCampaign: async () => {
        const { currentCampaign } = get();
        if (!currentCampaign) {
          console.warn('saveCampaign: No current campaign');
          return;
        }

        // FIX #3: Prevent concurrent saves with mutex lock
        if (saveMutex) {
          console.warn('saveCampaign: Save already in progress, skipping');
          return;
        }

        // FIX #5: Validate campaign before save
        if (!currentCampaign.name || currentCampaign.name.trim() === '') {
          throw new Error('Campaign name is required');
        }

        if (!currentCampaign.layers || currentCampaign.layers.length === 0) {
          throw new Error('Campaign must have at least one layer');
        }

        console.log('saveCampaign: Starting save for campaign:', currentCampaign.id);
        saveMutex = true;
        set({ isSaving: true, saveError: null });

        try {
          // Import API dynamically to avoid circular dependencies
          const api = await import('@/lib/api');
          console.log('saveCampaign: Calling API...');
          const savedCampaign = await api.saveCampaign(currentCampaign);
          console.log('saveCampaign: Success, received:', savedCampaign);

          const updatedCampaign = {
            ...currentCampaign,
            id: savedCampaign.id || currentCampaign.id,
            lastSaved: new Date().toISOString(),
            isDirty: false,
          };

          set({
            currentCampaign: updatedCampaign,
            isSaving: false,
            saveError: null,
          });

          // Sync with dashboard store (useStore)
          try {
            const { useStore } = await import('./useStore');
            const dashboardStore = useStore.getState();

            // Convert to dashboard Campaign format
            const dashboardCampaign = {
              id: savedCampaign.id || updatedCampaign.id,
              name: savedCampaign.name,
              status: savedCampaign.status as 'active' | 'paused' | 'draft',
              trigger: savedCampaign.trigger,
              segment: 'All Users',
              impressions: 0,
              clicks: 0,
              conversions: 0,
              conversion: '0.0',
              config: {
                type: savedCampaign.type,
                text: savedCampaign.config.text || '',
                backgroundColor: savedCampaign.config.backgroundColor || '#FFFFFF',
                textColor: savedCampaign.config.textColor || '#000000',
                buttonText: savedCampaign.config.buttonText,
                position: savedCampaign.config.position,
                ...savedCampaign.config,
              },
              rules: savedCampaign.rules.map(r => ({
                id: r.id,
                type: r.type as 'event' | 'attribute',
                field: r.field,
                operator: r.operator,
                value: String(r.value),
              })),
              createdAt: savedCampaign.createdAt || new Date().toISOString(),
              updatedAt: savedCampaign.updatedAt || new Date().toISOString(),
            };

            // Check if campaign exists in dashboard store
            const existingCampaign = dashboardStore.campaigns.find(c => c.id === dashboardCampaign.id);

            if (existingCampaign) {
              // Update existing campaign
              dashboardStore.updateCampaign(dashboardCampaign.id, dashboardCampaign);
              console.log('saveCampaign: Updated existing campaign in dashboard store');
            } else {
              // Add new campaign
              dashboardStore.addCampaign(dashboardCampaign);
              console.log('saveCampaign: Added new campaign to dashboard store');
            }
          } catch (syncError) {
            console.warn('saveCampaign: Failed to sync with dashboard store:', syncError);
          }

          console.log('saveCampaign: Updated store state');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save campaign';
          console.error('saveCampaign: Error occurred:', error);

          set({
            isSaving: false,
            saveError: errorMessage,
          });

          throw error;
        } finally {
          // FIX #3: Always release mutex lock
          saveMutex = false;
        }
      },

      // Add layer
      addLayer: (type, parentId) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return '';

        // FIX #7: Generate unique layer ID to prevent duplicates
        const uniqueLayerId = `layer_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        const newLayer: Layer = {
          id: uniqueLayerId,
          type,
          name: `New ${type}`,
          parent: parentId || null,
          children: [],
          visible: true,
          locked: false,
          zIndex: currentCampaign.layers.length,
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
          content: getDefaultContentForType(type),
          style: getDefaultStyleForType(type),
        };

        const updatedLayers = [...currentCampaign.layers, newLayer];

        // Update parent's children array
        if (parentId) {
          const parentIndex = updatedLayers.findIndex(l => l.id === parentId);
          if (parentIndex !== -1) {
            updatedLayers[parentIndex] = {
              ...updatedLayers[parentIndex],
              children: [...updatedLayers[parentIndex].children, newLayer.id],
            };
          }
        }

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(updatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedLayerId: newLayer.id,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });

        return newLayer.id;
      },

      // Update layer
      updateLayer: (id, updates) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id ? { ...layer, ...updates } : layer
        );

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(updatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Delete layer
      deleteLayer: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const layer = currentCampaign.layers.find(l => l.id === id);
        if (!layer) return;

        // Remove from parent's children
        let updatedLayers = currentCampaign.layers.map(l => {
          if (l.id === layer.parent) {
            return {
              ...l,
              children: l.children.filter(childId => childId !== id),
            };
          }
          return l;
        });

        // Delete the layer and all its children recursively
        const deleteRecursive = (layerId: string) => {
          const toDelete = updatedLayers.find(l => l.id === layerId);
          if (toDelete) {
            toDelete.children.forEach(childId => deleteRecursive(childId));
            updatedLayers = updatedLayers.filter(l => l.id !== layerId);
          }
        };

        deleteRecursive(id);

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(updatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedLayerId: currentCampaign.selectedLayerId === id ? null : currentCampaign.selectedLayerId,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Duplicate layer
      duplicateLayer: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return '';

        const layer = currentCampaign.layers.find(l => l.id === id);
        if (!layer) return '';

        const newLayer: Layer = {
          ...layer,
          id: `layer_${Date.now()}`,
          name: `${layer.name} Copy`,
          children: [], // Don't duplicate children for simplicity
        };

        const updatedLayers = [...currentCampaign.layers, newLayer];

        // Update parent's children
        if (layer.parent) {
          const parentIndex = updatedLayers.findIndex(l => l.id === layer.parent);
          if (parentIndex !== -1) {
            updatedLayers[parentIndex] = {
              ...updatedLayers[parentIndex],
              children: [...updatedLayers[parentIndex].children, newLayer.id],
            };
          }
        }

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(updatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedLayerId: newLayer.id,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });

        return newLayer.id;
      },

      // Select layer
      selectLayer: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            selectedLayerId: id,
          },
        });
      },

      // Toggle visibility
      toggleLayerVisibility: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id ? { ...layer, visible: !layer.visible } : layer
        );

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Toggle lock
      toggleLayerLock: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id ? { ...layer, locked: !layer.locked } : layer
        );

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Reorder layer
      reorderLayer: (id, newIndex) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const oldIndex = currentCampaign.layers.findIndex(l => l.id === id);
        if (oldIndex === -1) return;

        const updatedLayers = [...currentCampaign.layers];
        const [removed] = updatedLayers.splice(oldIndex, 1);
        updatedLayers.splice(newIndex, 0, removed);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Move layer to new parent
      moveLayerToParent: (layerId, newParentId) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const layer = currentCampaign.layers.find(l => l.id === layerId);
        if (!layer) return;

        const oldParentId = layer.parent;

        // Update layers
        const updatedLayers = currentCampaign.layers.map(l => {
          // Remove from old parent's children
          if (l.id === oldParentId && l.children) {
            return {
              ...l,
              children: l.children.filter(childId => childId !== layerId)
            };
          }

          // Add to new parent's children
          if (l.id === newParentId) {
            return {
              ...l,
              children: [...(l.children || []), layerId]
            };
          }

          // Update the moved layer's parent
          if (l.id === layerId) {
            return {
              ...l,
              parent: newParentId
            };
          }

          return l;
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update layer content
      updateLayerContent: (id, content) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id
            ? { ...layer, content: { ...layer.content, ...content } }
            : layer
        );

        // Update immediately, debounce history save
        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });

        // Debounced history save to prevent race conditions
        saveToHistoryDebounced(get, set);
      },

      // Update layer style
      updateLayerStyle: (id, style) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id
            ? { ...layer, style: { ...layer.style, ...style } }
            : layer
        );

        // Update immediately, debounce history save
        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });

        // Debounced history save to prevent race conditions
        saveToHistoryDebounced(get, set);
      },

      // Update bottom sheet config (Phase 3)
      updateBottomSheetConfig: (config) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const currentConfig = currentCampaign.bottomSheetConfig || {
          height: 'auto',
          dragHandle: true,
          swipeToDismiss: true,
          backgroundColor: '#FFFFFF',
          borderRadius: { topLeft: 16, topRight: 16 },
          elevation: 2,
          overlay: {
            enabled: true,
            opacity: 0.5,
            blur: 0,
            color: '#000000',
            dismissOnClick: true,
          },
          animation: {
            type: 'slide',
            duration: 300,
            easing: 'ease-out',
          },
        };

        // Deep merge for nested objects
        const updatedConfig = { ...currentConfig };
        Object.keys(config).forEach(key => {
          if (config[key] && typeof config[key] === 'object' && !Array.isArray(config[key])) {
            updatedConfig[key] = { ...currentConfig[key], ...config[key] };
          } else {
            updatedConfig[key] = config[key];
          }
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            bottomSheetConfig: updatedConfig,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Add targeting rule
      addTargetingRule: (rule) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const newRule: TargetingRule = {
          ...rule,
          id: `rule_${Date.now()}`,
        };

        set({
          currentCampaign: {
            ...currentCampaign,
            targeting: [...currentCampaign.targeting, newRule],
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update targeting rule
      updateTargetingRule: (id, rule) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedRules = currentCampaign.targeting.map(r =>
          r.id === id ? { ...r, ...rule } : r
        );

        set({
          currentCampaign: {
            ...currentCampaign,
            targeting: updatedRules,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Delete targeting rule
      deleteTargetingRule: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            targeting: currentCampaign.targeting.filter(r => r.id !== id),
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update display rules
      updateDisplayRules: (rules) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            displayRules: { ...currentCampaign.displayRules, ...rules },
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Undo
      undo: () => {
        const { currentCampaign } = get();
        if (!currentCampaign || currentCampaign.historyIndex <= 0) return;

        const newIndex = currentCampaign.historyIndex - 1;
        const previousLayers = currentCampaign.history[newIndex];

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: previousLayers,
            historyIndex: newIndex,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Redo
      redo: () => {
        const { currentCampaign } = get();
        if (!currentCampaign || currentCampaign.historyIndex >= currentCampaign.history.length - 1) return;

        const newIndex = currentCampaign.historyIndex + 1;
        const nextLayers = currentCampaign.history[newIndex];

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: nextLayers,
            historyIndex: newIndex,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Can undo
      canUndo: () => {
        const { currentCampaign } = get();
        return !!currentCampaign && currentCampaign.historyIndex > 0;
      },

      // Can redo
      canRedo: () => {
        const { currentCampaign } = get();
        return !!currentCampaign && currentCampaign.historyIndex < currentCampaign.history.length - 1;
      },

      // Set active tab
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Set property tab
      setPropertyTab: (tab) => set({ propertyTab: tab }),

      // Set show editor
      setShowEditor: (show) => set({ showEditor: show }),

      // Auto-save (debounced to prevent rate limiting)
      enableAutoSave: () => {
        const debouncedSave = () => {
          if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }

          autoSaveTimeout = setTimeout(() => {
            const { currentCampaign, saveCampaign } = get();
            if (currentCampaign?.isDirty) {
              console.log('Auto-save: Saving campaign...');
              saveCampaign();
            }
            autoSaveTimeout = null;
          }, AUTO_SAVE_DEBOUNCE_MS);
        };

        // Check every 1 second, but only save after 3 seconds of inactivity
        const interval = setInterval(() => {
          const { currentCampaign } = get();
          if (currentCampaign?.isDirty) {
            debouncedSave();
          }
        }, 1000);

        // Store interval ID for cleanup
        (window as any).__autoSaveInterval = interval;
      },

      // Disable auto-save
      disableAutoSave: () => {
        if ((window as any).__autoSaveInterval) {
          clearInterval((window as any).__autoSaveInterval);
          delete (window as any).__autoSaveInterval;
        }
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
          autoSaveTimeout = null;
        }
      },
    }),
    {
      name: 'editor-storage',
      // Don't persist currentCampaign - always load from server
      // This prevents stale data from showing after reload
      partialize: (state) => ({
        // Only persist UI state, not campaign data
      }),
    }
  )
);

// Helper functions
function getDefaultLayersForNudgeType(nudgeType: CampaignEditor['nudgeType']): Layer[] {
  const baseId = Date.now();

  switch (nudgeType) {
    case 'bottomsheet':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Bottom Sheet',
          parent: null,
          children: [`layer_${baseId + 1}`, `layer_${baseId + 2}`, `layer_${baseId + 3}`, `layer_${baseId + 4}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {},
          style: {
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: { top: 20, right: 20, bottom: 20, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'handle',
          name: 'Drag Handle',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: 40, height: 4 },
          content: {},
          style: {
            backgroundColor: '#D1D5DB',
            borderRadius: 2,
            margin: { top: 0, right: 0, bottom: 16, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 2}`,
          type: 'media',
          name: 'Image',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 2,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 200 },
          content: {
            imageUrl: 'https://www.bbassets.com/media/uploads/blinkitUX/ecofriendlycoverimage.webp',
            imageSize: { width: 720, height: 640 },
          },
          style: {
            borderRadius: 12,
            margin: { top: 0, right: 0, bottom: 16, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 3}`,
          type: 'text',
          name: 'Title',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 3,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {
            text: 'Skip a bag & go green!',
            fontSize: 20,
            fontWeight: 'bold',
            textColor: '#111827',
            textAlign: 'left',
          },
          style: {
            margin: { top: 0, right: 0, bottom: 8, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 4}`,
          type: 'button',
          name: 'CTA Button',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 4,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 48 },
          content: {
            label: 'Got it',
            buttonStyle: 'primary',
            action: {
              type: 'close',
              trackConversion: true,
              autoDismiss: true,
            },
          },
          style: {
            backgroundColor: '#22C55E',
            borderRadius: 12,
            margin: { top: 16, right: 0, bottom: 0, left: 0 },
            padding: { top: 12, right: 24, bottom: 12, left: 24 },
          },
        },
      ];

    // Add other nudge types...
    case 'modal':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Modal Container',
          parent: null,
          children: [`layer_${baseId + 1}`, `layer_${baseId + 2}`, `layer_${baseId + 3}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: 320, height: 'auto' },
          content: {},
          style: {
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: { top: 24, right: 24, bottom: 24, left: 24 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'text',
          name: 'Title',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {
            text: 'Welcome Aboard!',
            fontSize: 22,
            fontWeight: 'bold',
            textColor: '#111827',
            textAlign: 'center',
          },
          style: {
            margin: { top: 0, right: 0, bottom: 8, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 2}`,
          type: 'text',
          name: 'Description',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 2,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {
            text: 'This is a modal nudge. You can use it to make announcements or ask for confirmation.',
            fontSize: 15,
            fontWeight: 'normal',
            textColor: '#4B5563',
            textAlign: 'center',
          },
          style: {
            margin: { top: 0, right: 0, bottom: 16, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            lineHeight: 1.5,
          },
        },
        {
          id: `layer_${baseId + 3}`,
          type: 'button',
          name: 'Action Button',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 3,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 44 },
          content: {
            label: 'Get Started',
            buttonStyle: 'primary',
            action: {
              type: 'close',
              trackConversion: true,
              autoDismiss: true,
            },
          },
          style: {
            backgroundColor: '#4F46E5',
            borderRadius: 8,
            margin: { top: 8, right: 0, bottom: 0, left: 0 },
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
          },
        },
      ];

    default:
      return [];
  }
}

function getDefaultContentForType(type: LayerType): LayerContent {
  switch (type) {
    case 'text':
      return {
        text: 'New text',
        fontSize: 16,
        fontWeight: 'normal',
        textColor: '#111827',
        textAlign: 'left',
      };
    case 'button':
      return {
        label: 'Button',
        buttonStyle: 'primary',
        action: { type: 'close', trackConversion: false, autoDismiss: true },
      };
    case 'media':
      return {
        imageUrl: 'https://via.placeholder.com/300x200',
        imageSize: { width: 300, height: 200 },
      };
    case 'input':
      return {
        inputType: 'text',
        placeholder: 'Enter text...',
        required: false,
        fontSize: 14,
        textColor: '#374151',
      };
    case 'checkbox':
      return {
        checkboxLabel: 'I agree to terms',
        checked: false,
        checkboxColor: '#6366F1',
        fontSize: 14,
        textColor: '#374151',
      };
    default:
      return {};
  }
}

function getDefaultStyleForType(type: LayerType): LayerStyle {
  return {
    backgroundColor: type === 'button' ? '#6366F1' : 'transparent',
    borderRadius: type === 'button' ? 8 : 0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    opacity: 1,
  };
}
