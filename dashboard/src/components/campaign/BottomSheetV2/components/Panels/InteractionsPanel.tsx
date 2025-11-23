import React, { useState } from 'react';
import { Zap, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';

interface InteractionsPanelProps {
  state: BottomSheetState;
}

/**
 * InteractionsPanel - Manage component interactions (triggers + actions)
 * - Add triggers: click, hover, input change
 * - Define actions: navigate, close, toggle, submit
 * - Chain multiple actions per trigger
 */
export default function InteractionsPanel({ state }: InteractionsPanelProps) {
  const [expandedTriggers, setExpandedTriggers] = useState<Set<string>>(new Set());

  const { selectedComponent } = state;

  if (!selectedComponent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <Zap className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">Select a component to add interactions</p>
      </div>
    );
  }

  const interactions = selectedComponent.interactions;
  const triggers = interactions?.triggers || [];

  const toggleTrigger = (triggerId: string) => {
    setExpandedTriggers(prev => {
      const next = new Set(prev);
      if (next.has(triggerId)) {
        next.delete(triggerId);
      } else {
        next.add(triggerId);
      }
      return next;
    });
  };

  const handleAddTrigger = () => {
    const newTrigger = {
      id: `trigger-${Date.now()}`,
      event: 'on-click' as const,
      actions: [],
    };
    state.addTrigger(selectedComponent.id, newTrigger);
    setExpandedTriggers(prev => new Set(prev).add(newTrigger.id));
  };

  const handleDeleteTrigger = (triggerIndex: number) => {
    state.removeTrigger(selectedComponent.id, triggerIndex);
  };

  const handleUpdateTriggerEvent = (triggerIndex: number, event: string) => {
    const trigger = triggers[triggerIndex];
    if (trigger) {
      state.addTrigger(selectedComponent.id, { ...trigger, event: event as any });
    }
  };

  const handleAddAction = (triggerIndex: number) => {
    const trigger = triggers[triggerIndex];
    if (trigger) {
      const newAction = {
        id: `action-${Date.now()}`,
        type: 'navigate' as const,
        config: { url: '' },
      };
      state.addTrigger(selectedComponent.id, {
        ...trigger,
        actions: [...trigger.actions, newAction],
      });
    }
  };

  const handleUpdateAction = (triggerIndex: number, actionIndex: number, updates: any) => {
    const trigger = triggers[triggerIndex];
    if (trigger) {
      const updatedActions = trigger.actions.map((a, idx) =>
        idx === actionIndex ? { ...a, ...updates } : a
      );
      state.addTrigger(selectedComponent.id, {
        ...trigger,
        actions: updatedActions,
      });
    }
  };

  const handleDeleteAction = (triggerIndex: number, actionIndex: number) => {
    const trigger = triggers[triggerIndex];
    if (trigger) {
      const updatedActions = trigger.actions.filter((_, idx) => idx !== actionIndex);
      state.addTrigger(selectedComponent.id, {
        ...trigger,
        actions: updatedActions,
      });
    }
  };

  const getEventLabel = (event: string) => {
    const labels: Record<string, string> = {
      'on-click': 'On Click',
      'on-hover': 'On Hover',
      'on-input': 'On Input Change',
      'on-submit': 'On Submit',
      'on-focus': 'On Focus',
      'on-blur': 'On Blur',
    };
    return labels[event] || event;
  };

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      navigate: 'Navigate to URL',
      'close-modal': 'Close Modal/Sheet',
      'toggle-visibility': 'Toggle Visibility',
      submit: 'Submit Form',
      'set-variable': 'Set Variable',
      'show-notification': 'Show Notification',
    };
    return labels[type] || type;
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Interactions ({triggers.length})</Label>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleAddTrigger}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Trigger
            </Button>
          </div>

          {/* Triggers List */}
          {triggers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-xs">No interactions yet</p>
              <p className="text-xs mt-1">Add a trigger to create interactive behavior</p>
            </div>
          ) : (
            <div className="space-y-2">
              {triggers.map((trigger: any, triggerIndex: number) => {
                const triggerId = trigger.id || `trigger-${triggerIndex}`;
                const isExpanded = expandedTriggers.has(triggerId);
                const actionCount = trigger.actions?.length || 0;

                return (
                  <Collapsible
                    key={triggerId}
                    open={isExpanded}
                    onOpenChange={() => toggleTrigger(triggerId)}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      {/* Trigger Header */}
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getEventLabel(trigger.event)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {actionCount} action{actionCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrigger(triggerIndex);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CollapsibleTrigger>

                      {/* Trigger Content */}
                      <CollapsibleContent>
                        <div className="p-3 space-y-3">
                          {/* Event Type */}
                          <div className="space-y-2">
                            <Label className="text-xs">Trigger Event</Label>
                            <Select
                              value={trigger.event}
                              onValueChange={(value) => handleUpdateTriggerEvent(triggerIndex, value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="on-click">On Click</SelectItem>
                                <SelectItem value="on-hover">On Hover</SelectItem>
                                <SelectItem value="on-input">On Input Change</SelectItem>
                                <SelectItem value="on-submit">On Submit</SelectItem>
                                <SelectItem value="on-focus">On Focus</SelectItem>
                                <SelectItem value="on-blur">On Blur</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold">Actions</Label>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                                onClick={() => handleAddAction(triggerIndex)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Action
                              </Button>
                            </div>

                            {trigger.actions.length === 0 ? (
                              <div className="text-center py-4 text-xs text-muted-foreground border-2 border-dashed rounded">
                                No actions yet
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {trigger.actions.map((action: any, actionIndex: number) => (
                                  <div
                                    key={actionIndex}
                                    className="border rounded-lg p-3 space-y-2 bg-white"
                                  >
                                    <div className="flex items-center justify-between">
                                      <Badge variant="secondary" className="text-xs">
                                        Action {actionIndex + 1}
                                      </Badge>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleDeleteAction(triggerIndex, actionIndex)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>

                                    {/* Action Type */}
                                    <div className="space-y-2">
                                      <Label className="text-xs">Action Type</Label>
                                      <Select
                                        value={action.type}
                                        onValueChange={(value) =>
                                          handleUpdateAction(triggerIndex, actionIndex, { type: value })
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="navigate">Navigate to URL</SelectItem>
                                          <SelectItem value="close-modal">Close Modal/Sheet</SelectItem>
                                          <SelectItem value="toggle-visibility">Toggle Visibility</SelectItem>
                                          <SelectItem value="submit">Submit Form</SelectItem>
                                          <SelectItem value="set-variable">Set Variable</SelectItem>
                                          <SelectItem value="show-notification">Show Notification</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Action Config */}
                                    {action.type === 'navigate' && (
                                      <div className="space-y-2">
                                        <Label className="text-xs">URL</Label>
                                        <Input
                                          value={action.config?.url || ''}
                                          onChange={(e) =>
                                            handleUpdateAction(triggerIndex, actionIndex, {
                                              config: { ...action.config, url: e.target.value },
                                            })
                                          }
                                          placeholder="https://example.com"
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                    )}

                                    {action.type === 'toggle-visibility' && (
                                      <div className="space-y-2">
                                        <Label className="text-xs">Target Component ID</Label>
                                        <Input
                                          value={action.config?.targetId || ''}
                                          onChange={(e) =>
                                            handleUpdateAction(triggerIndex, actionIndex, {
                                              config: { ...action.config, targetId: e.target.value },
                                            })
                                          }
                                          placeholder="component-id"
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                    )}

                                    {action.type === 'set-variable' && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                          <Label className="text-xs">Variable Name</Label>
                                          <Input
                                            value={action.config?.variableName || ''}
                                            onChange={(e) =>
                                              handleUpdateAction(triggerIndex, actionIndex, {
                                                config: { ...action.config, variableName: e.target.value },
                                              })
                                            }
                                            placeholder="myVar"
                                            className="h-8 text-sm"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-xs">Value</Label>
                                          <Input
                                            value={action.config?.value || ''}
                                            onChange={(e) =>
                                              handleUpdateAction(triggerIndex, actionIndex, {
                                                config: { ...action.config, value: e.target.value },
                                              })
                                            }
                                            placeholder="true"
                                            className="h-8 text-sm"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {action.type === 'show-notification' && (
                                      <div className="space-y-2">
                                        <Label className="text-xs">Message</Label>
                                        <Input
                                          value={action.config?.message || ''}
                                          onChange={(e) =>
                                            handleUpdateAction(triggerIndex, actionIndex, {
                                              config: { ...action.config, message: e.target.value },
                                            })
                                          }
                                          placeholder="Success!"
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-blue-900 mb-2">⚡ Interaction Examples</h4>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Button → On Click → Navigate to /dashboard</li>
              <li>• Input → On Change → Set Variable "email"</li>
              <li>• Form → On Submit → Submit + Show Notification</li>
              <li>• Toggle → On Click → Toggle Visibility of modal</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
