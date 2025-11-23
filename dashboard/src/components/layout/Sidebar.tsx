import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
  Zap
} from 'lucide-react';
import { theme } from '../../styles/design-tokens';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
    { path: '/events', label: 'Events Log', icon: Zap },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/segments', label: 'Segments', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      backgroundColor: 'white',
      borderRight: `1px solid ${theme.colors.border.default}`,
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50
    }}>
      {/* Logo Area */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: `1px solid ${theme.colors.border.default}`
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: theme.colors.primary[500],
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          <Zap size={20} color="white" fill="white" />
        </div>
        <span style={{
          fontSize: '18px',
          fontWeight: 700,
          color: theme.colors.text.primary,
          letterSpacing: '-0.02em'
        }}>
          EmbeddedCraft
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '24px 12px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '12px', padding: '0 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: theme.colors.text.secondary, letterSpacing: '0.05em' }}>
          Main Menu
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? theme.colors.primary[600] : theme.colors.text.secondary,
                    backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      marginRight: '12px',
                      color: isActive ? theme.colors.primary[500] : theme.colors.gray[400]
                    }}
                  />
                  {item.label}
                  {isActive && (
                    <ChevronRight
                      size={14}
                      style={{ marginLeft: 'auto', color: theme.colors.primary[400] }}
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${theme.colors.border.default}`,
        backgroundColor: theme.colors.gray[50]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: theme.colors.primary[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.primary[600],
            fontWeight: 600,
            fontSize: '14px'
          }}>
            AU
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Aaryan Upadhyay
            </div>
            <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
              Admin
            </div>
          </div>
        </div>
        <button style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '8px',
          borderRadius: '6px',
          border: `1px solid ${theme.colors.border.default}`,
          backgroundColor: 'white',
          color: theme.colors.text.secondary,
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
