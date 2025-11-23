import React from 'react';
import { Search } from 'lucide-react';
import { theme } from '../../styles/design-tokens';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

/**
 * SearchInput - Standardized search field with icon
 */
const SearchInput: React.FC<SearchInputProps> = ({ style, ...props }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '320px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: theme.colors.gray[400],
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <Search size={16} />
      </div>
      <input
        type="text"
        placeholder="Search..."
        style={{
          width: '100%',
          padding: '8px 12px 8px 36px',
          fontSize: '14px',
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border.default}`,
          backgroundColor: '#FFFFFF',
          color: theme.colors.text.primary,
          outline: 'none',
          transition: `border-color ${theme.transitions.duration.fast} ease`,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary[500];
          e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary[100]}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.default;
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
