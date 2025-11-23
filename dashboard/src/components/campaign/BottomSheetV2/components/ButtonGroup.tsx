import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ButtonGroupLayout = 'horizontal' | 'vertical';
export type ButtonGroupSticky = 'none' | 'top' | 'bottom';

interface ButtonConfig {
  label: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  onClick?: () => void;
  className?: string;
}

interface ButtonGroupProps {
  buttons: ButtonConfig[];
  layout?: ButtonGroupLayout;
  sticky?: ButtonGroupSticky;
  gap?: number;
  className?: string;
}

/**
 * ButtonGroup Component - Group multiple buttons with layouts
 * 
 * Features:
 * - Horizontal/vertical layouts
 * - Sticky positioning (top/bottom)
 * - Customizable gap spacing
 * - Primary + secondary button patterns
 * - Responsive stacking
 * 
 * Usage:
 * ```tsx
 * <ButtonGroup
 *   layout="horizontal"
 *   sticky="bottom"
 *   buttons={[
 *     { label: 'DISMISS', variant: 'outline', onClick: handleDismiss },
 *     { label: 'BOOK NOW', variant: 'default', onClick: handleBook }
 *   ]}
 * />
 * ```
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  layout = 'horizontal',
  sticky = 'none',
  gap = 12,
  className,
}) => {
  const containerClasses = cn(
    'button-group',
    layout === 'horizontal' ? 'flex flex-row' : 'flex flex-col',
    sticky === 'top' && 'sticky top-0 z-10 bg-white border-b shadow-sm',
    sticky === 'bottom' && 'sticky bottom-0 z-10 bg-white border-t shadow-lg',
    sticky !== 'none' && 'p-4',
    className
  );

  const gapClass = layout === 'horizontal' ? `gap-${Math.floor(gap / 4)}` : `space-y-${Math.floor(gap / 4)}`;

  return (
    <div className={containerClasses}>
      <div className={cn('flex w-full', layout === 'horizontal' ? 'flex-row' : 'flex-col', gapClass)}>
        {buttons.map((button, index) => (
          <Button
            key={index}
            variant={button.variant || 'default'}
            onClick={button.onClick}
            className={cn(
              layout === 'horizontal' && 'flex-1',
              button.className
            )}
          >
            {button.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ButtonGroup;
