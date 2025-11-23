import React, { useEffect } from 'react';
import { Star, Video as VideoIcon, Images } from 'lucide-react';
import type { Component } from '../../core/types';
import { generateEffectStyles, generateFlexContainerStyles, generateFlexChildStyles, generateAnimationStyles, injectAnimationKeyframes } from '../../utils/effectStyles';
import { evaluateVariables } from '../../core/variableEvaluator';
import Badge from '../Badge';
import RichText from '../RichText';
import ButtonGroup from '../ButtonGroup';
import EnhancedImage from '../EnhancedImage';
import ProgressBar from '../ProgressBar';
import ProgressCircle from '../ProgressCircle';
import Stepper from '../Stepper';
import List from '../List';
import CountdownTimer from '../CountdownTimer';
import Link from '../Link';

/**
 * Shared component renderer used by both Canvas and MobilePreview.
 * This ensures visual consistency between editor and preview.
 * 
 * @param component - Component data to render
 * @param isPreview - Whether rendering in preview mode (affects some behaviors)
 * @param showGrid - Whether to show grid guides for spacers
 * @param previewAnimationId - ID of animation currently being previewed
 */

interface ComponentRendererProps {
  component: Component;
  isPreview?: boolean;
  showGrid?: boolean;
  previewAnimationId?: string | null;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isPreview = false,
  showGrid = false,
  previewAnimationId,
}) => {
  const { type, style = {}, content = {}, visible, effects, flexLayout, flexChild, animations } = component;

  // Inject animation keyframes into document when animations change
  useEffect(() => {
    if (animations && animations.length > 0) {
      injectAnimationKeyframes(animations);
    }
  }, [animations]);

  // Generate effect styles (shadows, gradients, blur, etc.)
  const effectStyles = generateEffectStyles(effects);
  
  // Generate flex child styles if component is inside a flex container
  const flexChildStyles = generateFlexChildStyles(flexChild);
  
  // Generate animation styles
  const animationStyles = generateAnimationStyles(animations || [], previewAnimationId);

  // Base style with opacity and effects
  const baseStyle: React.CSSProperties = {
    marginBottom: (style.marginBottom as number) || 0,
    opacity: visible === false ? 0.5 : 1,
    ...effectStyles,
    ...flexChildStyles,
    ...animationStyles,
  };

  // ========== TEXT ==========
  if (type === 'text') {
    // Evaluate variables in text content
    const textContent = String(content.text || 'Text');
    const evaluatedText = evaluateVariables(textContent);
    
    return (
      <div
        style={{
          ...baseStyle,
          fontSize: (style.fontSize as number) || 16,
          color: (style.color as string) || '#1F2937',
          fontWeight: (style.fontWeight as string) || '400',
          fontStyle: (style.fontStyle as string) || 'normal',
          textDecoration: (style.textDecoration as string) || 'none',
          fontFamily: (style.fontFamily as string) || 'Inter',
          lineHeight: (style.lineHeight as number) || 1.5,
          textAlign: (style.textAlign as any) || 'left',
          overflow: 'hidden',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap', // ✅ Preserve whitespace and emojis
        }}
      >
        {evaluatedText}
      </div>
    );
  }

  // ========== IMAGE ==========
  if (type === 'image') {
    return (
      <div style={baseStyle}>
        <EnhancedImage
          src={(content.url as string) || 'https://via.placeholder.com/300x200'}
          alt={(content.alt as string) || 'Image'}
          aspectRatio={(content.aspectRatio as any) || 'free'}
          objectFit={(content.objectFit as any) || 'cover'}
          objectPosition={(content.objectPosition as any) || 'center'}
          overlay={content.overlay as any}
          borderRadius={(style.borderRadius as number) || 0}
          style={{
            width: typeof style.width === 'number' ? `${style.width}px` : ((style.width as string) || '100%'),
            height: (content.aspectRatio && content.aspectRatio !== 'free') ? undefined : (
              typeof style.height === 'number' ? `${style.height}px` : ((style.height as string) || 'auto')
            ),
            filter: style.filter as string,
          }}
        />
      </div>
    );
  }

  // ========== VIDEO ==========
  if (type === 'video') {
    return (
      <div
        style={{
          ...baseStyle,
          width: typeof style.width === 'number' ? `${style.width}px` : ((style.width as string) || '100%'),
          height: (style.height as number) || 200,
          borderRadius: (style.borderRadius as number) || 0,
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {content.thumbnail ? (
          <img
            src={content.thumbnail as string}
            alt="Video thumbnail"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <VideoIcon className="h-12 w-12 text-white opacity-50" />
        )}
      </div>
    );
  }

  // ========== BUTTON ==========
  if (type === 'button') {
    return (
      <button
        style={{
          ...baseStyle,
          backgroundColor: (style.backgroundColor as string) || '#6366F1',
          color: (style.textColor as string) || '#FFFFFF',
          fontSize: (style.fontSize as number) || 16,
          fontWeight: (style.fontWeight as string) || '600',
          borderRadius: (style.borderRadius as number) || 8,
          padding: `${(style.paddingVertical as number) || 14}px ${(style.paddingHorizontal as number) || 24}px`,
          width: typeof style.width === 'number' ? `${style.width}px` : ((style.width as string) || '100%'),
          border: style.borderWidth
            ? `${style.borderWidth}px solid ${(style.borderColor as string) || '#000'}`
            : 'none',
          cursor: 'pointer',
          textAlign: (style.textAlign as any) || 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isPreview) e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          if (!isPreview) e.currentTarget.style.opacity = '1';
        }}
      >
        {(content.text as string) || 'Button'}
      </button>
    );
  }

  // ========== INPUT ==========
  if (type === 'input') {
    return (
      <div style={baseStyle}>
        {content.label && (
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 6,
              color: '#374151',
            }}
          >
            {content.label as string}
          </label>
        )}
        <input
          placeholder={(content.placeholder as string) || 'Enter text...'}
          style={{
            fontSize: (style.fontSize as number) || 15,
            color: (style.color as string) || '#1F2937',
            backgroundColor: (style.backgroundColor as string) || '#F9FAFB',
            borderRadius: (style.borderRadius as number) || 8,
            border: `${(style.borderWidth as number) || 1}px solid ${(style.borderColor as string) || '#D1D5DB'}`,
            padding: `${(style.paddingVertical as number) || 12}px ${(style.paddingHorizontal as number) || 16}px`,
            width: '100%',
            outline: 'none',
          }}
        />
      </div>
    );
  }

  // ========== CONTAINER ==========
  if (type === 'container') {
    // Generate flex container styles if flex layout is enabled
    const flexContainerStyles = generateFlexContainerStyles(flexLayout);
    
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: (style.backgroundColor as string) || '#F3F4F6',
          borderRadius: (style.borderRadius as number) || 12,
          padding: flexLayout?.enabled ? undefined : (style.padding as number) || 16,
          border: style.borderWidth
            ? `${style.borderWidth}px solid ${(style.borderColor as string) || '#E5E7EB'}`
            : 'none',
          ...flexContainerStyles, // Apply flex styles if enabled
        }}
      >
        {!flexLayout?.enabled && (
          <div className="text-sm text-gray-500 text-center">
            Container
            <div className="text-xs text-gray-400 mt-1">
              Enable Auto-Layout to arrange children
            </div>
          </div>
        )}
        {flexLayout?.enabled && (
          <div className="text-xs text-blue-600 text-center py-2 bg-blue-50 rounded border border-blue-200">
            Auto-Layout Enabled
          </div>
        )}
      </div>
    );
  }

  // ========== CAROUSEL ==========
  if (type === 'carousel') {
    return (
      <div
        style={{
          ...baseStyle,
          height: (style.height as number) || 200,
          borderRadius: (style.borderRadius as number) || 12,
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {content.items && Array.isArray(content.items) && content.items.length > 0 ? (
          <img
            src={(content.items[0] as any).url}
            alt="Carousel"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/400x200?text=Carousel';
            }}
          />
        ) : (
          <Images className="h-12 w-12 text-gray-400" />
        )}
      </div>
    );
  }

  // ========== RATING ==========
  if (type === 'rating') {
    const stars = (content.stars as number) || 5;
    const value = (content.value as number) || 0;
    return (
      <div style={baseStyle} className="flex gap-1">
        {Array.from({ length: stars }).map((_, i) => (
          <Star
            key={i}
            style={{ width: (style.size as number) || 28, height: (style.size as number) || 28 }}
            fill={
              i < value
                ? ((style.starColor as string) || '#FBBF24')
                : ((style.emptyStarColor as string) || '#D1D5DB')
            }
            color={
              i < value
                ? ((style.starColor as string) || '#FBBF24')
                : ((style.emptyStarColor as string) || '#D1D5DB')
            }
          />
        ))}
      </div>
    );
  }

  // ========== SHAPE ==========
  if (type === 'shape') {
    const shapeType = content.shapeType || 'rectangle';
    const shapeStyle: React.CSSProperties = {
      ...baseStyle,
      width: '100%',
      height: '100%',
      backgroundColor: (style.backgroundColor as string) || '#6366F1',
      border: `${(style.borderWidth as number) || 2}px solid ${(style.borderColor as string) || '#4F46E5'}`,
    };

    if (shapeType === 'circle') {
      shapeStyle.borderRadius = '50%';
    } else if (shapeType === 'rounded') {
      shapeStyle.borderRadius = (style.borderRadius as number) || 12;
    } else if (shapeType === 'triangle') {
      return (
        <div
          style={{
            ...baseStyle,
            width: 0,
            height: 0,
            borderLeft: `50px solid transparent`,
            borderRight: `50px solid transparent`,
            borderBottom: `100px solid ${(style.backgroundColor as string) || '#6366F1'}`,
          }}
        />
      );
    } else {
      shapeStyle.borderRadius = (style.borderRadius as number) || 0;
    }

    return <div style={shapeStyle} />;
  }

  // ========== DIVIDER ==========
  if (type === 'divider') {
    return (
      <hr
        style={{
          height: (style.height as number) || 1,
          backgroundColor: (style.color as string) || '#E5E7EB',
          border: 'none',
          margin: `${(style.marginTop as number) || 12}px 0 ${(style.marginBottom as number) || 12}px 0`,
        }}
      />
    );
  }

  // ========== SPACER ==========
  if (type === 'spacer') {
    return (
      <div
        style={{
          height: (style.height as number) || 24,
          width: '100%',
          backgroundColor: showGrid ? 'rgba(147, 197, 253, 0.1)' : 'transparent',
        }}
      />
    );
  }

  // ========== BADGE ==========
  if (type === 'badge') {
    return (
      <div style={baseStyle}>
        <Badge
          variant={(content.variant as any) || 'default'}
          size={(content.size as any) || 'sm'}
          shape={(content.shape as any) || 'rounded'}
        >
          {String(content.text || 'Badge')}
        </Badge>
      </div>
    );
  }

  // ========== RICH TEXT ==========
  if (type === 'richtext') {
    return (
      <div style={baseStyle}>
        <RichText
          content={String(content.html || '<p>Rich text content</p>')}
          className="prose prose-sm max-w-none"
        />
      </div>
    );
  }

  // ========== BUTTON GROUP ==========
  if (type === 'buttongroup') {
    return (
      <div style={baseStyle}>
        <ButtonGroup
          buttons={(content.buttons as any) || [
            { label: 'Button 1', variant: 'outline' },
            { label: 'Button 2', variant: 'default' },
          ]}
          layout={(content.layout as any) || 'horizontal'}
          sticky={(content.sticky as any) || 'none'}
          gap={(style.gap as number) || 12}
        />
      </div>
    );
  }

  // ========== PROGRESS BAR ==========
  if (type === 'progressbar') {
    return (
      <div style={baseStyle}>
        <ProgressBar
          value={(content.value as number) || 0}
          max={(content.max as number) || 100}
          milestones={(content.milestones as any) || []}
          showPercentage={(content.showPercentage as boolean) ?? true}
          color={(style.color as string) || '#10B981'}
          animated={true}
        />
      </div>
    );
  }

  // ========== PROGRESS CIRCLE ==========
  if (type === 'progresscircle') {
    return (
      <div style={{ ...baseStyle, display: 'flex', justifyContent: 'center' }}>
        <ProgressCircle
          value={(content.value as number) || 0}
          max={(content.max as number) || 100}
          size={(style.size as number) || 120}
          strokeWidth={(style.strokeWidth as number) || 8}
          color={(style.color as string) || '#3B82F6'}
          backgroundColor={(style.backgroundColor as string) || '#E5E7EB'}
          showPercentage={(content.showPercentage as boolean) ?? true}
          label={(content.label as string) || ''}
        />
      </div>
    );
  }

  // ========== STEPPER ==========
  if (type === 'stepper') {
    return (
      <div style={baseStyle}>
        <Stepper
          steps={(content.steps as any) || [
            { label: 'Step 1', completed: false },
            { label: 'Step 2', completed: false },
            { label: 'Step 3', completed: false },
          ]}
          currentStep={(content.currentStep as number) || 0}
          orientation={(style.orientation as any) || 'horizontal'}
        />
      </div>
    );
  }

  // ========== LIST ==========
  if (type === 'list') {
    return (
      <div style={baseStyle}>
        <List
          items={(content.items as any) || [
            { text: 'List item 1' },
            { text: 'List item 2' },
            { text: 'List item 3' },
          ]}
          type={(content.type as any) || 'bullet'}
          style={(content.style as any) || 'default'}
          iconColor={(style.iconColor as string) || '#3B82F6'}
        />
      </div>
    );
  }

  // ========== COUNTDOWN TIMER ==========
  if (type === 'countdown') {
    return (
      <div style={baseStyle}>
        <CountdownTimer
          targetDate={(content.targetDate as string) || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()}
          format={(content.format as any) || 'short'}
          urgentThreshold={(content.urgentThreshold as number) || 60}
          showIcon={(content.showIcon as boolean) ?? true}
        />
      </div>
    );
  }

  // ========== LINK ==========
  if (type === 'link') {
    return (
      <div style={baseStyle}>
        <Link
          text={(content.text as string) || 'Click here'}
          href={(content.href as string) || '#'}
          variant={(content.variant as any) || 'primary'}
          size={(content.size as any) || 'md'}
          showIcon={(content.showIcon as boolean) ?? false}
          iconType={(content.iconType as any) || 'arrow'}
          iconPosition={(content.iconPosition as any) || 'right'}
          external={(content.external as boolean) ?? false}
        />
      </div>
    );
  }

  // ========== FALLBACK ==========
  return (
    <div className="p-4 bg-gray-100 rounded text-center text-sm text-gray-600">
      {type}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(ComponentRenderer);
