import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, Type, Palette, Image as ImageIcon, Filter, Crop,
  Circle, Square, MoreHorizontal
} from 'lucide-react';
import { SketchPicker } from 'react-color';

interface FloatingToolbarProps {
  component: any;
  position: { x: number; y: number };
  onChange: (updates: any) => void;
}

export function FloatingToolbar({ component, position, onChange }: FloatingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  // Text Component Toolbar
  if (component.type === 'text') {
    return (
      <div 
        className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex items-center gap-2"
        style={{ 
          left: position.x, 
          top: position.y - 60,
          transform: 'translateX(-50%)'
        }}
      >
        {/* Font Family */}
        <Select 
          value={component.style?.fontFamily || 'Inter'} 
          onValueChange={(value) => onChange({ style: { ...component.style, fontFamily: value } })}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Montserrat">Montserrat</SelectItem>
            <SelectItem value="Poppins">Poppins</SelectItem>
            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Input
          type="number"
          value={component.style?.fontSize || 16}
          onChange={(e) => onChange({ style: { ...component.style, fontSize: parseInt(e.target.value) } })}
          className="w-16 h-8 text-xs"
          min={8}
          max={72}
        />

        <div className="w-px h-6 bg-gray-300" />

        {/* Bold */}
        <Button
          variant={component.style?.fontWeight === 'bold' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ 
            style: { 
              ...component.style, 
              fontWeight: component.style?.fontWeight === 'bold' ? 'normal' : 'bold' 
            } 
          })}
        >
          <Bold className="h-4 w-4" />
        </Button>

        {/* Italic */}
        <Button
          variant={component.style?.fontStyle === 'italic' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ 
            style: { 
              ...component.style, 
              fontStyle: component.style?.fontStyle === 'italic' ? 'normal' : 'italic' 
            } 
          })}
        >
          <Italic className="h-4 w-4" />
        </Button>

        {/* Underline */}
        <Button
          variant={component.style?.textDecoration === 'underline' ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ 
            style: { 
              ...component.style, 
              textDecoration: component.style?.textDecoration === 'underline' ? 'none' : 'underline' 
            } 
          })}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Alignment */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ style: { ...component.style, textAlign: 'left' } })}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ style: { ...component.style, textAlign: 'center' } })}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ style: { ...component.style, textAlign: 'right' } })}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Text Color */}
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: component.style?.color || '#000000' }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <SketchPicker
              color={component.style?.color || '#000000'}
              onChange={(color) => onChange({ style: { ...component.style, color: color.hex } })}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Image Component Toolbar
  if (component.type === 'image') {
    return (
      <div 
        className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex items-center gap-2"
        style={{ 
          left: position.x, 
          top: position.y - 60,
          transform: 'translateX(-50%)'
        }}
      >
        {/* Replace Image */}
        <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
          <ImageIcon className="h-4 w-4" />
          Replace
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Shape */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ style: { ...component.style, borderRadius: 0 } })}
          title="Rectangle"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ style: { ...component.style, borderRadius: '50%' } })}
          title="Circle"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange({ style: { ...component.style, borderRadius: 12 } })}
          title="Rounded"
        >
          <Square className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Filters */}
        <Select 
          value={component.style?.filter || 'none'} 
          onValueChange={(value) => onChange({ style: { ...component.style, filter: value === 'none' ? undefined : value } })}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Filters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="grayscale(100%)">Grayscale</SelectItem>
            <SelectItem value="sepia(100%)">Sepia</SelectItem>
            <SelectItem value="brightness(150%)">Bright</SelectItem>
            <SelectItem value="brightness(50%)">Dark</SelectItem>
            <SelectItem value="blur(5px)">Blur</SelectItem>
            <SelectItem value="contrast(200%)">High Contrast</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Button Component Toolbar
  if (component.type === 'button') {
    return (
      <div 
        className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-2 flex items-center gap-2"
        style={{ 
          left: position.x, 
          top: position.y - 60,
          transform: 'translateX(-50%)'
        }}
      >
        {/* Style Type */}
        <Select 
          value={component.style?.variant || 'solid'} 
          onValueChange={(value) => onChange({ style: { ...component.style, variant: value } })}
        >
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="ghost">Ghost</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300" />

        {/* Size */}
        <Select 
          value={component.style?.size || 'medium'} 
          onValueChange={(value) => onChange({ style: { ...component.style, size: value } })}
        >
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300" />

        {/* Background Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: component.style?.backgroundColor || '#6366F1' }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <SketchPicker
              color={component.style?.backgroundColor || '#6366F1'}
              onChange={(color) => onChange({ style: { ...component.style, backgroundColor: color.hex } })}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return null;
}
