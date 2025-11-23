import React, { useState } from 'react';
import { Play, Plus, Trash2, Copy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import type { Animation, AnimationTrigger, Keyframe } from '../../core/types';

interface AnimationPanelProps {
  state: BottomSheetState;
}

// Animation presets for quick setup
const ANIMATION_PRESETS = [
  {
    id: 'fade-in',
    name: 'Fade In',
    icon: '⬆️',
    keyframes: [
      { time: 0, properties: { opacity: '0' } },
      { time: 100, properties: { opacity: '1' } },
    ],
    duration: 500,
    easing: 'ease-out' as const,
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    icon: '⬆️',
    keyframes: [
      { time: 0, properties: { transform: 'translateY(20px)', opacity: '0' } },
      { time: 100, properties: { transform: 'translateY(0)', opacity: '1' } },
    ],
    duration: 600,
    easing: 'ease-out' as const,
  },
  {
    id: 'slide-down',
    name: 'Slide Down',
    icon: '⬇️',
    keyframes: [
      { time: 0, properties: { transform: 'translateY(-20px)', opacity: '0' } },
      { time: 100, properties: { transform: 'translateY(0)', opacity: '1' } },
    ],
    duration: 600,
    easing: 'ease-out' as const,
  },
  {
    id: 'scale-in',
    name: 'Scale In',
    icon: '🔍',
    keyframes: [
      { time: 0, properties: { transform: 'scale(0.8)', opacity: '0' } },
      { time: 100, properties: { transform: 'scale(1)', opacity: '1' } },
    ],
    duration: 500,
    easing: 'ease-out' as const,
  },
  {
    id: 'bounce',
    name: 'Bounce',
    icon: '🏀',
    keyframes: [
      { time: 0, properties: { transform: 'translateY(0)' } },
      { time: 25, properties: { transform: 'translateY(-10px)' } },
      { time: 50, properties: { transform: 'translateY(0)' } },
      { time: 75, properties: { transform: 'translateY(-5px)' } },
      { time: 100, properties: { transform: 'translateY(0)' } },
    ],
    duration: 800,
    easing: 'ease-in-out' as const,
  },
  {
    id: 'shake',
    name: 'Shake',
    icon: '🤝',
    keyframes: [
      { time: 0, properties: { transform: 'translateX(0)' } },
      { time: 25, properties: { transform: 'translateX(-5px)' } },
      { time: 50, properties: { transform: 'translateX(5px)' } },
      { time: 75, properties: { transform: 'translateX(-5px)' } },
      { time: 100, properties: { transform: 'translateX(0)' } },
    ],
    duration: 500,
    easing: 'ease-in-out' as const,
  },
];

const EASING_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
  { value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', label: 'Elastic' },
];

export default function AnimationPanel({ state }: AnimationPanelProps) {
  const [selectedAnimationId, setSelectedAnimationId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedComponent = state.selectedComponent;
  if (!selectedComponent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <Zap className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">Select a component to add animations</p>
      </div>
    );
  }

  const componentAnimations = selectedComponent.animations || [];
  const selectedAnimation = componentAnimations.find(a => a.id === selectedAnimationId);

  const handleAddPreset = (preset: typeof ANIMATION_PRESETS[0]) => {
    const newAnimation: Animation = {
      id: `anim-${Date.now()}`,
      name: preset.name,
      trigger: 'on-enter',
      keyframes: preset.keyframes.map(kf => ({
        ...kf,
        id: `kf-${Date.now()}-${kf.time}`,
      })),
      duration: preset.duration,
      delay: 0,
      easing: preset.easing,
      loop: false,
      enabled: true,
    };
    state.addAnimation(selectedComponent.id, newAnimation);
    setSelectedAnimationId(newAnimation.id);
  };

  const handleUpdateAnimation = (animationId: string, updates: Partial<Animation>) => {
    state.updateAnimation(selectedComponent.id, animationId, updates);
  };

  const handleDeleteAnimation = (animationId: string) => {
    state.removeAnimation(selectedComponent.id, animationId);
    if (selectedAnimationId === animationId) {
      setSelectedAnimationId(null);
    }
  };

  const handleDuplicateAnimation = (animation: Animation) => {
    const newAnimation: Animation = {
      ...animation,
      id: `anim-${Date.now()}`,
      name: `${animation.name} (Copy)`,
      keyframes: animation.keyframes.map(kf => ({
        ...kf,
        id: `kf-${Date.now()}-${kf.time}`,
      })),
    };
    state.addAnimation(selectedComponent.id, newAnimation);
    setSelectedAnimationId(newAnimation.id);
  };

  const handleAddKeyframe = (animationId: string) => {
    const animation = componentAnimations.find(a => a.id === animationId);
    if (!animation) return;

    const newKeyframe: Keyframe = {
      id: `kf-${Date.now()}`,
      time: 50,
      properties: { opacity: '1' },
    };

    const updatedKeyframes = [...animation.keyframes, newKeyframe].sort((a, b) => a.time - b.time);
    handleUpdateAnimation(animationId, { keyframes: updatedKeyframes });
  };

  const handleUpdateKeyframe = (animationId: string, keyframeId: string, updates: Partial<Keyframe>) => {
    const animation = componentAnimations.find(a => a.id === animationId);
    if (!animation) return;

    const updatedKeyframes = animation.keyframes.map(kf =>
      kf.id === keyframeId ? { ...kf, ...updates } : kf
    );
    handleUpdateAnimation(animationId, { keyframes: updatedKeyframes });
  };

  const handleDeleteKeyframe = (animationId: string, keyframeId: string) => {
    const animation = componentAnimations.find(a => a.id === animationId);
    if (!animation) return;

    const updatedKeyframes = animation.keyframes.filter(kf => kf.id !== keyframeId);
    if (updatedKeyframes.length >= 2) {
      handleUpdateAnimation(animationId, { keyframes: updatedKeyframes });
    }
  };

  const handlePreview = (animation: Animation) => {
    setIsPlaying(true);
    state.setAnimationPreview(animation.id);
    setTimeout(() => {
      setIsPlaying(false);
      state.setAnimationPreview(null);
    }, animation.duration + animation.delay);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="library" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 w-full rounded-none border-b">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Presets Library Tab */}
        <TabsContent value="library" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-xs font-semibold mb-3 block">Animation Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ANIMATION_PRESETS.map(preset => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      className="h-auto flex-col items-start p-3 gap-1"
                      onClick={() => handleAddPreset(preset)}
                    >
                      <span className="text-lg">{preset.icon}</span>
                      <span className="text-xs font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">{preset.duration}ms</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs font-semibold mb-3 block">
                  Active Animations ({componentAnimations.length})
                </Label>
                {componentAnimations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-xs">No animations added yet</p>
                    <p className="text-xs mt-1">Select a preset above to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {componentAnimations.map(animation => (
                      <div
                        key={animation.id}
                        className={`border rounded-lg p-3 space-y-2 cursor-pointer transition-colors ${
                          selectedAnimationId === animation.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedAnimationId(animation.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{animation.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {animation.trigger}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(animation);
                              }}
                              disabled={isPlaying}
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateAnimation(animation);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAnimation(animation.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{animation.duration}ms</span>
                          <span>{animation.keyframes.length} keyframes</span>
                          <span>{animation.easing}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Timeline Editor Tab */}
        <TabsContent value="timeline" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            {selectedAnimation ? (
              <div className="p-4 space-y-6">
                {/* Animation Settings */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs mb-2 block">Animation Name</Label>
                    <Input
                      value={selectedAnimation.name}
                      onChange={(e) => handleUpdateAnimation(selectedAnimation.id, { name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-2 block">Trigger</Label>
                    <Select
                      value={selectedAnimation.trigger}
                      onValueChange={(value) =>
                        handleUpdateAnimation(selectedAnimation.id, { trigger: value as AnimationTrigger })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-enter">On Enter (Load)</SelectItem>
                        <SelectItem value="on-exit">On Exit</SelectItem>
                        <SelectItem value="on-hover">On Hover</SelectItem>
                        <SelectItem value="on-click">On Click</SelectItem>
                        <SelectItem value="on-scroll">On Scroll</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-2 block">Duration (ms)</Label>
                      <Input
                        type="number"
                        value={selectedAnimation.duration}
                        onChange={(e) =>
                          handleUpdateAnimation(selectedAnimation.id, { duration: parseInt(e.target.value) })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Delay (ms)</Label>
                      <Input
                        type="number"
                        value={selectedAnimation.delay}
                        onChange={(e) =>
                          handleUpdateAnimation(selectedAnimation.id, { delay: parseInt(e.target.value) })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-2 block">Easing</Label>
                    <Select
                      value={selectedAnimation.easing}
                      onValueChange={(value) =>
                        handleUpdateAnimation(selectedAnimation.id, { easing: value as Animation['easing'] })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EASING_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="loop"
                      checked={selectedAnimation.loop}
                      onChange={(e) => handleUpdateAnimation(selectedAnimation.id, { loop: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="loop" className="text-xs cursor-pointer">
                      Loop Animation
                    </Label>
                  </div>
                </div>

                <Separator />

                {/* Keyframes Editor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-xs font-semibold">Keyframes</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddKeyframe(selectedAnimation.id)}
                      className="h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Keyframe
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedAnimation.keyframes.map((keyframe, index) => (
                      <div key={keyframe.id} className="border rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Keyframe {index + 1}
                          </Badge>
                          {selectedAnimation.keyframes.length > 2 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteKeyframe(selectedAnimation.id, keyframe.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs mb-2 block">Time (%)</Label>
                          <Slider
                            value={[keyframe.time]}
                            onValueChange={([value]) =>
                              handleUpdateKeyframe(selectedAnimation.id, keyframe.id, { time: value })
                            }
                            min={0}
                            max={100}
                            step={1}
                            className="mb-2"
                          />
                          <span className="text-xs text-muted-foreground">{keyframe.time}%</span>
                        </div>

                        <div>
                          <Label className="text-xs mb-2 block">Properties (CSS)</Label>
                          <textarea
                            value={JSON.stringify(keyframe.properties, null, 2)}
                            onChange={(e) => {
                              try {
                                const properties = JSON.parse(e.target.value);
                                handleUpdateKeyframe(selectedAnimation.id, keyframe.id, { properties });
                              } catch (e) {
                                // Invalid JSON, ignore
                              }
                            }}
                            className="w-full h-20 text-xs font-mono border rounded-md p-2 resize-none"
                            placeholder='{"opacity": "1", "transform": "scale(1)"}'
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Button */}
                <Button
                  onClick={() => handlePreview(selectedAnimation)}
                  disabled={isPlaying}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isPlaying ? 'Playing...' : 'Preview Animation'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <p className="text-sm">Select an animation from the Library tab</p>
                <p className="text-xs mt-2">to edit its timeline and keyframes</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
