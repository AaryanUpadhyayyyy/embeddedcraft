import React from 'react';
import { theme } from '../../styles/design-tokens';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * IconButton - Standardized icon-only button
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  style,
  ...props
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return '28px';
      case 'lg': return '40px';
      default: return '32px';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 20;
      default: return 16;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary[500],
          color: '#FFFFFF',
          hoverBg: theme.colors.primary[600],
        };
      case 'secondary':
        return {
          bg: theme.colors.gray[100],
          color: theme.colors.gray[700],
          hoverBg: theme.colors.gray[200],
        };
      case 'danger':
        return {
          bg: theme.colors.error, // using error color directly
          color: '#FFFFFF',
          hoverBg: '#DC2626', // darker red
        };
      default: // ghost
        return {
          bg: 'transparent',
          color: theme.colors.gray[500],
          hoverBg: theme.colors.gray[100],
        };
    }
  };

  const styles = getVariantStyles();
  const buttonSize = getSize();

  return (
    <button
      type="button"
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: buttonSize,
        height: buttonSize,
        borderRadius: theme.borderRadius.md,
        border: 'none',
        cursor: 'pointer',
        transition: `all ${theme.transitions.duration.fast} ${theme.transitions.timing.ease}`,
        backgroundColor: styles.bg,
        color: styles.color,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = styles.hoverBg;
        if (variant === 'ghost') {
          e.currentTarget.style.color = theme.colors.gray[900];
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = styles.bg;
        if (variant === 'ghost') {
          e.currentTarget.style.color = styles.color;
        }
      }}
      {...props}
    >
      <Icon size={getIconSize()} />
    </button>
  );
};

export default IconButton;
