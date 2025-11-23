import React, { useState } from 'react';
import { Layers, Eye, Copy, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';

interface ComponentStatesPanelProps {
  state: BottomSheetState;
}

/**
 * ComponentStatesPanel - Manage component states (hover, active, disabled, focused)
 * - Switch between states to edit styling
 * - Preview different states
 * - Copy state styles between states
 */
export default function ComponentStatesPanel({ state }: ComponentStatesPanelProps) {
  const [currentState, setCurrentState] = useState<'default' | 'hover' | 'active' | 'disabled' | 'focused'>('default');

  const { selectedComponent } = state;

  if (!selectedComponent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <Layers className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">Select a component to manage states</p>
      </div>
    );
  }

  const componentStates = selectedComponent.states || {
    default: {},
    hover: {},
    active: {},
    disabled: {},
    focused: {},
  };

  const currentStateStyle = componentStates[currentState] || {};
  const hasStateStyles = Object.keys(currentStateStyle).length > 0;

  const handleUpdateStateStyle = (property: string, value: any) => {
    state.updateStateStyle(selectedComponent.id, currentState, { [property]: value });
  };

  const handleCopyStateStyle = (fromState: typeof currentState) => {
    const sourceStyle = componentStates[fromState];
    if (sourceStyle) {
      state.updateStateStyle(selectedComponent.id, currentState, sourceStyle);
    }
  };

  const handleClearStateStyle = () => {
    state.updateStateStyle(selectedComponent.id, currentState, {});
  };

  const getStateDescription = (stateName: typeof currentState) => {
    switch (stateName) {
      case 'default':
        return 'Normal state of the component';
      case 'hover':
        return 'When user hovers over the component';
      case 'active':
        return 'When component is clicked/pressed';
      case 'disabled':
        return 'When component is disabled';
      case 'focused':
        return 'When component has keyboard focus';
      default:
        return '';
    }
  };

  const getStateColor = (stateName: typeof currentState) => {
    switch (stateName) {
      case 'default':
        return 'bg-gray-100 text-gray-700';
      case 'hover':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'disabled':
        return 'bg-red-100 text-red-700';
      case 'focused':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* State Selector */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold">Component State</Label>
            <ToggleGroup
              type="single"
              value={currentState}
              onValueChange={(value) => value && setCurrentState(value as typeof currentState)}
              className="grid grid-cols-5 gap-2"
            >
              <ToggleGroupItem value="default" className="text-xs h-8 px-2">
                Default
              </ToggleGroupItem>
              <ToggleGroupItem value="hover" className="text-xs h-8 px-2">
                Hover
              </ToggleGroupItem>
              <ToggleGroupItem value="active" className="text-xs h-8 px-2">
                Active
              </ToggleGroupItem>
              <ToggleGroupItem value="disabled" className="text-xs h-8 px-2">
                Disabled
              </ToggleGroupItem>
              <ToggleGroupItem value="focused" className="text-xs h-8 px-2">
                Focused
              </ToggleGroupItem>
            </ToggleGroup>

            <div className={`rounded-lg p-3 ${getStateColor(currentState)}`}>
              <p className="text-xs font-medium mb-1 capitalize">{currentState} State</p>
              <p className="text-xs opacity-80">{getStateDescription(currentState)}</p>
            </div>
          </div>

          <Separator />

          {/* State Style Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">State Styling</Label>
              {hasStateStyles && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={handleClearStateStyle}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {currentState === 'default' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Default state</strong> uses the component's base styling.
                  Edit styles in the <strong>Style tab</strong> to change the default appearance.
                </p>
              </div>
            ) : (
              <>
                {/* Background Color */}
                <div className="space-y-2">
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={(currentStateStyle.backgroundColor as string) || '#FFFFFF'}
                      onChange={(e) => handleUpdateStateStyle('backgroundColor', e.target.value)}
                      className="w-12 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={(currentStateStyle.backgroundColor as string) || ''}
                      onChange={(e) => handleUpdateStateStyle('backgroundColor', e.target.value)}
                      placeholder="#FFFFFF"
                      className="h-8 text-sm flex-1"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={(currentStateStyle.color as string) || '#000000'}
                      onChange={(e) => handleUpdateStateStyle('color', e.target.value)}
                      className="w-12 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={(currentStateStyle.color as string) || ''}
                      onChange={(e) => handleUpdateStateStyle('color', e.target.value)}
                      placeholder="#000000"
                      className="h-8 text-sm flex-1"
                    />
                  </div>
                </div>

                {/* Border Color */}
                <div className="space-y-2">
                  <Label className="text-xs">Border Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={(currentStateStyle.borderColor as string) || '#CCCCCC'}
                      onChange={(e) => handleUpdateStateStyle('borderColor', e.target.value)}
                      className="w-12 h-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={(currentStateStyle.borderColor as string) || ''}
                      onChange={(e) => handleUpdateStateStyle('borderColor', e.target.value)}
                      placeholder="#CCCCCC"
                      className="h-8 text-sm flex-1"
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Opacity</Label>
                    <span className="text-xs text-muted-foreground">
                      {((currentStateStyle.opacity as number) || 1) * 100}%
                    </span>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={(currentStateStyle.opacity as number) || 1}
                    onChange={(e) => handleUpdateStateStyle('opacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Transform (Scale) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Scale</Label>
                    <span className="text-xs text-muted-foreground">
                      {((currentStateStyle.scale as number) || 1) * 100}%
                    </span>
                  </div>
                  <Input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={(currentStateStyle.scale as number) || 1}
                    onChange={(e) => handleUpdateStateStyle('scale', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Copy from other states */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Copy From State</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['default', 'hover', 'active', 'disabled', 'focused'] as const)
                      .filter(s => s !== currentState)
                      .map(stateName => (
                        <Button
                          key={stateName}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleCopyStateStyle(stateName)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {stateName}
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Preview</Label>
                  <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                    {selectedComponent.type === 'button' ? (
                      <div
                        className="px-4 py-2 rounded transition-all"
                        style={{
                          backgroundColor: (currentStateStyle.backgroundColor as string) || selectedComponent.style?.backgroundColor as string || '#6366F1',
                          color: (currentStateStyle.color as string) || selectedComponent.style?.color as string || '#FFFFFF',
                          borderColor: (currentStateStyle.borderColor as string) || 'transparent',
                          opacity: (currentStateStyle.opacity as number) || 1,
                          transform: `scale(${(currentStateStyle.scale as number) || 1})`,
                        }}
                      >
                        {typeof selectedComponent.content?.text === 'string' ? selectedComponent.content.text : 'Button'}
                      </div>
                    ) : selectedComponent.type === 'text' ? (
                      <span
                        style={{
                          color: (currentStateStyle.color as string) || selectedComponent.style?.color as string || '#000000',
                          opacity: (currentStateStyle.opacity as number) || 1,
                          transform: `scale(${(currentStateStyle.scale as number) || 1})`,
                        }}
                      >
                        {typeof selectedComponent.content?.text === 'string' ? selectedComponent.content.text : 'Text'}
                      </span>
                    ) : (
                      <div
                        className="w-24 h-24 rounded border-2"
                        style={{
                          backgroundColor: (currentStateStyle.backgroundColor as string) || selectedComponent.style?.backgroundColor as string || '#F3F4F6',
                          borderColor: (currentStateStyle.borderColor as string) || '#D1D5DB',
                          opacity: (currentStateStyle.opacity as number) || 1,
                          transform: `scale(${(currentStateStyle.scale as number) || 1})`,
                        }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Live preview of {currentState} state
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-purple-900 mb-2">💡 State Tips</h4>
            <ul className="space-y-1 text-xs text-purple-700">
              <li>• Hover: Add subtle color change on mouse over</li>
              <li>• Active: Show pressed/clicked state</li>
              <li>• Disabled: Reduce opacity & change color</li>
              <li>• Focused: Add border or shadow for keyboard navigation</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
