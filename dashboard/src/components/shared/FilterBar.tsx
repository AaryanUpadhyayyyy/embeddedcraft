import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { theme } from '../../styles/design-tokens';
import * as Popover from '@radix-ui/react-popover';

export interface FilterOption {
    id: string;
    label: string;
    options: { label: string; value: string }[];
}

interface FilterBarProps {
    filters: FilterOption[];
    activeFilters: Record<string, string>;
    onFilterChange: (filterId: string, value: string | null) => void;
    onClearAll: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    activeFilters,
    onFilterChange,
    onClearAll
}) => {
    const [openFilter, setOpenFilter] = useState<string | null>(null);

    const activeCount = Object.keys(activeFilters).length;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Filter Trigger Buttons */}
            {filters.map((filter) => {
                const isActive = !!activeFilters[filter.id];
                const activeLabel = isActive
                    ? filter.options.find(o => o.value === activeFilters[filter.id])?.label
                    : null;

                return (
                    <Popover.Root
                        key={filter.id}
                        open={openFilter === filter.id}
                        onOpenChange={(open) => setOpenFilter(open ? filter.id : null)}
                    >
                        <Popover.Trigger asChild>
                            <button
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    backgroundColor: isActive ? theme.colors.primary[50] : 'white',
                                    border: `1px solid ${isActive ? theme.colors.primary[200] : theme.colors.border.default}`,
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: isActive ? theme.colors.primary[700] : theme.colors.text.secondary,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {isActive ? (
                                    <>
                                        <span style={{ fontWeight: 600 }}>{filter.label}:</span>
                                        <span>{activeLabel}</span>
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onFilterChange(filter.id, null);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: '4px',
                                                padding: '2px',
                                                borderRadius: '50%',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary[100]}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <X size={12} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {filter.label}
                                        <Filter size={12} />
                                    </>
                                )}
                            </button>
                        </Popover.Trigger>

                        <Popover.Portal>
                            <Popover.Content
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    padding: '4px',
                                    boxShadow: theme.shadows.lg,
                                    border: `1px solid ${theme.colors.border.default}`,
                                    minWidth: '180px',
                                    zIndex: 50,
                                    animation: 'fadeIn 0.1s ease-out',
                                }}
                                sideOffset={4}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {filter.options.map((option) => {
                                        const isSelected = activeFilters[filter.id] === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    onFilterChange(filter.id, option.value);
                                                    setOpenFilter(null);
                                                }}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '8px 12px',
                                                    fontSize: '13px',
                                                    color: isSelected ? theme.colors.primary[600] : theme.colors.text.primary,
                                                    backgroundColor: isSelected ? theme.colors.primary[50] : 'transparent',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) e.currentTarget.style.backgroundColor = theme.colors.gray[50];
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                {option.label}
                                                {isSelected && <Check size={14} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                );
            })}

            {/* Clear All Button */}
            {activeCount > 0 && (
                <button
                    onClick={onClearAll}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '13px',
                        color: theme.colors.text.secondary,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                    }}
                >
                    Clear all
                </button>
            )}
        </div>
    );
};

export default FilterBar;
