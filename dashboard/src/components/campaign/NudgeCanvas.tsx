import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Palette, Type, Square, Image, Gift, Star, Film, Layout } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BottomSheetEditor } from "./BottomSheetV2/BottomSheetEditor";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NudgeConfig {
  type: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  buttonText?: string;
  position?: string;
  title?: string;
  imageUrl?: string;
  iconUrl?: string;
  buttonColor?: string;
  secondaryButtonText?: string;
  showCloseButton?: boolean;
  dismissible?: boolean;
  autoDismissSeconds?: number;
  rewardText?: string;
  rewardAmount?: string;
  variant?: string;
  icon?: string;
  slides?: Array<{
    imageUrl?: string;
    title?: string;
    text?: string;
    buttonText?: string;
  }>;
  bulletPoints?: string[];
  [key: string]: any;
}

interface NudgeCanvasProps {
  config: NudgeConfig;
  onChange: (config: NudgeConfig) => void;
}

export const NudgeCanvas = ({ config, onChange }: NudgeCanvasProps) => {
  const [visualBuilderMode, setVisualBuilderMode] = useState(false);
  
  const updateConfig = (key: keyof NudgeConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const nudgeTypes = [
    { value: "modal", label: "Modal", icon: Square, description: "Centered dialog overlay" },
    { value: "banner", label: "Banner", icon: Layout, description: "Top/bottom slide-in notification" },
    { value: "bottom_sheet", label: "Bottom Sheet", icon: Layout, description: "Draggable sheet from bottom" },
    { value: "tooltip", label: "Tooltip", icon: Type, description: "Arrow pointing to element" },
    { value: "pip", label: "PIP (Floating)", icon: Star, description: "Draggable floating widget" },
    { value: "scratch_card", label: "Scratch Card", icon: Gift, description: "Scratch to reveal reward" },
    { value: "story_carousel", label: "Story Carousel", icon: Film, description: "Instagram-style stories" },
    { value: "inline", label: "Inline Widget", icon: Image, description: "Embedded in content" },
  ];

  const renderTypeSpecificFields = () => {
    switch (config.type) {
      case "modal":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={config.title || ""}
                onChange={(e) => updateConfig("title", e.target.value)}
                placeholder="e.g., Special Offer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                value={config.imageUrl || ""}
                onChange={(e) => updateConfig("imageUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryButton">Secondary Button Text (Optional)</Label>
              <Input
                id="secondaryButton"
                value={config.secondaryButtonText || ""}
                onChange={(e) => updateConfig("secondaryButtonText", e.target.value)}
                placeholder="e.g., Maybe Later"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showClose">Show Close Button</Label>
              <Switch
                id="showClose"
                checked={config.showCloseButton !== false}
                onCheckedChange={(checked) => updateConfig("showCloseButton", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dismissible">Dismissible (tap outside to close)</Label>
              <Switch
                id="dismissible"
                checked={config.dismissible !== false}
                onCheckedChange={(checked) => updateConfig("dismissible", checked)}
              />
            </div>
          </>
        );

      case "banner":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="bannerPosition">Banner Position</Label>
              <Select 
                value={config.position || "top"} 
                onValueChange={(v) => updateConfig("position", v)}
              >
                <SelectTrigger id="bannerPosition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="autoDismiss">Auto Dismiss (seconds)</Label>
              <Input
                id="autoDismiss"
                type="number"
                value={config.autoDismissSeconds || 5}
                onChange={(e) => updateConfig("autoDismissSeconds", parseInt(e.target.value))}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bannerTitle">Title (Optional)</Label>
              <Input
                id="bannerTitle"
                value={config.title || ""}
                onChange={(e) => updateConfig("title", e.target.value)}
                placeholder="e.g., New Feature"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bannerIcon">Icon URL (Optional)</Label>
              <Input
                id="bannerIcon"
                value={config.imageUrl || ""}
                onChange={(e) => updateConfig("imageUrl", e.target.value)}
                placeholder="https://example.com/icon.png"
              />
            </div>
          </>
        );

      case "bottom_sheet":
        // Check if user wants visual builder mode
        if (visualBuilderMode) {
          return (
            <div className="space-y-4">
              {/* Mode Toggle */}
              <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">🎨 Visual Builder Mode</h3>
                    <p className="text-xs text-gray-600">Drag and drop components like Canva</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setVisualBuilderMode(false)}
                  >
                    Switch to Simple Mode
                  </Button>
                </div>
              </div>

              {/* Visual Builder Component - Now using V2! */}
              <BottomSheetEditor
                config={config}
                onChange={onChange}
              />
            </div>
          );
        }

        // Simple Mode - Original Form Controls
        return (
          <>
            {/* Content Type Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>📝</span> Content Type & Settings
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <select
                  id="contentType"
                  value={config.contentType || "announcement"}
                  onChange={(e) => updateConfig("contentType", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="announcement">Announcement</option>
                  <option value="form">Form/Survey</option>
                  <option value="product">Product Details</option>
                  <option value="carousel">Image Carousel</option>
                  <option value="media">Media Player</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheetTitle">Title</Label>
                <Input
                  id="sheetTitle"
                  value={config.title || ""}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  placeholder="e.g., Special Offer!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheetDescription">Description</Label>
                <Textarea
                  id="sheetDescription"
                  value={config.description || ""}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  placeholder="Describe your offer or message..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sheetIcon">Icon/Image URL</Label>
                <Input
                  id="sheetIcon"
                  value={config.iconUrl || config.imageUrl || ""}
                  onChange={(e) => {
                    updateConfig("iconUrl", e.target.value);
                    updateConfig("imageUrl", e.target.value);
                  }}
                  placeholder="https://example.com/icon.png"
                />
              </div>
            </div>

            {/* Sheet Behavior Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>⚙️</span> Sheet Behavior
              </h3>

              <div className="space-y-2">
                <Label htmlFor="sheetType">Sheet Type</Label>
                <select
                  id="sheetType"
                  value={config.sheetType || "draggable"}
                  onChange={(e) => updateConfig("sheetType", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="standard">Standard (Fixed Height)</option>
                  <option value="draggable">Draggable (Snap Points)</option>
                  <option value="modal">Modal (Can't Dismiss Easily)</option>
                  <option value="persistent">Persistent (Always Visible)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialHeight">Initial Height</Label>
                <select
                  id="initialHeight"
                  value={config.initialHeight || "half"}
                  onChange={(e) => updateConfig("initialHeight", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="peek">Peek (30%)</option>
                  <option value="half">Half (50%)</option>
                  <option value="full">Full (90%)</option>
                  <option value="custom">Custom Height</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dismissible">Dismissible</Label>
                <Switch
                  id="dismissible"
                  checked={config.dismissible !== false}
                  onCheckedChange={(checked) => updateConfig("dismissible", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="tapOutsideToDismiss">Tap Outside to Dismiss</Label>
                <Switch
                  id="tapOutsideToDismiss"
                  checked={config.tapOutsideToDismiss !== false}
                  onCheckedChange={(checked) => updateConfig("tapOutsideToDismiss", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="swipeDownToDismiss">Swipe Down to Dismiss</Label>
                <Switch
                  id="swipeDownToDismiss"
                  checked={config.swipeDownToDismiss !== false}
                  onCheckedChange={(checked) => updateConfig("swipeDownToDismiss", checked)}
                />
              </div>
            </div>

            {/* Styling Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span>🎨</span> Styling & Appearance
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setVisualBuilderMode(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                >
                  🎨 Switch to Visual Builder
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cornerRadius">Corner Radius (px)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cornerRadius"
                    type="range"
                    value={config.cornerRadius || 20}
                    onChange={(e) => updateConfig("cornerRadius", parseInt(e.target.value))}
                    min="0"
                    max="40"
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12 text-right">{config.cornerRadius || 20}px</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundDimOpacity">Background Dim Opacity</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="backgroundDimOpacity"
                    type="range"
                    value={(config.backgroundDimOpacity || 0.5) * 100}
                    onChange={(e) => updateConfig("backgroundDimOpacity", parseInt(e.target.value) / 100)}
                    min="0"
                    max="100"
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12 text-right">{Math.round((config.backgroundDimOpacity || 0.5) * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="handleBarVisible">Show Handle Bar</Label>
                <Switch
                  id="handleBarVisible"
                  checked={config.handleBarVisible !== false}
                  onCheckedChange={(checked) => updateConfig("handleBarVisible", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handleBarColor">Handle Bar Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.handleBarColor || "#CCCCCC"}
                    onChange={(e) => updateConfig("handleBarColor", e.target.value)}
                    className="w-12 h-10"
                  />
                  <Input
                    value={config.handleBarColor || "#CCCCCC"}
                    onChange={(e) => updateConfig("handleBarColor", e.target.value)}
                    placeholder="#CCCCCC"
                  />
                </div>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>🔘</span> Call-to-Action Buttons
              </h3>

              <div className="space-y-2">
                <Label htmlFor="primaryBtnText">Primary Button Text</Label>
                <Input
                  id="primaryBtnText"
                  value={config.buttonText || ""}
                  onChange={(e) => updateConfig("buttonText", e.target.value)}
                  placeholder="e.g., Get Started"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryBtnText">Secondary Button Text (Optional)</Label>
                <Input
                  id="secondaryBtnText"
                  value={config.secondaryButtonText || ""}
                  onChange={(e) => updateConfig("secondaryButtonText", e.target.value)}
                  placeholder="e.g., Maybe Later"
                />
              </div>
            </div>

            {/* Animation Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>✨</span> Animation Settings
              </h3>

              <div className="space-y-2">
                <Label htmlFor="entranceAnimation">Entrance Animation</Label>
                <select
                  id="entranceAnimation"
                  value={config.entranceAnimation || "slide"}
                  onChange={(e) => updateConfig("entranceAnimation", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="slide">Slide Up</option>
                  <option value="spring">Spring (Bouncy)</option>
                  <option value="smooth">Smooth Fade</option>
                  <option value="bounce">Bounce</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animationDuration">Animation Duration (ms)</Label>
                <Input
                  id="animationDuration"
                  type="number"
                  value={config.animationDuration || 350}
                  onChange={(e) => updateConfig("animationDuration", parseInt(e.target.value))}
                  min="100"
                  max="1000"
                  step="50"
                />
              </div>
            </div>

            {/* Advanced Features Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>🚀</span> Advanced Features
              </h3>

              <div className="space-y-2">
                <Label htmlFor="maxImpressionsPerDay">Max Impressions per Day</Label>
                <Input
                  id="maxImpressionsPerDay"
                  type="number"
                  value={config.maxImpressionsPerDay || 3}
                  onChange={(e) => updateConfig("maxImpressionsPerDay", parseInt(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooldownMinutes">Cooldown After Dismiss (minutes)</Label>
                <Input
                  id="cooldownMinutes"
                  type="number"
                  value={config.cooldownMinutes || 60}
                  onChange={(e) => updateConfig("cooldownMinutes", parseInt(e.target.value))}
                  min="5"
                  max="1440"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="keyboardAvoidance">Keyboard Avoidance</Label>
                <Switch
                  id="keyboardAvoidance"
                  checked={config.keyboardAvoidance !== false}
                  onCheckedChange={(checked) => updateConfig("keyboardAvoidance", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="trackAnalytics">Track Analytics</Label>
                <Switch
                  id="trackAnalytics"
                  checked={config.trackAnalytics !== false}
                  onCheckedChange={(checked) => updateConfig("trackAnalytics", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hapticFeedback">Haptic Feedback</Label>
                <Switch
                  id="hapticFeedback"
                  checked={config.hapticFeedback !== false}
                  onCheckedChange={(checked) => updateConfig("hapticFeedback", checked)}
                />
              </div>
            </div>
          </>
        );

      case "tooltip":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="tooltipPos">Tooltip Position</Label>
              <Select 
                value={config.position || "bottom"} 
                onValueChange={(v) => updateConfig("position", v)}
              >
                <SelectTrigger id="tooltipPos">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tooltipTitle">Title (Optional)</Label>
              <Input
                id="tooltipTitle"
                value={config.title || ""}
                onChange={(e) => updateConfig("title", e.target.value)}
                placeholder="e.g., Pro Tip"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetX">Target X Position (px)</Label>
              <Input
                id="targetX"
                type="number"
                value={config.targetX || 200}
                onChange={(e) => updateConfig("targetX", parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetY">Target Y Position (px)</Label>
              <Input
                id="targetY"
                type="number"
                value={config.targetY || 300}
                onChange={(e) => updateConfig("targetY", parseInt(e.target.value))}
              />
            </div>
          </>
        );

      case "pip":
        return (
          <>
            {/* Content Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>📝</span> Content Settings
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="pipIcon">Icon URL (for minimized state)</Label>
                <Input
                  id="pipIcon"
                  value={config.iconUrl || ""}
                  onChange={(e) => updateConfig("iconUrl", e.target.value)}
                  placeholder="https://example.com/icon.png"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pipVideo">Video URL (YouTube or direct link)</Label>
                <Input
                  id="pipVideo"
                  value={config.videoUrl || ""}
                  onChange={(e) => updateConfig("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pipTitle">Title Text</Label>
                <Input
                  id="pipTitle"
                  value={config.title || ""}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  placeholder="e.g., Watch Now"
                />
              </div>
            </div>

            {/* Size & Dimensions Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>📏</span> Size & Dimensions
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pipWidth">Width (px)</Label>
                  <Input
                    id="pipWidth"
                    type="number"
                    value={config.width || 160}
                    onChange={(e) => updateConfig("width", parseInt(e.target.value))}
                    min="100"
                    max="400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pipHeight">Height (px)</Label>
                  <Input
                    id="pipHeight"
                    type="number"
                    value={config.height || 220}
                    onChange={(e) => updateConfig("height", parseInt(e.target.value))}
                    min="140"
                    max="600"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cornerRadius">Corner Radius (px)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cornerRadius"
                    type="range"
                    value={config.cornerRadius || 20}
                    onChange={(e) => updateConfig("cornerRadius", parseInt(e.target.value))}
                    min="0"
                    max="50"
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12 text-right">{config.cornerRadius || 20}px</span>
                </div>
              </div>
            </div>

            {/* Position Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>📍</span> Position & Placement
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialX">Initial X Position (px)</Label>
                  <Input
                    id="initialX"
                    type="number"
                    value={config.initialX || 16}
                    onChange={(e) => updateConfig("initialX", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialY">Initial Y Position (px)</Label>
                  <Input
                    id="initialY"
                    type="number"
                    value={config.initialY || 100}
                    onChange={(e) => updateConfig("initialY", parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultEdge">Default Snap Edge</Label>
                <select
                  id="defaultEdge"
                  value={config.defaultEdge || "right"}
                  onChange={(e) => updateConfig("defaultEdge", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="left">Left Edge</option>
                  <option value="right">Right Edge</option>
                  <option value="none">No Snap (Free Position)</option>
                </select>
              </div>
            </div>

            {/* Border & Shadow Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>🎨</span> Border & Effects
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borderWidth">Border Width (px)</Label>
                  <Input
                    id="borderWidth"
                    type="number"
                    value={config.borderWidth || 0}
                    onChange={(e) => updateConfig("borderWidth", parseInt(e.target.value))}
                    min="0"
                    max="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.borderColor || "#FFFFFF"}
                      onChange={(e) => updateConfig("borderColor", e.target.value)}
                      className="w-12 h-10"
                    />
                    <Input
                      value={config.borderColor || "#FFFFFF"}
                      onChange={(e) => updateConfig("borderColor", e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shadowBlur">Shadow Blur Radius (px)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="shadowBlur"
                    type="range"
                    value={config.shadowBlur || 24}
                    onChange={(e) => updateConfig("shadowBlur", parseInt(e.target.value))}
                    min="0"
                    max="50"
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-12 text-right">{config.shadowBlur || 24}px</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="glassmorphism">Enable Glassmorphism Effect</Label>
                <Switch
                  id="glassmorphism"
                  checked={config.glassmorphism !== false}
                  onCheckedChange={(checked) => updateConfig("glassmorphism", checked)}
                />
              </div>
            </div>

            {/* Video Settings Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>🎬</span> Video Settings
              </h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="autoPlay">Auto-play Video</Label>
                <Switch
                  id="autoPlay"
                  checked={config.autoPlay !== false}
                  onCheckedChange={(checked) => updateConfig("autoPlay", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="loopVideo">Loop Video</Label>
                <Switch
                  id="loopVideo"
                  checked={config.loopVideo !== false}
                  onCheckedChange={(checked) => updateConfig("loopVideo", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showAudioControl">Show Audio Control Button</Label>
                <Switch
                  id="showAudioControl"
                  checked={config.showAudioControl !== false}
                  onCheckedChange={(checked) => updateConfig("showAudioControl", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="defaultMuted">Start Muted</Label>
                <Switch
                  id="defaultMuted"
                  checked={config.defaultMuted === true}
                  onCheckedChange={(checked) => updateConfig("defaultMuted", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultQuality">Default Video Quality</Label>
                <select
                  id="defaultQuality"
                  value={config.defaultQuality || "Auto"}
                  onChange={(e) => updateConfig("defaultQuality", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Auto">Auto (Adaptive)</option>
                  <option value="HD">HD (1080p)</option>
                  <option value="SD">SD (480p)</option>
                </select>
              </div>
            </div>

            {/* Controls & UI Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>🎮</span> Controls & UI
              </h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showProgressBar">Show Progress Bar</Label>
                <Switch
                  id="showProgressBar"
                  checked={config.showProgressBar !== false}
                  onCheckedChange={(checked) => updateConfig("showProgressBar", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showTimeDisplay">Show Time Display</Label>
                <Switch
                  id="showTimeDisplay"
                  checked={config.showTimeDisplay !== false}
                  onCheckedChange={(checked) => updateConfig("showTimeDisplay", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showQualityBadge">Show HD Quality Badge</Label>
                <Switch
                  id="showQualityBadge"
                  checked={config.showQualityBadge !== false}
                  onCheckedChange={(checked) => updateConfig("showQualityBadge", checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoHideDuration">Auto-hide Controls (seconds)</Label>
                <Input
                  id="autoHideDuration"
                  type="number"
                  value={config.autoHideDuration || 3}
                  onChange={(e) => updateConfig("autoHideDuration", parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            {/* Interaction Settings Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>👆</span> Interaction Settings
              </h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableDrag">Enable Drag to Move</Label>
                <Switch
                  id="enableDrag"
                  checked={config.enableDrag !== false}
                  onCheckedChange={(checked) => updateConfig("enableDrag", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableSwipeDismiss">Enable Swipe Down to Dismiss</Label>
                <Switch
                  id="enableSwipeDismiss"
                  checked={config.enableSwipeDismiss !== false}
                  onCheckedChange={(checked) => updateConfig("enableSwipeDismiss", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableDoubleTap">Enable Double-tap Fullscreen</Label>
                <Switch
                  id="enableDoubleTap"
                  checked={config.enableDoubleTap !== false}
                  onCheckedChange={(checked) => updateConfig("enableDoubleTap", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableLongPress">Enable Long-press Menu</Label>
                <Switch
                  id="enableLongPress"
                  checked={config.enableLongPress !== false}
                  onCheckedChange={(checked) => updateConfig("enableLongPress", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="hapticFeedback">Haptic Feedback</Label>
                <Switch
                  id="hapticFeedback"
                  checked={config.hapticFeedback !== false}
                  onCheckedChange={(checked) => updateConfig("hapticFeedback", checked)}
                />
              </div>
            </div>

            {/* Animation Settings Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>✨</span> Animation Settings
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="entranceAnimation">Entrance Animation</Label>
                <select
                  id="entranceAnimation"
                  value={config.entranceAnimation || "scale"}
                  onChange={(e) => updateConfig("entranceAnimation", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="scale">Scale + Bounce</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide In</option>
                  <option value="none">No Animation</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="animationDuration">Animation Duration (ms)</Label>
                <Input
                  id="animationDuration"
                  type="number"
                  value={config.animationDuration || 400}
                  onChange={(e) => updateConfig("animationDuration", parseInt(e.target.value))}
                  min="100"
                  max="1000"
                  step="100"
                />
              </div>
            </div>

            {/* Advanced Features Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <span>🚀</span> Advanced Features
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="maxImpressionsPerDay">Max Impressions per Day</Label>
                <Input
                  id="maxImpressionsPerDay"
                  type="number"
                  value={config.maxImpressionsPerDay || 5}
                  onChange={(e) => updateConfig("maxImpressionsPerDay", parseInt(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cooldownMinutes">Cooldown After Dismiss (minutes)</Label>
                <Input
                  id="cooldownMinutes"
                  type="number"
                  value={config.cooldownMinutes || 30}
                  onChange={(e) => updateConfig("cooldownMinutes", parseInt(e.target.value))}
                  min="5"
                  max="1440"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboardAvoidance">Keyboard Avoidance</Label>
                <Switch
                  id="keyboardAvoidance"
                  checked={config.keyboardAvoidance !== false}
                  onCheckedChange={(checked) => updateConfig("keyboardAvoidance", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="orientationAutoFullscreen">Auto-fullscreen on Landscape</Label>
                <Switch
                  id="orientationAutoFullscreen"
                  checked={config.orientationAutoFullscreen !== false}
                  onCheckedChange={(checked) => updateConfig("orientationAutoFullscreen", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="trackAnalytics">Track Video Analytics</Label>
                <Switch
                  id="trackAnalytics"
                  checked={config.trackAnalytics !== false}
                  onCheckedChange={(checked) => updateConfig("trackAnalytics", checked)}
                />
              </div>
            </div>
          </>
        );

      case "scratch_card":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="rewardAmount">Reward Amount</Label>
              <Input
                id="rewardAmount"
                value={config.rewardAmount || ""}
                onChange={(e) => updateConfig("rewardAmount", e.target.value)}
                placeholder="e.g., $10 OFF, 20% OFF"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rewardText">Reward Text</Label>
              <Input
                id="rewardText"
                value={config.rewardText || ""}
                onChange={(e) => updateConfig("rewardText", e.target.value)}
                placeholder="e.g., Congratulations! You won"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scratchPrompt">Scratch Prompt</Label>
              <Input
                id="scratchPrompt"
                value={config.scratchPrompt || ""}
                onChange={(e) => updateConfig("scratchPrompt", e.target.value)}
                placeholder="Scratch to reveal your reward"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overlayColor">Scratch Overlay Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.overlayColor || "#C0C0C0"}
                  onChange={(e) => updateConfig("overlayColor", e.target.value)}
                  className="h-10 w-20"
                />
                <Input
                  value={config.overlayColor || "#C0C0C0"}
                  onChange={(e) => updateConfig("overlayColor", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Reveal Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                value={(config.revealThreshold || 0.6) * 100}
                onChange={(e) => updateConfig("revealThreshold", parseInt(e.target.value) / 100)}
                placeholder="60"
              />
            </div>
          </>
        );

      case "story_carousel":
        return (
          <>
            <div className="space-y-2">
              <Label>Story Slides (manage in Advanced)</Label>
              <p className="text-xs text-muted-foreground">
                Currently {config.slides?.length || 1} slide(s). Use JSON editor to add/edit slides.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slideDuration">Slide Duration (seconds)</Label>
              <Input
                id="slideDuration"
                type="number"
                value={config.slideDuration || 5}
                onChange={(e) => updateConfig("slideDuration", parseInt(e.target.value))}
                placeholder="5"
              />
            </div>
          </>
        );

      case "inline":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="inlineVariant">Variant</Label>
              <Select 
                value={config.variant || "card"} 
                onValueChange={(v) => updateConfig("variant", v)}
              >
                <SelectTrigger id="inlineVariant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inlineTitle">Title</Label>
              <Input
                id="inlineTitle"
                value={config.title || ""}
                onChange={(e) => updateConfig("title", e.target.value)}
                placeholder="e.g., Feature Highlight"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inlineImage">Image URL (for card variant)</Label>
              <Input
                id="inlineImage"
                value={config.imageUrl || ""}
                onChange={(e) => updateConfig("imageUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inlineIcon">Icon</Label>
              <Select 
                value={config.icon || ""} 
                onValueChange={(v) => updateConfig("icon", v)}
              >
                <SelectTrigger id="inlineIcon">
                  <SelectValue placeholder="Choose icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                  <SelectItem value="gift">Gift</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Palette className="mr-2 h-5 w-5 text-primary" />
          Design Your Nudge
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize the appearance and content of your in-app nudge
        </p>
      </div>

      {/* Nudge Type Selector */}
      <div className="space-y-2">
        <Label>Nudge Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {nudgeTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = config.type === type.value;
            return (
              <button
                key={type.value}
                onClick={() => updateConfig("type", type.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className={`font-medium ${isSelected ? "text-primary" : ""}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Common Fields */}
      <Accordion type="single" collapsible defaultValue="content">
        <AccordionItem value="content">
          <AccordionTrigger className="font-medium">
            <div className="flex items-center">
              <Type className="mr-2 h-4 w-4" />
              Content
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="mainText">Main Message</Label>
              <Textarea
                id="mainText"
                value={config.text}
                onChange={(e) => updateConfig("text", e.target.value)}
                placeholder="Enter your nudge message..."
                rows={3}
              />
            </div>

            {config.type !== "story_carousel" && (
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text (Optional)</Label>
                <Input
                  id="buttonText"
                  value={config.buttonText || ""}
                  onChange={(e) => updateConfig("buttonText", e.target.value)}
                  placeholder="e.g., Claim Now, Learn More"
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="styling">
          <AccordionTrigger className="font-medium">
            <div className="flex items-center">
              <Square className="mr-2 h-4 w-4" />
              Styling
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                    placeholder="#8B5CF6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={config.textColor}
                    onChange={(e) => updateConfig("textColor", e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    value={config.textColor}
                    onChange={(e) => updateConfig("textColor", e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {config.type !== "story_carousel" && (
              <div className="space-y-2">
                <Label htmlFor="buttonColor">Button Color (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.buttonColor || config.backgroundColor}
                    onChange={(e) => updateConfig("buttonColor", e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    value={config.buttonColor || ""}
                    onChange={(e) => updateConfig("buttonColor", e.target.value)}
                    placeholder="Defaults to theme color"
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type-specific">
          <AccordionTrigger className="font-medium">
            <div className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              {config.type.charAt(0).toUpperCase() + config.type.slice(1).replace("_", " ")} Options
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {renderTypeSpecificFields()}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
