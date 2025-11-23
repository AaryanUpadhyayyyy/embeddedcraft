import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Circle, Star, ChevronRight, LucideIcon } from 'lucide-react';

export type ListType = 'bullet' | 'numbered' | 'icon' | 'checkmark';
export type ListStyle = 'default' | 'spaced' | 'compact' | 'bordered';

export interface ListItemData {
  text: string;
  icon?: LucideIcon;
  iconColor?: string;
  subtext?: string;
}

interface ListProps {
  items: ListItemData[];
  type?: ListType;
  style?: ListStyle;
  customIcon?: LucideIcon;
  iconColor?: string;
  numbered?: boolean;
  className?: string;
}

/**
 * List Component - Structured lists with icons, bullets, or numbers
 * 
 * Features:
 * - Bullet lists (• items)
 * - Numbered lists (1. 2. 3.)
 * - Icon lists (✓ ★ →)
 * - Checkmark lists (✓ Feature 1)
 * - Custom styling
 * - Subtext support
 * 
 * Use Cases:
 * - Slack: Feature announcements with checkmarks
 * - Khatabook: Numbered steps
 * - Product benefits list
 * - FAQ items
 * 
 * Usage:
 * ```tsx
 * <List 
 *   type="checkmark"
 *   items={[
 *     { text: "New sidebar design", subtext: "Cleaner navigation" },
 *     { text: "Improved search", subtext: "Faster results" },
 *     { text: "Better notifications" }
 *   ]}
 * />
 * ```
 */
export const List: React.FC<ListProps> = ({
  items,
  type = 'bullet',
  style = 'default',
  customIcon,
  iconColor = '#3B82F6',
  numbered = false,
  className,
}) => {
  const getIcon = (index: number, item: ListItemData) => {
    // Use custom icon if provided
    if (item.icon) {
      const IconComponent = item.icon;
      return <IconComponent className="w-5 h-5" style={{ color: item.iconColor || iconColor }} />;
    }

    if (customIcon) {
      const IconComponent = customIcon;
      return <IconComponent className="w-5 h-5" style={{ color: iconColor }} />;
    }

    // Default icons based on type
    switch (type) {
      case 'checkmark':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'icon':
        return <Star className="w-5 h-5" style={{ color: iconColor }} />;
      case 'bullet':
        return <Circle className="w-2 h-2" style={{ color: iconColor }} fill="currentColor" />;
      case 'numbered':
        return (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
          >
            {index + 1}
          </div>
        );
      default:
        return null;
    }
  };

  const getItemSpacing = () => {
    switch (style) {
      case 'compact':
        return 'py-1';
      case 'spaced':
        return 'py-3';
      case 'bordered':
        return 'py-3 border-b border-gray-100 last:border-0';
      default:
        return 'py-2';
    }
  };

  return (
    <ul className={cn('list-component space-y-0', className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className={cn(
            'flex items-start gap-3',
            getItemSpacing()
          )}
        >
          {/* Icon/Bullet/Number */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(index, item)}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="text-sm text-gray-800 leading-relaxed">
              {item.text}
            </div>
            {item.subtext && (
              <div className="text-xs text-gray-500 mt-1">
                {item.subtext}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default List;
