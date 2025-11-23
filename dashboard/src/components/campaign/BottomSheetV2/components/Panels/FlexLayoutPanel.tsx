import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  AlignHorizontalSpaceAround, 
  AlignHorizontalSpaceBetween, 
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  AlignVerticalSpaceAround,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  Maximize2,
} from 'lucide-react';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface FlexLayoutPanelProps {
  state: BottomSheetState;
}

/**
 * FlexLayoutPanel - Auto-Layout (Flexbox) Controls
 * 
 * Features:
 * - Enable/disable flex layout
 * - Direction: row, column, row-reverse, column-reverse
 * - Gap: spacing between children (0-100px)
 * - Padding: container padding (top/right/bottom/left)
 * - Align Items: flex-start, center, flex-end, stretch, baseline
 * - Justify Content: flex-start, center, flex-end, space-between, space-around, space-evenly
 * - Flex Wrap: nowrap, wrap, wrap-reverse
 * - Child sizing: hug, fill, fixed
 */
export const FlexLayoutPanel: React.FC<FlexLayoutPanelProps> = ({ state }) => {
  const { selectedComponent, updateComponent } = state;

  if (!selectedComponent) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Select a component to configure flex layout
      </div>
    );
  }

  // Only containers and certain components can have flex layout
  const canHaveFlexLayout = selectedComponent.type === 'container' || 
                           selectedComponent.childIds && selectedComponent.childIds.length > 0;

  if (!canHaveFlexLayout) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Only containers can use flex layout.<br />
        Try selecting a container component.
      </div>
    );
  }

  const flexLayout = selectedComponent.flexLayout || {
    enabled: false,
    direction: 'column' as const,
    gap: 12,
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
    flexWrap: 'nowrap' as const,
  };

  const handleToggleFlex = (enabled: boolean) => {
    updateComponent(selectedComponent.id, {
      flexLayout: { ...flexLayout, enabled },
    });
  };

  const handleDirectionChange = (direction: string) => {
    updateComponent(selectedComponent.id, {
      flexLayout: { ...flexLayout, direction: direction as any },
    });
  };

  const handleGapChange = (value: number[]) => {
    updateComponent(selectedComponent.id, {
      flexLayout: { ...flexLayout, gap: value[0] },
    });
  };

  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', value: number[]) => {
    updateComponent(selectedComponent.id, {
      flexLayout: {
        ...flexLayout,
        padding: {
          ...(flexLayout.padding || { top: 16, right: 16, bottom: 16, left: 16 }),
          [side]: value[0],
        },
      },
    });
  };

  const handleAlignItemsChange = (value: string) => {
    updateComponent(selectedComponent.id, {
      flexLayout: { ...flexLayout, alignItems: value as any },
    });
  };

  const handleJustifyContentChange = (value: string) => {
    updateComponent(selectedComponent.id, {
      flexLayout: { ...flexLayout, justifyContent: value as any },
    });
  };

  const handleWrapChange = (value: string) => {
    updateComponent(selectedComponent.id, {
      flexLayout: { ...flexLayout, flexWrap: value as any },
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Enable/Disable Flex Layout */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Auto-Layout</Label>
          <p className="text-xs text-gray-500 mt-1">
            Automatically arrange child components
          </p>
        </div>
        <Switch
          checked={flexLayout.enabled}
          onCheckedChange={handleToggleFlex}
        />
      </div>

      {!flexLayout.enabled && (
        <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          Enable Auto-Layout to automatically arrange child components
        </div>
      )}

      {flexLayout.enabled && (
        <>
          <Separator />

          {/* Direction */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Direction</Label>
            <ToggleGroup
              type="single"
              value={flexLayout.direction}
              onValueChange={handleDirectionChange}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem value="row" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span className="text-xs">Row</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="column" className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                <span className="text-xs">Column</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="row-reverse" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs">Row ←</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="column-reverse" className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" />
                <span className="text-xs">Column ↑</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator />

          {/* Gap */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Gap</Label>
              <span className="text-xs text-gray-500">{flexLayout.gap}px</span>
            </div>
            <Slider
              value={[flexLayout.gap]}
              onValueChange={handleGapChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          <Separator />

          {/* Padding */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Padding</Label>
            
            {/* Top */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Top</span>
                <span className="text-xs text-gray-500">{flexLayout.padding?.top || 16}px</span>
              </div>
              <Slider
                value={[flexLayout.padding?.top || 16]}
                onValueChange={(v) => handlePaddingChange('top', v)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Right */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Right</span>
                <span className="text-xs text-gray-500">{flexLayout.padding?.right || 16}px</span>
              </div>
              <Slider
                value={[flexLayout.padding?.right || 16]}
                onValueChange={(v) => handlePaddingChange('right', v)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Bottom */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Bottom</span>
                <span className="text-xs text-gray-500">{flexLayout.padding?.bottom || 16}px</span>
              </div>
              <Slider
                value={[flexLayout.padding?.bottom || 16]}
                onValueChange={(v) => handlePaddingChange('bottom', v)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Left */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Left</span>
                <span className="text-xs text-gray-500">{flexLayout.padding?.left || 16}px</span>
              </div>
              <Slider
                value={[flexLayout.padding?.left || 16]}
                onValueChange={(v) => handlePaddingChange('left', v)}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </div>

          <Separator />

          {/* Align Items */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Align Items</Label>
            <ToggleGroup
              type="single"
              value={flexLayout.alignItems}
              onValueChange={handleAlignItemsChange}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem value="flex-start" className="text-xs">
                Start
              </ToggleGroupItem>
              <ToggleGroupItem value="center" className="text-xs">
                Center
              </ToggleGroupItem>
              <ToggleGroupItem value="flex-end" className="text-xs">
                End
              </ToggleGroupItem>
              <ToggleGroupItem value="stretch" className="flex items-center gap-1 text-xs">
                <Maximize2 className="h-3 w-3" />
                Stretch
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator />

          {/* Justify Content */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Justify Content</Label>
            <ToggleGroup
              type="single"
              value={flexLayout.justifyContent}
              onValueChange={handleJustifyContentChange}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem value="flex-start" className="flex items-center gap-1 text-xs">
                <AlignHorizontalJustifyStart className="h-3 w-3" />
                Start
              </ToggleGroupItem>
              <ToggleGroupItem value="center" className="flex items-center gap-1 text-xs">
                <AlignHorizontalJustifyCenter className="h-3 w-3" />
                Center
              </ToggleGroupItem>
              <ToggleGroupItem value="flex-end" className="flex items-center gap-1 text-xs">
                <AlignHorizontalJustifyEnd className="h-3 w-3" />
                End
              </ToggleGroupItem>
              <ToggleGroupItem value="space-between" className="flex items-center gap-1 text-xs">
                <AlignHorizontalSpaceBetween className="h-3 w-3" />
                Between
              </ToggleGroupItem>
              <ToggleGroupItem value="space-around" className="flex items-center gap-1 text-xs">
                <AlignHorizontalSpaceAround className="h-3 w-3" />
                Around
              </ToggleGroupItem>
              <ToggleGroupItem value="space-evenly" className="flex items-center gap-1 text-xs">
                <AlignVerticalSpaceAround className="h-3 w-3" />
                Evenly
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator />

          {/* Wrap */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Wrap</Label>
            <ToggleGroup
              type="single"
              value={flexLayout.flexWrap}
              onValueChange={handleWrapChange}
              className="grid grid-cols-3 gap-2"
            >
              <ToggleGroupItem value="nowrap" className="text-xs">
                No Wrap
              </ToggleGroupItem>
              <ToggleGroupItem value="wrap" className="text-xs">
                Wrap
              </ToggleGroupItem>
              <ToggleGroupItem value="wrap-reverse" className="text-xs">
                Wrap ↑
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator />

          {/* Visual Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 font-medium mb-2">💡 How it works:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Children auto-arrange based on direction</li>
              <li>• Gap controls spacing between items</li>
              <li>• Padding adds space inside container</li>
              <li>• No manual positioning needed!</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
