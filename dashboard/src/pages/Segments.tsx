import React from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/layout/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
import EmptyState from "@/components/shared/EmptyState";
import { theme } from "@/styles/design-tokens";
import { Button } from "@/components/ui/button";

const Segments = () => {
  const { segments, deleteSegment } = useStore();

  const handleDelete = (id: string) => {
    deleteSegment(id);
    toast.success("Segment deleted");
  };

  const colors = [
    theme.colors.primary[600],
    theme.colors.info,
    theme.colors.warning,
    theme.colors.success,
    theme.colors.purple[600]
  ];

  const bgColors = [
    theme.colors.primary[50],
    '#EFF6FF', // info-50
    '#FFFBEB', // warning-50
    '#ECFDF5', // success-50
    theme.colors.purple[50]
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      <PageHeader
        title="User Segments"
        subtitle={`Create and manage user targeting rules • ${segments.length} segments`}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={16} />
            New Segment
          </Button>
        }
      />

      <PageContainer>
        {segments.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No segments created yet"
            description="Segments allow you to target specific groups of users based on their attributes and behavior."
            action={{
              label: "Create Your First Segment",
              onClick: () => { }
            }}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: theme.borderRadius.lg,
                  border: `1px solid ${theme.colors.border.default}`,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  transition: 'all 0.2s',
                  boxShadow: theme.shadows.sm,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = theme.shadows.md;
                  e.currentTarget.style.borderColor = theme.colors.primary[200];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.shadows.sm;
                  e.currentTarget.style.borderColor = theme.colors.border.default;
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.text.primary, marginBottom: '4px' }}>
                      {segment.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: theme.colors.success
                      }} />
                      <span style={{ fontSize: '13px', color: theme.colors.text.secondary }}>Active</span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: theme.colors.gray[100],
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: theme.colors.text.primary
                  }}>
                    <Users size={12} className="text-gray-500" />
                    {segment.users.toLocaleString()}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.text.secondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Targeting Rules
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {segment.rules.map((rule) => (
                      <div key={rule.id} style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        backgroundColor: bgColors[index % bgColors.length],
                        color: colors[index % colors.length],
                        borderRadius: '6px',
                        fontWeight: 500,
                        border: `1px solid ${colors[index % colors.length]}20`
                      }}>
                        <span style={{ opacity: 0.7 }}>{rule.field}</span> {rule.operator} <b>{rule.value}</b>
                      </div>
                    ))}
                    {segment.rules.length === 0 && (
                      <span style={{ fontSize: '13px', color: theme.colors.text.secondary, fontStyle: 'italic' }}>
                        All users included
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  paddingTop: '20px',
                  borderTop: `1px solid ${theme.colors.border.default}`
                }}>
                  <Button variant="outline" size="sm" className="flex-1 gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    <Edit size={14} />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Segment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{segment.name}". Campaigns using this segment may be affected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(segment.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default Segments;
