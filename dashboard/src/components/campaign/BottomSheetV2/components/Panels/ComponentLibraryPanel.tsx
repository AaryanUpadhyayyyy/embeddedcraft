import React, { useState } from 'react';
import { Box, Copy, Unlink, Edit, Trash2, Star, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import type { Component } from '../../core/types';

interface ComponentLibraryPanelProps {
  state: BottomSheetState;
}

/**
 * ComponentLibraryPanel - Manage master components and instances
 * - Create master components from selected components
 * - Create instances from master components
 * - Update all instances when master changes
 * - Detach instances to edit independently
 */
export default function ComponentLibraryPanel({ state }: ComponentLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newMasterName, setNewMasterName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { masterComponents, selectedComponent, components, setSelectedIds } = state;
  const filteredMasters = masterComponents.filter((comp: Component) => {
    const text = comp.content?.text;
    const textStr = typeof text === 'string' ? text : '';
    return textStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Check if selected component is an instance
  const selectedInstance = selectedComponent?.componentInstance;
  const isMasterComponent = selectedComponent?.componentInstance?.isMaster;
  const isInstance = selectedInstance && !isMasterComponent;

  // Count instances of each master
  const getInstanceCount = (masterId: string) => {
    return components.filter(
      (c) => c.componentInstance?.masterComponentId === masterId
    ).length;
  };

  // Handle creating master component
  const handleCreateMaster = () => {
    if (!selectedComponent) return;

    state.createMasterComponent(selectedComponent.id);
    setIsCreateDialogOpen(false);
  };

  // Handle creating instance from master
  const handleCreateInstance = (masterId: string) => {
    state.createInstance(masterId);
  };

  // Handle updating master (affects all instances)
  const handleUpdateMaster = (masterId: string) => {
    if (!selectedComponent) return;
    
    // Copy selected component's properties to master
    const updates = {
      style: selectedComponent.style,
      content: selectedComponent.content,
      effects: selectedComponent.effects,
    };
    
    state.updateMasterComponent(masterId, updates);
  };

  // Handle detaching instance
  const handleDetachInstance = () => {
    if (!selectedComponent || !isInstance) return;
    state.detachInstance(selectedComponent.id);
  };

  // Get master component for current instance
  const getMasterForInstance = () => {
    if (!isInstance || !selectedInstance?.masterComponentId) return null;
    return masterComponents.find(
      (c: Component) => c.id === selectedInstance.masterComponentId
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Selected Component Actions */}
          {selectedComponent && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold">Selected Component</Label>
              
              {isMasterComponent ? (
                // Master Component Card
                <div className="border border-primary rounded-lg p-3 space-y-2 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <Badge variant="default" className="text-xs">Master Component</Badge>
                  </div>
                  <p className="text-sm font-medium">{selectedComponent.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {getInstanceCount(selectedComponent.id)} instance(s) in use
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => handleCreateInstance(selectedComponent.id)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Create Instance
                  </Button>
                </div>
              ) : isInstance ? (
                // Instance Component Card
                <div className="border border-blue-500 rounded-lg p-3 space-y-2 bg-blue-50">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-600" />
                    <Badge variant="secondary" className="text-xs">Instance</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Linked to: {getMasterForInstance()?.id || 'Unknown'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        const master = getMasterForInstance();
                        if (master) {
                          setSelectedIds([master.id]);
                        }
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Master
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={handleDetachInstance}
                    >
                      <Unlink className="w-3 h-3 mr-1" />
                      Detach
                    </Button>
                  </div>
                </div>
              ) : (
                // Regular Component Card
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="w-full h-8 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Create Master Component
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Master Component</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <p className="text-sm text-muted-foreground">
                        Master components can be reused across your design. Changes to the master
                        will update all instances automatically.
                      </p>
                      <div>
                        <Label className="text-xs mb-2 block">Master Component Name</Label>
                        <Input
                          value={newMasterName}
                          onChange={(e) => setNewMasterName(e.target.value)}
                          placeholder="Button Primary"
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button onClick={handleCreateMaster} className="w-full" disabled={!newMasterName}>
                        Create Master
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          <Separator />

          {/* Master Components Library */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Component Library ({masterComponents.length})
              </Label>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="h-8 text-sm pl-8"
              />
            </div>

            {/* Master Components List */}
            {filteredMasters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                {masterComponents.length === 0 ? (
                  <>
                    <p className="text-xs">No master components yet</p>
                    <p className="text-xs mt-1">Select a component and create a master to reuse it</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs">No components match "{searchQuery}"</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMasters.map((master: Component) => {
                  const instanceCount = getInstanceCount(master.id);
                  const isSelected = selectedComponent?.id === master.id;

                  return (
                    <div
                      key={master.id}
                      className={`border rounded-lg p-3 space-y-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedIds([master.id])}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-3.5 h-3.5 text-primary fill-primary flex-shrink-0" />
                            <Badge variant="outline" className="text-xs">
                              {master.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate">{master.id}</p>
                          {master.content?.text && typeof master.content.text === 'string' && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {master.content.text}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {instanceCount} instance{instanceCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateInstance(master.id);
                            }}
                            title="Create instance"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Preview of master component */}
                      <div
                        className="border rounded p-2 bg-white/50 text-xs overflow-hidden"
                        style={{
                          maxHeight: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {master.type === 'text' && (
                          <span
                            style={{
                              fontSize: Math.min(master.style?.fontSize as number || 14, 14),
                              color: master.style?.color as string || '#000',
                              fontWeight: master.style?.fontWeight as string || '400',
                            }}
                          >
                            {typeof master.content?.text === 'string' ? master.content.text : 'Text'}
                          </span>
                        )}
                        {master.type === 'button' && (
                          <div
                            className="px-3 py-1 rounded"
                            style={{
                              backgroundColor: master.style?.backgroundColor as string || '#000',
                              color: master.style?.color as string || '#fff',
                            }}
                          >
                            {typeof master.content?.text === 'string' ? master.content.text : 'Button'}
                          </div>
                        )}
                        {master.type === 'container' && (
                          <div
                            className="w-full h-full border-2 border-dashed rounded flex items-center justify-center"
                            style={{
                              borderColor: master.style?.backgroundColor as string || '#ddd',
                            }}
                          >
                            Container
                          </div>
                        )}
                        {!['text', 'button', 'container'].includes(master.type) && (
                          <span className="text-muted-foreground">{master.type}</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateInstance(master.id);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Canvas
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
