import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { ResizableBox } from 'react-resizable';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import { CANVAS_CONSTANTS } from '../../core/constants';
import CanvasComponent from './CanvasComponent';

interface CanvasProps {
  state: BottomSheetState;
}

/**
 * Canvas - Main drawing area for the bottom sheet.
 * Features:
 * - Resizable height (bottom handle only)
 * - Grid background (toggle-able)
 * - Zoom support
 * - Drop zone for components
 * - Handle bar at top
 * - Selection rectangle for multi-select
 */
export const Canvas: React.FC<CanvasProps> = ({ state }) => {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingRect, setIsDraggingRect] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start selection rect if clicking on canvas background
    if (e.target === e.currentTarget) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top - 32; // Account for handle bar

      setIsDraggingRect(true);
      state.setSelectionRect({
        startX,
        startY,
        endX: startX,
        endY: startY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRect || !state.selectionRect) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top - 32;

    state.setSelectionRect({
      ...state.selectionRect,
      endX,
      endY,
    });
  };

  const handleMouseUp = () => {
    if (!isDraggingRect || !state.selectionRect) return;

    const { startX, startY, endX, endY } = state.selectionRect;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width > 5 && height > 5) {
      state.selectInRect({ x, y, width, height });
    }

    setIsDraggingRect(false);
    state.setSelectionRect(null);
  };

  return (
    <Droppable droppableId="canvas">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            transform: `scale(${state.zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s',
          }}
        >
          {/* Bottom Sheet Canvas - Resizable Height */}
          <ResizableBox
            width={CANVAS_CONSTANTS.WIDTH}
            height={state.canvasHeight}
            minConstraints={[CANVAS_CONSTANTS.WIDTH, CANVAS_CONSTANTS.MIN_HEIGHT]}
            maxConstraints={[CANVAS_CONSTANTS.WIDTH, CANVAS_CONSTANTS.MAX_HEIGHT]}
            resizeHandles={['s']}
            onResizeStop={(e, data) => {
              state.updateCanvasHeight(data.size.height);
            }}
            className="mx-auto"
          >
            <div
              ref={canvasRef}
              className={`w-full bg-white shadow-2xl relative ${
                snapshot.isDraggingOver ? 'ring-4 ring-blue-400 ring-offset-4' : ''
              }`}
              style={{
                height: state.canvasHeight,
                minHeight: state.canvasHeight,
                maxHeight: state.canvasHeight,
                overflowY: 'visible',
                overflowX: 'visible',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                backgroundImage: state.showGrid
                  ? `
                    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
                    linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
                  `
                  : 'none',
                backgroundSize: state.showGrid
                  ? `5px 5px, 5px 5px, 25px 25px, 25px 25px`
                  : 'auto',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  state.clearSelection();
                }
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDraggingRect) {
                  handleMouseUp();
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
                  height: state.canvasHeight - CANVAS_CONSTANTS.HANDLE_BAR_HEIGHT,
                  minHeight: state.canvasHeight - CANVAS_CONSTANTS.HANDLE_BAR_HEIGHT,
                  padding: 0,
                }}
              >
                {state.components.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center p-8">
                      <Plus className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-1">Empty Canvas</p>
                      <p className="text-sm">Drag components from the palette or click to add</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {state.sortedComponents.map((comp) => (
                      <CanvasComponent
                        key={comp.id}
                        component={comp}
                        state={state}
                        showGrid={state.showGrid}
                      />
                    ))}

                    {/* Selection Rectangle */}
                    {state.selectionRect && (
                      <div
                        style={{
                          position: 'absolute',
                          left: Math.min(state.selectionRect.startX, state.selectionRect.endX),
                          top: Math.min(state.selectionRect.startY, state.selectionRect.endY),
                          width: Math.abs(state.selectionRect.endX - state.selectionRect.startX),
                          height: Math.abs(state.selectionRect.endY - state.selectionRect.startY),
                          border: '2px dashed #6366F1',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          pointerEvents: 'none',
                          zIndex: 9999,
                        }}
                      />
                    )}

                    {/* Alignment Guides */}
                    {state.alignmentGuides.map((guide, index) => (
                      <div
                        key={`${guide.type}-${guide.position}-${index}`}
                        style={{
                          position: 'absolute',
                          ...(guide.type === 'vertical'
                            ? {
                                left: guide.position,
                                top: 0,
                                width: '1px',
                                height: '100%',
                              }
                            : {
                                left: 0,
                                top: guide.position,
                                width: '100%',
                                height: '1px',
                              }),
                          backgroundColor: '#EC4899', // Pink like Figma
                          pointerEvents: 'none',
                          zIndex: 9998,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {provided.placeholder}
            </div>
          </ResizableBox>
        </div>
      )}
    </Droppable>
  );
};

export default Canvas;
