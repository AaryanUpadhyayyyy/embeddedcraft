import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Sparkles, Box, ImageIcon, LayoutTemplate } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COMPONENT_PALETTE } from '../../core/constants';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import AssetsPanel from './AssetsPanel';
import TemplatesPanel from './TemplatesPanel';

interface ComponentPaletteProps {
  state: BottomSheetState;
}

/**
 * ComponentPalette - Left sidebar with draggable component types, assets, and templates.
 * Features:
 * - 14 component types (including badge, richtext, buttongroup)
 * - Drag to canvas or click to add
 * - Assets tab with photos, icons, and uploads
 * - Templates tab with 6 pre-built bottom sheet patterns
 * - Layout mode selector
 */
export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ state }) => {
  return (
    <div className="w-72 min-w-[288px] max-w-[288px] flex-shrink-0 bg-white border-r flex flex-col shadow-sm">
      <Tabs defaultValue="components" className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="font-bold text-lg text-gray-800">Design Toolkit</h3>
          <p className="text-xs text-gray-600 mt-1">Components & Assets</p>
        </div>

        <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
          <TabsTrigger value="components" className="text-xs gap-1">
            <Box className="h-3.5 w-3.5" />
            Components
          </TabsTrigger>
          <TabsTrigger value="assets" className="text-xs gap-1">
            <ImageIcon className="h-3.5 w-3.5" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs gap-1">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 mt-0 flex flex-col">
          <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
            <Button
              onClick={() => state.setShowTemplateGallery(true)}
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
                    {COMPONENT_PALETTE.map(({ type, icon: Icon, label, color, description }, index) => (
                      <Draggable key={type} draggableId={`palette-${type}`} index={index}>
                        {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <button
                          onClick={() => state.addComponent(type)}
                          className={`w-full flex items-center gap-3 p-3 bg-white border-2 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group ${
                            snapshot.isDragging
                              ? 'shadow-2xl border-blue-500 scale-105 rotate-2'
                              : 'border-gray-200'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            <Icon className="h-5 w-5" />
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

          <div className="text-sm text-gray-500 space-y-2">
            <p className="font-semibold">Layout: {state.layoutType}</p>
            <p>Components: {state.components.length}</p>
            <p>Height: {state.canvasHeight}px</p>
          </div>
        </div>
      </ScrollArea>
        </TabsContent>

        <TabsContent value="assets" className="flex-1 mt-0">
          <AssetsPanel />
        </TabsContent>

        <TabsContent value="templates" className="flex-1 mt-0">
          <TemplatesPanel state={state} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComponentPalette;
