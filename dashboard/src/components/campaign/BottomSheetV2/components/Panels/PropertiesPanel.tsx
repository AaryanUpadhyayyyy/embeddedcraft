import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layout, 
  Sparkles, 
  Palette, 
  Settings, 
  Layers as LayersIcon,
  Library,
  Image as ImageIcon,
  MessageSquare,
  Zap,
  Paintbrush,
  Box,
  Activity,
  Download,
  Code2
} from 'lucide-react';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import { FlexLayoutPanel } from './FlexLayoutPanel';
import { EffectsPanel } from './EffectsPanel';
import AnimationPanel from './AnimationPanel';
import StylesPanel from './StylesPanel';
import ComponentLibraryPanel from './ComponentLibraryPanel';
import ComponentStatesPanel from './ComponentStatesPanel';
import InteractionsPanel from './InteractionsPanel';
import { ExportPanel } from './ExportPanel';
import VariablesPanel from './VariablesPanel';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertiesPanelProps {
  state: BottomSheetState;
}

/**
 * PropertiesPanel - Right sidebar with all editing controls
 * 
 * Tabs:
 * 1. Layout - Position, size, rotation, flex layout
 * 2. Style - Colors, typography, basic styling
 * 3. Effects - Shadows, gradients, blur, opacity
 * 4. Content - Component-specific content editing
 * 5. Advanced - States, interactions, animations, variables
 */
export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ state }) => {
  const { selectedComponent } = state;

  if (!selectedComponent) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-400">
          <LayersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-semibold mb-2">No Component Selected</p>
          <p className="text-sm">Click a component on the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="layout" className="flex-1 flex flex-col h-full">
      <TabsList className="grid grid-cols-7 w-full rounded-none border-b">
        <TabsTrigger value="layout" className="text-xs gap-1">
          <Layout className="h-3.5 w-3.5" />
          Layout
        </TabsTrigger>
        <TabsTrigger value="style" className="text-xs gap-1">
          <Palette className="h-3.5 w-3.5" />
          Style
        </TabsTrigger>
        <TabsTrigger value="variables" className="text-xs gap-1">
          <Code2 className="h-3.5 w-3.5" />
          Variables
        </TabsTrigger>
        <TabsTrigger value="effects" className="text-xs gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Effects
        </TabsTrigger>
        <TabsTrigger value="animate" className="text-xs gap-1">
          <Zap className="h-3.5 w-3.5" />
          Animate
        </TabsTrigger>
        <TabsTrigger value="export" className="text-xs gap-1">
          <Download className="h-3.5 w-3.5" />
          Export
        </TabsTrigger>
        <TabsTrigger value="advanced" className="text-xs gap-1">
          <Settings className="h-3.5 w-3.5" />
          Advanced
        </TabsTrigger>
      </TabsList>

      {/* Layout Tab */}
      <TabsContent value="layout" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <FlexLayoutPanel state={state} />
        </ScrollArea>
      </TabsContent>

      {/* Style Tab */}
      <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <BasicStylePanel state={state} />
        </ScrollArea>
      </TabsContent>

      {/* Variables Tab */}
      <TabsContent value="variables" className="flex-1 mt-0 overflow-hidden">
        <VariablesPanel />
      </TabsContent>

      {/* Effects Tab */}
      <TabsContent value="effects" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <EffectsPanel state={state} />
        </ScrollArea>
      </TabsContent>

      {/* Animate Tab */}
      <TabsContent value="animate" className="flex-1 mt-0 overflow-hidden">
        <AnimationPanel state={state} />
      </TabsContent>

      {/* Export Tab */}
      <TabsContent value="export" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <ExportPanel />
        </ScrollArea>
      </TabsContent>

      {/* Advanced Tab */}
      <TabsContent value="advanced" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <AdvancedPanel state={state} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

/**
 * BasicStylePanel - Colors, typography, basic styling
 */
const BasicStylePanel: React.FC<{ state: BottomSheetState }> = ({ state }) => {
  const { selectedComponent, updateComponent } = state;
  
  if (!selectedComponent) return null;

  const style = selectedComponent.style || {};
  const content = selectedComponent.content || {};

  return (
    <div className="p-4 space-y-6">
      {/* Component Type Badge */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <div className="text-xs text-indigo-600 font-medium uppercase">
          {selectedComponent.type}
        </div>
        <div className="text-xs text-indigo-500 mt-1">
          ID: {selectedComponent.id.split('_').slice(0, 2).join('_')}...
        </div>
      </div>

      {/* Position */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">Position & Size</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600">X</label>
            <input
              type="number"
              value={selectedComponent.position.x || 0}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  position: {
                    ...selectedComponent.position,
                    x: Number(e.target.value),
                  },
                });
              }}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Y</label>
            <input
              type="number"
              value={selectedComponent.position.y || 0}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  position: {
                    ...selectedComponent.position,
                    y: Number(e.target.value),
                  },
                });
              }}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Width</label>
            <input
              type="number"
              value={selectedComponent.position.width}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  position: {
                    ...selectedComponent.position,
                    width: Number(e.target.value),
                  },
                });
              }}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Height</label>
            <input
              type="number"
              value={selectedComponent.position.height}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  position: {
                    ...selectedComponent.position,
                    height: Number(e.target.value),
                  },
                });
              }}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Text Components */}
      {selectedComponent.type === 'text' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Text</h4>
            <textarea
              value={String(content.text || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, text: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={3}
              placeholder="Enter text..."
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Typography</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Font Size</label>
                <input
                  type="number"
                  value={Number(style.fontSize) || 16}
                  onChange={(e) => {
                    updateComponent(selectedComponent.id, {
                      style: { ...style, fontSize: Number(e.target.value) },
                    });
                  }}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Color</label>
                <input
                  type="color"
                  value={String(style.color) || '#1F2937'}
                  onChange={(e) => {
                    updateComponent(selectedComponent.id, {
                      style: { ...style, color: e.target.value },
                    });
                  }}
                  className="w-full mt-1 h-9 border rounded"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Button Components */}
      {selectedComponent.type === 'button' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Button Text</h4>
            <input
              type="text"
              value={String(content.text || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, text: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Button text..."
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Colors</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Background</label>
                <input
                  type="color"
                  value={String(style.backgroundColor) || '#6366F1'}
                  onChange={(e) => {
                    updateComponent(selectedComponent.id, {
                      style: { ...style, backgroundColor: e.target.value },
                    });
                  }}
                  className="w-full mt-1 h-9 border rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Text Color</label>
                <input
                  type="color"
                  value={String(style.textColor) || '#FFFFFF'}
                  onChange={(e) => {
                    updateComponent(selectedComponent.id, {
                      style: { ...style, textColor: e.target.value },
                    });
                  }}
                  className="w-full mt-1 h-9 border rounded"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Components */}
      {selectedComponent.type === 'image' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Image URL</h4>
            <input
              type="text"
              value={String(content.url || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, url: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Aspect Ratio</h4>
            <select
              value={String(content.aspectRatio || 'free')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, aspectRatio: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="free">Free (No lock)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="3:4">3:4 (Portrait)</option>
              <option value="2:3">2:3 (Tall)</option>
              <option value="21:9">21:9 (Ultrawide)</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Object Fit</h4>
            <select
              value={String(content.objectFit || 'cover')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, objectFit: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="cover">Cover (Fill & Crop)</option>
              <option value="contain">Contain (Fit Inside)</option>
              <option value="fill">Fill (Stretch)</option>
              <option value="none">None (Original)</option>
              <option value="scale-down">Scale Down</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Overlay</h4>
            <select
              value={typeof content.overlay === 'object' && content.overlay !== null ? String((content.overlay as any).type) : 'none'}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { 
                    ...content, 
                    overlay: { 
                      type: e.target.value,
                      gradient: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                      color: 'rgba(0,0,0,0.3)',
                      opacity: 1
                    } 
                  },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="none">None</option>
              <option value="gradient">Gradient</option>
              <option value="color">Color</option>
            </select>
          </div>
        </>
      )}

      {/* Badge Components */}
      {selectedComponent.type === 'badge' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Badge Text</h4>
            <input
              type="text"
              value={String(content.text || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, text: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="LIVE NOW"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Variant</h4>
            <select
              value={String(content.variant || 'default')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, variant: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="default">Default (Gray)</option>
              <option value="primary">Primary (Blue)</option>
              <option value="danger">Danger (Red)</option>
              <option value="success">Success (Green)</option>
              <option value="warning">Warning (Yellow)</option>
              <option value="info">Info (Cyan)</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Size</h4>
            <select
              value={String(content.size || 'sm')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, size: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="xs">Extra Small</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Shape</h4>
            <select
              value={String(content.shape || 'rounded')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, shape: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="rounded">Rounded</option>
              <option value="pill">Pill</option>
              <option value="square">Square</option>
            </select>
          </div>
        </>
      )}

      {/* RichText Components */}
      {selectedComponent.type === 'richtext' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">HTML Content</h4>
            <textarea
              value={String(content.html || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, html: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm font-mono"
              placeholder="Up to <b>30% OFF</b> on <span style='color: blue'>Hotels</span>"
              rows={6}
            />
            <p className="text-xs text-gray-500">
              💡 Use HTML tags: &lt;b&gt;, &lt;i&gt;, &lt;span&gt;, &lt;p&gt;, etc.
            </p>
          </div>
        </>
      )}

      {/* ButtonGroup Components */}
      {selectedComponent.type === 'buttongroup' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Layout</h4>
            <select
              value={String(content.layout || 'horizontal')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, layout: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Sticky Position</h4>
            <select
              value={String(content.sticky || 'none')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, sticky: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="none">None</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Buttons</h4>
            <p className="text-xs text-gray-500">
              Default: DISMISS (outline) + BOOK NOW (primary)
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 Advanced button editing coming in next update
            </p>
          </div>
        </>
      )}

      {/* ProgressBar Components */}
      {selectedComponent.type === 'progressbar' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Progress Value</h4>
            <input
              type="number"
              value={Number(content.value || 0)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, value: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={0}
              max={Number(content.max || 100)}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Maximum Value</h4>
            <input
              type="number"
              value={Number(content.max || 100)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, max: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={1}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Show Percentage</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.showPercentage !== false}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, showPercentage: e.target.checked },
                  });
                }}
                className="rounded"
              />
              <span className="text-sm">Display percentage label</span>
            </label>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Color</h4>
            <input
              type="color"
              value={String(style.color || '#10B981')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, color: e.target.value },
                });
              }}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Milestones</h4>
            <p className="text-xs text-gray-500">
              💡 Use milestones for rewards: "₹50 more for free shipping"
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Advanced milestone editor coming soon
            </p>
          </div>
        </>
      )}

      {/* ProgressCircle Components */}
      {selectedComponent.type === 'progresscircle' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Progress Value</h4>
            <input
              type="number"
              value={Number(content.value || 0)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, value: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={0}
              max={Number(content.max || 100)}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Maximum Value</h4>
            <input
              type="number"
              value={Number(content.max || 100)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, max: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={1}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Label</h4>
            <input
              type="text"
              value={String(content.label || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, label: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="e.g., Daily Goal"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Size (px)</h4>
            <input
              type="number"
              value={Number(style.size || 120)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, size: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={60}
              max={300}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Stroke Width (px)</h4>
            <input
              type="number"
              value={Number(style.strokeWidth || 8)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, strokeWidth: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={2}
              max={20}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Color</h4>
            <input
              type="color"
              value={String(style.color || '#3B82F6')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, color: e.target.value },
                });
              }}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </>
      )}

      {/* Stepper Components */}
      {selectedComponent.type === 'stepper' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Current Step</h4>
            <input
              type="number"
              value={Number(content.currentStep || 0)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, currentStep: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={0}
              max={(content.steps as any[])?.length - 1 || 0}
            />
            <p className="text-xs text-gray-500">
              Current step index (0-based)
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Orientation</h4>
            <select
              value={String(style.orientation || 'horizontal')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, orientation: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Steps</h4>
            <p className="text-xs text-gray-500">
              Total steps: {(content.steps as any[])?.length || 0}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 Advanced step editor coming soon
            </p>
          </div>
        </>
      )}

      {/* List Components */}
      {selectedComponent.type === 'list' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">List Type</h4>
            <select
              value={String(content.type || 'bullet')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, type: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="bullet">Bullet Points</option>
              <option value="numbered">Numbered List</option>
              <option value="checkmark">Checkmarks ✓</option>
              <option value="icon">Custom Icons</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Style</h4>
            <select
              value={String(content.style || 'default')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, style: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="default">Default Spacing</option>
              <option value="compact">Compact</option>
              <option value="spaced">Spacious</option>
              <option value="bordered">Bordered</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Icon Color</h4>
            <input
              type="color"
              value={String(style.iconColor || '#3B82F6')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, iconColor: e.target.value },
                });
              }}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">List Items</h4>
            <p className="text-xs text-gray-500">
              Total items: {(content.items as any[])?.length || 0}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 Advanced list editor coming soon
            </p>
          </div>
        </>
      )}

      {/* Countdown Timer Components */}
      {selectedComponent.type === 'countdown' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Target Date</h4>
            <input
              type="datetime-local"
              value={content.targetDate ? new Date(content.targetDate as string).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, targetDate: new Date(e.target.value).toISOString() },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <p className="text-xs text-gray-500">
              When should the countdown end?
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Format</h4>
            <select
              value={String(content.format || 'short')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, format: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="full">Full (5d 12h 30m 45s)</option>
              <option value="short">Short (5d 12h 30m)</option>
              <option value="compact">Compact (5d 12h)</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Urgency Threshold (minutes)</h4>
            <input
              type="number"
              value={Number(content.urgentThreshold || 60)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, urgentThreshold: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={0}
            />
            <p className="text-xs text-gray-500">
              Turn red when time remaining &lt; threshold
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Show Icon</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.showIcon !== false}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, showIcon: e.target.checked },
                  });
                }}
                className="rounded"
              />
              <span className="text-sm">Display clock icon</span>
            </label>
          </div>
        </>
      )}

      {/* Link Components */}
      {selectedComponent.type === 'link' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Link Text</h4>
            <input
              type="text"
              value={String(content.text || 'Click here')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, text: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Learn more"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">URL</h4>
            <input
              type="text"
              value={String(content.href || '#')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, href: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Variant</h4>
            <select
              value={String(content.variant || 'primary')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, variant: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="default">Default</option>
              <option value="primary">Primary (Bold)</option>
              <option value="secondary">Secondary</option>
              <option value="underline">Underlined</option>
              <option value="muted">Muted</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Size</h4>
            <select
              value={String(content.size || 'md')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, size: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Icon</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.showIcon === true}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, showIcon: e.target.checked },
                  });
                }}
                className="rounded"
              />
              <span className="text-sm">Show icon</span>
            </label>
          </div>

          {content.showIcon && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Icon Type</h4>
                <select
                  value={String(content.iconType || 'arrow')}
                  onChange={(e) => {
                    updateComponent(selectedComponent.id, {
                      content: { ...content, iconType: e.target.value },
                    });
                  }}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="arrow">Arrow →</option>
                  <option value="chevron">Chevron ›</option>
                  <option value="external">External ↗</option>
                </select>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Icon Position</h4>
                <select
                  value={String(content.iconPosition || 'right')}
                  onChange={(e) => {
                    updateComponent(selectedComponent.id, {
                      content: { ...content, iconPosition: e.target.value },
                    });
                  }}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">External Link</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.external === true}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, external: e.target.checked },
                  });
                }}
                className="rounded"
              />
              <span className="text-sm">Open in new tab</span>
            </label>
          </div>
        </>
      )}

      {/* Coming Soon for Other Types */}
      {!['text', 'button', 'image', 'badge', 'richtext', 'buttongroup', 'progressbar', 'progresscircle', 'stepper', 'list', 'countdown', 'link'].includes(selectedComponent.type) && (
        <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          Style controls for {selectedComponent.type} coming soon
        </div>
      )}
    </div>
  );
};

/**
 * AdvancedPanel - Design system, component library, states, interactions
 */
const AdvancedPanel: React.FC<{ state: BottomSheetState }> = ({ state }) => {
  return (
    <Tabs defaultValue="styles" className="flex-1 flex flex-col h-full">
      <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
        <TabsTrigger value="styles" className="text-xs gap-1">
          <Paintbrush className="h-3.5 w-3.5" />
          Styles
        </TabsTrigger>
        <TabsTrigger value="library" className="text-xs gap-1">
          <Box className="h-3.5 w-3.5" />
          Library
        </TabsTrigger>
        <TabsTrigger value="states" className="text-xs gap-1">
          <LayersIcon className="h-3.5 w-3.5" />
          States
        </TabsTrigger>
        <TabsTrigger value="interactions" className="text-xs gap-1">
          <Activity className="h-3.5 w-3.5" />
          Interact
        </TabsTrigger>
      </TabsList>

      <TabsContent value="styles" className="flex-1 mt-0 overflow-hidden">
        <StylesPanel state={state} />
      </TabsContent>

      <TabsContent value="library" className="flex-1 mt-0 overflow-hidden">
        <ComponentLibraryPanel state={state} />
      </TabsContent>

      <TabsContent value="states" className="flex-1 mt-0 overflow-hidden">
        <ComponentStatesPanel state={state} />
      </TabsContent>

      <TabsContent value="interactions" className="flex-1 mt-0 overflow-hidden">
        <InteractionsPanel state={state} />
      </TabsContent>
    </Tabs>
  );
};

export default PropertiesPanel;
