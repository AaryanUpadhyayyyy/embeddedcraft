import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Download,
  Calendar
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import { useStore } from "@/store/useStore";
import PageHeader from "@/components/layout/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { theme } from "@/styles/design-tokens";
import { Button } from "@/components/ui/button";

// Stat Card Component (Reused from Dashboard, could be moved to shared if used in >2 places)
const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: '24px',
    border: `1px solid ${theme.colors.border.default}`,
    boxShadow: theme.shadows.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '14px', color: theme.colors.text.secondary, fontWeight: 500 }}>{title}</p>
        <h3 style={{ fontSize: '28px', fontWeight: 700, color: theme.colors.text.primary, marginTop: '8px' }}>{value}</h3>
      </div>
      <div style={{
        padding: '10px',
        borderRadius: '12px',
        backgroundColor: theme.colors.gray[50],
        color: theme.colors.text.secondary
      }}>
        <Icon size={20} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '13px',
        fontWeight: 600,
        color: trend === 'up' ? theme.colors.success : theme.colors.error,
        backgroundColor: trend === 'up' ? '#ECFDF5' : '#FEF2F2',
        padding: '2px 8px',
        borderRadius: '100px'
      }}>
        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
      </div>
      <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>vs last period</span>
    </div>
  </div>
);

const Analytics = () => {
  const { campaigns, analyticsData } = useStore();

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  const campaignDistribution = campaigns.map((c, i) => ({
    name: c.name,
    value: c.impressions,
    color: i === 0 ? theme.colors.primary[500] : i === 1 ? theme.colors.info : `hsl(${200 + i * 30} 70% 50%)`
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: `1px solid ${theme.colors.border.default}`,
          padding: '12px',
          borderRadius: '8px',
          boxShadow: theme.shadows.lg
        }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: theme.colors.text.primary }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
              <span style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{entry.name}:</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.text.primary }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Columns for DataTable
  const columns = [
    {
      key: 'name',
      header: 'Campaign',
      width: '250px',
      render: (value: string) => <span style={{ fontWeight: 500, color: theme.colors.text.primary }}>{value}</span>
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
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
      key: 'ctr',
      header: 'CTR',
      width: '100px',
      render: (_: any, row: any) => {
        const val = row.impressions > 0 ? ((row.clicks / row.impressions) * 100).toFixed(1) : '0.0';
        return <span style={{ fontFamily: theme.typography.fontFamily.mono[0], color: theme.colors.primary[600], fontWeight: 600 }}>{val}%</span>;
      }
    },
    {
      key: 'conversions',
      header: 'Conversions',
      width: '120px',
      render: (value: number) => <span style={{ fontFamily: theme.typography.fontFamily.mono[0] }}>{value.toLocaleString()}</span>
    },
    {
      key: 'conversion',
      header: 'CVR',
      width: '100px',
      render: (value: string) => <span style={{ fontFamily: theme.typography.fontFamily.mono[0], color: theme.colors.success, fontWeight: 600 }}>{value}%</span>
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into campaign performance and user engagement"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'white',
              border: `1px solid ${theme.colors.border.default}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              color: theme.colors.text.primary,
              cursor: 'pointer'
            }}>
              <Calendar size={16} className="text-gray-500" />
              Last 30 Days
            </button>
            <Button variant="outline" className="gap-2 bg-white">
              <Download size={16} />
              Export Report
            </Button>
          </div>
        }
      />

      <PageContainer>
        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="Total Impressions"
            value={`${(totalImpressions / 1000).toFixed(1)}K`}
            change="+24.5%"
            trend="up"
            icon={Eye}
          />
          <StatCard
            title="Total Clicks"
            value={`${(totalClicks / 1000).toFixed(1)}K`}
            change="+18.2%"
            trend="up"
            icon={MousePointerClick}
          />
          <StatCard
            title="Click-Through Rate"
            value={`${ctr}%`}
            change={parseFloat(ctr) > 7 ? "+2.1%" : "-1.5%"}
            trend={parseFloat(ctr) > 7 ? "up" : "down"}
            icon={TrendingUp}
          />
          <StatCard
            title="Conversions"
            value={`${(totalConversions / 1000).toFixed(2)}K`}
            change="+31.8%"
            trend="up"
            icon={TrendingUp}
          />
        </div>

        {/* Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: theme.borderRadius.lg,
            padding: '24px',
            border: `1px solid ${theme.colors.border.default}`,
            boxShadow: theme.shadows.sm
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '24px' }}>Weekly Trend</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border.default} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme.colors.text.secondary, fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    stroke={theme.colors.primary[500]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke={theme.colors.info}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke={theme.colors.success}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: theme.borderRadius.lg,
            padding: '24px',
            border: `1px solid ${theme.colors.border.default}`,
            boxShadow: theme.shadows.sm
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '24px' }}>Impressions by Campaign</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campaignDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {campaignDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.default}`,
          boxShadow: theme.shadows.sm,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.colors.border.default}` }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.text.primary }}>Campaign Performance Details</h3>
          </div>
          <DataTable
            data={campaigns}
            columns={columns}
            searchPlaceholder="Search campaigns..."
            searchable
          />
        </div>
      </PageContainer>
    </div>
  );
};

export default Analytics;
