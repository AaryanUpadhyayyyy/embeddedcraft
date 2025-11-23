import React from 'react';
import { theme } from '../../styles/design-tokens';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import IconButton from './IconButton';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

/**
 * DataTable - Reusable table component matching design
 */
function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data found',
  onRowClick,
  pagination,
}: DataTableProps<T>) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border.default}`,
        overflow: 'hidden',
        boxShadow: theme.shadows.sm,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: theme.colors.gray[50], borderBottom: `1px solid ${theme.colors.border.default}` }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '12px 24px',
                    textAlign: col.align || 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: theme.colors.gray[500],
                    width: col.width,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center', color: theme.colors.gray[500] }}>
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center', color: theme.colors.gray[500] }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  style={{
                    borderBottom: index < data.length - 1 ? `1px solid ${theme.colors.gray[100]}` : 'none',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (onRowClick) e.currentTarget.style.backgroundColor = theme.colors.gray[50];
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={`${item.id}-${col.key}`}
                      style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        color: theme.colors.text.primary,
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            padding: '12px 24px',
            borderTop: `1px solid ${theme.colors.border.default}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.gray[50],
          }}
        >
          <span style={{ fontSize: '13px', color: theme.colors.gray[500] }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <IconButton
              icon={ChevronLeft}
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              style={{ opacity: pagination.page <= 1 ? 0.5 : 1 }}
            />
            <IconButton
              icon={ChevronRight}
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              style={{ opacity: pagination.page >= pagination.totalPages ? 0.5 : 1 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
