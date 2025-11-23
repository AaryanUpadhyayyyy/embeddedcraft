import React, { useState, useEffect } from 'react';
import { theme } from '../styles/design-tokens';
import { toast } from 'sonner';
import { Filter, RefreshCw } from 'lucide-react';

// Components
import PageHeader from '../components/layout/PageHeader';
import PageContainer from '../components/layout/PageContainer';
import DataTable, { Column } from '../components/shared/DataTable';
import IconButton from '../components/shared/IconButton';
import SearchInput from '../components/shared/SearchInput';

interface EventRow {
    id: string;
    event: string;
    userId: string;
    timestamp: string;
    properties: string;
    original: any;
}

const Events: React.FC = () => {
    const [events, setEvents] = useState<EventRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const api = await import('@/lib/api');
            // @ts-ignore - listEvents added dynamically
            const { events: backendEvents } = await api.apiClient.listEvents(100);

            const formattedEvents = backendEvents.map((e: any) => ({
                id: e.id || Math.random().toString(),
                event: e.event,
                userId: e.user_id,
                timestamp: new Date(e.ts).toLocaleString(),
                properties: JSON.stringify(e.properties || {}),
                original: e,
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter data
    const filteredData = events.filter((row) =>
        row.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<EventRow>[] = [
        {
            key: 'event',
            header: 'Event Name',
            width: '25%',
            render: (row) => (
                <span style={{ fontWeight: 500, color: theme.colors.text.primary }}>
                    {row.event}
                </span>
            )
        },
        {
            key: 'userId',
            header: 'User ID',
            width: '20%',
            render: (row) => (
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: theme.colors.primary[600] }}>
                    {row.userId}
                </span>
            )
        },
        {
            key: 'timestamp',
            header: 'Timestamp',
            width: '20%',
            render: (row) => <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>{row.timestamp}</span>
        },
        {
            key: 'properties',
            header: 'Properties',
            width: '35%',
            render: (row) => (
                <div
                    style={{
                        fontSize: '12px',
                        color: theme.colors.text.secondary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '300px',
                        fontFamily: 'monospace'
                    }}
                    title={row.properties}
                >
                    {row.properties}
                </div>
            )
        },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PageHeader
                title="Events Log"
                subtitle="Real-time log of user events and interactions"
                actions={
                    <IconButton
                        icon={RefreshCw}
                        onClick={fetchEvents}
                        title="Refresh"
                        variant="secondary"
                    />
                }
            />

            <PageContainer>
                <div style={{ marginBottom: theme.spacing[6], display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <SearchInput
                        placeholder="Search events or users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div style={{ flex: 1 }} />
                    <IconButton icon={Filter} label="Filter" variant="secondary" />
                </div>

                <DataTable
                    data={filteredData}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage="No events recorded yet."
                />
            </PageContainer>
        </div>
    );
};

export default Events;
