import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export type AspectRatio = 'free' | '1:1' | '16:9' | '4:3' | '3:4' | '2:3' | '21:9';
export type ObjectFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
export type ObjectPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface OverlayConfig {
  type: 'gradient' | 'color' | 'none';
  gradient?: string;
  color?: string;
  opacity?: number;
}

interface EnhancedImageProps {
  src: string;
  alt?: string;
  aspectRatio?: AspectRatio;
  objectFit?: ObjectFit;
  objectPosition?: ObjectPosition;
  overlay?: OverlayConfig;
  fallbackSrc?: string;
  showPlaceholder?: boolean;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode; // For badge overlays
}

/**
 * EnhancedImage Component - Advanced image component for bottom sheets
 * 
 * Features:
 * - Aspect ratio lock (1:1, 16:9, 4:3, etc.)
 * - Object-fit modes (cover, contain, fill)
 * - Object-position for focal point control
 * - Overlay support (gradient/color/none)
 * - Fallback/placeholder handling
 * - Badge/content overlays via children
 * - Responsive image handling
 * 
 * Usage:
 * ```tsx
 * <EnhancedImage
 *   src="https://example.com/image.jpg"
 *   aspectRatio="16:9"
 *   objectFit="cover"
 *   overlay={{
 *     type: 'gradient',
 *     gradient: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
 *   }}
 * >
 *   <Badge variant="danger">LIVE NOW</Badge>
 * </EnhancedImage>
 * ```
 */
export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt = 'Image',
  aspectRatio = 'free',
  objectFit = 'cover',
  objectPosition = 'center',
  overlay,
  fallbackSrc = 'https://via.placeholder.com/400x300?text=Image',
  showPlaceholder = true,
  borderRadius = 0,
  className,
  style,
  children,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert aspect ratio to padding-bottom percentage
  const getAspectRatioPadding = (): string | undefined => {
    const ratios: Record<AspectRatio, string> = {
      'free': 'auto',
      '1:1': '100%',
      '16:9': '56.25%',
      '4:3': '75%',
      '3:4': '133.33%',
      '2:3': '150%',
      '21:9': '42.86%',
    };
    return ratios[aspectRatio];
  };

  const paddingBottom = getAspectRatioPadding();
  const usePaddingTrick = aspectRatio !== 'free';

  // Convert objectPosition string to CSS value
  const getObjectPositionCSS = (): string => {
    const positions: Record<ObjectPosition, string> = {
      'center': 'center center',
      'top': 'center top',
      'bottom': 'center bottom',
      'left': 'left center',
      'right': 'right center',
      'top-left': 'left top',
      'top-right': 'right top',
      'bottom-left': 'left bottom',
      'bottom-right': 'right bottom',
    };
    return positions[objectPosition];
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Overlay styles
  const getOverlayStyles = (): React.CSSProperties => {
    if (!overlay || overlay.type === 'none') return {};

    const baseOverlay: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
    };

    if (overlay.type === 'gradient') {
      return {
        ...baseOverlay,
        background: overlay.gradient || 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
        opacity: overlay.opacity ?? 1,
      };
    }

    if (overlay.type === 'color') {
      return {
        ...baseOverlay,
        backgroundColor: overlay.color || 'rgba(0,0,0,0.3)',
        opacity: overlay.opacity ?? 1,
      };
    }

    return {};
  };

  const containerClasses = cn(
    'enhanced-image-container relative overflow-hidden',
    className
  );

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: usePaddingTrick ? '100%' : 'auto',
    objectFit,
    objectPosition: getObjectPositionCSS(),
    borderRadius,
    display: 'block',
    ...(usePaddingTrick && {
      position: 'absolute',
      inset: 0,
    }),
  };

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div className={containerClasses} style={style}>
      {/* Aspect Ratio Container */}
      <div
        className="relative w-full"
        style={{
          paddingBottom: usePaddingTrick ? paddingBottom : undefined,
          borderRadius,
        }}
      >
        {/* Image */}
        <img
          src={imageSrc}
          alt={alt}
          style={imageStyles}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
        />

        {/* Loading Placeholder */}
        {isLoading && showPlaceholder && (
          <div
            className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
            style={{ borderRadius }}
          >
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}

        {/* Overlay */}
        {overlay && overlay.type !== 'none' && (
          <div style={getOverlayStyles()} className="rounded-inherit" />
        )}

        {/* Children (badges, text overlays, etc.) */}
        {children && (
          <div className="absolute inset-0 pointer-events-none">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedImage;
