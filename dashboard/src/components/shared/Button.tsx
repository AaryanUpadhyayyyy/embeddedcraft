import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { theme } from '../../styles/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Button - Primary button component matching screenshot design
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      loading = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      const baseStyles = {
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: `all ${theme.transitions.duration.normal} ${theme.transitions.timing.ease}`,
        fontFamily: theme.typography.fontFamily.sans.join(', '),
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyles,
            backgroundColor: disabled
              ? theme.colors.gray[300]
              : theme.colors.primary[500],
            color: theme.colors.text.inverse,
            hoverBg: theme.colors.primary[600],
            activeBg: theme.colors.primary[700],
          };
        case 'secondary':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.background.card,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.default}`,
            hoverBg: theme.colors.background.hover,
            activeBg: theme.colors.gray[200],
          };
        case 'ghost':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            color: theme.colors.text.secondary,
            hoverBg: theme.colors.background.hover,
            activeBg: theme.colors.gray[200],
          };
        case 'danger':
          return {
            ...baseStyles,
            backgroundColor: disabled
              ? theme.colors.gray[300]
              : theme.colors.error,
            color: theme.colors.text.inverse,
            hoverBg: '#DC2626',
            activeBg: '#B91C1C',
          };
        default:
          return baseStyles;
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            height: theme.components.button.height.sm,
            padding: theme.components.button.padding.sm,
            fontSize: theme.typography.fontSize.xs,
          };
        case 'lg':
          return {
            height: theme.components.button.height.lg,
            padding: theme.components.button.padding.lg,
            fontSize: theme.typography.fontSize.base,
          };
        case 'md':
        default:
          return {
            height: theme.components.button.height.md,
            padding: theme.components.button.padding.md,
            fontSize: theme.typography.fontSize.sm,
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          ...variantStyles,
          ...sizeStyles,
          width: fullWidth ? '100%' : 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing[2],
          borderRadius: theme.borderRadius.lg,
          fontWeight: theme.typography.fontWeight.medium,
          opacity: disabled || loading ? 0.6 : 1,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = variantStyles.hoverBg;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor =
              variantStyles.backgroundColor as string;
          }
        }}
        onMouseDown={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = variantStyles.activeBg;
          }
        }}
        onMouseUp={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = variantStyles.hoverBg;
          }
        }}
        {...props}
      >
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
