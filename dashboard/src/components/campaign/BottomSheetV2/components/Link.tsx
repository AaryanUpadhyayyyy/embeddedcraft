import React from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, ChevronRight, ArrowRight } from 'lucide-react';

interface LinkProps {
  text: string;
  href: string;
  variant?: 'default' | 'primary' | 'secondary' | 'underline' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  iconType?: 'external' | 'chevron' | 'arrow' | 'none';
  external?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Link Component - Styled hyperlinks with configurable icons
 * 
 * Features:
 * - 5 visual variants (default/primary/secondary/underline/muted)
 * - 3 sizes (sm/md/lg)
 * - Icon support (external/chevron/arrow)
 * - Icon positioning (left/right)
 * - External link indicator
 * - Custom click handlers
 * 
 * Use Cases:
 * - Slack: "Learn more about this feature →"
 * - Footer links: "Privacy Policy", "Terms of Service"
 * - Call-to-action links: "View all offers"
 * - External resource links
 * 
 * Usage:
 * ```tsx
 * <Link 
 *   text="Learn more" 
 *   href="/features"
 *   variant="primary"
 *   iconType="arrow"
 *   iconPosition="right"
 * />
 * ```
 */
export const Link: React.FC<LinkProps> = ({
  text,
  href,
  variant = 'default',
  size = 'md',
  showIcon = false,
  iconPosition = 'right',
  iconType = 'external',
  external = false,
  className,
  style,
  onClick,
}) => {
  const getIcon = () => {
    if (!showIcon) return null;

    const iconClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    switch (iconType) {
      case 'external':
        return <ExternalLink className={iconClass} />;
      case 'chevron':
        return <ChevronRight className={iconClass} />;
      case 'arrow':
        return <ArrowRight className={iconClass} />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const variantClasses = {
    default: 'text-blue-600 hover:text-blue-800',
    primary: 'text-blue-600 hover:text-blue-800 font-semibold',
    secondary: 'text-gray-600 hover:text-gray-800',
    underline: 'text-blue-600 hover:text-blue-800 underline',
    muted: 'text-gray-500 hover:text-gray-700',
  };

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        'link-component inline-flex items-center gap-1.5 transition-colors duration-200',
        'hover:underline cursor-pointer',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={style}
      onClick={onClick}
    >
      {showIcon && iconPosition === 'left' && getIcon()}
      <span>{text}</span>
      {showIcon && iconPosition === 'right' && getIcon()}
    </a>
  );
};

export default Link;
