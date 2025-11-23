import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Layer, BottomSheetConfig } from '@/store/useEditorStore';
import { Check, Circle, Move } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

type ColorTheme = {
  border: {
    default: string;
  };
  primary: Record<number, string>;
  gray: Record<number, string>;
} & (
  | {
      background: {
        page: string;
        card: string;
      };
      text: {
        primary: string;
        secondary: string;
      };
    }
  | {
      bg: string;
      text: string;
    }
);

// Helper functions for type-safe color access
const getBackgroundColor = (colors: ColorTheme): string => {
  if ('background' in colors) return colors.background.card;
  if ('bg' in colors) return colors.bg;
  return '#FFFFFF';
};

const getTextColor = (colors: ColorTheme): string => {
  if ('text' in colors) {
    if (typeof colors.text === 'string') return colors.text;
    return colors.text.primary;
  }
  return '#000000';
};

interface BottomSheetRendererProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (id: string) => void;
  colors: ColorTheme;
  config?: BottomSheetConfig;
  onHeightChange?: (height: number | string) => void; // Fix 7: Visual resize
}

/**
 * PHASE 1 & 3: Dynamic Bottom Sheet Renderer
 * Renders bottom sheet based on layer data with animation, overlay, and height controls
 */
export const BottomSheetRenderer: React.FC<BottomSheetRendererProps> = ({ 
  layers, 
  selectedLayerId, 
  onLayerSelect,
  colors,
  config,
  onHeightChange
}) => {
  // Debug logging
  console.log('BottomSheetRenderer: Rendering with', layers.length, 'layers');
  console.log('BottomSheetRenderer: Layers:', layers);
  
  // Fix 7: Visual resize handle state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Find bottom sheet container
  const bottomSheetLayer = layers.find(
    l => (l.type === 'container' && !l.parent) || 
    (l.type === 'container' && l.name.toLowerCase().includes('bottom sheet'))
  );
  
  console.log('BottomSheetRenderer: Found bottom sheet layer:', bottomSheetLayer);
  
  if (!bottomSheetLayer) {
    console.warn('BottomSheetRenderer: No bottom sheet container found!');
    return (
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'white',
        borderRadius: '24px 24px 0 0',
        padding: '20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
          No bottom sheet container found. Add layers to see preview.
        </p>
      </div>
    );
  }

  // Get all child layers sorted by zIndex
  const childLayers = layers
    .filter(l => l.parent === bottomSheetLayer.id)
    .sort((a, b) => a.zIndex - b.zIndex);

  console.log('BottomSheetRenderer: Child layers count:', childLayers.length);
  console.log('BottomSheetRenderer: Child layers:', childLayers);

  // Render countdown timer with proper cleanup
  const renderCountdown = (layer: Layer) => {
    const [timeLeft, setTimeLeft] = useState('');
    const endTimeMs = useMemo(() => 
      layer.content.endTime ? new Date(layer.content.endTime).getTime() : Date.now() + 3600000,
      [layer.content.endTime]
    );

    useEffect(() => {
      let mounted = true;
      
      const updateTimer = () => {
        if (!mounted) return;
        
        const now = Date.now();
        const diff = endTimeMs - now;

        if (diff <= 0) {
          setTimeLeft('00:00:00');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          const format = layer.content.format || 'HH:MM:SS';
          if (format === 'MM:SS') {
            setTimeLeft(`${String(hours * 60 + minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
          } else {
            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
          }
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }, [endTimeMs, layer.content.format]);

    const isUrgent = layer.content.urgencyThreshold && timeLeft.split(':').reduce((acc, val) => acc * 60 + parseInt(val), 0) < (layer.content.urgencyThreshold || 0);

    return (
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: isUrgent ? '#EF4444' : '#111827',
        textAlign: 'center',
        fontFamily: 'monospace',
        letterSpacing: '2px'
      }}>
        {timeLeft}
      </div>
    );
  };

  // Render progress circle
  const renderProgressCircle = (layer: Layer) => {
    const value = layer.content.value || 0;
    const max = layer.content.max || 100;
    const percentage = (value / max) * 100;
    const size = (layer.size.width as number) || 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div style={{ 
        position: 'relative', 
        width: size, 
        height: size,
        margin: '0 auto'
      }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={layer.style?.backgroundColor || '#6366F1'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {layer.content.showPercentage && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '20px',
            fontWeight: 'bold',
            color: layer.style?.backgroundColor || '#6366F1'
          }}>
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  };

  // Render list
  const renderList = (layer: Layer) => {
    const items = layer.content.items || [];
    const listStyle = layer.content.listStyle || 'bullet';

    const getListIcon = (index: number) => {
      switch (listStyle) {
        case 'numbered':
          return `${index + 1}.`;
        case 'checkmark':
          return <Check size={16} color="#22C55E" />;
        case 'bullet':
        default:
          return <Circle size={8} style={{ fill: 'currentColor' }} />;
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, marginTop: '2px', color: layer.content.textColor || '#6B7280' }}>
              {getListIcon(index)}
            </span>
            <span style={{ 
              fontSize: `${layer.content.fontSize || 14}px`,
              color: layer.content.textColor || '#111827',
              lineHeight: 1.5
            }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render input field
  const renderInput = (layer: Layer) => {
    const inputType = layer.content.inputType || 'text';
    const placeholder = layer.content.placeholder || 'Enter text...';

    if (inputType === 'textarea') {
      return (
        <textarea
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px',
            border: `1px solid ${colors.border.default}`,
            borderRadius: `${layer.style?.borderRadius || 8}px`,
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '80px',
            outline: 'none'
          }}
        />
      );
    }

    return (
      <input
        type={inputType}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px',
          border: `1px solid ${colors.border.default}`,
          borderRadius: `${layer.style?.borderRadius || 8}px`,
          fontSize: '14px',
          outline: 'none'
        }}
      />
    );
  };

  // Render statistic with animation and proper cleanup
  const renderStatistic = (layer: Layer) => {
    const [displayValue, setDisplayValue] = useState(0);
    const targetValue = layer.content.value || 0;
    const shouldAnimate = layer.content.animateOnLoad;

    useEffect(() => {
      if (!shouldAnimate) {
        setDisplayValue(targetValue);
        return;
      }

      let mounted = true;
      let start = 0;
      const duration = 1000;
      const increment = targetValue / (duration / 16);

      const timer = setInterval(() => {
        if (!mounted) return;
        
        start += increment;
        if (start >= targetValue) {
          setDisplayValue(targetValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => {
        mounted = false;
        clearInterval(timer);
      };
    }, [targetValue, shouldAnimate]);

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: `${layer.content.fontSize || 36}px`,
          fontWeight: layer.content.fontWeight || 'bold',
          color: layer.content.textColor || '#111827'
        }}>
          {layer.content.prefix || ''}{displayValue}{layer.content.suffix ? ` ${layer.content.suffix}` : ''}
        </div>
      </div>
    );
  };

  // Render rating stars (Phase 3.5)
  const renderRating = (layer: Layer) => {
    const maxStars = layer.content.maxStars || 5;
    const rating = layer.content.rating || 0;
    const reviewCount = layer.content.reviewCount || 0;
    const starColor = layer.style?.starColor || '#FFB800';
    const emptyStarColor = layer.style?.emptyStarColor || '#D1D5DB';
    const starSize = layer.style?.starSize || 20;
    const starSpacing = layer.style?.starSpacing || 2;

    const renderStar = (index: number) => {
      const filled = index < Math.floor(rating);
      const half = index < rating && index >= Math.floor(rating);
      
      return (
        <span
          key={index}
          style={{
            fontSize: `${starSize}px`,
            color: filled || half ? starColor : emptyStarColor,
            marginRight: index < maxStars - 1 ? `${starSpacing}px` : '0',
            display: 'inline-block',
          }}
        >
          {filled ? '★' : half ? '⯨' : '☆'}
        </span>
      );
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
        </div>
        {layer.content.showReviewCount && reviewCount > 0 && (
          <span style={{ fontSize: '14px', color: '#6B7280' }}>
            ({reviewCount.toLocaleString()} reviews)
          </span>
        )}
      </div>
    );
  };

  // Render badge (Phase 3.5)
  const renderBadge = (layer: Layer) => {
    const text = layer.content.badgeText || 'Badge';
    const variant = layer.content.badgeVariant || 'custom';
    const icon = layer.content.badgeIcon;
    const iconPosition = layer.content.badgeIconPosition || 'left';
    
    // Variant colors
    const variantColors = {
      success: { bg: '#10B981', text: '#FFFFFF' },
      error: { bg: '#EF4444', text: '#FFFFFF' },
      warning: { bg: '#F59E0B', text: '#FFFFFF' },
      info: { bg: '#3B82F6', text: '#FFFFFF' },
      custom: { 
        bg: layer.style?.badgeBackgroundColor || '#6B7280', 
        text: layer.style?.badgeTextColor || '#FFFFFF' 
      }
    };

    const badgeColors = variantColors[variant];
    const padding = layer.style?.badgePadding;
    const paddingStyle = typeof padding === 'number' 
      ? { padding: `${padding}px` }
      : padding 
      ? { paddingLeft: `${padding.horizontal}px`, paddingRight: `${padding.horizontal}px`, paddingTop: `${padding.vertical}px`, paddingBottom: `${padding.vertical}px` }
      : { padding: '4px 12px' };

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: badgeColors.bg,
        color: badgeColors.text,
        borderRadius: `${layer.style?.badgeBorderRadius || 12}px`,
        ...paddingStyle,
        fontSize: '12px',
        fontWeight: '600',
        animation: layer.content.pulse ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
      }}>
        {icon && iconPosition === 'left' && <span>{icon}</span>}
        <span>{text}</span>
        {icon && iconPosition === 'right' && <span>{icon}</span>}
      </div>
    );
  };

  // Render gradient overlay (Phase 3.5)
  const renderGradientOverlay = (layer: Layer) => {
    const gradientType = layer.content.gradientType || 'linear';
    const direction = layer.content.gradientDirection || 'to-bottom';
    const stops = layer.content.gradientStops || [
      { color: '#00000000', position: 0 },
      { color: '#00000066', position: 100 }
    ];

    const gradientString = gradientType === 'linear'
      ? `linear-gradient(${typeof direction === 'number' ? `${direction}deg` : direction}, ${stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
      : `radial-gradient(circle, ${stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: gradientString,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none'
      }} />
    );
  };

  // Main layer renderer
  const renderLayer = (layer: Layer): React.ReactNode => {
    console.log('renderLayer: Rendering layer', layer.id, layer.type, 'visible:', layer.visible);
    
    if (!layer.visible) {
      console.warn('renderLayer: Skipping invisible layer:', layer.id, layer.name);
      return null;
    }

    const isSelected = layer.id === selectedLayerId;
    const padding = layer.style?.padding;
    const paddingStyle = typeof padding === 'number' 
      ? { padding: `${padding}px` }
      : padding 
        ? { 
            paddingTop: `${padding.top}px`,
            paddingRight: `${padding.right}px`,
            paddingBottom: `${padding.bottom}px`,
            paddingLeft: `${padding.left}px`
          }
        : {};

    const baseStyle: React.CSSProperties = {
      position: layer.position.type === 'absolute' ? 'absolute' : 'relative',
      left: layer.position.type === 'absolute' ? `${layer.position.x}px` : undefined,
      top: layer.position.type === 'absolute' ? `${layer.position.y}px` : undefined,
      zIndex: layer.zIndex,
      backgroundColor: layer.style?.backgroundColor,
      borderRadius: typeof layer.style?.borderRadius === 'number' 
        ? `${layer.style.borderRadius}px`
        : layer.style?.borderRadius 
        ? `${layer.style.borderRadius.topLeft}px ${layer.style.borderRadius.topRight}px ${layer.style.borderRadius.bottomRight}px ${layer.style.borderRadius.bottomLeft}px`
        : undefined,
      opacity: layer.style?.opacity,
      boxShadow: layer.style?.boxShadow,
      border: isSelected 
        ? `2px solid ${colors.primary[500]}` 
        : layer.style?.borderWidth 
        ? `${layer.style.borderWidth}px ${layer.style?.borderStyle || 'solid'} ${layer.style.borderColor || colors.border.default}` 
        : 'none',
      cursor: layer.style?.cursor || 'pointer',
      width: typeof layer.size?.width === 'number' ? `${layer.size.width}px` : layer.size?.width,
      height: typeof layer.size?.height === 'number' ? `${layer.size.height}px` : layer.size?.height,
      maxWidth: layer.style?.maxWidth ? `${layer.style.maxWidth}px` : undefined,
      minWidth: layer.style?.minWidth ? `${layer.style.minWidth}px` : undefined,
      maxHeight: layer.style?.maxHeight ? `${layer.style.maxHeight}px` : undefined,
      minHeight: layer.style?.minHeight ? `${layer.style.minHeight}px` : undefined,
      
      // Phase 3.5: Advanced styling
      backgroundImage: layer.style?.backgroundImage,
      backgroundSize: layer.style?.backgroundSize,
      backgroundPosition: layer.style?.backgroundPosition,
      backgroundRepeat: layer.style?.backgroundRepeat,
      objectFit: layer.style?.objectFit as any,
      objectPosition: layer.style?.objectPosition,
      overflow: layer.style?.overflow,
      clipPath: layer.style?.clipPath, // Fix 5: Custom shapes
      
      // Filters (brightness and contrast are percentages, need to convert to ratio)
      filter: layer.style?.filter 
        ? `blur(${layer.style.filter.blur || 0}px) brightness(${(layer.style.filter.brightness || 100) / 100}) contrast(${(layer.style.filter.contrast || 100) / 100}) grayscale(${(layer.style.filter.grayscale || 0) / 100})`
        : undefined,
      
      // Transform
      transform: layer.style?.transform
        ? `rotate(${layer.style.transform.rotate || 0}deg) scale(${layer.style.transform.scale || 1}) translate(${layer.style.transform.translateX || 0}px, ${layer.style.transform.translateY || 0}px)`
        : undefined,
      
      // Layout & Display (New Features)
      display: layer.style?.display,
      flexDirection: layer.style?.flexDirection,
      alignItems: layer.style?.alignItems,
      justifyContent: layer.style?.justifyContent,
      gap: layer.style?.gap ? `${layer.style.gap}px` : undefined,
      
      ...paddingStyle,
      
      // Margin support
      ...(typeof layer.style?.margin === 'number'
        ? { margin: `${layer.style.margin}px` }
        : layer.style?.margin
        ? {
            marginTop: layer.style.margin.top ? `${layer.style.margin.top}px` : undefined,
            marginRight: layer.style.margin.right ? `${layer.style.margin.right}px` : undefined,
            marginBottom: layer.style.margin.bottom ? `${layer.style.margin.bottom}px` : undefined,
            marginLeft: layer.style.margin.left ? `${layer.style.margin.left}px` : undefined,
          }
        : {})
    };

    // Handle container layout
    if (layer.type === 'container' && layer.children.length > 0) {
      const childElements = layers
        .filter(l => layer.children.includes(l.id))
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(child => renderLayer(child));

      const layoutStyle: React.CSSProperties = {
        display: layer.style?.display || 'flex',
        flexDirection: layer.style?.flexDirection || (layer.style?.layout === 'row' ? 'row' : 'column'),
        gap: layer.style?.gap ? `${layer.style.gap}px` : '16px',
        alignItems: layer.style?.alignItems,
        justifyContent: layer.style?.justifyContent
      };

      return (
        <div 
          key={layer.id} 
          onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
          style={{ ...baseStyle, ...layoutStyle }}
        >
          {childElements}
        </div>
      );
    }

    switch (layer.type) {
      case 'media':
        const imageUrl = layer.content.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
        
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            <img 
              src={imageUrl} 
              alt={layer.name}
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'cover',
                borderRadius: `${layer.style?.borderRadius || 0}px`,
                display: 'block'
              }} 
            />
          </div>
        );

      case 'text':
        const textContent = layer.content.text || 'Sample text';
        const fontSize = layer.content.fontSize || 16;
        const fontWeight = layer.content.fontWeight || 'normal';
        const textColor = layer.content.textColor || '#111827';
        const textAlign = layer.content.textAlign || 'left';
        
        // Phase 3.5: Enhanced typography
        const lineHeight = layer.style?.lineHeight || 1.5;
        const letterSpacing = layer.style?.letterSpacing ? `${layer.style.letterSpacing}px` : 'normal';
        const textTransform = layer.style?.textTransform || 'none';
        const textDecoration = layer.style?.textDecoration || 'none';
        const textShadow = layer.style?.textShadow;
        const fontFamily = layer.style?.fontFamily || 'inherit';
        const wordBreak = layer.style?.wordBreak || 'normal';
        const whiteSpace = layer.style?.whiteSpace || 'normal';

        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            <p style={{ 
              fontSize: `${fontSize}px`,
              fontWeight,
              fontFamily,
              color: textColor,
              textAlign: textAlign as any,
              lineHeight,
              letterSpacing,
              textTransform,
              textDecoration,
              textShadow,
              wordBreak,
              whiteSpace,
              margin: 0
            }}>
              {textContent}
            </p>
          </div>
        );

      case 'button':
        const label = layer.content.label || 'Click me';
        const buttonBg = layer.style?.backgroundColor || '#6366F1';
        const buttonTextColor = layer.content.textColor || '#FFFFFF';
        const buttonBorderRadius = layer.style?.borderRadius || 8;

        return (
          <button 
            key={layer.id}
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={{
              ...baseStyle,
              backgroundColor: buttonBg,
              color: buttonTextColor,
              borderRadius: `${buttonBorderRadius}px`,
              padding: typeof baseStyle.padding === 'string' ? baseStyle.padding : '12px 24px',
              border: baseStyle.border === 'none' ? 'none' : baseStyle.border,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              width: baseStyle.width || '100%'
            }}
          >
            {label}
          </button>
        );

      case 'progress-bar':
        const value = layer.content.value || 0;
        const max = layer.content.max || 100;
        const percentage = Math.min((value / max) * 100, 100);

        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            <div style={{ 
              width: '100%', 
              height: typeof layer.size.height === 'number' ? `${layer.size.height}px` : '8px', 
              backgroundColor: '#E5E7EB', 
              borderRadius: `${layer.style?.borderRadius || 4}px`,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{ 
                width: `${percentage}%`, 
                height: '100%', 
                backgroundColor: layer.style?.backgroundColor || '#22C55E',
                transition: 'width 0.3s ease',
                borderRadius: `${layer.style?.borderRadius || 4}px`
              }} />
            </div>
            {layer.content.showPercentage && (
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', margin: '4px 0 0 0' }}>
                {Math.round(percentage)}%
              </p>
            )}
          </div>
        );

      case 'progress-circle':
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            {renderProgressCircle(layer)}
          </div>
        );

      case 'countdown':
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            {renderCountdown(layer)}
          </div>
        );

      case 'list':
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            {renderList(layer)}
          </div>
        );

      case 'input':
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            {renderInput(layer)}
          </div>
        );

      case 'statistic':
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            {renderStatistic(layer)}
          </div>
        );

      case 'rating':
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            {renderRating(layer)}
          </div>
        );

      case 'badge':
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            {renderBadge(layer)}
          </div>
        );

      case 'gradient-overlay':
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={baseStyle}
          >
            {renderGradientOverlay(layer)}
          </div>
        );

      case 'handle':
        // Drag handle with all styling properties
        const handleMarginTop = typeof layer.style?.margin === 'object' ? layer.style.margin.top : layer.style?.margin || 0;
        const handleMarginBottom = typeof layer.style?.margin === 'object' ? layer.style.margin.bottom : layer.style?.margin || 16;
        
        return (
          <div 
            key={layer.id} 
            onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
            style={{
              ...baseStyle,
              width: typeof layer.size?.width === 'number' ? `${layer.size.width}px` : '40px',
              height: typeof layer.size?.height === 'number' ? `${layer.size.height}px` : '4px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: `${handleMarginTop}px`,
              marginBottom: `${handleMarginBottom}px`,
            }}
          />
        );

      default:
        return null;
    }
  };

  // Get container style
  const containerBg = bottomSheetLayer.style?.backgroundColor || config?.backgroundColor || 'white';
  
  // Priority: Layer style > Config > Default
  const containerBorderRadius = typeof bottomSheetLayer.style?.borderRadius === 'number'
    ? `${bottomSheetLayer.style.borderRadius}px ${bottomSheetLayer.style.borderRadius}px 0 0`
    : bottomSheetLayer.style?.borderRadius 
    ? `${bottomSheetLayer.style.borderRadius.topLeft || 0}px ${bottomSheetLayer.style.borderRadius.topRight || 0}px 0 0`
    : config?.borderRadius 
    ? `${config.borderRadius.topLeft ?? 16}px ${config.borderRadius.topRight ?? 16}px 0 0`
    : '24px 24px 0 0';
  const containerPadding = bottomSheetLayer.style?.padding;
  const containerPaddingStyle = typeof containerPadding === 'number'
    ? { padding: `${containerPadding}px` }
    : containerPadding
      ? {
          paddingTop: `${containerPadding.top}px`,
          paddingRight: `${containerPadding.right}px`,
          paddingBottom: `${containerPadding.bottom}px`,
          paddingLeft: `${containerPadding.left}px`
        }
      : { padding: '20px' };

  const containerGap = bottomSheetLayer.style?.gap || 16;
  const containerLayout = bottomSheetLayer.style?.layout || 'stack';

  // Calculate height based on config
  const getHeightStyle = () => {
    // Check if maxHeight is set in container style (not content!)
    const containerMaxHeight = bottomSheetLayer.style?.maxHeight;
    const containerMaxWidth = bottomSheetLayer.style?.maxWidth;
    
    // If container maxHeight is set and greater than 0, use it as the primary height
    if (containerMaxHeight && containerMaxHeight > 0) {
      const heightStyle: React.CSSProperties = {
        height: `${containerMaxHeight}px`,
        maxHeight: `${containerMaxHeight}px`,
      };
      if (containerMaxWidth && containerMaxWidth > 0) {
        heightStyle.maxWidth = `${containerMaxWidth}px`;
        heightStyle.marginLeft = 'auto';
        heightStyle.marginRight = 'auto';
      }
      return heightStyle;
    }
    
    if (!config) {
      const baseStyle: React.CSSProperties = { minHeight: '200px', maxHeight: '70%' };
      if (containerMaxWidth && containerMaxWidth > 0) {
        baseStyle.maxWidth = `${containerMaxWidth}px`;
        baseStyle.marginLeft = 'auto';
        baseStyle.marginRight = 'auto';
      }
      return baseStyle;
    }
    
    // Support numeric pixel heights (Fix 3)
    if (typeof config.height === 'number') {
      const heightStyle: React.CSSProperties = {
        height: `${config.height}px`,
        minHeight: `${config.height}px`,
        maxHeight: `${config.height}px`,
      };
      if (containerMaxWidth && containerMaxWidth > 0) {
        heightStyle.maxWidth = `${containerMaxWidth}px`;
        heightStyle.marginLeft = 'auto';
        heightStyle.marginRight = 'auto';
      }
      return heightStyle;
    }
    
    // Support vh and % units (Fix 8)
    if (typeof config.height === 'string' && (config.height.includes('vh') || config.height.includes('%'))) {
      const heightStyle: React.CSSProperties = {
        height: config.height,
        minHeight: config.height,
        maxHeight: config.height,
      };
      if (containerMaxWidth && containerMaxWidth > 0) {
        heightStyle.maxWidth = `${containerMaxWidth}px`;
        heightStyle.marginLeft = 'auto';
        heightStyle.marginRight = 'auto';
      }
      return heightStyle;
    }
    
    const heightStyle: React.CSSProperties = {};
    switch (config.height) {
      case 'half':
        heightStyle.height = '50%';
        heightStyle.minHeight = '50%';
        heightStyle.maxHeight = '50%';
        break;
      case 'full':
        heightStyle.height = '100%';
        heightStyle.minHeight = '100%';
        heightStyle.maxHeight = '100%';
        heightStyle.borderRadius = '0';
        break;
      case 'auto':
      default:
        heightStyle.minHeight = '200px';
        heightStyle.maxHeight = '70%';
        break;
    }
    
    if (containerMaxWidth && containerMaxWidth > 0) {
      heightStyle.maxWidth = `${containerMaxWidth}px`;
      heightStyle.marginLeft = 'auto';
      heightStyle.marginRight = 'auto';
    }
    
    return heightStyle;
  };

  // Fix 7: Resize handlers with proper cleanup
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartY(e.clientY);
    
    const currentHeight = containerRef.current?.offsetHeight || 400;
    setResizeStartHeight(currentHeight);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = resizeStartY - e.clientY;
      const newHeight = Math.max(100, Math.min(812, resizeStartHeight + deltaY));
      
      if (onHeightChange) {
        onHeightChange(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartY, resizeStartHeight, onHeightChange]);

  // Get animation styles (Phase 3)
  const animationStyle = config?.animation ? {
    animation: `slideUp ${config.animation.duration}ms ${config.animation.easing}`,
  } : {};

  // Overlay style (Phase 3)
  const overlayStyle = config?.overlay.enabled ? {
    backgroundColor: config.overlay.color,
    opacity: config.overlay.opacity,
    backdropFilter: config.overlay.blur > 0 ? `blur(${config.overlay.blur}px)` : undefined,
  } : null;

  return (
    <ErrorBoundary>
      <>
        {/* Overlay (Phase 3) */}
        {config?.overlay.enabled && (
          <div 
            onClick={() => {
              if (config.overlay.dismissOnClick) {
                // TODO: Add dismiss handler
              }
            }}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              ...overlayStyle,
              cursor: config.overlay.dismissOnClick ? 'pointer' : 'default',
              transition: `opacity ${config.animation?.duration || 300}ms ${config.animation?.easing || 'ease-out'}`
            }} 
          />
        )}

      {/* Bottom Sheet Container (Fix 2: Background Image Support, Fix 5: Custom Shapes, Image-Only Mode) */}
      <div 
        ref={containerRef}
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          // Image-Only Mode: Use config background image
          backgroundColor: config?.mode === 'image-only' ? 'transparent' : containerBg,
          backgroundImage: config?.mode === 'image-only' && config?.backgroundImageUrl 
            ? `url(${config.backgroundImageUrl})` 
            : bottomSheetLayer.style?.backgroundImage,
          backgroundSize: config?.mode === 'image-only' 
            ? (config?.backgroundSize || 'cover') 
            : (bottomSheetLayer.style?.backgroundSize || 'cover'),
          backgroundPosition: config?.mode === 'image-only' 
            ? (config?.backgroundPosition || 'center center') 
            : (bottomSheetLayer.style?.backgroundPosition || 'center center'),
          backgroundRepeat: bottomSheetLayer.style?.backgroundRepeat || 'no-repeat',
          borderRadius: containerBorderRadius,
          clipPath: bottomSheetLayer.style?.clipPath, // Fix 5: Custom shapes
          ...containerPaddingStyle,
          boxShadow: config?.elevation !== undefined 
            ? `0 -${config.elevation * 2}px ${config.elevation * 8}px rgba(0,0,0,${0.05 + config.elevation * 0.05})`
            : `0 -4px 16px rgba(0,0,0,${0.05 + 2 * 0.05})`, // Default to elevation level 2
          ...getHeightStyle(),
          overflow: 'hidden', // Changed from overflowY to hide overflow properly
          ...animationStyle
        }}
      >
        {/* Fix 7: Visual Resize Handle - Hidden in image-only mode */}
        {onHeightChange && typeof config?.height === 'number' && config?.mode !== 'image-only' && (
          <div
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute',
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '8px',
              backgroundColor: isResizing ? colors.primary[500] : colors.gray[300],
              borderRadius: '4px',
              cursor: 'ns-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              zIndex: 1000,
              boxShadow: isResizing ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary[400]}
            onMouseLeave={(e) => !isResizing && (e.currentTarget.style.backgroundColor = colors.gray[300])}
          >  
            <Move size={12} color="white" style={{ opacity: 0.8 }} />
          </div>
        )}

        {/* Render all child layers (including handle layer) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: containerLayout === 'row' ? 'row' : 'column', 
          gap: `${containerGap}px`,
          alignItems: bottomSheetLayer.style?.alignItems,
          justifyContent: bottomSheetLayer.style?.justifyContent,
          minHeight: '100px'
        }}>
          {childLayers.length > 0 ? (
            childLayers.map(layer => renderLayer(layer))
          ) : (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#9CA3AF',
              fontSize: '14px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '2px dashed #E5E7EB'
            }}>
              <p style={{ margin: 0 }}>No content layers found</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                Add layers to the bottom sheet to see content
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Keyframe animations (Phase 3 & 3.5) */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
    </ErrorBoundary>
  );
};
