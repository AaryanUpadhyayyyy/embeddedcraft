import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'default';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgeShape = 'rounded' | 'pill' | 'square';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-cyan-500 text-white',
  default: 'bg-gray-500 text-white',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'text-xs px-1.5 py-0.5',
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const shapeStyles: Record<BadgeShape, string> = {
  rounded: 'rounded',
  pill: 'rounded-full',
  square: 'rounded-none',
};

/**
 * Badge Component - Small colored labels for highlighting information
 * 
 * Features:
 * - 6 variants: primary, danger, success, warning, info, default
 * - 4 sizes: xs, sm, md, lg
 * - 3 shapes: rounded, pill, square
 * - Inline or overlay positioning
 * 
 * Usage:
 * ```tsx
 * <Badge variant="danger" size="sm" shape="pill">LIVE NOW</Badge>
 * <Badge variant="success">NEW</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  shape = 'rounded',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        variantStyles[variant],
        sizeStyles[size],
        shapeStyles[shape],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
