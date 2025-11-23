import React, { useState } from 'react';
import { Palette, Type, Sparkles, Plus, Trash2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';

interface StylesPanelProps {
  state: BottomSheetState;
}

/**
 * StylesPanel - Manage global design system styles
 * - Color Styles: Reusable color palettes
 * - Text Styles: Typography presets
 * - Effect Styles: Shadow/gradient presets
 */
export default function StylesPanel({ state }: StylesPanelProps) {
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#000000');
  const [newTextName, setNewTextName] = useState('');
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);

  const { designSystem, selectedComponent } = state;
  const colorStyles = designSystem?.colors || [];
  const textStyles = designSystem?.textStyles || [];
  const effectStyles = designSystem?.effectStyles || [];

  // Color Style Management
  const handleCreateColorStyle = () => {
    if (!newColorName || !newColorValue) return;
    
    state.addColorStyle({
      id: `color-${Date.now()}`,
      name: newColorName,
      color: newColorValue,
    });
    
    setNewColorName('');
    setNewColorValue('#000000');
    setIsColorDialogOpen(false);
  };

  const handleApplyColorStyle = (styleId: string) => {
    if (!selectedComponent) return;
    state.applyColorStyle(selectedComponent.id, styleId);
  };

  const handleDeleteColorStyle = (styleId: string) => {
    const updatedColors = colorStyles.filter((s: any) => s.id !== styleId);
    state.setDesignSystem({
      ...designSystem,
      colors: updatedColors,
    });
  };

  // Text Style Management
  const handleCreateTextStyle = () => {
    if (!newTextName) return;
    
    state.addTextStyle({
      id: `text-${Date.now()}`,
      name: newTextName,
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
      fontFamily: 'Inter',
    });
    
    setNewTextName('');
    setIsTextDialogOpen(false);
  };

  const handleApplyTextStyle = (styleId: string) => {
    if (!selectedComponent) return;
    state.applyTextStyle(selectedComponent.id, styleId);
  };

  const handleDeleteTextStyle = (styleId: string) => {
    const updatedTextStyles = textStyles.filter((s: any) => s.id !== styleId);
    state.setDesignSystem({
      ...designSystem,
      textStyles: updatedTextStyles,
    });
  };

  // Effect Style Management
  const handleApplyEffectStyle = (styleId: string) => {
    if (!selectedComponent) return;
    state.applyEffectStyle(selectedComponent.id, styleId);
  };

  const handleDeleteEffectStyle = (styleId: string) => {
    const updatedEffectStyles = effectStyles.filter((s: any) => s.id !== styleId);
    state.setDesignSystem({
      ...designSystem,
      effectStyles: updatedEffectStyles,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="colors" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 w-full rounded-none border-b">
          <TabsTrigger value="colors" className="text-xs gap-1">
            <Palette className="h-3.5 w-3.5" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs gap-1">
            <Type className="h-3.5 w-3.5" />
            Text
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-xs gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Effects
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Color Styles</Label>
                <Dialog open={isColorDialogOpen} onOpenChange={setIsColorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      New Color
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Color Style</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label className="text-xs mb-2 block">Style Name</Label>
                        <Input
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          placeholder="Primary Blue"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-2 block">Color Value</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={newColorValue}
                            onChange={(e) => setNewColorValue(e.target.value)}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <Input
                            value={newColorValue}
                            onChange={(e) => setNewColorValue(e.target.value)}
                            className="h-8 text-sm flex-1"
                          />
                        </div>
                      </div>
                      <Button onClick={handleCreateColorStyle} className="w-full">
                        Create Style
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {colorStyles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-xs">No color styles yet</p>
                  <p className="text-xs mt-1">Create reusable colors for your design</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {colorStyles.map((style: any) => (
                    <div
                      key={style.id}
                      className="border rounded-lg p-3 space-y-2 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border shadow-sm"
                            style={{ backgroundColor: style.color }}
                          />
                          <div>
                            <p className="text-sm font-medium">{style.name}</p>
                            <p className="text-xs text-muted-foreground">{style.color}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              navigator.clipboard.writeText(style.color);
                            }}
                            title="Copy color"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDeleteColorStyle(style.id)}
                            title="Delete style"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {selectedComponent && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs mt-2 pt-2 border-t"
                          onClick={() => handleApplyColorStyle(style.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Apply to Selected
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Text Styles Tab */}
        <TabsContent value="text" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Text Styles</Label>
                <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      New Text Style
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Text Style</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label className="text-xs mb-2 block">Style Name</Label>
                        <Input
                          value={newTextName}
                          onChange={(e) => setNewTextName(e.target.value)}
                          placeholder="Heading 1"
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button onClick={handleCreateTextStyle} className="w-full">
                        Create Style
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {textStyles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-xs">No text styles yet</p>
                  <p className="text-xs mt-1">Create reusable typography presets</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {textStyles.map((style: any) => (
                    <div
                      key={style.id}
                      className="border rounded-lg p-3 space-y-2 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">{style.name}</p>
                          <p
                            className="text-sm"
                            style={{
                              fontSize: style.fontSize,
                              fontWeight: style.fontWeight,
                              lineHeight: style.lineHeight,
                              fontFamily: style.fontFamily,
                            }}
                          >
                            The quick brown fox
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {style.fontSize}px · {style.fontWeight} · {style.fontFamily}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDeleteTextStyle(style.id)}
                            title="Delete style"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {selectedComponent && selectedComponent.type === 'text' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs"
                          onClick={() => handleApplyTextStyle(style.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Apply to Selected Text
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Effect Styles Tab */}
        <TabsContent value="effects" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Effect Styles</Label>
                <Button size="sm" variant="outline" className="h-7 text-xs" disabled>
                  <Plus className="w-3 h-3 mr-1" />
                  New Effect
                </Button>
              </div>

              {effectStyles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-xs">No effect styles yet</p>
                  <p className="text-xs mt-1">Save shadow & gradient combinations</p>
                  <p className="text-xs mt-2 text-primary">Coming soon: Save current effects as style</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {effectStyles.map((style: any) => (
                    <div
                      key={style.id}
                      className="border rounded-lg p-3 space-y-2 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{style.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {style.effects?.shadows?.length || 0} shadows
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDeleteEffectStyle(style.id)}
                            title="Delete style"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {selectedComponent && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs"
                          onClick={() => handleApplyEffectStyle(style.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Apply Effect
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
