import React from 'react';
import { theme } from '../../styles/design-tokens';

export type StatusType = 'active' | 'paused' | 'draft' | 'archived';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

/**
 * StatusBadge - Visual indicator for item status
 * Matches screenshot badge styling
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalizedStatus = status.toLowerCase() as StatusType;

  const getStatusStyles = (type: StatusType) => {
    switch (type) {
      case 'active':
        return {
          bg: '#ECFDF5', // emerald-50
          text: '#059669', // emerald-600
          dot: '#10B981', // emerald-500
        };
      case 'paused':
        return {
          bg: '#FFFBEB', // amber-50
          text: '#D97706', // amber-600
          dot: '#F59E0B', // amber-500
        };
      case 'draft':
        return {
          bg: '#F3F4F6', // gray-100
          text: '#4B5563', // gray-600
          dot: '#9CA3AF', // gray-400
        };
      default:
        return {
          bg: '#F3F4F6',
          text: '#4B5563',
          dot: '#9CA3AF',
        };
    }
  };

  const styles = getStatusStyles(normalizedStatus);
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: '9999px',
        backgroundColor: styles.bg,
        color: styles.text,
        fontSize: isSmall ? '12px' : '13px',
        fontWeight: 500,
        textTransform: 'capitalize',
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: isSmall ? '6px' : '8px',
          height: isSmall ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: styles.dot,
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
