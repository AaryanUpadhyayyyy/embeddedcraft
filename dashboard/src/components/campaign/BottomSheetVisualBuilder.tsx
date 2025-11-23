import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import ReactDraggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TransformHandles } from "./TransformHandles";
import { FloatingToolbar } from "./FloatingToolbar";
import { TemplateGallery } from "./TemplateGallery";
import { QuickEditPanel } from "./QuickEditPanel";
import { ComponentErrorBoundary } from "./ComponentErrorBoundary";
import { 
  Type, Image as ImageIcon, Video, Square, Mail, Container as ContainerIcon, 
  Images, Star, Minus, Space, Plus, Trash2, Copy, Eye, Code,
  Layers, ChevronDown, ChevronUp, Download, Upload, Grid3x3, Lock, Unlock,
  ZoomIn, ZoomOut, Maximize2, AlignLeft, AlignCenter, AlignRight,
  GripVertical, EyeOff, Move, RotateCw, Palette, Sparkles, Wand2
} from "lucide-react";

interface Component {
  id: string;
  type: string;
  position: {
    type: string;
    x?: number;
    y?: number;
    width?: number | string;
    height?: number | string;
    order?: number;
    zIndex?: number;
    rotation?: number;
  };
  style: Record<string, any>;
  content: Record<string, any>;
  visible?: boolean;
  locked?: boolean;
}

interface VisualBuilderProps {
  config: any;
  onChange: (config: any) => void;
}

export const BottomSheetVisualBuilder = ({ config, onChange }: VisualBuilderProps) => {
  const [components, setComponents] = useState<Component[]>(config.components || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layoutType, setLayoutType] = useState<string>('absolute'); // Default to absolute for free positioning
  const [showJSON, setShowJSON] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [isEditingText, setIsEditingText] = useState<string | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(80); // Bottom sheet height - compact by default
  const [showHeightDialog, setShowHeightDialog] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<any>(null);
  const [calculatedTemplateHeight, setCalculatedTemplateHeight] = useState(0);
  const [heightAdjustMode, setHeightAdjustMode] = useState<'resize' | 'scale' | 'scroll'>('resize');
  const [showTemplateGallery, setShowTemplateGallery] = useState(components.length === 0); // Show on empty canvas
  const [loadedTemplate, setLoadedTemplate] = useState<any>(null); // Track loaded template for Quick Edit
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedComponent = components.find(c => c.id === selectedId);

  // Component templates with better defaults
  const componentPalette = [
    { type: 'text', icon: Type, label: 'Text', color: '#3B82F6', description: 'Add text content' },
    { type: 'image', icon: ImageIcon, label: 'Image', color: '#10B981', description: 'Add an image' },
    { type: 'video', icon: Video, label: 'Video', color: '#EF4444', description: 'Add video player' },
    { type: 'button', icon: Square, label: 'Button', color: '#8B5CF6', description: 'Add action button' },
    { type: 'input', icon: Mail, label: 'Input', color: '#F59E0B', description: 'Add input field' },
    { type: 'shape', icon: Square, label: 'Shape', color: '#EC4899', description: 'Add shapes' },
    { type: 'container', icon: ContainerIcon, label: 'Container', color: '#14B8A6', description: 'Add container' },
    { type: 'carousel', icon: Images, label: 'Carousel', color: '#06B6D4', description: 'Add image slider' },
    { type: 'rating', icon: Star, label: 'Rating', color: '#FBBF24', description: 'Add star rating' },
    { type: 'divider', icon: Minus, label: 'Divider', color: '#6B7280', description: 'Add separator line' },
    { type: 'spacer', icon: Space, label: 'Spacer', color: '#9CA3AF', description: 'Add spacing' },
  ];

  const addComponent = (type: string) => {
    const newComponent: Component = {
      id: `${type}_${Date.now()}`,
      type,
      position: layoutType === 'absolute' 
        ? { type: 'absolute', x: 50, y: 50, width: 300, height: 'auto', zIndex: components.length + 1 }
        : { type: 'flex', order: components.length },
      style: getDefaultStyle(type),
      content: getDefaultContent(type),
      visible: true,
      locked: false,
    };

    const updated = [...components, newComponent];
    setComponents(updated);
    updateConfig(updated);
    setSelectedId(newComponent.id);
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    const updated = components.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updates };
        
        // ✅ Validate and clamp position values
        if (merged.position) {
          const width = typeof merged.position.width === 'number' ? merged.position.width : 100;
          const height = typeof merged.position.height === 'number' ? merged.position.height : 100;
          const x = typeof merged.position.x === 'number' ? merged.position.x : 0;
          const y = typeof merged.position.y === 'number' ? merged.position.y : 0;
          
          merged.position = {
            ...merged.position,
            x: Math.max(0, Math.min(375 - width, x)),
            y: Math.max(0, Math.min(canvasHeight - height, y)),
            width: Math.max(20, Math.min(375, width)),
            height: Math.max(20, Math.min(canvasHeight, height)),
            zIndex: Math.max(1, Math.min(100, merged.position.zIndex || 1)),
            rotation: merged.position.rotation || 0,
          };
        }
        
        return merged;
      }
      return c;
    });
    setComponents(updated);
    updateConfig(updated);
  };

  const deleteComponent = (id: string) => {
    const updated = components.filter(c => c.id !== id);
    setComponents(updated);
    updateConfig(updated);
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateComponent = (id: string) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;

    const newComp = {
      ...comp,
      id: `${comp.type}_${Date.now()}`,
      position: layoutType === 'absolute'
        ? { ...comp.position, x: (comp.position.x || 0) + 10, y: (comp.position.y || 0) + 10 }
        : { ...comp.position, order: (comp.position.order || 0) + 1 },
    };

    const updated = [...components, newComp];
    setComponents(updated);
    updateConfig(updated);
  };

  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(c => c.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= components.length) return;

    const updated = [...components];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update order for flex layout
    if (layoutType === 'flex') {
      updated.forEach((c, i) => {
        c.position.order = i;
      });
    }

    setComponents(updated);
    updateConfig(updated);
  };

  const updateConfig = (comps: Component[]) => {
    onChange({
      ...config,
      type: 'bottom_sheet', // ✅ CRITICAL: Always set type to bottom_sheet when using Visual Builder
      layout: {
        type: layoutType,
        ...(layoutType === 'absolute' ? { width: 375, height: canvasHeight } : { padding: 24, scrollable: true }),
      },
      canvasHeight: canvasHeight, // ✅ Pass canvas height to preview
      components: comps,
    });
  };

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      // Delete selected component
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteComponent(selectedId);
      }

      // Duplicate component (Ctrl+D)
      if (isCtrl && e.key === 'd' && selectedId) {
        e.preventDefault();
        duplicateComponent(selectedId);
      }

      // Copy component (Ctrl+C)
      if (isCtrl && e.key === 'c' && selectedId) {
        e.preventDefault();
        const comp = components.find(c => c.id === selectedId);
        if (comp) {
          localStorage.setItem('copiedComponent', JSON.stringify(comp));
        }
      }

      // Paste component (Ctrl+V)
      if (isCtrl && e.key === 'v') {
        e.preventDefault();
        const copiedData = localStorage.getItem('copiedComponent');
        if (copiedData) {
          const comp = JSON.parse(copiedData);
          const newComp = {
            ...comp,
            id: `${comp.type}_${Date.now()}`,
            position: layoutType === 'absolute'
              ? { ...comp.position, x: (comp.position.x || 0) + 20, y: (comp.position.y || 0) + 20 }
              : { ...comp.position, order: components.length },
          };
          const updated = [...components, newComp];
          setComponents(updated);
          updateConfig(updated);
          setSelectedId(newComp.id);
        }
      }

      // Arrow keys to move (1px or 10px with Shift)
      if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const comp = components.find(c => c.id === selectedId);
        if (!comp || comp.locked) return;

        const step = e.shiftKey ? 10 : 1;
        let { x = 0, y = 0 } = comp.position;

        switch (e.key) {
          case 'ArrowUp':
            y -= step;
            break;
          case 'ArrowDown':
            y += step;
            break;
          case 'ArrowLeft':
            x -= step;
            break;
          case 'ArrowRight':
            x += step;
            break;
        }

        updateComponent(selectedId, {
          position: { ...comp.position, x, y }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, components, layoutType]);

  // Load template into canvas
  const loadTemplate = (template: any) => {
    // Calculate required height from template components (with proper padding)
    const requiredHeight = template.config.components.reduce((max: number, comp: any) => {
      const compBottom = (comp.position?.y || 0) + (comp.position?.height || 0);
      return Math.max(max, compBottom);
    }, 0) + 80; // ✅ Add 80px padding (40 top + 40 bottom)
    
    setCalculatedTemplateHeight(requiredHeight);
    
    // Check if template fits in current canvas
    if (requiredHeight > canvasHeight) {
      // Template is too tall - show adjustment dialog
      setPendingTemplate(template);
      setShowHeightDialog(true);
    } else {
      // Template fits - load directly
      applyTemplate(template, 'none');
    }
  };
  
  // Apply template with chosen adjustment mode
  const applyTemplate = (template: any, mode: 'resize' | 'scale' | 'scroll' | 'none') => {
    // Generate unique IDs to prevent conflicts
    const templateComponents = template.config.components.map((comp: any) => ({
      ...comp,
      id: `${comp.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ✅ Unique IDs
    }));
    
    if (mode === 'resize') {
      // Option 1: Resize canvas to fit template
      const newHeight = Math.min(Math.max(calculatedTemplateHeight, 50), 800); // Clamp to reasonable range
      setCanvasHeight(newHeight);
      setComponents(templateComponents);
    } else if (mode === 'scale') {
      // Option 2: Scale components down to fit current canvas
      const scaleFactor = canvasHeight / calculatedTemplateHeight;
      const scaledComponents = templateComponents.map((comp: any) => ({
        ...comp,
        position: {
          ...comp.position,
          y: Math.max(0, Math.round((comp.position?.y || 0) * scaleFactor)), // ✅ Clamp to >= 0
          height: Math.max(20, Math.round((comp.position?.height || 0) * scaleFactor)), // ✅ Min 20px
          x: Math.max(0, comp.position?.x || 0), // ✅ Clamp to >= 0
          width: Math.max(20, comp.position?.width || 100), // ✅ Min 20px
          zIndex: Math.min(100, Math.max(1, comp.position?.zIndex || 1)), // ✅ Clamp 1-100
        },
        style: {
          ...comp.style,
          fontSize: comp.style?.fontSize ? Math.max(8, Math.round(comp.style.fontSize * scaleFactor)) : undefined,
        }
      }));
      setComponents(scaledComponents);
    } else if (mode === 'scroll') {
      // Option 3: Keep original size, use scrollable canvas
      setComponents(templateComponents);
      // Canvas will have overflow-y: auto to allow scrolling
    } else {
      // No adjustment needed - template fits
      setComponents(templateComponents);
    }
    
    updateConfig(mode === 'scale' || mode === 'none' ? 
      (mode === 'scale' ? templateComponents : templateComponents) : 
      templateComponents
    );
    setSelectedId(null);
    setLoadedTemplate(template);
    setShowQuickEdit(true);
    setShowHeightDialog(false);
    setPendingTemplate(null);
  };

  // Start with blank canvas
  const startBlank = () => {
    setComponents([]);
    updateConfig([]);
    setSelectedId(null);
    setLoadedTemplate(null);
    setShowQuickEdit(false);
  };

  // Quick Edit update handler
  const handleQuickEditUpdate = (componentId: string, property: string, value: any) => {
    const [section, key] = property.split(".");
    if (section === "content") {
      updateComponent(componentId, { content: { [key]: value } });
    } else if (section === "style") {
      updateComponent(componentId, { style: { [key]: value } });
    }
  };

  const getDefaultStyle = (type: string): Record<string, any> => {
    const defaults: Record<string, any> = {
      text: { 
        fontSize: 16, 
        color: '#1F2937', 
        fontWeight: '400',
        lineHeight: 1.5,
        textAlign: 'left',
        marginBottom: 12 
      },
      image: { 
        width: '100%', 
        height: 200, 
        borderRadius: 12, 
        objectFit: 'cover',
        marginBottom: 16 
      },
      video: { 
        width: '100%', 
        height: 200, 
        borderRadius: 12, 
        marginBottom: 16 
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
        marginBottom: 12 
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
        marginBottom: 16 
      },
      shape: {
        backgroundColor: '#6366F1',
        borderColor: '#4F46E5',
        borderWidth: 2,
        borderRadius: 0,
        marginBottom: 12
      },
      container: { 
        backgroundColor: '#F3F4F6', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 16 
      },
      carousel: { 
        height: 200, 
        borderRadius: 12, 
        marginBottom: 16 
      },
      rating: { 
        starColor: '#FBBF24', 
        emptyStarColor: '#D1D5DB',
        size: 28, 
        spacing: 4,
        marginBottom: 16 
      },
      divider: { 
        height: 1, 
        color: '#E5E7EB', 
        marginTop: 12,
        marginBottom: 12 
      },
      spacer: { 
        height: 24 
      },
    };
    return defaults[type] || {};
  };

  const getDefaultContent = (type: string): Record<string, any> => {
    const defaults: Record<string, any> = {
      text: { text: 'Click to edit text' },
      image: { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400', alt: 'Placeholder Image' },
      video: { url: '', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400' },
      button: { text: 'Click Me', action: 'primary_action' },
      input: { name: 'input_field', label: 'Input Label', placeholder: 'Enter your text here...' },
      shape: { shapeType: 'rectangle' },
      container: { direction: 'column', alignment: 'start', spacing: 8, children: [] },
      carousel: { items: [
        { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400' },
        { url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400' }
      ], autoplay: false, interval: 3000 },
      rating: { stars: 5, value: 0, allowHalf: false },
      divider: {},
      spacer: {},
    };
    return defaults[type] || {};
  };

  const exportJSON = () => {
    const json = JSON.stringify({ ...config, components }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bottom-sheet-config.json';
    a.click();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setComponents(json.components || []);
        setLayoutType(json.layout?.type || 'flex');
        updateConfig(json.components || []);
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Dragging from palette to canvas
    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      addComponent(draggableId.replace('palette-', ''));
      return;
    }

    // Reordering in layers (flex layout)
    if (source.droppableId === 'layers' && destination.droppableId === 'layers') {
      const updated = [...components];
      const [removed] = updated.splice(source.index, 1);
      updated.splice(destination.index, 0, removed);

      // Update order/z-index based on layout type
      if (layoutType === 'flex') {
        updated.forEach((c, i) => {
          c.position.order = i;
        });
      } else {
        // For absolute layout, update z-index
        updated.forEach((c, i) => {
          c.position.zIndex = i + 1;
        });
      }

      setComponents(updated);
      updateConfig(updated);
    }
  };

  return (
    <>
      {/* Template Gallery Modal */}
      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onSelectTemplate={loadTemplate}
        onStartBlank={startBlank}
      />

      {/* Height Adjustment Dialog */}
      <Dialog open={showHeightDialog} onOpenChange={(open) => {
        // ✅ Prevent dismissing dialog without making a choice
        if (!open && pendingTemplate) {
          // User trying to close without choosing - don't allow
          return;
        }
        setShowHeightDialog(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-orange-500" />
              Template Height Adjustment
            </DialogTitle>
            <DialogDescription>
              This template requires <strong>{calculatedTemplateHeight}px</strong> height, but your canvas is set to <strong>{canvasHeight}px</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={heightAdjustMode} onValueChange={(v: any) => setHeightAdjustMode(v)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                  <RadioGroupItem value="resize" id="resize" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="resize" className="font-semibold text-blue-900 cursor-pointer">
                      Auto-resize canvas to {calculatedTemplateHeight}px
                    </Label>
                    <p className="text-sm text-blue-700 mt-1">
                      ✅ Recommended - Adjusts canvas height to fit all template components perfectly
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:border-gray-300">
                  <RadioGroupItem value="scale" id="scale" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="scale" className="font-semibold cursor-pointer">
                      Scale template to fit {canvasHeight}px
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      ⚠️ Components will be proportionally smaller - may be hard to read
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:border-gray-300">
                  <RadioGroupItem value="scroll" id="scroll" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="scroll" className="font-semibold cursor-pointer">
                      Use scrollable canvas
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      📜 Keep {canvasHeight}px height, scroll to see all components
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowHeightDialog(false);
              setPendingTemplate(null);
            }}>
              Cancel
            </Button>
            <Button onClick={() => pendingTemplate && applyTemplate(pendingTemplate, heightAdjustMode)}>
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-[calc(100vh-200px)] min-h-[600px] w-full bg-gray-50 overflow-x-auto">
        {/* Left: Component Palette */}
        <div className="w-72 min-w-[288px] max-w-[288px] flex-shrink-0 bg-white border-r flex flex-col shadow-sm">
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
              <Layers className="h-5 w-5 text-blue-600" />
              Components
            </h3>
            <p className="text-xs text-gray-600 mt-1">Drag to canvas or click to add</p>
          </div>

          {/* Browse Templates Button */}
          <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <Button
              onClick={() => setShowTemplateGallery(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Browse Templates
            </Button>
          </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <Droppable droppableId="palette" isDropDisabled={true}>
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {componentPalette.map(({ type, icon: Icon, label, color, description }, index) => (
                    <Draggable key={type} draggableId={`palette-${type}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <button
                            onClick={() => addComponent(type)}
                            className={`w-full flex items-center gap-3 p-3 bg-white border-2 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group ${
                              snapshot.isDragging ? 'shadow-2xl border-blue-500 scale-105 rotate-2' : 'border-gray-200'
                            }`}
                          >
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                              style={{ backgroundColor: `${color}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color }} />
                            </div>
                            <div className="text-left flex-1">
                              <div className="text-sm font-semibold text-gray-800">{label}</div>
                              <div className="text-xs text-gray-500">{description}</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Layout Mode</Label>
              <Select value={layoutType} onValueChange={(v) => { setLayoutType(v); updateConfig(components); }}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Flex (Responsive)
                    </div>
                  </SelectItem>
                  <SelectItem value="absolute">
                    <div className="flex items-center gap-2">
                      <Move className="h-4 w-4" />
                      Absolute (Pixel-Perfect)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Center: Canvas + Layers */}
      <div className="flex-1 flex flex-col bg-white border-r">
        {/* Toolbar */}
        <div className="h-16 bg-gradient-to-r from-gray-50 to-white border-b px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={exportJSON} className="shadow-sm hover:shadow">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label className="cursor-pointer">
              <Button size="sm" variant="outline" asChild className="shadow-sm hover:shadow">
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input type="file" accept=".json" className="hidden" onChange={importJSON} />
            </label>
            <Separator orientation="vertical" className="h-8" />
            
            {/* Alignment Tools - Show when component selected */}
            {selectedComponent && (
              <>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      updateComponent(selectedComponent.id, {
                        position: { ...selectedComponent.position, x: 0 }
                      });
                    }}
                    className="h-8 w-8 p-0"
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      const width = typeof selectedComponent.position.width === 'number' ? selectedComponent.position.width : 300;
                      updateComponent(selectedComponent.id, {
                        position: { ...selectedComponent.position, x: (375 - width) / 2 }
                      });
                    }}
                    className="h-8 w-8 p-0"
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      const width = typeof selectedComponent.position.width === 'number' ? selectedComponent.position.width : 300;
                      updateComponent(selectedComponent.id, {
                        position: { ...selectedComponent.position, x: 375 - width }
                      });
                    }}
                    className="h-8 w-8 p-0"
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
                <Separator orientation="vertical" className="h-8" />
              </>
            )}
            
            <Button 
              size="sm" 
              variant={showGrid ? "default" : "outline"}
              onClick={() => setShowGrid(!showGrid)}
              className="shadow-sm"
              title="Toggle Grid (Ctrl+G)"
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            
            {/* Canvas Height Control with visible value */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
              <Maximize2 className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600 min-w-[45px]">Height:</span>
              <Slider
                value={[canvasHeight]}
                onValueChange={([value]) => {
                  setCanvasHeight(value);
                  // Pass new value directly to avoid stale closure
                  onChange({
                    ...config,
                    type: 'bottom_sheet',
                    canvasHeight: value,
                    layout: {
                      type: layoutType,
                      ...(layoutType === 'absolute' ? { width: 375, height: value } : { padding: 24, scrollable: true }),
                    },
                    components: components,
                  });
                }}
                min={50}
                max={800}
                step={10}
                className="w-24"
              />
              <span className="text-sm font-bold text-blue-600 min-w-[50px] text-right">{canvasHeight}px</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold w-16 text-center">{zoom}%</span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                disabled={zoom >= 200}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setZoom(100)}
              className="h-8 w-8 p-0"
              title="Reset Zoom"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            <Button 
              size="sm" 
              variant={showJSON ? "default" : "outline"}
              onClick={() => setShowJSON(!showJSON)}
              className="shadow-sm"
            >
              <Code className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        {/* Canvas Area + Quick Edit Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Canvas Area */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
          <Tabs defaultValue="canvas" className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="canvas" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Canvas
                </TabsTrigger>
                <TabsTrigger value="layers" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Layers ({components.length})
                </TabsTrigger>
                {showJSON && (
                  <TabsTrigger value="json" className="gap-2">
                    <Code className="h-4 w-4" />
                    JSON
                  </TabsTrigger>
                )}
                {/* Quick Edit Toggle (if template loaded) */}
                {loadedTemplate && (
                  <Button
                    variant={showQuickEdit ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowQuickEdit(!showQuickEdit)}
                    className="ml-auto gap-1"
                  >
                    <Wand2 className="h-3 w-3" />
                    Quick Edit
                  </Button>
                )}
              </TabsList>
            </div>

            <TabsContent value="canvas" className="flex-1 flex items-center justify-center p-8">
              <Droppable droppableId="canvas">
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ 
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.2s',
                    }}
                  >
                    {/* Bottom Sheet Canvas - Resizable Height */}
                    <ResizableBox
                      width={375}
                      height={canvasHeight}
                      minConstraints={[375, 50]}
                      maxConstraints={[375, 800]}
                      resizeHandles={['s']}
                      onResizeStop={(e, data) => {
                        const newHeight = data.size.height;
                        setCanvasHeight(newHeight);
                        // Pass new value directly to avoid stale closure
                        onChange({
                          ...config,
                          type: 'bottom_sheet',
                          canvasHeight: newHeight,
                          layout: {
                            type: layoutType,
                            ...(layoutType === 'absolute' ? { width: 375, height: newHeight } : { padding: 24, scrollable: true }),
                          },
                          components: components,
                        });
                      }}
                      className="mx-auto"
                    >
                      <div 
                        ref={canvasRef}
                        className={`w-full bg-white shadow-2xl relative ${
                          snapshot.isDraggingOver ? 'ring-4 ring-blue-400 ring-offset-4' : ''
                        }`} 
                        style={{ 
                          height: canvasHeight,
                          minHeight: canvasHeight,
                          maxHeight: canvasHeight,
                          overflowY: heightAdjustMode === 'scroll' ? 'auto' : 'visible',
                          overflowX: 'visible',
                          borderTopLeftRadius: 24,
                          borderTopRightRadius: 24,
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                          backgroundImage: showGrid ? 
                            'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)' : 
                            'none',
                          backgroundSize: showGrid ? '20px 20px' : 'auto',
                        }}
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setSelectedId(null);
                          }
                        }}
                      >
                        {/* Bottom Sheet Handle Bar */}
                        <div className="h-8 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>

                        {/* Content Area */}
                        <div 
                          className="relative" 
                          style={{ 
                            height: heightAdjustMode === 'scroll' ? calculatedTemplateHeight || canvasHeight - 40 : canvasHeight - 40,
                            minHeight: heightAdjustMode === 'scroll' ? calculatedTemplateHeight || canvasHeight - 40 : canvasHeight - 40, 
                            padding: 0 
                          }}
                        >
                          {components.length === 0 ? (
                          <div className="flex items-center justify-center h-96 text-gray-400">
                            <div className="text-center p-8">
                              <Plus className="h-16 w-16 mx-auto mb-4 opacity-30" />
                              <p className="text-lg font-medium mb-1">Start Building</p>
                              <p className="text-sm">Drag components from the left panel</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-full p-4">
                            {components
                              .filter(comp => comp.visible !== false)
                              .sort((a, b) => (a.position.zIndex || 0) - (b.position.zIndex || 0))
                              .map((comp) => {
                                const width = typeof comp.position.width === 'number' ? comp.position.width : 300;
                                const height = typeof comp.position.height === 'number' ? comp.position.height : 60;
                                
                                return (
                                  <ComponentErrorBoundary
                                    key={comp.id}
                                    componentId={comp.id}
                                    componentType={comp.type}
                                  >
                                  <ReactDraggable
                                    key={comp.id}
                                    disabled={comp.locked}
                                    position={{ 
                                      x: comp.position.x || 0, 
                                      y: comp.position.y || 0 
                                    }}
                                    onStart={() => {
                                      if (!comp.locked) {
                                        setSelectedId(comp.id);
                                        setIsDraggingComponent(true);
                                      }
                                    }}
                                    onDrag={(e, data) => {
                                      // Real-time update while dragging
                                      updateComponent(comp.id, {
                                        position: { ...comp.position, x: data.x, y: data.y }
                                      });
                                    }}
                                    onStop={(e, data) => {
                                      setIsDraggingComponent(false);
                                      updateComponent(comp.id, {
                                        position: { ...comp.position, x: data.x, y: data.y }
                                      });
                                    }}
                                    grid={showGrid ? [20, 20] : [1, 1]}
                                    bounds={{
                                      left: 0,
                                      top: 0,
                                      right: 375 - width - 0, // ✅ No padding constraint (canvas has no side padding)
                                      bottom: canvasHeight - height - 40 // ✅ Account for handle bar (32px) + margin
                                    }}
                                  >
                                    <div
                                      style={{ 
                                        position: 'absolute',
                                        zIndex: comp.position.zIndex || 1,
                                      }}
                                    >
                                      <ResizableBox
                                        width={width}
                                        height={height}
                                        minConstraints={[50, 30]}
                                        maxConstraints={[350, 550]}
                                        resizeHandles={selectedId === comp.id && !comp.locked ? ['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w'] : []}
                                        onResizeStop={(e, data) => {
                                          updateComponent(comp.id, {
                                            position: { 
                                              ...comp.position, 
                                              width: data.size.width, 
                                              height: data.size.height 
                                            }
                                          });
                                        }}
                                      >
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!comp.locked) setSelectedId(comp.id);
                                          }}
                                          onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            if (comp.type === 'text' && !comp.locked) {
                                              setIsEditingText(comp.id);
                                            }
                                          }}
                                          className={`
                                            h-full w-full
                                            ${comp.locked ? 'cursor-not-allowed' : 'cursor-move'} 
                                            transition-all
                                            ${selectedId === comp.id 
                                              ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' 
                                              : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'
                                            }
                                          `}
                                          style={{ 
                                            opacity: comp.locked ? 0.7 : 1,
                                            transform: `rotate(${comp.position.rotation || 0}deg)`,
                                          }}
                                        >
                                          {/* Selection Badge */}
                                          {selectedId === comp.id && (
                                            <div className="absolute -top-7 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-t flex items-center gap-1 z-50">
                                              {getComponentIcon(comp.type)}
                                              <span className="font-medium">{comp.type}</span>
                                              {comp.locked && <Lock className="h-3 w-3" />}
                                            </div>
                                          )}
                                          
                                          {/* Component Content */}
                                          {isEditingText === comp.id && comp.type === 'text' ? (
                                            <input
                                              type="text"
                                              value={comp.content.text || ''}
                                              onChange={(e) => {
                                                updateComponent(comp.id, {
                                                  content: { ...comp.content, text: e.target.value }
                                                });
                                              }}
                                              onBlur={() => setIsEditingText(null)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === 'Escape') {
                                                  setIsEditingText(null);
                                                }
                                              }}
                                              autoFocus
                                              className="w-full h-full px-2 py-1 border-2 border-blue-500 rounded outline-none"
                                              style={{
                                                fontSize: comp.style?.fontSize || 16,
                                                color: comp.style?.color || '#1F2937',
                                                fontWeight: comp.style?.fontWeight || '400',
                                                textAlign: comp.style?.textAlign || 'left',
                                              }}
                                            />
                                          ) : (
                                            <div className="w-full h-full overflow-hidden">
                                              <ComponentPreview component={comp} showGrid={showGrid} />
                                            </div>
                                          )}

                                          {/* Floating Toolbar */}
                                          {selectedId === comp.id && !comp.locked && canvasRef.current && (
                                            <FloatingToolbar
                                              component={comp}
                                              position={{ 
                                                x: (comp.position.x || 0) + width / 2,
                                                y: (comp.position.y || 0)
                                              }}
                                              onChange={(updates) => updateComponent(comp.id, updates)}
                                            />
                                          )}
                                        </div>
                                      </ResizableBox>
                                    </div>
                                  </ReactDraggable>
                                  </ComponentErrorBoundary>
                                );
                              })}
                          </div>
                        )}
                      </div>
                      
                      {provided.placeholder}
                    </div>
                    </ResizableBox>
                  </div>
                )}
              </Droppable>
            </TabsContent>

            <TabsContent value="layers" className="space-y-2">
              <Droppable droppableId="layers">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {components.map((comp, index) => (
                      <Draggable key={comp.id} draggableId={comp.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <Card className={`p-3 ${selectedId === comp.id ? 'border-blue-500' : ''} ${snapshot.isDragging ? 'shadow-lg' : ''}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                    <div className="w-6 h-6 text-gray-400 hover:text-gray-600">
                                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                                        <circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/>
                                        <circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/>
                                        <circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/>
                                      </svg>
                                    </div>
                                  </div>
                                  <div 
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => setSelectedId(comp.id)}
                                  >
                                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                      {getComponentIcon(comp.type)}
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{comp.type}</div>
                                      <div className="text-xs text-gray-500">
                                        {layoutType === 'absolute' 
                                          ? `x:${comp.position.x} y:${comp.position.y} z:${comp.position.zIndex}`
                                          : `Order: ${comp.position.order}`
                                        }
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {layoutType === 'flex' && (
                                    <>
                                      <Button size="sm" variant="ghost" onClick={() => moveComponent(comp.id, 'up')} disabled={index === 0}>
                                        <ChevronUp className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => moveComponent(comp.id, 'down')} disabled={index === components.length - 1}>
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button size="sm" variant="ghost" onClick={() => duplicateComponent(comp.id)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => deleteComponent(comp.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </TabsContent>

            {showJSON && (
              <TabsContent value="json">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-[600px]">
                  {JSON.stringify({ ...config, components }, null, 2)}
                </pre>
              </TabsContent>
            )}
          </Tabs>
          </div>
          
          {/* Quick Edit Panel - Separate Column */}
          {showQuickEdit && loadedTemplate && (
            <div className="w-80 border-l bg-white flex-shrink-0 overflow-y-auto">
              <QuickEditPanel
                template={loadedTemplate}
                components={components}
                onUpdate={handleQuickEditUpdate}
                onClose={() => setShowQuickEdit(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right: Properties Panel - ALWAYS VISIBLE */}
      <div className="w-96 min-w-[384px] max-w-[384px] flex-shrink-0 bg-white border-l flex flex-col shadow-lg overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
            <Square className="h-5 w-5 text-purple-600" />
            Properties
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {selectedComponent ? `Editing ${selectedComponent.type}` : 'No selection'}
          </p>
        </div>
        
        <ScrollArea className="flex-1 h-full">
          <div className="p-4">
            {selectedComponent ? (
              <PropertiesPanel
                component={selectedComponent}
                layoutType={layoutType}
                onChange={(updates) => updateComponent(selectedComponent.id, updates)}
                onDelete={() => deleteComponent(selectedComponent.id)}
              />
            ) : (
              <div className="text-center text-gray-400 mt-16 p-4">
                <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-200">
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-semibold mb-2 text-gray-700">No Component Selected</p>
                  <p className="text-sm text-gray-500">Click on a component in the canvas to edit its properties</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
    </DragDropContext>
    </>
  );
};

// Component Preview (simplified rendering)
// Component Preview (Industrial-level rendering)
const ComponentPreview = ({ component, showGrid = false }: { component: Component; showGrid?: boolean }) => {
  const { type, style, content } = component;

  const baseStyle: React.CSSProperties = {
    marginBottom: style.marginBottom || 0,
    opacity: component.visible === false ? 0.5 : 1,
  };

  switch (type) {
    case 'text':
      return (
        <div 
          style={{ 
            ...baseStyle,
            fontSize: style.fontSize || 16, 
            color: style.color || '#1F2937', 
            fontWeight: style.fontWeight || '400',
            fontStyle: style.fontStyle || 'normal',
            textDecoration: style.textDecoration || 'none',
            fontFamily: style.fontFamily || 'Inter',
            lineHeight: style.lineHeight || 1.5,
            textAlign: (style.textAlign || 'left') as any,
          }}
        >
          {content.text || 'Text'}
        </div>
      );
      
    case 'image':
      return (
        <div style={baseStyle}>
          <img 
            src={content.url || 'https://via.placeholder.com/300x200'} 
            alt={content.alt || 'Image'}
            style={{ 
              width: typeof style.width === 'number' ? `${style.width}px` : style.width || '100%',
              height: typeof style.height === 'number' ? `${style.height}px` : style.height || 'auto',
              borderRadius: style.borderRadius || 0,
              objectFit: (style.objectFit || 'cover') as any,
              filter: style.filter,
              display: 'block',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image';
            }}
          />
        </div>
      );
      
    case 'video':
      return (
        <div 
          style={{
            ...baseStyle,
            width: typeof style.width === 'number' ? `${style.width}px` : style.width || '100%',
            height: style.height || 200,
            borderRadius: style.borderRadius || 0,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {content.thumbnail ? (
            <img src={content.thumbnail} alt="Video thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Video className="h-12 w-12 text-white opacity-50" />
          )}
        </div>
      );
      
    case 'button':
      return (
        <button 
          style={{
            ...baseStyle,
            backgroundColor: style.backgroundColor || '#6366F1',
            color: style.textColor || '#FFFFFF',
            fontSize: style.fontSize || 16,
            fontWeight: style.fontWeight || '600',
            borderRadius: style.borderRadius || 8,
            padding: `${style.paddingVertical || 14}px ${style.paddingHorizontal || 24}px`,
            width: typeof style.width === 'number' ? `${style.width}px` : style.width || '100%',
            border: 'none',
            cursor: 'pointer',
            textAlign: (style.textAlign || 'center') as any,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {content.text || 'Button'}
        </button>
      );
      
    case 'input':
      return (
        <div style={baseStyle}>
          {content.label && (
            <label style={{ display: 'block', fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' }}>
              {content.label}
            </label>
          )}
          <input
            placeholder={content.placeholder || 'Enter text...'}
            style={{
              fontSize: style.fontSize || 15,
              color: style.color || '#1F2937',
              backgroundColor: style.backgroundColor || '#F9FAFB',
              borderRadius: style.borderRadius || 8,
              border: `${style.borderWidth || 1}px solid ${style.borderColor || '#D1D5DB'}`,
              padding: `${style.paddingVertical || 12}px ${style.paddingHorizontal || 16}px`,
              width: '100%',
              outline: 'none',
            }}
          />
        </div>
      );
      
    case 'container':
      return (
        <div 
          style={{
            ...baseStyle,
            backgroundColor: style.backgroundColor || '#F3F4F6',
            borderRadius: style.borderRadius || 12,
            padding: style.padding || 16,
            border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor || '#E5E7EB'}` : 'none',
          }}
        >
          <div className="text-sm text-gray-500 text-center">Container</div>
        </div>
      );
      
    case 'carousel':
      return (
        <div 
          style={{
            ...baseStyle,
            height: style.height || 200,
            borderRadius: style.borderRadius || 12,
            backgroundColor: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {content.items && content.items.length > 0 ? (
            <img 
              src={content.items[0].url} 
              alt="Carousel"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Carousel';
              }}
            />
          ) : (
            <Images className="h-12 w-12 text-gray-400" />
          )}
        </div>
      );
      
    case 'rating':
      return (
        <div style={baseStyle} className="flex gap-1">
          {Array.from({ length: content.stars || 5 }).map((_, i) => (
            <Star 
              key={i} 
              style={{ width: style.size || 28, height: style.size || 28 }}
              fill={i < (content.value || 0) ? (style.starColor || '#FBBF24') : (style.emptyStarColor || '#D1D5DB')} 
              color={i < (content.value || 0) ? (style.starColor || '#FBBF24') : (style.emptyStarColor || '#D1D5DB')}
            />
          ))}
        </div>
      );
    
    case 'shape':
      const shapeType = content.shapeType || 'rectangle';
      const shapeStyle: React.CSSProperties = {
        ...baseStyle,
        width: '100%',
        height: '100%',
        backgroundColor: style.backgroundColor || '#6366F1',
        border: `${style.borderWidth || 2}px solid ${style.borderColor || '#4F46E5'}`,
      };
      
      if (shapeType === 'circle') {
        shapeStyle.borderRadius = '50%';
      } else if (shapeType === 'rounded') {
        shapeStyle.borderRadius = style.borderRadius || 12;
      } else if (shapeType === 'triangle') {
        return (
          <div 
            style={{
              ...baseStyle,
              width: 0,
              height: 0,
              borderLeft: `50px solid transparent`,
              borderRight: `50px solid transparent`,
              borderBottom: `100px solid ${style.backgroundColor || '#6366F1'}`,
            }}
          />
        );
      } else {
        shapeStyle.borderRadius = style.borderRadius || 0;
      }
      
      return <div style={shapeStyle} />;
      
    case 'divider':
      return (
        <hr 
          style={{ 
            height: style.height || 1, 
            backgroundColor: style.color || '#E5E7EB', 
            border: 'none', 
            margin: `${style.marginTop || 12}px 0 ${style.marginBottom || 12}px 0` 
          }} 
        />
      );
      
    case 'spacer':
      return (
        <div 
          style={{ 
            height: style.height || 24, 
            width: '100%',
            backgroundColor: showGrid ? 'rgba(147, 197, 253, 0.1)' : 'transparent',
          }} 
        />
      );
      
    default:
      return (
        <div className="p-4 bg-gray-100 rounded text-center text-sm text-gray-600">
          {type}
        </div>
      );
  }
};

// Properties Panel - Separate Card-based Design
const PropertiesPanel = ({ component, layoutType, onChange, onDelete }: any) => {
  const updateStyle = (key: string, value: any) => {
    onChange({ style: { ...component.style, [key]: value } });
  };

  const updateContent = (key: string, value: any) => {
    onChange({ content: { ...component.content, [key]: value } });
  };

  const updatePosition = (key: string, value: any) => {
    onChange({ position: { ...component.position, [key]: value } });
  };

  const toggleVisibility = () => {
    onChange({ visible: !component.visible });
  };

  const toggleLock = () => {
    onChange({ locked: !component.locked });
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getComponentIcon(component.type)}
            <h3 className="font-bold text-base capitalize">{component.type}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={toggleVisibility}
              className="h-8 w-8 p-0"
              title={component.visible ? "Hide" : "Show"}
            >
              {component.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={toggleLock}
              className="h-8 w-8 p-0"
              title={component.locked ? "Unlock" : "Lock"}
            >
              {component.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={onDelete}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          ID: {component.id.substring(0, 12)}...
        </div>
      </Card>

      {/* Position Card */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Move className="h-4 w-4" />
          Position
        </h4>
        {layoutType === 'absolute' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-600">X Position</Label>
                <Input 
                  type="number" 
                  value={component.position.x || 0}
                  onChange={(e) => updatePosition('x', parseInt(e.target.value) || 0)}
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Y Position</Label>
                <Input 
                  type="number" 
                  value={component.position.y || 0}
                  onChange={(e) => updatePosition('y', parseInt(e.target.value) || 0)}
                  className="h-9 mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-600">Width</Label>
                <Input 
                  value={component.position.width || ''}
                  onChange={(e) => updatePosition('width', e.target.value)}
                  placeholder="200 or 100%"
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Height</Label>
                <Input 
                  value={component.position.height || 'auto'}
                  onChange={(e) => updatePosition('height', e.target.value)}
                  placeholder="auto or 100"
                  className="h-9 mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Layer (Z-Index)</Label>
              <Input 
                type="number" 
                value={component.position.zIndex || 1}
                onChange={(e) => updatePosition('zIndex', parseInt(e.target.value) || 1)}
                className="h-9 mt-1"
              />
            </div>
          </div>
        ) : (
          <div>
            <Label className="text-xs text-gray-600">Order in Stack</Label>
            <Input 
              type="number" 
              value={component.position.order || 0}
              onChange={(e) => updatePosition('order', parseInt(e.target.value) || 0)}
              className="h-9 mt-1"
            />
          </div>
        )}
      </Card>

      {/* Content Card */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Type className="h-4 w-4" />
          Content
        </h4>
        <div className="space-y-3">
          {component.type === 'text' && (
            <div>
              <Label className="text-xs text-gray-600">Text Content</Label>
              <Textarea 
                value={component.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                className="mt-1 min-h-[80px]"
                placeholder="Enter your text..."
              />
            </div>
          )}
          
          {(component.type === 'image' || component.type === 'video') && (
            <div>
              <Label className="text-xs text-gray-600">Media URL</Label>
              <Input 
                value={component.content.url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-9 mt-1"
              />
            </div>
          )}
          
          {component.type === 'button' && (
            <>
              <div>
                <Label className="text-xs text-gray-600">Button Label</Label>
                <Input 
                  value={component.content.text || ''}
                  onChange={(e) => updateContent('text', e.target.value)}
                  className="h-9 mt-1"
                  placeholder="Click Me"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Action ID</Label>
                <Input 
                  value={component.content.action || ''}
                  onChange={(e) => updateContent('action', e.target.value)}
                  className="h-9 mt-1"
                  placeholder="button_action"
                />
              </div>
            </>
          )}
          
          {component.type === 'input' && (
            <>
              <div>
                <Label className="text-xs text-gray-600">Field Label</Label>
                <Input 
                  value={component.content.label || ''}
                  onChange={(e) => updateContent('label', e.target.value)}
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Placeholder</Label>
                <Input 
                  value={component.content.placeholder || ''}
                  onChange={(e) => updateContent('placeholder', e.target.value)}
                  className="h-9 mt-1"
                  placeholder="Enter text..."
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Field Name</Label>
                <Input 
                  value={component.content.name || ''}
                  onChange={(e) => updateContent('name', e.target.value)}
                  className="h-9 mt-1"
                  placeholder="field_name"
                />
              </div>
            </>
          )}
          
          {component.type === 'rating' && (
            <>
              <div>
                <Label className="text-xs text-gray-600">Total Stars</Label>
                <Input 
                  type="number" 
                  value={component.content.stars || 5}
                  onChange={(e) => updateContent('stars', parseInt(e.target.value) || 5)}
                  className="h-9 mt-1"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Default Value</Label>
                <Input 
                  type="number" 
                  value={component.content.value || 0}
                  onChange={(e) => updateContent('value', parseInt(e.target.value) || 0)}
                  className="h-9 mt-1"
                  min="0"
                  max={component.content.stars || 5}
                />
              </div>
            </>
          )}
          
          {component.type === 'shape' && (
            <div>
              <Label className="text-xs text-gray-600">Shape Type</Label>
              <Select 
                value={component.content.shapeType || 'rectangle'} 
                onValueChange={(value) => updateContent('shapeType', value)}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Style Card */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Styling
        </h4>
        <div className="space-y-3">
          {/* Font Family - Text only */}
          {component.type === 'text' && (
            <div>
              <Label className="text-xs text-gray-600">Font Family</Label>
              <Select 
                value={component.style.fontFamily || 'Inter'} 
                onValueChange={(value) => updateStyle('fontFamily', value)}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Font Size */}
          {['text', 'button', 'input'].includes(component.type) && (
            <div>
              <Label className="text-xs text-gray-600">Font Size (px)</Label>
              <Input 
                type="number" 
                value={component.style.fontSize || 16}
                onChange={(e) => updateStyle('fontSize', parseInt(e.target.value) || 16)}
                className="h-9 mt-1"
                min="8"
                max="72"
              />
            </div>
          )}

          {/* Font Weight - Text only */}
          {component.type === 'text' && (
            <div>
              <Label className="text-xs text-gray-600">Font Weight</Label>
              <Select 
                value={component.style.fontWeight || '400'} 
                onValueChange={(value) => updateStyle('fontWeight', value)}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Thin (100)</SelectItem>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Regular (400)</SelectItem>
                  <SelectItem value="600">Semibold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                  <SelectItem value="900">Black (900)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Font Style - Text only */}
          {component.type === 'text' && (
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-600 flex-1">Font Style</Label>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={component.style.fontStyle === 'italic' ? 'default' : 'outline'}
                    className="h-8 w-8 p-0"
                    onClick={() => updateStyle('fontStyle', component.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                  >
                    <em>I</em>
                  </Button>
                  <Button
                    size="sm"
                    variant={component.style.textDecoration === 'underline' ? 'default' : 'outline'}
                    className="h-8 w-8 p-0"
                    onClick={() => updateStyle('textDecoration', component.style.textDecoration === 'underline' ? 'none' : 'underline')}
                  >
                    <u>U</u>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Line Height - Text only */}
          {component.type === 'text' && (
            <div>
              <Label className="text-xs text-gray-600">Line Height</Label>
              <Input 
                type="number" 
                value={component.style.lineHeight || 1.5}
                onChange={(e) => updateStyle('lineHeight', parseFloat(e.target.value) || 1.5)}
                className="h-9 mt-1"
                min="1"
                max="3"
                step="0.1"
              />
            </div>
          )}

          {/* Text Align - Text only */}
          {component.type === 'text' && (
            <div>
              <Label className="text-xs text-gray-600">Text Align</Label>
              <div className="flex gap-1 mt-1">
                <Button
                  size="sm"
                  variant={component.style.textAlign === 'left' ? 'default' : 'outline'}
                  className="flex-1 h-9"
                  onClick={() => updateStyle('textAlign', 'left')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={component.style.textAlign === 'center' ? 'default' : 'outline'}
                  className="flex-1 h-9"
                  onClick={() => updateStyle('textAlign', 'center')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={component.style.textAlign === 'right' ? 'default' : 'outline'}
                  className="flex-1 h-9"
                  onClick={() => updateStyle('textAlign', 'right')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Text Color */}
          {['text', 'button'].includes(component.type) && (
            <div>
              <Label className="text-xs text-gray-600">Text Color</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  type="color" 
                  value={component.style.color || component.style.textColor || '#000000'}
                  onChange={(e) => updateStyle(component.type === 'button' ? 'textColor' : 'color', e.target.value)}
                  className="w-14 h-9 p-1 cursor-pointer"
                />
                <Input 
                  value={component.style.color || component.style.textColor || '#000000'}
                  onChange={(e) => updateStyle(component.type === 'button' ? 'textColor' : 'color', e.target.value)}
                  className="flex-1 h-9"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}

          {/* Background Color */}
          {['button', 'input', 'container', 'image', 'shape'].includes(component.type) && (
            <div>
              <Label className="text-xs text-gray-600">Background Color</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  type="color" 
                  value={component.style.backgroundColor || '#FFFFFF'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-14 h-9 p-1 cursor-pointer"
                />
                <Input 
                  value={component.style.backgroundColor || '#FFFFFF'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="flex-1 h-9"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          )}

          {/* Border Width */}
          {['button', 'container', 'shape'].includes(component.type) && (
            <div>
              <Label className="text-xs text-gray-600">Border Width (px)</Label>
              <Input 
                type="number" 
                value={component.style.borderWidth || 0}
                onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value) || 0)}
                className="h-9 mt-1"
                min="0"
                max="20"
              />
            </div>
          )}

          {/* Border Color */}
          {['button', 'container', 'shape'].includes(component.type) && (
            <div>
              <Label className="text-xs text-gray-600">Border Color</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  type="color" 
                  value={component.style.borderColor || '#000000'}
                  onChange={(e) => updateStyle('borderColor', e.target.value)}
                  className="w-14 h-9 p-1 cursor-pointer"
                />
                <Input 
                  value={component.style.borderColor || '#000000'}
                  onChange={(e) => updateStyle('borderColor', e.target.value)}
                  className="flex-1 h-9"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
          
          {/* Border Radius */}
          {['button', 'input', 'container', 'image', 'video'].includes(component.type) && (
            <div>
              <Label className="text-xs text-gray-600">Border Radius (px)</Label>
              <Input 
                type="number" 
                value={component.style.borderRadius || 0}
                onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value) || 0)}
                className="h-9 mt-1"
                min="0"
                max="50"
              />
            </div>
          )}

          {/* Image Filters */}
          {component.type === 'image' && (
            <div>
              <Label className="text-xs text-gray-600">Filter</Label>
              <Select 
                value={component.style.filter || 'none'} 
                onValueChange={(value) => updateStyle('filter', value === 'none' ? undefined : value)}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue placeholder="No filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="grayscale(100%)">Grayscale</SelectItem>
                  <SelectItem value="sepia(100%)">Sepia</SelectItem>
                  <SelectItem value="brightness(150%)">Bright</SelectItem>
                  <SelectItem value="brightness(50%)">Dark</SelectItem>
                  <SelectItem value="blur(3px)">Blur</SelectItem>
                  <SelectItem value="contrast(200%)">High Contrast</SelectItem>
                  <SelectItem value="saturate(200%)">Saturated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Object Fit - Image only */}
          {component.type === 'image' && (
            <div>
              <Label className="text-xs text-gray-600">Image Fit</Label>
              <Select 
                value={component.style.objectFit || 'cover'} 
                onValueChange={(value) => updateStyle('objectFit', value)}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Margin Bottom */}
          <div>
            <Label className="text-xs text-gray-600">Margin Bottom (px)</Label>
            <Input 
              type="number" 
              value={component.style.marginBottom || 0}
              onChange={(e) => updateStyle('marginBottom', parseInt(e.target.value) || 0)}
              className="h-9 mt-1"
              min="0"
              max="100"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

const getComponentIcon = (type: string) => {
  const icons: Record<string, any> = {
    text: <Type className="h-4 w-4" />,
    image: <ImageIcon className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    button: <Square className="h-4 w-4" />,
    input: <Mail className="h-4 w-4" />,
    container: <ContainerIcon className="h-4 w-4" />,
    carousel: <Images className="h-4 w-4" />,
    rating: <Star className="h-4 w-4" />,
    divider: <Minus className="h-4 w-4" />,
    spacer: <Space className="h-4 w-4" />,
  };
  return icons[type] || <Square className="h-4 w-4" />;
};
