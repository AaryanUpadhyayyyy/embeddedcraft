import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  BarChart2,
  Play,
  Pause,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import PageHeader from '@/components/layout/PageHeader';
import PageContainer from '@/components/layout/PageContainer';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import IconButton from '@/components/shared/IconButton';
import SearchInput from '@/components/shared/SearchInput';
import CreateCampaignModal from '@/components/campaign/CreateCampaignModal';
import { theme } from '@/styles/design-tokens';

const Campaigns = () => {
  const navigate = useNavigate();
  const { campaigns, deleteCampaign, updateCampaignStatus, syncCampaigns } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch campaigns from backend on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const api = await import('@/lib/api');
        const { campaigns: backendCampaigns } = await api.listCampaigns({ limit: 100 });

        // Convert backend campaigns to dashboard format
        const dashboardCampaigns = backendCampaigns.map((bc: any) => ({
          id: bc.id,
          name: bc.name,
          status: bc.status as 'active' | 'paused' | 'draft',
          trigger: bc.trigger,
          segment: 'All Users', // Default for now
          impressions: 0, // Mock data for now
          clicks: 0,
          conversions: 0,
          conversion: '0.0',
          config: bc.config,
          rules: bc.rules.map((r: any) => ({
            id: r.id,
            type: r.type as 'event' | 'attribute',
            field: r.field,
            operator: r.operator,
            value: String(r.value),
          })),
          createdAt: bc.createdAt || new Date().toISOString(),
          updatedAt: bc.updatedAt || new Date().toISOString(),
        }));

        syncCampaigns(dashboardCampaigns);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        toast.error('Failed to load campaigns');
      }
    };

    fetchCampaigns();
  }, [syncCampaigns]);

  const handleEdit = (id: string) => {
    navigate(`/campaign-builder?id=${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(id);
      toast.success('Campaign deleted');
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateCampaignStatus(id, newStatus);
    toast.success(`Campaign ${newStatus}`);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? campaign.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'name',
      header: 'Campaign Name',
      width: '300px',
      render: (value: string, row: any) => (
        <div>
          <div style={{ fontWeight: 500, color: theme.colors.text.primary }}>{value}</div>
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
            {row.trigger === 'manual' ? 'Manual Trigger' : `Event: ${row.trigger}`}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (value: string) => <StatusBadge status={value as any} />
    },
    {
      key: 'impressions',
      header: 'Impressions',
      width: '120px',
      render: (value: number) => <span style={{ fontFamily: theme.typography.fontFamily.mono[0] }}>{value.toLocaleString()}</span>
    },
    {
      key: 'clicks',
      header: 'Clicks',
      width: '100px',
      render: (value: number) => <span style={{ fontFamily: theme.typography.fontFamily.mono[0] }}>{value.toLocaleString()}</span>
    },
    {
      key: 'conversion',
      header: 'Conversion',
      width: '100px',
      render: (value: string) => <span style={{ fontFamily: theme.typography.fontFamily.mono[0] }}>{value}%</span>
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      width: '150px',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      header: '',
      width: '160px',
      render: (_: any, row: any) => (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
          <IconButton
            icon={row.status === 'active' ? Pause : Play}
            onClick={() => handleToggleStatus(row.id, row.status)}
            tooltip={row.status === 'active' ? 'Pause' : 'Activate'}
          />
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(row.id)}
            tooltip="Edit"
          />
          <IconButton
            icon={BarChart2}
            onClick={() => navigate('/analytics')}
            tooltip="Analytics"
          />
          <IconButton
            icon={Trash2}
            onClick={() => handleDelete(row.id)}
            variant="danger"
            tooltip="Delete"
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      <PageHeader
        title="Campaigns"
        subtitle="Manage your in-app nudges and messages"
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: theme.colors.primary[600],
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: theme.shadows.sm,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary[700]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary[600]}
          >
            <Plus size={18} />
            New Campaign
          </button>
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
                placeholder="Search campaigns..."
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
            data={filteredCampaigns}
            columns={columns}
            onRowClick={(row) => handleEdit(row.id)}
            emptyState={{
              title: "No campaigns found",
              description: "Get started by creating your first campaign."
            }}
          />
        </div>
      </PageContainer>

      <CreateCampaignModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};

export default Campaigns;
