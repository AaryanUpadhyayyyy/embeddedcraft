import React from 'react';
import ReactDraggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { Lock, Eye, EyeOff } from 'lucide-react';
import type { Component } from '../../core/types';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import { calculateDragBounds } from '../../core/geometry';
import { CANVAS_CONSTANTS, COMPONENT_CONSTRAINTS } from '../../core/constants';
import { detectAlignmentGuides, applySnap } from '../../utils/alignmentGuides';
import ComponentRenderer from './ComponentRenderer';

interface CanvasComponentProps {
  component: Component;
  state: BottomSheetState;
  showGrid: boolean;
}

/**
 * CanvasComponent - Draggable and resizable wrapper for each component.
 * Handles:
 * - Drag and drop positioning
 * - Resize with handles
 * - Rotation (via transform)
 * - Selection state
 * - Lock/visibility states
 */
export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  component,
  state,
  showGrid,
}) => {
  const width = typeof component.position.width === 'number' ? component.position.width : 300;
  const height = typeof component.position.height === 'number' ? component.position.height : 60;
  const isSelected = state.selectedIds.includes(component.id);
  const isLocked = component.locked;

  // ✅ CRITICAL FIX: Component-specific minimum sizes (was 50x30 for all types)
  const minSizesMap: any = COMPONENT_CONSTRAINTS.MIN_SIZES;
  const minSize = minSizesMap[component.type] || {
    width: 20,
    height: 20,
  };

  // Calculate drag bounds dynamically based on canvas height
  const dragBounds = calculateDragBounds(
    width,
    height,
    CANVAS_CONSTANTS.WIDTH,
    state.canvasHeight,
    CANVAS_CONSTANTS.HANDLE_BAR_HEIGHT
  );

  return (
    <ReactDraggable
      disabled={isLocked}
      position={{
        x: component.position.x || 0,
        y: component.position.y || 0,
      }}
      onStart={(e) => {
        if (!isLocked) {
          // Check for Ctrl/Cmd key for additive selection
          const event = e as unknown as MouseEvent;
          const additive = event.ctrlKey || event.metaKey;
          state.toggleSelection(component.id, additive);
          state.setIsDragging(true);
          state.setAlignmentGuides([]); // Clear guides on start
        }
      }}
      onDrag={(e, data) => {
        // Create temporary component with new position for alignment detection
        const tempComponent: Component = {
          ...component,
          position: {
            ...component.position,
            x: data.x,
            y: data.y,
          },
        };

        // Detect alignment with other components
        const otherComponents = state.components.filter(c => c.id !== component.id);
        const { guides, snapPosition } = detectAlignmentGuides(tempComponent, otherComponents);

        // Update alignment guides for rendering
        state.setAlignmentGuides(guides);

        // Apply snap if detected
        const finalPosition = applySnap({ x: data.x, y: data.y }, snapPosition);
        state.updateComponentPosition(component.id, finalPosition.x, finalPosition.y);
      }}
      onStop={(e, data) => {
        state.setIsDragging(false);
        state.setAlignmentGuides([]); // Clear guides on stop

        // Final position update
        const tempComponent: Component = {
          ...component,
          position: {
            ...component.position,
            x: data.x,
            y: data.y,
          },
        };

        const otherComponents = state.components.filter(c => c.id !== component.id);
        const { snapPosition } = detectAlignmentGuides(tempComponent, otherComponents);
        const finalPosition = applySnap({ x: data.x, y: data.y }, snapPosition);
        
        state.updateComponentPosition(component.id, finalPosition.x, finalPosition.y);
      }}
      grid={showGrid ? [CANVAS_CONSTANTS.GRID_SIZE, CANVAS_CONSTANTS.GRID_SIZE] : [1, 1]}
      bounds={dragBounds}
    >
      <div
        style={{
          position: 'absolute',
          zIndex: component.position.zIndex || 1,
        }}
      >
        <ResizableBox
          width={width}
          height={height}
          minConstraints={[minSize.width, minSize.height]} // ✅ FIX: Component-specific (was 50x30)
          maxConstraints={[CANVAS_CONSTANTS.WIDTH - 50, state.canvasHeight - 100]}
          resizeHandles={
            isSelected && !isLocked
              ? ['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']
              : []
          }
          onResizeStop={(e, data) => {
            state.updateComponentSize(component.id, data.size.width, data.size.height);
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isLocked) {
                const additive = e.ctrlKey || e.metaKey;
                state.toggleSelection(component.id, additive);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (component.type === 'text' && !isLocked) {
                state.setIsEditingText(component.id);
              }
            }}
            className={`
              h-full w-full relative
              ${isLocked ? 'cursor-not-allowed' : 'cursor-move'}
              transition-all
              ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg'
                  : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'
              }
            `}
            style={{
              opacity: isLocked ? 0.7 : component.visible === false ? 0.5 : 1,
              transform: `rotate(${component.position.rotation || 0}deg)`,
            }}
          >
            {/* Selection Badge */}
            {isSelected && (
              <div className="absolute -top-7 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-t flex items-center gap-1 z-50">
                <span className="font-medium capitalize">{component.type}</span>
                {isLocked && <Lock className="h-3 w-3" />}
                {component.visible === false && <EyeOff className="h-3 w-3" />}
              </div>
            )}

            {/* Component Content */}
            {state.isEditingText === component.id && component.type === 'text' ? (
              <input
                type="text"
                value={String(component.content.text || '')}
                onChange={(e) => {
                  state.updateComponent(component.id, {
                    content: { ...component.content, text: e.target.value },
                  });
                }}
                onBlur={() => state.setIsEditingText(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    state.setIsEditingText(null);
                  }
                }}
                autoFocus
                className="w-full h-full px-2 py-1 border-2 border-blue-500 rounded outline-none"
                style={{
                  fontSize: Number(component.style?.fontSize) || 16,
                  color: String(component.style?.color) || '#1F2937',
                  fontWeight: String(component.style?.fontWeight) || '400',
                  textAlign: String(component.style?.textAlign || 'left') as any,
                }}
              />
            ) : (
              <div className="w-full h-full overflow-hidden">
                <ComponentRenderer 
                  component={component} 
                  showGrid={showGrid}
                  previewAnimationId={state.animationPreview}
                />
              </div>
            )}
          </div>
        </ResizableBox>
      </div>
    </ReactDraggable>
  );
};

export default React.memo(CanvasComponent);
