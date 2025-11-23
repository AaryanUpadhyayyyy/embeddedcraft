import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Layers, Code } from 'lucide-react';
import { useBottomSheetState } from './hooks/useBottomSheetState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { CANVAS_CONSTANTS } from './core/constants';
import { validateImportedConfig } from './core/validation';
import ComponentPalette from './components/Panels/ComponentPalette';
import PropertiesPanel from './components/Panels/PropertiesPanel';
import Toolbar from './components/Toolbar/Toolbar';
import Canvas from './components/Canvas/Canvas';

/**
 * BottomSheetEditor V2 - Complete Rebuild
 * 
 * Clean separation of concerns:
 * - State management via useBottomSheetState hook
 * - Geometry/validation in pure functions
 * - Component rendering shared between Canvas and Preview
 * - Type-safe with Zod schemas
 * 
 * Main improvements over V1:
 * - ✅ Canvas height syncs perfectly with preview
 * - ✅ Rotation-aware bounding boxes
 * - ✅ No type coercion bugs
 * - ✅ Centralized state management
 * - ✅ Clean component structure (< 300 lines)
 */

interface BottomSheetEditorProps {
  config: any;
  onChange: (config: any) => void;
}

export type { BottomSheetEditorProps };

export const BottomSheetEditor: React.FC<BottomSheetEditorProps> = ({
  config,
  onChange,
}) => {
  // Centralized state management
  const state = useBottomSheetState(config);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: state.undo,
    onRedo: state.redo,
    onDelete: () => {
      if (state.selectedIds.length > 0) {
        state.deleteSelected();
      }
    },
    onDuplicate: () => {
      if (state.selectedIds.length === 1) {
        state.duplicateComponent(state.selectedIds[0]);
      }
    },
    onMove: (dx, dy) => {
      if (state.selectedIds.length === 1) {
        const component = state.components.find(c => c.id === state.selectedIds[0]);
        if (component) {
          state.updateComponent(state.selectedIds[0], {
            position: {
              ...component.position,
              x: Math.max(0, Math.min(CANVAS_CONSTANTS.WIDTH - component.position.width, component.position.x + dx)),
              y: Math.max(0, component.position.y + dy),
            },
          });
        }
      }
    },
    onSelectAll: state.selectAll,
    onDeselect: state.clearSelection,
    enabled: !state.isEditingText,
  });

  // Sync state changes to parent
  React.useEffect(() => {
    onChange({
      type: 'bottom_sheet',
      layout: {
        type: state.layoutType,
        width: CANVAS_CONSTANTS.WIDTH,
        height: state.canvasHeight,
        ...(state.layoutType === 'flex' ? { padding: 24, scrollable: true } : {}),
      },
      canvasHeight: state.canvasHeight,
      components: state.components,
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
    });
  }, [state.components, state.canvasHeight, state.layoutType, onChange]);

  // Export JSON
  const exportJSON = () => {
    const json = JSON.stringify(
      {
        type: 'bottom_sheet',
        layout: {
          type: state.layoutType,
          width: CANVAS_CONSTANTS.WIDTH,
          height: state.canvasHeight,
        },
        canvasHeight: state.canvasHeight,
        components: state.components,
      },
      null,
      2
    );
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bottom-sheet-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validated = validateImportedConfig(json);
        
        if (validated.success && validated.data) {
          state.setComponentsWithHistory(validated.data.components);
          state.updateCanvasHeight(validated.data.canvasHeight);
          state.setLayoutType(validated.data.layoutType);
        } else {
          alert(`Invalid JSON: ${validated.error?.message}`);
        }
      } catch (error) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Handle drag-and-drop for component reordering
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Dragging from palette to canvas
    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      const componentType = draggableId.replace('palette-', '');
      state.addComponent(componentType as any);
      return;
    }

    // Reordering in layers panel
    if (source.droppableId === 'layers' && destination.droppableId === 'layers') {
      const reordered = [...state.components];
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      state.reorderComponents(reordered);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-[calc(100vh-200px)] min-h-[600px] w-full bg-gray-50 overflow-x-auto">
        {/* Left: Component Palette */}
        <ComponentPalette state={state} />

        {/* Center: Canvas Area */}
        <div className="flex-1 flex flex-col bg-white border-r">
          {/* Toolbar */}
          <Toolbar state={state} onExport={exportJSON} onImport={importJSON} />

          {/* Canvas with Tabs */}
          <Tabs defaultValue="canvas" className="flex-1 flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="canvas" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Canvas
                </TabsTrigger>
                <TabsTrigger value="layers" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Layers ({state.components.length})
                </TabsTrigger>
                {state.showJSON && (
                  <TabsTrigger value="json" className="gap-2">
                    <Code className="h-4 w-4" />
                    JSON
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="canvas" className="flex-1 flex items-center justify-center p-8 mt-0">
              <Canvas state={state} />
            </TabsContent>

            <TabsContent value="layers" className="p-6 space-y-2 mt-0">
              <div className="text-sm text-gray-600">
                Layers panel coming soon - {state.components.length} components
              </div>
            </TabsContent>

            {state.showJSON && (
              <TabsContent value="json" className="p-6 mt-0">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-[600px]">
                  {JSON.stringify(
                    {
                      type: 'bottom_sheet',
                      canvasHeight: state.canvasHeight,
                      components: state.components,
                    },
                    null,
                    2
                  )}
                </pre>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right: Properties Panel */}
        <div className="w-96 min-w-[384px] max-w-[384px] flex-shrink-0 bg-white border-l flex flex-col shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="font-bold text-lg text-gray-800">Properties</h3>
            <p className="text-xs text-gray-600 mt-1">
              {state.selectedComponent
                ? `Editing ${state.selectedComponent.type}`
                : state.selectedIds.length > 1
                ? `${state.selectedIds.length} components selected`
                : 'No selection'}
            </p>
          </div>

          <PropertiesPanel state={state} />
        </div>
      </div>
    </DragDropContext>
  );
};

export default BottomSheetEditor;
