import { useState, useCallback, useMemo } from 'react';
import type { Component, ComponentType, Template, HeightAdjustMode } from '../core/types';
import { validateComponent } from '../core/validation';
import { DEFAULT_STYLES, DEFAULT_CONTENT, CANVAS_CONSTANTS } from '../core/constants';
import { calculateRequiredHeight } from '../utils/heightCalculator';
import { useHistory } from './useHistory';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

// ============================================================================
// Component Factory
// ============================================================================

export function createDefaultComponent(
  type: ComponentType,
  existingCount: number,
  canvasWidth = CANVAS_CONSTANTS.WIDTH
): Component {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  
  return {
    id: `${type}_${timestamp}_${random}`,
    type,
    position: {
      type: 'absolute',
      x: 50,
      y: 50,
      width: Math.min(300, canvasWidth - 100),
      height: 60,
      zIndex: existingCount + 1,
      rotation: 0,
    },
    style: DEFAULT_STYLES[type] ? { ...DEFAULT_STYLES[type] } : {},
    content: DEFAULT_CONTENT[type] ? { ...DEFAULT_CONTENT[type] } : {},
    visible: true,
    locked: false,
  };
}

// ============================================================================
// Main State Hook
// ============================================================================

export function useBottomSheetState(initialConfig?: any) {
  // ========== History (Undo/Redo) ==========
  const {
    state: components,
    canUndo,
    canRedo,
    undo,
    redo,
    setState: setComponentsWithHistory,
    reset: resetHistory,
  } = useHistory(initialConfig?.components || []);

  // ========== Core State ==========
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [canvasHeight, setCanvasHeight] = useState<number>(
    initialConfig?.canvasHeight || CANVAS_CONSTANTS.DEFAULT_HEIGHT
  );
  const [layoutType, setLayoutType] = useState<'absolute' | 'flex'>(
    initialConfig?.layout?.type || 'absolute'
  );

  // ========== UI State ==========
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState<number>(CANVAS_CONSTANTS.DEFAULT_ZOOM);
  const [showJSON, setShowJSON] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingText, setIsEditingText] = useState<string | null>(null);
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<Array<{
    type: 'vertical' | 'horizontal';
    position: number;
  }>>([]);

  // ========== Template State ==========
  const [loadedTemplate, setLoadedTemplate] = useState<Template | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(
    components.length === 0
  );

  // ========== Height Dialog State ==========
  const [heightDialog, setHeightDialog] = useState<{
    isOpen: boolean;
    requiredHeight: number;
    currentHeight: number;
    mode: HeightAdjustMode;
    pendingTemplate: Template | null;
  }>({
    isOpen: false,
    requiredHeight: 0,
    currentHeight: canvasHeight,
    mode: 'resize',
    pendingTemplate: null,
  });

  // ========== Advanced Features State ==========
  // Design System
  const [designSystem, setDesignSystem] = useState({
    colors: [] as any[],
    textStyles: [] as any[],
    effectStyles: [] as any[],
    spacing: {} as Record<string, number>,
  });

  // Variables for conditional logic
  const [variables, setVariables] = useState<any[]>([]);

  // Assets & Brand Kit
  const [uploadedAssets, setUploadedAssets] = useState<any[]>([]);
  const [brandKit, setBrandKit] = useState({
    logos: [] as any[],
    colors: [] as any[],
    fonts: [] as string[],
  });

  // Comments
  const [comments, setComments] = useState<any[]>([]);

  // Responsive Design
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // Animation
  const [animationPreview, setAnimationPreview] = useState<string | null>(null);

  // Component Library
  const [masterComponents, setMasterComponents] = useState<Component[]>([]);

  // Collaboration (placeholder for future real-time features)
  const [activeUsers, setActiveUsers] = useState<Array<{
    id: string;
    name: string;
    color: string;
    cursor: { x: number; y: number } | null;
  }>>([]);

  // ========== Derived State ==========
  const selectedComponents = useMemo(
    () => components.filter(c => selectedIds.includes(c.id)),
    [components, selectedIds]
  );

  const selectedComponent = useMemo(
    () => selectedIds.length === 1 ? components.find(c => c.id === selectedIds[0]) || null : null,
    [components, selectedIds]
  );

  const visibleComponents = useMemo(
    () => components.filter(c => c.visible !== false),
    [components]
  );

  const sortedComponents = useMemo(
    () => [...visibleComponents].sort((a, b) => 
      (a.position.zIndex || 0) - (b.position.zIndex || 0)
    ),
    [visibleComponents]
  );

  // ========== Selection Actions ==========

  const toggleSelection = useCallback((id: string, additive: boolean = false) => {
    if (additive) {
      // Ctrl+Click: Toggle component in selection
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      // Normal click: Replace selection
      setSelectedIds([id]);
    }
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(components.map(c => c.id));
  }, [components]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectInRect = useCallback((rect: { x: number; y: number; width: number; height: number }) => {
    const inRect = components.filter(c => {
      const cx = c.position.x || 0;
      const cy = c.position.y || 0;
      const cw = c.position.width || 0;
      const ch = c.position.height || 0;
      
      // Check if component overlaps with selection rectangle
      return !(
        cx + cw < rect.x ||
        cx > rect.x + rect.width ||
        cy + ch < rect.y ||
        cy > rect.y + rect.height
      );
    });
    setSelectedIds(inRect.map(c => c.id));
  }, [components]);

  // ========== Component Actions ==========

  const addComponent = useCallback((type: ComponentType) => {
    const newComponent = createDefaultComponent(type, components.length);
    setComponentsWithHistory([...components, newComponent]);
    setSelectedIds([newComponent.id]);
  }, [components, setComponentsWithHistory]);

  const updateComponent = useCallback((
    id: string,
    updates: Partial<Component>
  ) => {
    const newComponents = components.map(comp => {
      if (comp.id !== id) return comp;
      
      const merged = { ...comp, ...updates };
      
      // Validate and clamp
      const validated = validateComponent(merged, CANVAS_CONSTANTS.WIDTH, canvasHeight);
      
      if (validated.success && validated.data) {
        return validated.data;
      }
      
      // If validation fails, return original
      console.warn('Component validation failed:', validated.error);
      return comp;
    });
    setComponentsWithHistory(newComponents);
  }, [components, canvasHeight, setComponentsWithHistory]);

  const deleteComponent = useCallback((id: string) => {
    setComponentsWithHistory(components.filter(c => c.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  }, [components, setComponentsWithHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setComponentsWithHistory(components.filter(c => !selectedIds.includes(c.id)));
    setSelectedIds([]);
  }, [components, selectedIds, setComponentsWithHistory]);

  const duplicateComponent = useCallback((id: string) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    
    const newComp: Component = {
      ...comp,
      id: `${comp.type}_${timestamp}_${random}`,
      position: {
        ...comp.position,
        x: (comp.position.x || 0) + 20,
        y: (comp.position.y || 0) + 20,
        zIndex: (comp.position.zIndex || 1) + 1,
      },
    };

    setComponentsWithHistory([...components, newComp]);
    setSelectedIds([newComp.id]);
  }, [components, setComponentsWithHistory]);

  const updateComponentPosition = useCallback((
    id: string,
    x: number,
    y: number
  ) => {
    updateComponent(id, {
      position: {
        ...components.find(c => c.id === id)?.position!,
        x,
        y,
      },
    });
  }, [components, updateComponent]);

  const updateComponentSize = useCallback((
    id: string,
    width: number,
    height: number
  ) => {
    updateComponent(id, {
      position: {
        ...components.find(c => c.id === id)?.position!,
        width,
        height,
      },
    });
  }, [components, updateComponent]);

  const toggleVisibility = useCallback((id: string) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;
    updateComponent(id, { visible: !comp.visible });
  }, [components, updateComponent]);

  const toggleLock = useCallback((id: string) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;
    updateComponent(id, { locked: !comp.locked });
  }, [components, updateComponent]);

  const bringToFront = useCallback((id: string) => {
    const maxZ = Math.max(...components.map(c => c.position.zIndex || 1), 0);
    updateComponent(id, {
      position: {
        ...components.find(c => c.id === id)?.position!,
        zIndex: maxZ + 1,
      },
    });
  }, [components, updateComponent]);

  const sendToBack = useCallback((id: string) => {
    updateComponent(id, {
      position: {
        ...components.find(c => c.id === id)?.position!,
        zIndex: 1,
      },
    });
  }, [components, updateComponent]);

  // ========== Bulk Actions ==========

  const clearCanvas = useCallback(() => {
    setComponentsWithHistory([]);
    setSelectedIds([]);
    setLoadedTemplate(null);
    setShowQuickEdit(false);
  }, [setComponentsWithHistory]);

  const reorderComponents = useCallback((newOrder: Component[]) => {
    if (layoutType === 'flex') {
      // Update order property for flex layout
      const reordered = newOrder.map((comp, index) => ({
        ...comp,
        position: { ...comp.position, order: index },
      }));
      setComponentsWithHistory(reordered);
    } else {
      // Update z-index for absolute layout
      const reordered = newOrder.map((comp, index) => ({
        ...comp,
        position: { ...comp.position, zIndex: index + 1 },
      }));
      setComponentsWithHistory(reordered);
    }
  }, [layoutType, setComponentsWithHistory]);

  // ========== Template Actions ==========

  const loadTemplate = useCallback((template: Template) => {
    const requiredHeight = calculateRequiredHeight(template.config.components);
    
    if (requiredHeight > canvasHeight) {
      // Show height adjustment dialog
      setHeightDialog({
        isOpen: true,
        requiredHeight,
        currentHeight: canvasHeight,
        mode: 'resize',
        pendingTemplate: template,
      });
    } else {
      // Template fits - apply directly
      applyTemplate(template, 'none');
    }
  }, [canvasHeight]);

  const applyTemplate = useCallback((
    template: Template,
    mode: HeightAdjustMode
  ) => {
    const templateComponents = template.config.components.map(comp => ({
      ...comp,
      id: `${comp.type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    }));

    if (mode === 'resize') {
      // Resize canvas to fit
      const newHeight = Math.min(
        Math.max(heightDialog.requiredHeight, CANVAS_CONSTANTS.MIN_HEIGHT),
        CANVAS_CONSTANTS.MAX_HEIGHT
      );
      setCanvasHeight(newHeight);
      setComponentsWithHistory(templateComponents);
    } else if (mode === 'scale') {
      // Scale components proportionally
      const scaleFactor = canvasHeight / heightDialog.requiredHeight;
      const scaledComponents = templateComponents.map(comp => ({
        ...comp,
        position: {
          ...comp.position,
          y: Math.max(0, Math.round((comp.position.y || 0) * scaleFactor)),
          height: Math.max(20, Math.round(comp.position.height * scaleFactor)),
        },
        style: {
          ...comp.style,
          fontSize: comp.style?.fontSize && typeof comp.style.fontSize === 'number'
            ? Math.max(8, Math.round(comp.style.fontSize * scaleFactor))
            : undefined,
        },
      }));
      setComponentsWithHistory(scaledComponents);
    } else {
      // Use scrollable canvas (no adjustment)
      setComponentsWithHistory(templateComponents);
    }

    setLoadedTemplate(template);
    setShowQuickEdit(true);
    setShowTemplateGallery(false);
    setHeightDialog({
      isOpen: false,
      requiredHeight: 0,
      currentHeight: canvasHeight,
      mode: 'resize',
      pendingTemplate: null,
    });
  }, [canvasHeight, heightDialog.requiredHeight]);

  // ========== Canvas Actions ==========

  const updateCanvasHeight = useCallback((newHeight: number) => {
    const clamped = Math.max(
      CANVAS_CONSTANTS.MIN_HEIGHT,
      Math.min(CANVAS_CONSTANTS.MAX_HEIGHT, newHeight)
    );
    setCanvasHeight(clamped);
  }, []);

  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const updateZoom = useCallback((newZoom: number) => {
    const clamped = Math.max(
      CANVAS_CONSTANTS.MIN_ZOOM,
      Math.min(CANVAS_CONSTANTS.MAX_ZOOM, newZoom)
    );
    setZoom(clamped);
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(CANVAS_CONSTANTS.DEFAULT_ZOOM);
  }, []);

  // ========== Auto-Layout (Flexbox) Actions ==========

  const setFlexLayout = useCallback((componentId: string, flexLayout: any) => {
    updateComponent(componentId, { flexLayout });
  }, [updateComponent]);

  const updateFlexProperties = useCallback((componentId: string, properties: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        flexLayout: { ...component.flexLayout, ...properties },
      });
    }
  }, [components, updateComponent]);

  const setFlexChild = useCallback((componentId: string, flexChild: any) => {
    updateComponent(componentId, { flexChild });
  }, [updateComponent]);

  // ========== Layer Effects Actions ==========

  const addShadow = useCallback((componentId: string, shadow: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const shadows = component.effects?.shadows || [];
      updateComponent(componentId, {
        effects: {
          ...component.effects,
          shadows: [...shadows, shadow],
        },
      });
    }
  }, [components, updateComponent]);

  const updateShadow = useCallback((componentId: string, shadowId: string, updates: any) => {
    const component = components.find(c => c.id === componentId);
    if (component && component.effects?.shadows) {
      const shadows = component.effects.shadows.map((s: any) =>
        s.id === shadowId ? { ...s, ...updates } : s
      );
      updateComponent(componentId, {
        effects: { ...component.effects, shadows },
      });
    }
  }, [components, updateComponent]);

  const removeShadow = useCallback((componentId: string, shadowId: string) => {
    const component = components.find(c => c.id === componentId);
    if (component && component.effects?.shadows) {
      const shadows = component.effects.shadows.filter((s: any) => s.id !== shadowId);
      updateComponent(componentId, {
        effects: { ...component.effects, shadows },
      });
    }
  }, [components, updateComponent]);

  const setGradient = useCallback((componentId: string, gradient: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        effects: { ...component.effects, gradient },
      });
    }
  }, [components, updateComponent]);

  const setBlur = useCallback((componentId: string, blur: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        effects: { ...component.effects, blur },
      });
    }
  }, [components, updateComponent]);

  const setStroke = useCallback((componentId: string, stroke: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        effects: { ...component.effects, stroke },
      });
    }
  }, [components, updateComponent]);

  const setOpacity = useCallback((componentId: string, opacity: number) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      updateComponent(componentId, {
        effects: { ...component.effects, opacity },
      });
    }
  }, [components, updateComponent]);

  // ========== Component States Actions ==========

  const setComponentState = useCallback((componentId: string, stateName: 'default' | 'hover' | 'active' | 'disabled' | 'focused') => {
    updateComponent(componentId, { currentState: stateName });
  }, [updateComponent]);

  const updateStateStyle = useCallback((componentId: string, stateName: string, style: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const states = component.states || { default: component.style };
      updateComponent(componentId, {
        states: {
          ...states,
          [stateName]: { ...states[stateName as keyof typeof states], ...style },
        },
      });
    }
  }, [components, updateComponent]);

  // ========== Interactions Actions ==========

  const addTrigger = useCallback((componentId: string, trigger: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const triggers = component.interactions?.triggers || [];
      updateComponent(componentId, {
        interactions: {
          triggers: [...triggers, trigger],
        },
      });
    }
  }, [components, updateComponent]);

  const removeTrigger = useCallback((componentId: string, triggerIndex: number) => {
    const component = components.find(c => c.id === componentId);
    if (component && component.interactions?.triggers) {
      const triggers = component.interactions.triggers.filter((_, i) => i !== triggerIndex);
      updateComponent(componentId, {
        interactions: { triggers },
      });
    }
  }, [components, updateComponent]);

  // ========== Variables Actions ==========

  const addVariable = useCallback((variable: any) => {
    setVariables(prev => [...prev, variable]);
  }, []);

  const updateVariable = useCallback((variableName: string, value: any) => {
    setVariables(prev =>
      prev.map(v => (v.name === variableName ? { ...v, currentValue: value } : v))
    );
  }, []);

  const removeVariable = useCallback((variableName: string) => {
    setVariables(prev => prev.filter(v => v.name !== variableName));
  }, []);

  // ========== Conditions Actions ==========

  const addCondition = useCallback((componentId: string, condition: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const conditions = component.conditions || [];
      updateComponent(componentId, {
        conditions: [...conditions, condition],
      });
    }
  }, [components, updateComponent]);

  const removeCondition = useCallback((componentId: string, conditionIndex: number) => {
    const component = components.find(c => c.id === componentId);
    if (component && component.conditions) {
      const conditions = component.conditions.filter((_, i) => i !== conditionIndex);
      updateComponent(componentId, { conditions });
    }
  }, [components, updateComponent]);

  // ========== Responsive Design Actions ==========

  const addResponsiveOverride = useCallback((componentId: string, override: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const overrides = component.responsiveOverrides || [];
      updateComponent(componentId, {
        responsiveOverrides: [...overrides, override],
      });
    }
  }, [components, updateComponent]);

  const setConstraints = useCallback((componentId: string, constraints: any) => {
    updateComponent(componentId, { constraints });
  }, [updateComponent]);

  // ========== Animations Actions ==========

  const addAnimation = useCallback((componentId: string, animation: any) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const animations = component.animations || [];
      updateComponent(componentId, {
        animations: [...animations, animation],
      });
    }
  }, [components, updateComponent]);

  const updateAnimation = useCallback((componentId: string, animationId: string, updates: any) => {
    const component = components.find(c => c.id === componentId);
    if (component && component.animations) {
      const animations = component.animations.map((a: any) =>
        a.id === animationId ? { ...a, ...updates } : a
      );
      updateComponent(componentId, { animations });
    }
  }, [components, updateComponent]);

  const removeAnimation = useCallback((componentId: string, animationId: string) => {
    const component = components.find(c => c.id === componentId);
    if (component && component.animations) {
      const animations = component.animations.filter((a: any) => a.id !== animationId);
      updateComponent(componentId, { animations });
    }
  }, [components, updateComponent]);

  // ========== Component Library Actions ==========

  const createMasterComponent = useCallback((componentId: string) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const masterComponent = {
        ...component,
        componentInstance: {
          isMaster: true,
          detached: false,
        },
      };
      setMasterComponents(prev => [...prev, masterComponent]);
      updateComponent(componentId, {
        componentInstance: {
          isMaster: true,
          detached: false,
        },
      });
    }
  }, [components, updateComponent]);

  const createInstance = useCallback((masterComponentId: string) => {
    const master = masterComponents.find(c => c.id === masterComponentId);
    if (master) {
      const instance = {
        ...master,
        id: `instance_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        componentInstance: {
          isMaster: false,
          masterComponentId,
          overrides: {},
          detached: false,
        },
      };
      setComponentsWithHistory([...components, instance]);
    }
  }, [masterComponents, components, setComponentsWithHistory]);

  const updateMasterComponent = useCallback((masterComponentId: string, updates: any) => {
    // Update master
    setMasterComponents(prev =>
      prev.map(c => (c.id === masterComponentId ? { ...c, ...updates } : c))
    );
    
    // Update all instances
    const newComponents = components.map(c => {
      if (c.componentInstance?.masterComponentId === masterComponentId && !c.componentInstance.detached) {
        const overrides = c.componentInstance.overrides || {};
        return { ...c, ...updates, ...overrides };
      }
      return c;
    });
    setComponentsWithHistory(newComponents);
  }, [components, setComponentsWithHistory]);

  const detachInstance = useCallback((componentId: string) => {
    updateComponent(componentId, {
      componentInstance: {
        ...(components.find(c => c.id === componentId)?.componentInstance || {}),
        detached: true,
      },
    });
  }, [components, updateComponent]);

  // ========== Design System Actions ==========

  const addColorStyle = useCallback((colorStyle: any) => {
    setDesignSystem(prev => ({
      ...prev,
      colors: [...prev.colors, colorStyle],
    }));
  }, []);

  const addTextStyle = useCallback((textStyle: any) => {
    setDesignSystem(prev => ({
      ...prev,
      textStyles: [...prev.textStyles, textStyle],
    }));
  }, []);

  const addEffectStyle = useCallback((effectStyle: any) => {
    setDesignSystem(prev => ({
      ...prev,
      effectStyles: [...prev.effectStyles, effectStyle],
    }));
  }, []);

  const applyColorStyle = useCallback((componentId: string, colorStyleId: string) => {
    const colorStyle = designSystem.colors.find((c: any) => c.id === colorStyleId);
    if (colorStyle) {
      updateComponent(componentId, {
        style: {
          ...(components.find(c => c.id === componentId)?.style || {}),
          color: colorStyle.value,
        },
      });
    }
  }, [designSystem.colors, components, updateComponent]);

  const applyTextStyle = useCallback((componentId: string, textStyleId: string) => {
    const textStyle = designSystem.textStyles.find((t: any) => t.id === textStyleId);
    if (textStyle) {
      updateComponent(componentId, {
        style: {
          ...(components.find(c => c.id === componentId)?.style || {}),
          fontFamily: textStyle.fontFamily,
          fontSize: textStyle.fontSize,
          fontWeight: textStyle.fontWeight,
          lineHeight: textStyle.lineHeight,
        },
      });
    }
  }, [designSystem.textStyles, components, updateComponent]);

  const applyEffectStyle = useCallback((componentId: string, effectStyleId: string) => {
    const effectStyle = designSystem.effectStyles.find((e: any) => e.id === effectStyleId);
    if (effectStyle) {
      updateComponent(componentId, { effects: effectStyle.effects });
    }
  }, [designSystem.effectStyles, updateComponent]);

  // ========== Asset Management Actions ==========

  const uploadAsset = useCallback((asset: any) => {
    setUploadedAssets(prev => [...prev, asset]);
  }, []);

  const deleteAsset = useCallback((assetId: string) => {
    setUploadedAssets(prev => prev.filter(a => a.id !== assetId));
  }, []);

  const addToBrandKit = useCallback((type: 'logo' | 'color' | 'font', item: any) => {
    setBrandKit(prev => ({
      ...prev,
      [type + 's']: [...(prev[type + 's' as keyof typeof prev] as any[]), item],
    }));
  }, []);

  // ========== Comments Actions ==========

  const addComment = useCallback((comment: any) => {
    setComments(prev => [...prev, comment]);
  }, []);

  const replyToComment = useCallback((commentId: string, reply: any) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, replies: [...c.replies, reply] }
          : c
      )
    );
  }, []);

  const resolveComment = useCallback((commentId: string) => {
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, resolved: true } : c))
    );
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  // ========== Return API ==========

  return {
    // Core State
    components,
    selectedIds,
    selectedId: selectedIds[0] || null, // For backward compatibility
    selectedComponent,
    selectedComponents,
    canvasHeight,
    layoutType,
    showGrid,
    zoom,
    showJSON,
    isDragging,
    isEditingText,
    loadedTemplate,
    showQuickEdit,
    showTemplateGallery,
    heightDialog,
    visibleComponents,
    sortedComponents,
    selectionRect,
    alignmentGuides,

    // Advanced State
    designSystem,
    variables,
    uploadedAssets,
    brandKit,
    comments,
    currentBreakpoint,
    animationPreview,
    masterComponents,
    activeUsers,

    // Selection Actions
    toggleSelection,
    selectAll,
    clearSelection,
    selectInRect,
    setSelectedIds,
    setSelectionRect,
    setAlignmentGuides,

    // Component Actions
    addComponent,
    updateComponent,
    deleteComponent,
    deleteSelected,
    duplicateComponent,
    updateComponentPosition,
    updateComponentSize,
    toggleVisibility,
    toggleLock,
    bringToFront,
    sendToBack,

    // Bulk Actions
    clearCanvas,
    reorderComponents,

    // Template Actions
    loadTemplate,
    applyTemplate,

    // Canvas Actions
    updateCanvasHeight,
    setLayoutType,
    toggleGrid,
    updateZoom,
    resetZoom,

    // History Actions
    undo,
    redo,
    canUndo,
    canRedo,
    setComponentsWithHistory,

    // UI Actions
    setShowJSON,
    setIsDragging,
    setIsEditingText,
    setShowQuickEdit,
    setShowTemplateGallery,
    setHeightDialog,

    // Auto-Layout Actions
    setFlexLayout,
    updateFlexProperties,
    setFlexChild,

    // Layer Effects Actions
    addShadow,
    updateShadow,
    removeShadow,
    setGradient,
    setBlur,
    setStroke,
    setOpacity,

    // Component States Actions
    setComponentState,
    updateStateStyle,

    // Interactions Actions
    addTrigger,
    removeTrigger,

    // Variables Actions
    addVariable,
    updateVariable,
    removeVariable,

    // Conditions Actions
    addCondition,
    removeCondition,

    // Responsive Design Actions
    addResponsiveOverride,
    setConstraints,
    setCurrentBreakpoint,

    // Animations Actions
    addAnimation,
    updateAnimation,
    removeAnimation,
    setAnimationPreview,

    // Component Library Actions
    createMasterComponent,
    createInstance,
    updateMasterComponent,
    detachInstance,

    // Design System Actions
    addColorStyle,
    addTextStyle,
    addEffectStyle,
    applyColorStyle,
    applyTextStyle,
    applyEffectStyle,
    setDesignSystem,

    // Asset Management Actions
    uploadAsset,
    deleteAsset,
    addToBrandKit,
    setUploadedAssets,
    setBrandKit,

    // Comments Actions
    addComment,
    replyToComment,
    resolveComment,
    deleteComment,
    setComments,

    // Advanced Setters
    setVariables,
    setMasterComponents,
    setActiveUsers,
  };
}

export type BottomSheetState = ReturnType<typeof useBottomSheetState>;
