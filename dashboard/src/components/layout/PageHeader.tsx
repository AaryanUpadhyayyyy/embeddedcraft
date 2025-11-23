import React from 'react';
import { theme } from '../../styles/design-tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * PageHeader - Reusable page header component
 * Shows title, optional subtitle, and action buttons
 * Matches screenshot header layout
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <header
      style={{
        minHeight: theme.layout.header.height,
        padding: theme.layout.header.padding,
        backgroundColor: theme.colors.background.card,
        borderBottom: `1px solid ${theme.colors.border.default}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing[6],
      }}
    >
      {/* Title Section */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.sans.join(', '),
            lineHeight: theme.typography.lineHeight.tight,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: `${theme.spacing[1]} 0 0 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.sans.join(', '),
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions Section */}
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[3],
          }}
        >
          {actions}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
