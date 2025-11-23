import React from 'react';
import { theme } from '../../styles/design-tokens';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px',
                textAlign: 'center',
                backgroundColor: theme.colors.background.card,
                borderRadius: theme.borderRadius.lg,
                border: `1px dashed ${theme.colors.border.default}`,
            }}
        >
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.gray[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: theme.colors.text.secondary,
                }}
            >
                <Icon size={24} />
            </div>

            <h3
                style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    marginBottom: '8px',
                }}
            >
                {title}
            </h3>

            <p
                style={{
                    fontSize: '14px',
                    color: theme.colors.text.secondary,
                    maxWidth: '400px',
                    marginBottom: action ? '24px' : 0,
                    lineHeight: 1.5,
                }}
            >
                {description}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: theme.colors.primary[500],
                        color: 'white',
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary[600]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary[500]}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
