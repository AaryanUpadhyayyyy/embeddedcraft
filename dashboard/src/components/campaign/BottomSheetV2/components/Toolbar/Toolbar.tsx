import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Upload,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Undo,
  Redo,
} from 'lucide-react';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import { CANVAS_CONSTANTS } from '../../core/constants';
import { alignLeft, alignCenter, alignRight } from '../../core/geometry';

interface ToolbarProps {
  state: BottomSheetState;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Toolbar - Top bar with actions and controls.
 * Features:
 * - Export/Import JSON
 * - Grid toggle
 * - Zoom controls
 * - Height slider
 * - Alignment tools (when component selected)
 * - JSON view toggle
 */
export const Toolbar: React.FC<ToolbarProps> = ({ state, onExport, onImport }) => {
  return (
    <div className="h-16 bg-gradient-to-r from-gray-50 to-white border-b px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        {/* Export/Import */}
        <Button size="sm" variant="outline" onClick={onExport} className="shadow-sm hover:shadow">
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
          <input type="file" accept=".json" className="hidden" onChange={onImport} />
        </label>

        <Separator orientation="vertical" className="h-8" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={state.undo}
            disabled={!state.canUndo}
            className="h-8 w-8 p-0"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={state.redo}
            disabled={!state.canRedo}
            className="h-8 w-8 p-0"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Selection Info */}
        {state.selectedIds.length > 0 && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700">
              {state.selectedIds.length} selected
            </div>
            <Separator orientation="vertical" className="h-8" />
          </>
        )}

        {/* Alignment Tools - Show when component selected */}
        {state.selectedComponent && (
          <>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  state.updateComponent(state.selectedComponent!.id, {
                    position: {
                      ...state.selectedComponent!.position,
                      x: alignLeft(),
                    },
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
                  const width =
                    typeof state.selectedComponent!.position.width === 'number'
                      ? state.selectedComponent!.position.width
                      : 300;
                  state.updateComponent(state.selectedComponent!.id, {
                    position: {
                      ...state.selectedComponent!.position,
                      x: alignCenter(width, CANVAS_CONSTANTS.WIDTH),
                    },
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
                  const width =
                    typeof state.selectedComponent!.position.width === 'number'
                      ? state.selectedComponent!.position.width
                      : 300;
                  state.updateComponent(state.selectedComponent!.id, {
                    position: {
                      ...state.selectedComponent!.position,
                      x: alignRight(width, CANVAS_CONSTANTS.WIDTH),
                    },
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

        {/* Grid Toggle */}
        <Button
          size="sm"
          variant={state.showGrid ? 'default' : 'outline'}
          onClick={state.toggleGrid}
          className="shadow-sm"
          title="Toggle Grid"
        >
          <Grid3x3 className="h-4 w-4 mr-2" />
          Grid
        </Button>

        {/* Canvas Height Control */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
          <Maximize2 className="h-4 w-4 text-gray-600" />
          <span className="text-xs font-medium text-gray-600 min-w-[45px]">Height:</span>
          <Slider
            value={[state.canvasHeight]}
            onValueChange={([value]) => state.updateCanvasHeight(value)}
            min={CANVAS_CONSTANTS.MIN_HEIGHT}
            max={CANVAS_CONSTANTS.MAX_HEIGHT}
            step={10}
            className="w-24"
          />
          <span className="text-sm font-bold text-blue-600 min-w-[50px] text-right">
            {state.canvasHeight}px
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => state.updateZoom(state.zoom - 10)}
            disabled={state.zoom <= CANVAS_CONSTANTS.MIN_ZOOM}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold w-16 text-center">{state.zoom}%</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => state.updateZoom(state.zoom + 10)}
            disabled={state.zoom >= CANVAS_CONSTANTS.MAX_ZOOM}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={state.resetZoom}
          className="h-8 w-8 p-0"
          title="Reset Zoom"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* JSON Toggle */}
        <Button
          size="sm"
          variant={state.showJSON ? 'default' : 'outline'}
          onClick={() => state.setShowJSON(!state.showJSON)}
          className="shadow-sm"
        >
          <Code className="h-4 w-4 mr-2" />
          JSON
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
