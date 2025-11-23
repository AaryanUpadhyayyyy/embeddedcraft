import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Calendar,
    Activity,
    Filter,
    Download
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import DataTable from '@/components/shared/DataTable';
import SearchInput from '@/components/shared/SearchInput';
import UserDetailPanel from '@/components/users/UserDetailPanel';
import { theme } from '@/styles/design-tokens';
import { Button } from '@/components/ui/button';

const UsersPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const api = await import('@/lib/api');
                const data = await api.listUsers();
                setUsers(data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                toast.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleUserClick = (user: any) => {
        setSelectedUserId(user.id);
        setIsDetailOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            key: 'name',
            header: 'User',
            width: '250px',
            render: (value: string, row: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: theme.colors.primary[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.primary[600],
                        fontWeight: 600,
                        fontSize: '14px'
                    }}>
                        {value ? value.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <div>
                        <div style={{ fontWeight: 500, color: theme.colors.text.primary }}>{value || 'Anonymous'}</div>
                        <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'id',
            header: 'User ID',
            width: '150px',
            render: (value: string) => (
                <span style={{ fontFamily: theme.typography.fontFamily.mono[0], fontSize: '12px', color: theme.colors.text.secondary }}>
                    {value.substring(0, 8)}...
                </span>
            )
        },
        {
            key: 'lastSeen',
            header: 'Last Seen',
            width: '150px',
            render: (value: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: theme.colors.text.secondary }}>
                    <Activity size={14} />
                    {value || 'Just now'}
                </div>
            )
        },
        {
            key: 'segments',
            header: 'Segments',
            width: '200px',
            render: () => (
                <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{
                        padding: '2px 8px',
                        backgroundColor: theme.colors.gray[100],
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: theme.colors.text.secondary
                    }}>
                        All Users
                    </span>
                </div>
            )
        },
        {
            key: 'createdAt',
            header: 'Joined',
            width: '150px',
            render: (value: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: theme.colors.text.secondary }}>
                    <Calendar size={14} />
                    {new Date(value).toLocaleDateString()}
                </div>
            )
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
            <PageHeader
                title="Users"
                subtitle={`Manage and view your user base • ${users.length} total users`}
                actions={
                    <Button variant="outline" className="gap-2 bg-white">
                        <Download size={16} />
                        Export CSV
                    </Button>
                }
            />

            <PageContainer>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: theme.borderRadius.lg,
                    border: `1px solid ${theme.colors.border.default}`,
                    boxShadow: theme.shadows.sm,
                    overflow: 'hidden'
                }}>
                    {/* Filters Bar */}
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: `1px solid ${theme.colors.border.default}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{ width: '300px' }}>
                            <SearchInput
                                placeholder="Search users by name, email or ID..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                border: `1px solid ${theme.colors.border.default}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                color: theme.colors.text.secondary,
                                cursor: 'pointer'
                            }}>
                                <Filter size={16} />
                                Filter
                            </button>
                        </div>
                    </div>

                    <DataTable
                        data={filteredUsers}
                        columns={columns}
                        loading={loading}
                        onRowClick={handleUserClick}
                        emptyState={{
                            title: "No users found",
                            description: "Users will appear here once they interact with your app."
                        }}
                    />
                </div>
            </PageContainer>

            <UserDetailPanel
                userId={selectedUserId}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </div>
    );
};

export default UsersPage;
