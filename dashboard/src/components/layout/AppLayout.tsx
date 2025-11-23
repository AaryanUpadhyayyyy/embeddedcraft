import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { theme } from '../../styles/design-tokens';

/**
 * AppLayout - Main application shell with sidebar navigation
 * Matches screenshot layout: fixed sidebar + main content area
 */
const AppLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: theme.colors.background.page,
        overflow: 'hidden',
      }}
    >
      {/* Sidebar - Fixed left navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          minWidth: 0, // Prevent flex item from overflowing
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
