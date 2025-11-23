import React from 'react';
import { theme } from '../../styles/design-tokens';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * PageContainer - Wraps page content with consistent padding
 * Matches screenshot content area styling
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = theme.layout.page.maxWidth,
}) => {
  return (
    <div
      style={{
        flex: 1,
        padding: theme.layout.page.padding,
        maxWidth,
        width: '100%',
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
};

export default PageContainer;
