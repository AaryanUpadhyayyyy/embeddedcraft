import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Save, Rocket, MessageSquare, Smartphone, Film, Target, Flame, ClipboardList, Square, Zap, Image as ImageIcon, Menu, X, ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock, Plus, Trash2, Type, Palette, Settings2, Maximize2, Layout, MessageCircle, Info, ImageIcon as PictureIcon, CreditCard, PlayCircle, Grid3x3, Link2, Undo2, Redo2, Copy, LayoutGrid } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useEditorStore } from '@/store/useEditorStore';
import { BottomSheetRenderer } from '@/components/BottomSheetRenderer';
import { BOTTOM_SHEET_TEMPLATES, getFeaturedTemplates } from '@/lib/bottomSheetTemplates';
import { validateNumericInput, validatePercentage, validateOpacity, validateDimension, validateColor } from '@/lib/validation';
import { BannerRenderer } from '@/components/BannerRenderer';
import { TooltipRenderer } from '@/components/TooltipRenderer';
import { ModalRenderer } from '@/components/ModalRenderer';
import { PositionEditor } from '@/components/editor/style/PositionEditor';
import { ShapeEditor } from '@/components/editor/style/ShapeEditor';

const CampaignBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Zustand Editor Store
  const {
    currentCampaign,
    activeTab,
    propertyTab,
    showEditor,
    isSaving,
    saveError,
    createCampaign,
    updateCampaignName,
    updateTrigger,
    updateScreen,
    updateStatus,
    saveCampaign,
    loadCampaign,
    loadTemplate,
    selectLayer,
    updateLayer,
    updateLayerContent,
    updateLayerStyle,
    updateBottomSheetConfig,
    updateModalConfig,
    updateBannerConfig,
    updateTooltipConfig,
    toggleLayerVisibility,
    toggleLayerLock,
    deleteLayer,
    duplicateLayer,
    addLayer,
    moveLayerToParent,
    undo,
    redo,
    canUndo,
    canRedo,
    setActiveTab,
    setPropertyTab,
    setShowEditor,
    updateDisplayRules,
    addTargetingRule,
    updateTargetingRule,
    deleteTargetingRule,
    enableAutoSave,
  } = useEditorStore();

  // Local UI state
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<string | null>('nudges');
  const [selectedNudgeType, setSelectedNudgeType] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null); // Fix 3
  const [collapsedLayers, setCollapsedLayers] = useState<Set<string>>(new Set()); // For layer hierarchy

  // Derived state for selected layer
  const selectedLayerId = currentCampaign?.selectedLayerId || null;
  const selectedLayerObj = currentCampaign?.layers?.find((layer: any) => layer.id === selectedLayerId);

  // Property panel state
  const [borderRadiusValue, setBorderRadiusValue] = useState(8);

  // FIX #20: Debounce timer ref for slider inputs
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Handle property updates with real-time store sync
  const handleContentUpdate = (field: string, value: any) => {
    if (!selectedLayerId) return;
    updateLayerContent(selectedLayerId, { [field]: value });
  };

  const handleStyleUpdate = (field: string, value: any) => {
    if (!selectedLayerId) return;
    updateLayerStyle(selectedLayerId, { [field]: value });
  };

  // Image upload handler (Fix 1)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'layer' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;

      if (target === 'layer') {
        handleContentUpdate('imageUrl', base64);
        toast.success('Image uploaded successfully');
      } else {
        handleStyleUpdate('backgroundImage', `url('${base64}')`);
        toast.success('Background image uploaded');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop Handlers for Layer Reordering
  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a subtle visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLayerId(null);
    setDragOverLayerId(null);
    setDropPosition(null); // Fix 3
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedLayerId && draggedLayerId !== layerId) {
      setDragOverLayerId(layerId);

      // Calculate drop position (Fix 3 - Enhanced visual feedback)
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const mouseY = e.clientY;
      const relativeY = mouseY - rect.top;
      const height = rect.height;

      // Determine if drop should be before, after, or inside (for containers)
      const targetLayer = campaignLayers.find(l => l.id === layerId);
      const isContainer = targetLayer?.type === 'container';

      if (relativeY < height * 0.33) {
        setDropPosition('before');
      } else if (relativeY > height * 0.67 || !isContainer) {
        setDropPosition('after');
      } else {
        setDropPosition('inside'); // Only for containers
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverLayerId(null);
    setDropPosition(null); // Fix 3
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();

    if (!draggedLayerId || draggedLayerId === targetLayerId) {
      setDraggedLayerId(null);
      setDragOverLayerId(null);
      setDropPosition(null);
      return;
    }

    const draggedLayer = campaignLayers.find(l => l.id === draggedLayerId);
    const targetLayer = campaignLayers.find(l => l.id === targetLayerId);

    if (!draggedLayer || !targetLayer || !currentCampaign) {
      setDraggedLayerId(null);
      setDragOverLayerId(null);
      setDropPosition(null);
      return;
    }

    // Handle different drop positions
    if (dropPosition === 'inside' && targetLayer.type === 'container') {
      // Move layer inside the container (make it a child)
      moveLayerToParent(draggedLayerId, targetLayerId);
      toast.success(`"${draggedLayer.name}" moved inside "${targetLayer.name}"`);
    } else {
      // Reorder at same level (before/after)
      const draggedIndex = campaignLayers.findIndex(l => l.id === draggedLayerId);
      const targetIndex = campaignLayers.findIndex(l => l.id === targetLayerId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const { reorderLayer } = useEditorStore.getState();
        const adjustedIndex = dropPosition === 'after' ? targetIndex + 1 : targetIndex;
        reorderLayer(draggedLayerId, adjustedIndex);
        toast.success('Layer reordered');
      }
    }

    setDraggedLayerId(null);
    setDragOverLayerId(null);
    setDropPosition(null);
  };

  // Load campaign from URL parameter if present, OR reset for new campaign
  useEffect(() => {
    const campaignId = searchParams.get('id');
    if (campaignId) {
      console.log('=== CAMPAIGN LOAD START ===');
      console.log('CampaignBuilder: Campaign ID from URL:', campaignId);
      console.log('CampaignBuilder: Current campaign before load:', currentCampaign?.id);

      // ALWAYS fetch from server on page load/reload to get latest data
      // Don't rely on localStorage cache
      console.log('CampaignBuilder: Fetching campaign from server...');

      // Show loading state
      loadCampaign(campaignId)
        .then(() => {
          console.log('CampaignBuilder: loadCampaign promise resolved');

          // Force re-check of currentCampaign after a brief delay to ensure state is updated
          setTimeout(() => {
            const { currentCampaign: updatedCampaign } = useEditorStore.getState();
            console.log('CampaignBuilder: Campaign after load:', updatedCampaign?.id);
            console.log('CampaignBuilder: Campaign nudgeType:', updatedCampaign?.nudgeType);
            console.log('CampaignBuilder: Campaign layers count:', updatedCampaign?.layers?.length);

            if (updatedCampaign) {
              console.log('CampaignBuilder: Setting nudgeType to:', updatedCampaign.nudgeType);
              setSelectedNudgeType(updatedCampaign.nudgeType);
              toast.success('Campaign loaded successfully');
              console.log('=== CAMPAIGN LOAD SUCCESS ===');
            } else {
              console.error('CampaignBuilder: Campaign loaded but currentCampaign is null');
              toast.error('Failed to load campaign data');
              setSelectedNudgeType(null);
              console.log('=== CAMPAIGN LOAD FAILED (NULL) ===');
            }
          }, 100);
        })
        .catch((error) => {
          console.error('=== CAMPAIGN LOAD ERROR ===');
          console.error('CampaignBuilder: Error details:', error);
          console.error('CampaignBuilder: Error message:', error.message);
          console.error('CampaignBuilder: Error stack:', error.stack);
          toast.error(`Failed to load campaign: ${error.message || 'Unknown error'}`);
          // FIX #6: Reset to campaign selection on failure
          setSelectedNudgeType(null);
        });
    } else {
      // No campaign ID - this is a new campaign, reset everything
      console.log('CampaignBuilder: No campaign ID in URL - resetting for new campaign');
      useEditorStore.setState({ currentCampaign: null });
      setSelectedNudgeType(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadCampaign]); // Added loadCampaign to force reload on mount

  // Enable auto-save on mount
  useEffect(() => {
    enableAutoSave();
    return () => {
      // Cleanup handled by store
    };
  }, [enableAutoSave]);

  // Sync selectedNudgeType with current campaign
  useEffect(() => {
    if (currentCampaign?.nudgeType && selectedNudgeType !== currentCampaign.nudgeType) {
      console.log('CampaignBuilder: Syncing selectedNudgeType to:', currentCampaign.nudgeType);
      setSelectedNudgeType(currentCampaign.nudgeType);
    } else if (!currentCampaign && selectedNudgeType) {
      // If no campaign exists but selectedNudgeType is set, reset it
      console.log('CampaignBuilder: No campaign but selectedNudgeType is set, resetting');
      setSelectedNudgeType(null);
    }
  }, [currentCampaign, selectedNudgeType]);

  // FIX #14: Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentCampaign?.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentCampaign?.isDirty]);

  // Get layers from current campaign
  const campaignLayers = currentCampaign?.layers || [];
  const campaignName = currentCampaign?.name || 'New Campaign';

  // Debug logging for preview
  console.log('CampaignBuilder: Current campaign:', currentCampaign?.id);
  console.log('CampaignBuilder: Campaign layers count:', campaignLayers.length);
  console.log('CampaignBuilder: Campaign layers:', campaignLayers);

  // Get bottom sheet container ID (for adding new layers as children)
  const bottomSheetContainer = campaignLayers.find(l => l.type === 'container' && l.name === 'Bottom Sheet');
  const bottomSheetId = bottomSheetContainer?.id || null;

  // Design Tokens
  const colors = {
    primary: { 50: '#EEF2FF', 100: '#E0E7FF', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827' },
    purple: { 50: '#FAF5FF', 500: '#A855F7', 600: '#9333EA' },
    green: { 50: '#F0FDF4', 500: '#22C55E' },
    background: { page: '#F9FAFB', card: '#FFFFFF' },
    border: { default: '#E5E7EB' },
    text: { primary: '#111827', secondary: '#6B7280' }
  };

  // Experience Types (Screenshot 7)
  const experienceTypes = [
    { id: 'nudges', label: 'In-app nudges', Icon: MessageSquare, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'messages', label: 'Messages', Icon: Smartphone, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'stories', label: 'Stories', Icon: Film, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'challenges', label: 'Challenges', Icon: Target, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'streaks', label: 'Streaks', Icon: Flame, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'survey', label: 'Survey', Icon: ClipboardList, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  ];

  // Nudge Types (Screenshot 8)
  const nudgeTypes = [
    { id: 'modal', label: 'Modal', Icon: Maximize2, bg: '#E0E7FF', iconBg: '#C7D2FE', iconColor: '#6366F1' },
    { id: 'banner', label: 'Banner', Icon: Layout, bg: '#DBEAFE', iconBg: '#BFDBFE', iconColor: '#3B82F6' },
    { id: 'bottomsheet', label: 'Bottom Sheet', Icon: Square, bg: '#D1FAE5', iconBg: '#A7F3D0', iconColor: '#10B981' },
    { id: 'tooltip', label: 'Tooltip', Icon: MessageCircle, bg: '#FEF3C7', iconBg: '#FDE68A', iconColor: '#F59E0B' },
    { id: 'pip', label: 'Picture in Picture', Icon: PictureIcon, bg: '#E0E7FF', iconBg: '#C7D2FE', iconColor: '#6366F1' },
    { id: 'scratchcard', label: 'Scratch Card', Icon: CreditCard, bg: '#FCE7F3', iconBg: '#F9A8D4', iconColor: '#EC4899' },
    { id: 'carousel', label: 'Story Carousel', Icon: PlayCircle, bg: '#E0E7FF', iconBg: '#C7D2FE', iconColor: '#6366F1' },
    { id: 'inline', label: 'Inline Widget', Icon: Grid3x3, bg: '#DBEAFE', iconBg: '#BFDBFE', iconColor: '#3B82F6' }
  ];

  // Helper function to check if a layer is selected
  const isLayerSelected = (layerId: string) => selectedLayerId === layerId;

  // Helper function to check if selected layer matches a type or name
  const isSelectedLayerType = (typeOrName: string) => {
    if (!selectedLayerObj) return false;
    return selectedLayerObj.type === typeOrName ||
      selectedLayerObj.name.toLowerCase().includes(typeOrName.toLowerCase());
  };

  // Layer hierarchy helpers (Fix 2)
  const toggleLayerCollapse = (layerId: string) => {
    setCollapsedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  };

  // Recursive Layer Tree Item Component (Fix 2)
  const renderLayerTreeItem = (layer: any, depth: number = 0): JSX.Element => {
    const hasChildren = layer.children && layer.children.length > 0;
    const isCollapsed = collapsedLayers.has(layer.id);
    const isSelected = currentCampaign?.selectedLayerId === layer.id;
    const isDraggedOver = dragOverLayerId === layer.id;
    const isDragging = draggedLayerId === layer.id; // Fix 3
    const indentPx = depth * 20;

    return (
      <div key={layer.id} style={{ position: 'relative' }}>
        {/* Insertion line - BEFORE (Fix 3) */}
        {isDraggedOver && dropPosition === 'before' && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            left: `${12 + indentPx}px`,
            right: '12px',
            height: '2px',
            backgroundColor: colors.primary[500],
            borderRadius: '1px',
            zIndex: 100,
            boxShadow: '0 0 4px rgba(99, 102, 241, 0.5)'
          }} />
        )}

        <div
          draggable={!layer.locked}
          onDragStart={(e) => handleDragStart(e, layer.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, layer.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, layer.id)}
          onClick={() => selectLayer(layer.id)}
          style={{
            padding: '10px 12px',
            marginBottom: '4px',
            borderRadius: '6px',
            cursor: layer.locked ? 'not-allowed' : 'grab',
            backgroundColor: isSelected ? colors.purple[50] : 'transparent',
            border: `1px solid ${isDraggedOver && dropPosition === 'inside'
              ? colors.primary[500]
              : isSelected
                ? colors.purple[500]
                : 'transparent'
              }`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: `${12 + indentPx}px`,
            opacity: isDragging ? 0.4 : (layer.visible ? 1 : 0.5), // Ghost effect when dragging
            transition: 'all 0.15s ease',
            transform: isDragging ? 'scale(0.98)' : 'scale(1)' // Subtle scale when dragging
          }}
        >
          {/* Drag handle indicator */}
          {!layer.locked && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              cursor: 'grab',
              opacity: 0.4
            }}>
              <div style={{ width: '3px', height: '3px', backgroundColor: colors.gray[400], borderRadius: '50%' }} />
              <div style={{ width: '3px', height: '3px', backgroundColor: colors.gray[400], borderRadius: '50%' }} />
              <div style={{ width: '3px', height: '3px', backgroundColor: colors.gray[400], borderRadius: '50%' }} />
            </div>
          )}

          {/* Expand/collapse chevron for containers */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerCollapse(layer.id);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              {isCollapsed ? (
                <ChevronRight size={14} color={colors.gray[500]} />
              ) : (
                <ChevronDown size={14} color={colors.gray[500]} />
              )}
            </button>
          ) : (
            <div style={{ width: '18px' }} /> // Spacer for alignment
          )}

          <ImageIcon size={16} color={isSelected ? colors.purple[500] : colors.gray[500]} />
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: isSelected ? colors.purple[600] : colors.text.primary }}>
            {layer.name}
          </span>

          {/* Action buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLayerVisibility(layer.id);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
            title={layer.visible ? 'Hide layer' : 'Show layer'}
          >
            {layer.visible ? <Eye size={14} color={colors.gray[400]} /> : <EyeOff size={14} color={colors.gray[400]} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLayerLock(layer.id);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
            title={layer.locked ? 'Unlock layer' : 'Lock layer'}
          >
            {layer.locked ? <Lock size={14} color={colors.gray[400]} /> : <Unlock size={14} color={colors.gray[400]} />}
          </button>

          {/* Delete button - Skip for Bottom Sheet root layer */}
          {layer.type !== 'container' && layer.name !== 'Bottom Sheet' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${layer.name}" layer?`)) {
                  deleteLayer(layer.id);
                  toast.success('Layer deleted');
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              title="Delete layer"
            >
              <Trash2 size={14} color={colors.gray[400]} />
            </button>
          )}

          {/* More options */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Show context menu
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              title="More options"
            >
              <Menu size={14} color={colors.gray[400]} />
            </button>
          </div>
        </div>

        {/* Insertion line - AFTER (Fix 3) */}
        {isDraggedOver && dropPosition === 'after' && (
          <div style={{
            position: 'absolute',
            bottom: '2px',
            left: `${12 + indentPx}px`,
            right: '12px',
            height: '2px',
            backgroundColor: colors.primary[500],
            borderRadius: '1px',
            zIndex: 100,
            boxShadow: '0 0 4px rgba(99, 102, 241, 0.5)'
          }} />
        )}

        {/* Recursively render children if not collapsed */}
        {hasChildren && !isCollapsed && (
          <div>
            {layer.children.map((childId: string) => {
              const childLayer = campaignLayers.find((l: any) => l.id === childId);
              if (!childLayer) return null;
              return renderLayerTreeItem(childLayer, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  // Helper function to find a layer by name/type
  const findLayerByName = (name: string) => {
    return campaignLayers.find(layer => layer.name.toLowerCase().includes(name.toLowerCase()) || layer.type === name);
  };



  // ... (previous imports)

  // Inside CampaignBuilder component...

  // Render canvas preview based on nudge type
  const renderCanvasPreview = () => {
    // Check if we have a loaded campaign with nudgeType
    const nudgeTypeToRender = selectedNudgeType || currentCampaign?.nudgeType;

    if (!nudgeTypeToRender) {
      return (
        <div style={{ padding: '60px 20px 20px', textAlign: 'center', color: colors.text.secondary, fontSize: '13px' }}>
          Select a nudge type to preview
        </div>
      );
    }

    switch (nudgeTypeToRender) {
      case 'bottomsheet':
        // Extract maxHeight from bottom sheet container to pass to renderer
        const bottomSheetContainerLayer = campaignLayers.find(l => l.type === 'container' && l.name === 'Bottom Sheet');

        return (
          <BottomSheetRenderer
            layers={campaignLayers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={selectLayer}
            colors={colors}
            config={currentCampaign?.bottomSheetConfig}
            onHeightChange={(height) => updateBottomSheetConfig({ height })}
          />
        );

      case 'modal':
        return (
          <ModalRenderer
            layers={campaignLayers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={selectLayer}
            colors={colors}
            config={currentCampaign?.modalConfig}
            onConfigChange={(config) => updateModalConfig(config)}
          />
        );

      case 'banner':
        return (
          <BannerRenderer
            layers={campaignLayers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={selectLayer}
            colors={colors}
            config={currentCampaign?.bannerConfig}
            onConfigChange={(config) => updateBannerConfig(config)}
          />
        );

      case 'tooltip':
        return (
          <TooltipRenderer
            layers={campaignLayers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={selectLayer}
            colors={colors}
            config={currentCampaign?.tooltipConfig}
            onConfigChange={(config) => updateTooltipConfig(config)}
          />
        );

      case 'pip':
        return (
          <div style={{ position: 'absolute', bottom: '80px', right: '16px', width: '140px', height: '100px', backgroundColor: 'black', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: isSelectedLayerType('container') ? `2px solid ${colors.primary[500]}` : 'none' }}>
            {/* Video Placeholder */}
            <div style={{ width: '100%', height: '100%', backgroundColor: colors.gray[800], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: isSelectedLayerType('video') ? 1 : 0.9 }}>
              <PlayCircle size={32} color="white" opacity={0.8} />

              {/* Controls Overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', opacity: isSelectedLayerType('controls') ? 1 : 0.7 }}>
                  <PlayCircle size={16} color="white" />
                </button>
                <button style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', opacity: isSelectedLayerType('controls') ? 1 : 0.7 }}>
                  <Maximize2 size={14} color="white" />
                </button>
              </div>

              {/* Close Button */}
              <button style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: isSelectedLayerType('close') ? 1 : 0.7 }}>
                <X size={12} color="white" />
              </button>
            </div>
          </div>
        );

      case 'scratchcard':
        return (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: isSelectedLayerType('container') ? `2px solid ${colors.primary[500]}` : 'none' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', opacity: isSelectedLayerType('title') || isSelectedLayerType('text') ? 1 : 0.9 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700, color: colors.text.primary }}>
                Scratch & Win! 🎁
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: colors.text.secondary }}>
                Scratch to reveal your reward
              </p>
            </div>

            {/* Scratch Card Area */}
            <div style={{ width: '100%', height: '140px', borderRadius: '12px', marginBottom: '20px', position: 'relative', border: isSelectedLayerType('overlay') ? `2px solid ${colors.primary[500]}` : 'none' }}>
              {/* Scratch Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSelectedLayerType('overlay') ? 1 : 0.9 }}>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Scratch Here</p>
              </div>

              {/* Reward Content (shown partially) */}
              <div style={{ position: 'absolute', inset: 0, backgroundColor: colors.green[50], borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <p style={{ fontSize: '32px', fontWeight: 700, color: colors.green[500], margin: '0 0 4px 0' }}>50% OFF</p>
                <p style={{ fontSize: '12px', color: colors.text.secondary, margin: 0 }}>On your next order</p>
              </div>
            </div>

            {/* CTA */}
            <button style={{ width: '100%', padding: '14px', backgroundColor: colors.primary[500], color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: isSelectedLayerType('button') ? 1 : 0.9 }}>
              Claim Reward
            </button>
          </div>
        );

      case 'carousel':
        return (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'black' }}>
            {/* Progress Bars */}
            <div style={{ display: 'flex', gap: '4px', padding: '12px 16px', opacity: isSelectedLayerType('container') ? 1 : 0.7 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ flex: 1, height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                  {i === 0 && <div style={{ width: '60%', height: '100%', backgroundColor: 'white' }}></div>}
                </div>
              ))}
            </div>

            {/* Story Content */}
            <div style={{ position: 'relative', height: 'calc(100% - 50px)', opacity: isSelectedLayerType('media') ? 1 : 0.9 }}>
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop" alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Gradient Overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'white', opacity: isSelectedLayerType('text') ? 1 : 0.9 }}>
                  Summer Sale is Live! ☀️
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                  Up to 70% off on all items
                </p>
              </div>

              {/* Close Button */}
              <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: isSelectedLayerType('close') ? 1 : 0.7 }}>
                <X size={18} color="white" />
              </button>

              {/* Navigation Controls */}
              <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', opacity: isSelectedLayerType('controls') ? 1 : 0.5 }}>
                <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={20} color="white" style={{ transform: 'rotate(180deg)' }} />
                </button>
              </div>
              <div style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', opacity: isSelectedLayerType('controls') ? 1 : 0.5 }}>
                <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={20} color="white" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'inline':
        return (
          <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
            {/* Inline Widget */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '16px', border: isSelectedLayerType('container') ? `2px solid ${colors.primary[500]}` : `1px solid ${colors.border.default}` }}>
              {/* Media */}
              <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: isSelectedLayerType('media') ? `2px solid ${colors.primary[500]}` : 'none' }}>
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop" alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Content */}
              <div style={{ marginBottom: '16px', opacity: isSelectedLayerType('text') ? 1 : 0.9 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 700, color: colors.text.primary }}>
                  Exclusive Members Deal 🌟
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: colors.text.secondary, lineHeight: 1.5 }}>
                  Get early access to our new collection. Limited spots available!
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ flex: 1, padding: '12px', backgroundColor: colors.primary[500], color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: isSelectedLayerType('button') ? 1 : 0.9 }}>
                  Join Now
                </button>
                <button style={{ padding: '12px 20px', backgroundColor: 'transparent', color: colors.text.primary, border: `1px solid ${colors.border.default}`, borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', opacity: isSelectedLayerType('button') ? 1 : 0.9 }}>
                  Learn More
                </button>
              </div>
            </div>

            {/* Dummy content to show inline context */}
            <div style={{ fontSize: '13px', color: colors.text.secondary, lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 12px 0' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p style={{ margin: 0 }}>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ padding: '60px 20px 20px', textAlign: 'center', color: colors.text.secondary, fontSize: '13px' }}>
            Preview for {selectedNudgeType}
          </div>
        );
    }
  };

  // Render properties based on layer type
  const renderLayerProperties = () => {
    if (!selectedLayerObj) return null;

    // Check if layer is locked (Phase A - Fix 1)
    if (selectedLayerObj.locked) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: colors.text.secondary
        }}>
          <Lock size={48} color={colors.gray[300]} />
          <div style={{ fontSize: '14px', fontWeight: 500, color: colors.text.primary }}>Layer is Locked</div>
          <div style={{ fontSize: '12px', maxWidth: '200px', lineHeight: '1.5' }}>
            This layer cannot be edited while locked. Unlock it from the layers panel to make changes.
          </div>
        </div>
      );
    }

    // Bottom Sheet Configuration (Phase 3) - Show for bottomsheet nudge type
    const renderBottomSheetConfig = () => {
      if (selectedNudgeType !== 'bottomsheet') return null;

      const config = currentCampaign?.bottomSheetConfig || {
        mode: 'container',
        height: 'auto',
        dragHandle: true,
        swipeToDismiss: true,
        backgroundColor: '#FFFFFF',
        borderRadius: { topLeft: 16, topRight: 16 },
        elevation: 2,
        overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
        animation: { type: 'slide', duration: 300, easing: 'ease-out' }
      };

      const handleConfigUpdate = (field: string, value: any) => {
        updateBottomSheetConfig({ [field]: value });
      };

      const handleNestedConfigUpdate = (parent: 'overlay' | 'animation' | 'borderRadius', field: string, value: any) => {
        const parentObj = config[parent] as any;
        updateBottomSheetConfig({ [parent]: { ...parentObj, [field]: value } });
      };

      // Show bottom sheet config when:
      // 1. Bottom Sheet container is selected
      // 2. No layer is selected
      const isBottomSheetSelected = selectedLayerObj?.type === 'container' && selectedLayerObj?.name === 'Bottom Sheet';
      const shouldShowFullConfig = !selectedLayerObj || isBottomSheetSelected;

      // ALWAYS show the mode toggle, even when child layers are selected
      const modeToggleSection = (
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border.default}` }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎨 Bottom Sheet Mode
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleConfigUpdate('mode', 'container')}
              style={{
                padding: '12px',
                border: `2px solid ${(config.mode || 'container') === 'container' ? colors.primary[500] : colors.border.default}`,
                borderRadius: '8px',
                background: (config.mode || 'container') === 'container' ? colors.primary[50] : 'white',
                color: (config.mode || 'container') === 'container' ? colors.primary[600] : colors.text.secondary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={18} />
              <div>Container Card</div>
              <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>
                White box + layers
              </div>
            </button>
            <button
              onClick={() => handleConfigUpdate('mode', 'image-only')}
              style={{
                padding: '12px',
                border: `2px solid ${config.mode === 'image-only' ? colors.primary[500] : colors.border.default}`,
                borderRadius: '8px',
                background: config.mode === 'image-only' ? colors.primary[50] : 'white',
                color: config.mode === 'image-only' ? colors.primary[600] : colors.text.secondary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center'
              }}
            >
              <ImageIcon size={18} />
              <div>Image Only</div>
              <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>
                Full-image background
              </div>
            </button>
          </div>
          {!shouldShowFullConfig && (
            <button
              onClick={() => selectLayer(bottomSheetId)}
              style={{
                width: '100%',
                padding: '8px 12px',
                marginTop: '8px',
                background: 'transparent',
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 500,
                color: colors.text.secondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Settings2 size={14} />
              More Bottom Sheet Settings
            </button>
          )}
        </div>
      );

      if (!shouldShowFullConfig && selectedLayerObj) {
        // If a child layer is selected, show just the mode toggle + link to full settings
        return modeToggleSection;
      }

      return (
        <>
          {/* Mode Toggle Section (always visible) */}
          {modeToggleSection}

          {/* Background Image Upload (Image-Only Mode) */}
          {config.mode === 'image-only' && (
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border.default}` }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🖼️ Background Image
              </h5>

              {/* Image Preview */}
              {config.backgroundImageUrl && (
                <div style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  border: `1px solid ${colors.border.default}`,
                  position: 'relative'
                }}>
                  <img
                    src={config.backgroundImageUrl}
                    alt="Background preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: config.backgroundSize || 'cover'
                    }}
                  />
                  <button
                    onClick={() => handleConfigUpdate('backgroundImageUrl', '')}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}

              {/* URL Input */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: colors.text.secondary, display: 'block', marginBottom: '6px' }}>
                  Image URL
                </label>
                <input
                  type="text"
                  value={config.backgroundImageUrl || ''}
                  onChange={(e) => handleConfigUpdate('backgroundImageUrl', e.target.value)}
                  placeholder="https://example.com/image.png"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </div>

              {/* Upload Button */}
              <div style={{ marginBottom: '12px' }}>
                <label
                  htmlFor="bg-image-upload"
                  style={{
                    display: 'block',
                    padding: '10px',
                    background: colors.primary[500],
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📤 Upload Image
                </label>
                <input
                  id="bg-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Image must be under 5MB');
                      return;
                    }

                    // Convert to base64
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      handleConfigUpdate('backgroundImageUrl', base64);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              {/* Background Size */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: colors.text.secondary, display: 'block', marginBottom: '6px' }}>
                  Background Size
                </label>
                <select
                  value={config.backgroundSize || 'cover'}
                  onChange={(e) => handleConfigUpdate('backgroundSize', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  <option value="cover">Cover (fill area)</option>
                  <option value="contain">Contain (fit inside)</option>
                  <option value="fill">Fill (stretch)</option>
                </select>
              </div>

              {/* Background Position */}
              <div>
                <label style={{ fontSize: '12px', color: colors.text.secondary, display: 'block', marginBottom: '6px' }}>
                  Background Position
                </label>
                <select
                  value={config.backgroundPosition || 'center center'}
                  onChange={(e) => handleConfigUpdate('backgroundPosition', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  <option value="center center">Center Center</option>
                  <option value="top center">Top Center</option>
                  <option value="bottom center">Bottom Center</option>
                  <option value="center left">Center Left</option>
                  <option value="center right">Center Right</option>
                  <option value="top left">Top Left</option>
                  <option value="top right">Top Right</option>
                  <option value="bottom left">Bottom Left</option>
                  <option value="bottom right">Bottom Right</option>
                </select>
              </div>
            </div>
          )}

          {/* Height Presets */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border.default}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              📏 Bottom Sheet Height
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              {['auto', 'half', 'full'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleConfigUpdate('height', preset)}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${config.height === preset ? colors.primary[500] : colors.border.default}`,
                    borderRadius: '6px',
                    background: config.height === preset ? colors.primary[50] : 'white',
                    color: config.height === preset ? colors.primary[600] : colors.text.secondary,
                    fontSize: '12px',
                    fontWeight: config.height === preset ? 600 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Manual Height Control (Fix 3 + Fix 8: Responsive Units) */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', color: colors.text.secondary }}>
                  Custom Height: {typeof config.height === 'number' ? config.height : typeof config.height === 'string' && config.height.includes('%') ? config.height : typeof config.height === 'string' && config.height.includes('vh') ? config.height : 'Auto'}
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['px', 'vh', '%'].map(unit => (
                    <button
                      key={unit}
                      onClick={() => {
                        if (unit === 'px') handleConfigUpdate('height', 400);
                        else if (unit === 'vh') handleConfigUpdate('height', '50vh');
                        else handleConfigUpdate('height', '50%');
                      }}
                      style={{
                        padding: '4px 8px',
                        border: `1px solid ${(unit === 'px' && typeof config.height === 'number') ||
                          (unit === 'vh' && typeof config.height === 'string' && config.height.includes('vh')) ||
                          (unit === '%' && typeof config.height === 'string' && config.height.includes('%') && !config.height.includes('vh'))
                          ? colors.primary[500]
                          : colors.border.default
                          }`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        background: (unit === 'px' && typeof config.height === 'number') ||
                          (unit === 'vh' && typeof config.height === 'string' && config.height.includes('vh')) ||
                          (unit === '%' && typeof config.height === 'string' && config.height.includes('%') && !config.height.includes('vh'))
                          ? colors.primary[50]
                          : 'white',
                        color: (unit === 'px' && typeof config.height === 'number') ||
                          (unit === 'vh' && typeof config.height === 'string' && config.height.includes('vh')) ||
                          (unit === '%' && typeof config.height === 'string' && config.height.includes('%') && !config.height.includes('vh'))
                          ? colors.primary[700]
                          : colors.text.secondary
                      }}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              {typeof config.height === 'number' && (
                <>
                  <input
                    type="range"
                    min="100"
                    max="640"
                    step="10"
                    value={config.height}
                    onChange={(e) => handleConfigUpdate('height', validateDimension(Number(e.target.value), { min: 100, max: 640 }))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </>
              )}
              {typeof config.height === 'string' && config.height.includes('vh') && (
                <>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={parseInt(config.height)}
                    onChange={(e) => handleConfigUpdate('height', `${validatePercentage(Number(e.target.value))}vh`)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </>
              )}
              {typeof config.height === 'string' && config.height.includes('%') && !config.height.includes('vh') && (
                <>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={parseInt(config.height)}
                    onChange={(e) => handleConfigUpdate('height', `${e.target.value}%`)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </>
              )}
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {[200, 300, 400, 500].map(height => (
                  <button
                    key={height}
                    onClick={() => handleConfigUpdate('height', height)}
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: '4px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      backgroundColor: config.height === height ? colors.gray[100] : 'transparent'
                    }}
                  >
                    {height}px
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>Drag Handle</span>
              <div
                onClick={() => handleConfigUpdate('dragHandle', !config.dragHandle)}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: config.dragHandle ? colors.primary[500] : colors.gray[300],
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.dragHandle ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>Swipe to Dismiss</span>
              <div
                onClick={() => handleConfigUpdate('swipeToDismiss', !config.swipeToDismiss)}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: config.swipeToDismiss ? colors.primary[500] : colors.gray[300],
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.swipeToDismiss ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
            </div>
          </div>

          {/* Border Radius Controls for Bottom Sheet */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border.default}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔲 Border Radius
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Top Left</label>
                <input
                  type="number"
                  value={config.borderRadius?.topLeft || 16}
                  onChange={(e) => handleNestedConfigUpdate('borderRadius', 'topLeft', validateDimension(Number(e.target.value), { min: 0, max: 50 }))}
                  style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Top Right</label>
                <input
                  type="number"
                  value={config.borderRadius?.topRight || 16}
                  onChange={(e) => handleNestedConfigUpdate('borderRadius', 'topRight', validateDimension(Number(e.target.value), { min: 0, max: 50 }))}
                  style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { label: 'Square', value: 0 },
                { label: 'Small', value: 8 },
                { label: 'Medium', value: 16 },
                { label: 'Large', value: 24 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    handleNestedConfigUpdate('borderRadius', 'topLeft', preset.value);
                    handleNestedConfigUpdate('borderRadius', 'topRight', preset.value);
                  }}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    backgroundColor: 'white'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Elevation/Shadow Control */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border.default}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⬆️ Elevation
            </h5>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>
                Shadow Depth: Level {config.elevation !== undefined ? config.elevation : 2}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={config.elevation !== undefined ? config.elevation : 2}
                onChange={(e) => handleConfigUpdate('elevation', validateNumericInput(parseInt(e.target.value), { min: 0, max: 5, defaultValue: 0 }))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleConfigUpdate('elevation', level)}
                  style={{
                    padding: '8px 4px',
                    border: `1px solid ${(config.elevation !== undefined ? config.elevation : 2) === level ? colors.primary[500] : colors.border.default}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    backgroundColor: (config.elevation !== undefined ? config.elevation : 2) === level ? colors.primary[50] : 'white',
                    color: (config.elevation !== undefined ? config.elevation : 2) === level ? colors.primary[600] : colors.text.secondary,
                    fontWeight: 500
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Controls */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border.default}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✨ Animation
            </h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Animation Type</label>
              <select
                value={config.animation.type}
                onChange={(e) => handleNestedConfigUpdate('animation', 'type', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="slide">Slide Up</option>
                <option value="fade">Fade In</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Duration (ms)</label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={config.animation.duration}
                onChange={(e) => handleNestedConfigUpdate('animation', 'duration', validateDimension(parseInt(e.target.value), { min: 100, max: 2000 }))}
                style={{ width: '100%', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{config.animation.duration}ms</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Easing</label>
              <select
                value={config.animation.easing}
                onChange={(e) => handleNestedConfigUpdate('animation', 'easing', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="ease-out">Ease Out</option>
                <option value="ease-in">Ease In</option>
                <option value="ease-in-out">Ease In Out</option>
                <option value="linear">Linear</option>
                <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Bounce</option>
              </select>
            </div>
          </div>

          {/* Overlay Settings */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border.default}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎭 Overlay
            </h5>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>Show Overlay</span>
              <div
                onClick={() => handleNestedConfigUpdate('overlay', 'enabled', !config.overlay.enabled)}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: config.overlay.enabled ? colors.primary[500] : colors.gray[300],
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.overlay.enabled ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
            </div>
            {config.overlay.enabled && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.overlay.opacity}
                    onChange={(e) => handleNestedConfigUpdate('overlay', 'opacity', validateOpacity(parseFloat(e.target.value)))}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{Math.round(config.overlay.opacity * 100)}%</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Blur (px)</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="2"
                    value={config.overlay.blur}
                    onChange={(e) => handleNestedConfigUpdate('overlay', 'blur', parseInt(e.target.value))}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{config.overlay.blur}px</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={config.overlay.color}
                      onChange={(e) => handleNestedConfigUpdate('overlay', 'color', e.target.value)}
                      style={{ width: '40px', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={config.overlay.color}
                      onChange={(e) => handleNestedConfigUpdate('overlay', 'color', e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: colors.text.secondary }}>Dismiss on Click</span>
                  <div
                    onClick={() => handleNestedConfigUpdate('overlay', 'dismissOnClick', !config.overlay.dismissOnClick)}
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px',
                      background: config.overlay.dismissOnClick ? colors.primary[500] : colors.gray[300],
                      position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.overlay.dismissOnClick ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      );
    };

    // Common style properties
    const renderCommonStyles = () => {
      const bgColor = selectedLayerObj?.style?.backgroundColor || '#FFFFFF';
      const hasBorder = selectedLayerObj?.style?.borderWidth
        ? typeof selectedLayerObj.style.borderWidth === 'number'
          ? selectedLayerObj.style.borderWidth > 0
          : (selectedLayerObj.style.borderWidth.top > 0 ||
            selectedLayerObj.style.borderWidth.right > 0 ||
            selectedLayerObj.style.borderWidth.bottom > 0 ||
            selectedLayerObj.style.borderWidth.left > 0)
        : false;
      const positionType = selectedLayerObj?.position?.type || 'relative';
      const posX = selectedLayerObj?.position?.x || 0;
      const posY = selectedLayerObj?.position?.y || 0;

      return (
        <>
          {/* Position Controls (Fix 6) */}
          <div style={{ borderTop: `1px solid ${colors.border.default}`, paddingTop: '16px', marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Position</h5>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => {
                    const currentPos = selectedLayerObj?.position || { type: 'relative', x: 0, y: 0 };
                    updateLayer(selectedLayerId!, { position: { ...currentPos, type: 'relative' } });
                  }}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${positionType === 'relative' ? colors.primary[500] : colors.border.default}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: positionType === 'relative' ? colors.primary[50] : 'white',
                    color: positionType === 'relative' ? colors.primary[700] : colors.text.secondary,
                    fontWeight: positionType === 'relative' ? 600 : 400
                  }}
                >
                  Relative
                </button>
                <button
                  onClick={() => {
                    const currentPos = selectedLayerObj?.position || { type: 'relative', x: 0, y: 0 };
                    updateLayer(selectedLayerId!, { position: { ...currentPos, type: 'absolute' } });
                  }}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${positionType === 'absolute' ? colors.primary[500] : colors.border.default}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: positionType === 'absolute' ? colors.primary[50] : 'white',
                    color: positionType === 'absolute' ? colors.primary[700] : colors.text.secondary,
                    fontWeight: positionType === 'absolute' ? 600 : 400
                  }}
                >
                  Absolute
                </button>
              </div>
            </div>
            {positionType === 'absolute' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>X Position (px)</label>
                  <input
                    type="number"
                    value={posX}
                    onChange={(e) => {
                      const currentPos = selectedLayerObj?.position || { type: 'absolute', x: 0, y: 0 };
                      updateLayer(selectedLayerId!, { position: { ...currentPos, x: Number(e.target.value) } });
                    }}
                    style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Y Position (px)</label>
                  <input
                    type="number"
                    value={posY}
                    onChange={(e) => {
                      const currentPos = selectedLayerObj?.position || { type: 'absolute', x: 0, y: 0 };
                      updateLayer(selectedLayerId!, { position: { ...currentPos, y: Number(e.target.value) } });
                    }}
                    style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${colors.border.default}`, paddingTop: '16px', marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Background</h5>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ width: '40px', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${colors.border.default}`, paddingTop: '16px', marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Border</h5>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: colors.text.primary }}>Add Border</span>
              <div
                onClick={() => handleStyleUpdate('borderWidth', hasBorder ? 0 : 1)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: hasBorder ? colors.primary[500] : colors.gray[300],
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '2px',
                  left: hasBorder ? '22px' : '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s'
                }} />
              </div>
            </div>
            {hasBorder && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                    Border Width: {typeof selectedLayerObj?.style?.borderWidth === 'number' ? selectedLayerObj.style.borderWidth : 1}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={typeof selectedLayerObj?.style?.borderWidth === 'number' ? selectedLayerObj.style.borderWidth : 1}
                    onChange={(e) => handleStyleUpdate('borderWidth', Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Border Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={selectedLayerObj?.style?.borderColor || '#000000'}
                      onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                      style={{ width: '40px', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={selectedLayerObj?.style?.borderColor || '#000000'}
                      onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Border Style</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {['solid', 'dashed', 'dotted'].map((style) => (
                      <button
                        key={style}
                        onClick={() => handleStyleUpdate('borderStyle', style)}
                        style={{
                          padding: '8px',
                          border: `1px solid ${(selectedLayerObj?.style?.borderStyle || 'solid') === style ? colors.primary[500] : colors.border.default}`,
                          borderRadius: '6px',
                          background: (selectedLayerObj?.style?.borderStyle || 'solid') === style ? colors.primary[50] : 'white',
                          color: (selectedLayerObj?.style?.borderStyle || 'solid') === style ? colors.primary[600] : colors.text.secondary,
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Filter Controls (Feature 5) */}
          <div style={{ borderTop: `1px solid ${colors.border.default}`, paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Filters</h5>
              {(selectedLayerObj?.style?.filter?.blur || selectedLayerObj?.style?.filter?.brightness || selectedLayerObj?.style?.filter?.contrast || selectedLayerObj?.style?.filter?.grayscale) && (
                <button
                  onClick={() => handleStyleUpdate('filter', {})}
                  style={{
                    padding: '4px 8px',
                    border: `1px solid ${colors.border.default}`,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: colors.text.secondary
                  }}
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Blur */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Blur: {selectedLayerObj?.style?.filter?.blur || 0}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={selectedLayerObj?.style?.filter?.blur || 0}
                onChange={(e) => {
                  const currentFilter = selectedLayerObj?.style?.filter || {};
                  handleStyleUpdate('filter', { ...currentFilter, blur: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Brightness */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Brightness: {selectedLayerObj?.style?.filter?.brightness || 100}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={selectedLayerObj?.style?.filter?.brightness || 100}
                onChange={(e) => {
                  const currentFilter = selectedLayerObj?.style?.filter || {};
                  handleStyleUpdate('filter', { ...currentFilter, brightness: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Contrast */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Contrast: {selectedLayerObj?.style?.filter?.contrast || 100}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={selectedLayerObj?.style?.filter?.contrast || 100}
                onChange={(e) => {
                  const currentFilter = selectedLayerObj?.style?.filter || {};
                  handleStyleUpdate('filter', { ...currentFilter, contrast: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Grayscale */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Grayscale: {selectedLayerObj?.style?.filter?.grayscale || 0}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedLayerObj?.style?.filter?.grayscale || 0}
                onChange={(e) => {
                  const currentFilter = selectedLayerObj?.style?.filter || {};
                  handleStyleUpdate('filter', { ...currentFilter, grayscale: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Transform Controls (Feature 6) */}
          <div style={{ borderTop: `1px solid ${colors.border.default}`, paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Transform</h5>
              {(selectedLayerObj?.style?.transform?.rotate || selectedLayerObj?.style?.transform?.scale || selectedLayerObj?.style?.transform?.translateX || selectedLayerObj?.style?.transform?.translateY) && (
                <button
                  onClick={() => handleStyleUpdate('transform', {})}
                  style={{
                    padding: '4px 8px',
                    border: `1px solid ${colors.border.default}`,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: colors.text.secondary
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Rotation */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Rotate: {selectedLayerObj?.style?.transform?.rotate || 0}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={selectedLayerObj?.style?.transform?.rotate || 0}
                onChange={(e) => {
                  const currentTransform = selectedLayerObj?.style?.transform || {};
                  handleStyleUpdate('transform', { ...currentTransform, rotate: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {[-90, -45, 0, 45, 90, 180].map(angle => (
                  <button
                    key={angle}
                    onClick={() => {
                      const currentTransform = selectedLayerObj?.style?.transform || {};
                      handleStyleUpdate('transform', { ...currentTransform, rotate: angle });
                    }}
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: '4px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      backgroundColor: (selectedLayerObj?.style?.transform?.rotate || 0) === angle ? colors.gray[100] : 'transparent'
                    }}
                  >
                    {angle}°
                  </button>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Scale: {selectedLayerObj?.style?.transform?.scale || 1}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedLayerObj?.style?.transform?.scale || 1}
                onChange={(e) => {
                  const currentTransform = selectedLayerObj?.style?.transform || {};
                  handleStyleUpdate('transform', { ...currentTransform, scale: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Translate X */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Translate X: {selectedLayerObj?.style?.transform?.translateX || 0}px
              </label>
              <input
                type="range"
                min="-200"
                max="200"
                step="5"
                value={selectedLayerObj?.style?.transform?.translateX || 0}
                onChange={(e) => {
                  const currentTransform = selectedLayerObj?.style?.transform || {};
                  handleStyleUpdate('transform', { ...currentTransform, translateX: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Translate Y */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Translate Y: {selectedLayerObj?.style?.transform?.translateY || 0}px
              </label>
              <input
                type="range"
                min="-200"
                max="200"
                step="5"
                value={selectedLayerObj?.style?.transform?.translateY || 0}
                onChange={(e) => {
                  const currentTransform = selectedLayerObj?.style?.transform || {};
                  handleStyleUpdate('transform', { ...currentTransform, translateY: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Advanced Shadow Builder (Feature 7) */}
          <div style={{ borderTop: `1px solid ${colors.border.default}`, paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Box Shadow</h5>
              {selectedLayerObj?.style?.boxShadow && (
                <button
                  onClick={() => handleStyleUpdate('boxShadow', undefined)}
                  style={{
                    padding: '4px 8px',
                    border: `1px solid ${colors.border.default}`,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: colors.text.secondary
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Shadow Presets */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Quick Presets</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { name: 'Soft', value: '0 2px 8px rgba(0,0,0,0.1)' },
                  { name: 'Medium', value: '0 4px 12px rgba(0,0,0,0.15)' },
                  { name: 'Hard', value: '0 8px 24px rgba(0,0,0,0.25)' },
                  { name: 'Glow', value: '0 0 20px rgba(99, 102, 241, 0.5)' },
                  { name: 'Inner', value: 'inset 0 2px 4px rgba(0,0,0,0.1)' },
                  { name: 'Lifted', value: '0 10px 40px rgba(0,0,0,0.2)' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleStyleUpdate('boxShadow', preset.value)}
                    style={{
                      padding: '8px 12px',
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: selectedLayerObj?.style?.boxShadow === preset.value ? colors.primary[50] : 'white',
                      color: selectedLayerObj?.style?.boxShadow === preset.value ? colors.primary[600] : colors.text.primary,
                      boxShadow: preset.value,
                      transition: 'all 0.2s'
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Shadow Builder */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Custom Shadow</label>
              <div style={{
                padding: '12px',
                border: `1px solid ${colors.border.default}`,
                borderRadius: '8px',
                backgroundColor: colors.gray[50]
              }}>
                {/* X Offset */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                    X Offset: 0px
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    defaultValue="0"
                    onChange={(e) => {
                      const xOffset = Number(e.target.value);
                      handleStyleUpdate('boxShadow', `${xOffset}px 4px 12px rgba(0,0,0,0.15)`);
                    }}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Y Offset */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                    Y Offset: 4px
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    defaultValue="4"
                    onChange={(e) => {
                      const yOffset = Number(e.target.value);
                      handleStyleUpdate('boxShadow', `0px ${yOffset}px 12px rgba(0,0,0,0.15)`);
                    }}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Blur Radius */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                    Blur: 12px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    defaultValue="12"
                    onChange={(e) => {
                      const blur = Number(e.target.value);
                      handleStyleUpdate('boxShadow', `0px 4px ${blur}px rgba(0,0,0,0.15)`);
                    }}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Shadow Color */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                    Shadow Color
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="color"
                      defaultValue="#000000"
                      onChange={(e) => {
                        const color = e.target.value;
                        handleStyleUpdate('boxShadow', `0px 4px 12px ${color}26`);
                      }}
                      style={{ width: '36px', height: '32px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      placeholder="rgba(0,0,0,0.15)"
                      defaultValue="rgba(0,0,0,0.15)"
                      onChange={(e) => {
                        handleStyleUpdate('boxShadow', `0px 4px 12px ${e.target.value}`);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '6px' }}>Preview</label>
                  <div style={{
                    width: '100%',
                    height: '60px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: selectedLayerObj?.style?.boxShadow || '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: colors.text.secondary
                  }}>
                    Shadow Preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    };

    // Media/Image properties
    if (selectedLayerObj.type === 'media' || selectedLayerObj.type === 'video' || selectedLayerObj.type === 'icon' || selectedLayerObj.type === 'overlay') {
      const imageUrl = selectedLayerObj?.content?.imageUrl || selectedLayerObj?.content?.videoUrl || '';
      const width = selectedLayerObj?.size?.width || 720;
      const height = selectedLayerObj?.size?.height || 640;
      const hasUrl = !!imageUrl;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Media Properties</h5>
            <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', border: `1px solid ${colors.border.default}`, backgroundColor: colors.gray[100] }}>
              {imageUrl ? (
                <img src={imageUrl} alt="Media preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text.secondary, fontSize: '13px' }}>
                  Upload Image
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: colors.text.primary }}>Add URL</span>
              <div
                onClick={() => {
                  // Toggle URL input visibility (for now just toggle state)
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: hasUrl ? colors.primary[500] : colors.gray[300],
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '2px',
                  left: hasUrl ? '22px' : '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => handleContentUpdate(selectedLayerObj.type === 'video' ? 'videoUrl' : 'imageUrl', e.target.value)}
                placeholder="https://example.com/image.png"
                style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
              <label style={{
                padding: '8px 16px',
                background: colors.primary[500],
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap'
              }}>
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'layer')}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleContentUpdate('imageSize', { width: Number(e.target.value), height })}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <Lock size={16} color={colors.gray[400]} style={{ marginTop: '20px' }} />
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleContentUpdate('imageSize', { width, height: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Text properties
    if (selectedLayerObj.type === 'text') {
      const textContent = selectedLayerObj?.content?.text || '';
      const fontSize = selectedLayerObj?.content?.fontSize || 16;
      const fontWeight = selectedLayerObj?.content?.fontWeight || 'semibold';
      const textColor = selectedLayerObj?.content?.textColor || '#111827';
      const textAlign = selectedLayerObj?.content?.textAlign || 'center';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Text Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Content</label>
              <textarea
                placeholder="Enter text content..."
                value={textContent}
                onChange={(e) => handleContentUpdate('text', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Weight</label>
                <select
                  value={fontWeight}
                  onChange={(e) => handleContentUpdate('fontWeight', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Align</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => handleContentUpdate('textAlign', align)}
                    style={{
                      padding: '8px',
                      border: `1px solid ${align === textAlign ? colors.primary[500] : colors.border.default}`,
                      borderRadius: '6px',
                      background: align === textAlign ? colors.primary[50] : 'transparent',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: align === textAlign ? colors.primary[500] : colors.text.secondary
                    }}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Button/CTA properties
    if (selectedLayerObj.type === 'button') {
      const buttonText = selectedLayerObj?.content?.label || 'Got it';
      const buttonStyle = selectedLayerObj?.content?.buttonStyle || 'primary';
      const buttonColor = selectedLayerObj?.style?.backgroundColor || '#6366F1';
      const buttonTextColor = selectedLayerObj?.content?.textColor || '#FFFFFF';
      const buttonBorderRadius = typeof selectedLayerObj?.style?.borderRadius === 'number'
        ? selectedLayerObj.style.borderRadius
        : 8;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Button Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => handleContentUpdate('label', e.target.value)}
                placeholder="Enter button text"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Button Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['primary', 'secondary'].map(style => (
                  <button
                    key={style}
                    onClick={() => handleContentUpdate('buttonStyle', style)}
                    style={{
                      padding: '8px',
                      border: `1px solid ${style === buttonStyle ? colors.primary[500] : colors.border.default}`,
                      borderRadius: '6px',
                      background: style === buttonStyle ? colors.primary[50] : 'transparent',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: style === buttonStyle ? colors.primary[500] : colors.text.secondary
                    }}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Button Color</label>
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                  style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
                <input
                  type="color"
                  value={buttonTextColor}
                  onChange={(e) => handleContentUpdate('color', e.target.value)}
                  style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                <span>Border Radius</span>
                <span style={{ fontWeight: 600, color: colors.text.primary }}>{buttonBorderRadius}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={buttonBorderRadius}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setBorderRadiusValue(value);
                  handleStyleUpdate('borderRadius', value);
                }}
                style={{ width: '100%', accentColor: colors.primary[500] }}
              />
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Progress Bar properties (Phase 2)
    if (selectedLayerObj.type === 'progress-bar') {
      const value = selectedLayerObj.content?.value || 0;
      const max = selectedLayerObj.content?.max || 100;
      const showPercentage = selectedLayerObj.content?.showPercentage || false;
      const barColor = selectedLayerObj.style?.backgroundColor || '#22C55E';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Progress Bar Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Current Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleContentUpdate('value', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Max Value</label>
              <input
                type="number"
                value={max}
                onChange={(e) => handleContentUpdate('max', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Bar Color</label>
              <input
                type="color"
                value={barColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('showPercentage', !showPercentage)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: showPercentage ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: showPercentage ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Show Percentage</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Progress Circle properties (Phase 2)
    if (selectedLayerObj.type === 'progress-circle') {
      const value = selectedLayerObj.content?.value || 0;
      const max = selectedLayerObj.content?.max || 100;
      const showPercentage = selectedLayerObj.content?.showPercentage !== false;
      const circleColor = selectedLayerObj.style?.backgroundColor || '#6366F1';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Progress Circle Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Current Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleContentUpdate('value', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Max Value</label>
              <input
                type="number"
                value={max}
                onChange={(e) => handleContentUpdate('max', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Circle Color</label>
              <input
                type="color"
                value={circleColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('showPercentage', !showPercentage)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: showPercentage ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: showPercentage ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Show Percentage</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Countdown Timer properties (Phase 2)
    if (selectedLayerObj.type === 'countdown') {
      const endTime = selectedLayerObj.content?.endTime || new Date(Date.now() + 3600000).toISOString();
      const format = selectedLayerObj.content?.format || 'HH:MM:SS';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Countdown Timer Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>End Time</label>
              <input
                type="datetime-local"
                value={new Date(endTime).toISOString().slice(0, 16)}
                onChange={(e) => handleContentUpdate('endTime', new Date(e.target.value).toISOString())}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Format</label>
              <select
                value={format}
                onChange={(e) => handleContentUpdate('format', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'white' }}
              >
                <option value="HH:MM:SS">HH:MM:SS</option>
                <option value="MM:SS">MM:SS</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Background Color</label>
              <input
                type="color"
                value={selectedLayerObj.style?.backgroundColor || '#FEE2E2'}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // List properties (Phase 2)
    if (selectedLayerObj.type === 'list') {
      const items = selectedLayerObj.content?.items || [];
      const listStyle = selectedLayerObj.content?.listStyle || 'bullet';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>List Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>List Style</label>
              <select
                value={listStyle}
                onChange={(e) => handleContentUpdate('listStyle', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'white' }}
              >
                <option value="bullet">Bullet</option>
                <option value="numbered">Numbered</option>
                <option value="checkmark">Checkmark</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>List Items</label>
              {items.map((item: string, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index] = e.target.value;
                      handleContentUpdate('items', newItems);
                    }}
                    style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                    placeholder={`Item ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newItems = items.filter((_: any, i: number) => i !== index);
                      handleContentUpdate('items', newItems);
                    }}
                    style={{ padding: '8px', border: 'none', background: colors.gray[100], borderRadius: '6px', cursor: 'pointer', color: colors.gray[600] }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleContentUpdate('items', [...items, ''])}
                style={{ width: '100%', padding: '8px 12px', border: `1px dashed ${colors.border.default}`, borderRadius: '6px', background: 'transparent', fontSize: '13px', color: colors.text.secondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Input properties (Phase 2)
    if (selectedLayerObj.type === 'input') {
      const inputType = selectedLayerObj.content?.inputType || 'text';
      const placeholder = selectedLayerObj.content?.placeholder || '';
      const required = selectedLayerObj.content?.required || false;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Input Field Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Input Type</label>
              <select
                value={inputType}
                onChange={(e) => handleContentUpdate('inputType', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'white' }}
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Placeholder</label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => handleContentUpdate('placeholder', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('required', !required)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: required ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: required ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Required Field</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Checkbox properties
    if (selectedLayerObj.type === 'checkbox') {
      const checkboxLabel = selectedLayerObj.content?.checkboxLabel || 'I agree to terms';
      const checked = selectedLayerObj.content?.checked || false;
      const checkboxColor = selectedLayerObj.content?.checkboxColor || '#6366F1';
      const fontSize = selectedLayerObj.content?.fontSize || 14;
      const textColor = selectedLayerObj.content?.textColor || '#374151';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Checkbox Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Label Text</label>
              <input
                type="text"
                value={checkboxLabel}
                onChange={(e) => handleContentUpdate('checkboxLabel', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('checked', !checked)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: checked ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: checked ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Checked by Default</span>
              </label>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Checkbox Color</label>
              <input
                type="color"
                value={checkboxColor}
                onChange={(e) => handleContentUpdate('checkboxColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                  style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Statistic properties (Phase 2)
    if (selectedLayerObj.type === 'statistic') {
      const value = selectedLayerObj.content?.value || 0;
      const prefix = selectedLayerObj.content?.prefix || '';
      const suffix = selectedLayerObj.content?.suffix || '';
      const animateOnLoad = selectedLayerObj.content?.animateOnLoad !== false;
      const fontSize = selectedLayerObj.content?.fontSize || 36;
      const textColor = selectedLayerObj.content?.textColor || '#111827';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Statistic Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleContentUpdate('value', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => handleContentUpdate('prefix', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  placeholder="₹"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => handleContentUpdate('suffix', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  placeholder="saved"
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('animateOnLoad', !animateOnLoad)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: animateOnLoad ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: animateOnLoad ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Animate on Load</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Rating properties (Phase 3.5)
    if (selectedLayerObj.type === 'rating') {
      const maxStars = selectedLayerObj.content?.maxStars || 5;
      const rating = selectedLayerObj.content?.rating || 0;
      const reviewCount = selectedLayerObj.content?.reviewCount || 0;
      const showReviewCount = selectedLayerObj.content?.showReviewCount !== false;
      const starColor = selectedLayerObj.style?.starColor || '#FFB800';
      const starSize = selectedLayerObj.style?.starSize || 20;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>⭐ Rating Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Rating Value (0-5)</label>
              <input
                type="number"
                min="0"
                max={maxStars}
                step="0.5"
                value={rating}
                onChange={(e) => handleContentUpdate('rating', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Max Stars</label>
              <input
                type="number"
                min="3"
                max="10"
                value={maxStars}
                onChange={(e) => handleContentUpdate('maxStars', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Review Count</label>
              <input
                type="number"
                value={reviewCount}
                onChange={(e) => handleContentUpdate('reviewCount', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                placeholder="2847"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Star Color</label>
              <input
                type="color"
                value={starColor}
                onChange={(e) => handleStyleUpdate('starColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Star Size (px)</label>
              <input
                type="number"
                value={starSize}
                onChange={(e) => handleStyleUpdate('starSize', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('showReviewCount', !showReviewCount)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: showReviewCount ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: showReviewCount ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Show Review Count</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Badge properties (Phase 3.5)
    if (selectedLayerObj.type === 'badge') {
      const badgeText = selectedLayerObj.content?.badgeText || 'NEW';
      const badgeVariant = selectedLayerObj.content?.badgeVariant || 'custom';
      const pulse = selectedLayerObj.content?.pulse !== false;
      const badgeBackgroundColor = selectedLayerObj.style?.badgeBackgroundColor || '#EF4444';
      const badgeTextColor = selectedLayerObj.style?.badgeTextColor || '#FFFFFF';
      const badgeBorderRadius = selectedLayerObj.style?.badgeBorderRadius || 12;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>🏷️ Badge Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Badge Text</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => handleContentUpdate('badgeText', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                placeholder="30% OFF"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Variant</label>
              <select
                value={badgeVariant}
                onChange={(e) => handleContentUpdate('badgeVariant', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="success">Success (Green)</option>
                <option value="error">Error (Red)</option>
                <option value="warning">Warning (Orange)</option>
                <option value="info">Info (Blue)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {badgeVariant === 'custom' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Background Color</label>
                  <input
                    type="color"
                    value={badgeBackgroundColor}
                    onChange={(e) => handleStyleUpdate('badgeBackgroundColor', e.target.value)}
                    style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
                  <input
                    type="color"
                    value={badgeTextColor}
                    onChange={(e) => handleStyleUpdate('badgeTextColor', e.target.value)}
                    style={{ width: '100%', height: '40px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', cursor: 'pointer' }}
                  />
                </div>
              </>
            )}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Border Radius</label>
              <input
                type="number"
                value={badgeBorderRadius}
                onChange={(e) => handleStyleUpdate('badgeBorderRadius', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('pulse', !pulse)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: pulse ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: pulse ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Pulse Animation</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Gradient Overlay properties (Feature 4 - Gradient Builder UI)
    if (selectedLayerObj.type === 'gradient-overlay') {
      const gradientType = selectedLayerObj.content?.gradientType || 'linear';
      const gradientDirection = selectedLayerObj.content?.gradientDirection || 180;
      const gradientStops = selectedLayerObj.content?.gradientStops || [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ];

      const addGradientStop = () => {
        const newStops = [...gradientStops, { color: '#000000', position: 50 }].sort((a, b) => a.position - b.position);
        handleContentUpdate('gradientStops', newStops);
      };

      const removeGradientStop = (index: number) => {
        if (gradientStops.length > 2) { // Minimum 2 stops
          const newStops = gradientStops.filter((_, i) => i !== index);
          handleContentUpdate('gradientStops', newStops);
        }
      };

      const updateGradientStop = (index: number, field: 'color' | 'position', value: any) => {
        const newStops = [...gradientStops];
        newStops[index] = { ...newStops[index], [field]: value };
        if (field === 'position') {
          newStops.sort((a, b) => a.position - b.position);
        }
        handleContentUpdate('gradientStops', newStops);
      };

      // Generate gradient preview
      const gradientPreview = gradientType === 'linear'
        ? `linear-gradient(${typeof gradientDirection === 'number' ? gradientDirection + 'deg' : gradientDirection}, ${gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`
        : `radial-gradient(circle, ${gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>🌈 Gradient Properties</h5>

            {/* Gradient Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Gradient Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleContentUpdate('gradientType', 'linear')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: `1px solid ${gradientType === 'linear' ? colors.primary[500] : colors.border.default}`,
                    backgroundColor: gradientType === 'linear' ? colors.primary[50] : 'transparent',
                    color: gradientType === 'linear' ? colors.primary[600] : colors.text.primary,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Linear
                </button>
                <button
                  onClick={() => handleContentUpdate('gradientType', 'radial')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: `1px solid ${gradientType === 'radial' ? colors.primary[500] : colors.border.default}`,
                    backgroundColor: gradientType === 'radial' ? colors.primary[50] : 'transparent',
                    color: gradientType === 'radial' ? colors.primary[600] : colors.text.primary,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Radial
                </button>
              </div>
            </div>

            {/* Angle/Direction (for linear) */}
            {gradientType === 'linear' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>
                  Angle: {typeof gradientDirection === 'number' ? gradientDirection : 0}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={typeof gradientDirection === 'number' ? gradientDirection : 180}
                  onChange={(e) => handleContentUpdate('gradientDirection', Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {[0, 90, 180, 270].map(angle => (
                    <button
                      key={angle}
                      onClick={() => handleContentUpdate('gradientDirection', angle)}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        backgroundColor: gradientDirection === angle ? colors.gray[100] : 'transparent'
                      }}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Preview */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Preview</label>
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: '8px',
                background: gradientPreview,
                border: `1px solid ${colors.border.default}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }} />
            </div>

            {/* Color Stops */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: colors.text.secondary }}>Color Stops</label>
                <button
                  onClick={addGradientStop}
                  style={{
                    padding: '4px 12px',
                    border: `1px solid ${colors.primary[500]}`,
                    backgroundColor: colors.primary[50],
                    color: colors.primary[600],
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  + Add Stop
                </button>
              </div>

              {gradientStops.map((stop, index) => (
                <div key={index} style={{
                  marginBottom: '12px',
                  padding: '12px',
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: '6px',
                  backgroundColor: colors.gray[50]
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                      style={{ width: '40px', height: '32px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                    {gradientStops.length > 2 && (
                      <button
                        onClick={() => removeGradientStop(index)}
                        style={{
                          padding: '6px 10px',
                          border: `1px solid ${colors.border.default}`,
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: colors.text.secondary
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                      Position: {stop.position}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) => updateGradientStop(index, 'position', Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Preset Gradients */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Presets</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { name: 'Sunset', stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 100 }] },
                  { name: 'Ocean', stops: [{ color: '#1e3c72', position: 0 }, { color: '#2a5298', position: 100 }] },
                  { name: 'Purple', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
                  { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
                  { name: 'Ice', stops: [{ color: '#74ebd5', position: 0 }, { color: '#ACB6E5', position: 100 }] },
                  { name: 'Aurora', stops: [{ color: '#00c6ff', position: 0 }, { color: '#0072ff', position: 100 }] }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleContentUpdate('gradientStops', preset.stops)}
                    style={{
                      padding: '8px',
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '24px',
                      borderRadius: '4px',
                      background: `linear-gradient(90deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                    }} />
                    <span style={{ fontSize: '10px', color: colors.text.secondary }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    }

    // Container properties
    if (selectedLayerObj.type === 'container') {
      const containerPosition = (selectedLayerObj.content as any)?.containerPosition || 'bottom-center';

      // Size properties from layer.size
      const currentWidth = selectedLayerObj.size?.width || '100%';
      const currentHeight = selectedLayerObj.size?.height || 'auto';

      // Constraints from style (not content!)
      const maxWidth = selectedLayerObj.style?.maxWidth || null;
      const maxHeight = selectedLayerObj.style?.maxHeight || null;
      const minWidth = selectedLayerObj.style?.minWidth || null;
      const minHeight = selectedLayerObj.style?.minHeight || null;
      const padding = selectedLayerObj.style?.padding || { top: 16, right: 16, bottom: 16, left: 16 };
      const paddingObj = typeof padding === 'object' ? padding : { top: padding, right: padding, bottom: padding, left: padding };
      const paddingTop = paddingObj.top || 16;
      const paddingRight = paddingObj.right || 16;
      const paddingBottom = paddingObj.bottom || 16;
      const paddingLeft = paddingObj.left || 16;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Container Properties</h5>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Position</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: 'fit-content' }}>
                {['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                  <div
                    key={pos}
                    onClick={() => handleContentUpdate('containerPosition', pos)}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: `1px solid ${pos === containerPosition ? colors.primary[500] : colors.border.default}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: pos === containerPosition ? colors.primary[50] : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    {pos === containerPosition && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors.primary[500] }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Width */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Width</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={currentWidth === 'auto' || currentWidth === '100%' ? '' : (typeof currentWidth === 'string' ? parseInt(currentWidth) : currentWidth)}
                  onChange={(e) => {
                    const val = e.target.value;
                    const unit = currentWidth === 'auto' || currentWidth === '100%' ? 'px' : (currentWidth.toString().includes('%') ? '%' : currentWidth.toString().includes('vh') ? 'vh' : 'px');
                    const newValue = val ? `${val}${unit}` : 'auto';
                    updateLayer(selectedLayerObj.id, {
                      ...selectedLayerObj,
                      size: { ...selectedLayerObj.size, width: newValue }
                    });
                  }}
                  placeholder="auto"
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
                <select
                  value={currentWidth === 'auto' ? 'auto' : currentWidth === '100%' ? '%' : (currentWidth.toString().includes('%') ? '%' : currentWidth.toString().includes('vh') ? 'vh' : 'px')}
                  onChange={(e) => {
                    const unit = e.target.value;
                    if (unit === 'auto') {
                      updateLayer(selectedLayerObj.id, {
                        ...selectedLayerObj,
                        size: { ...selectedLayerObj.size, width: 'auto' }
                      });
                    } else if (unit === '%' && currentWidth !== 'auto' && currentWidth !== '100%') {
                      const numValue = typeof currentWidth === 'string' ? parseInt(currentWidth) : currentWidth;
                      updateLayer(selectedLayerObj.id, {
                        ...selectedLayerObj,
                        size: { ...selectedLayerObj.size, width: numValue ? `${numValue}%` : '100%' }
                      });
                    } else {
                      const numValue = typeof currentWidth === 'string' ? parseInt(currentWidth) : currentWidth;
                      updateLayer(selectedLayerObj.id, {
                        ...selectedLayerObj,
                        size: { ...selectedLayerObj.size, width: numValue ? `${numValue}${unit}` : 'auto' }
                      });
                    }
                  }}
                  style={{ padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none', backgroundColor: colors.background.card, cursor: 'pointer', minWidth: '70px' }}
                >
                  <option value="px">px</option>
                  <option value="%">%</option>
                  <option value="vh">vh</option>
                  <option value="auto">auto</option>
                </select>
              </div>
            </div>

            {/* Height */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Height</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={currentHeight === 'auto' ? '' : (typeof currentHeight === 'string' ? parseInt(currentHeight) : currentHeight)}
                  onChange={(e) => {
                    const val = e.target.value;
                    const unit = currentHeight === 'auto' ? 'px' : (currentHeight.toString().includes('%') ? '%' : currentHeight.toString().includes('vh') ? 'vh' : 'px');
                    const newValue = val ? `${val}${unit}` : 'auto';
                    updateLayer(selectedLayerObj.id, {
                      ...selectedLayerObj,
                      size: { ...selectedLayerObj.size, height: newValue }
                    });
                  }}
                  placeholder="auto"
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
                <select
                  value={currentHeight === 'auto' ? 'auto' : (currentHeight.toString().includes('%') ? '%' : currentHeight.toString().includes('vh') ? 'vh' : 'px')}
                  onChange={(e) => {
                    const unit = e.target.value;
                    if (unit === 'auto') {
                      updateLayer(selectedLayerObj.id, {
                        ...selectedLayerObj,
                        size: { ...selectedLayerObj.size, height: 'auto' }
                      });
                    } else {
                      const numValue = typeof currentHeight === 'string' ? parseInt(currentHeight) : currentHeight;
                      updateLayer(selectedLayerObj.id, {
                        ...selectedLayerObj,
                        size: { ...selectedLayerObj.size, height: numValue ? `${numValue}${unit}` : 'auto' }
                      });
                    }
                  }}
                  style={{ padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none', backgroundColor: colors.background.card, cursor: 'pointer', minWidth: '70px' }}
                >
                  <option value="px">px</option>
                  <option value="%">%</option>
                  <option value="vh">vh</option>
                  <option value="auto">auto</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Max Width (px)</label>
              <input
                type="number"
                value={maxWidth || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  handleStyleUpdate('maxWidth', val);
                }}
                placeholder="No limit"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Max Height (px)</label>
              <input
                type="number"
                value={maxHeight || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  handleStyleUpdate('maxHeight', val);
                }}
                placeholder="No limit"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* Min Width & Min Height */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Min Width (px)</label>
                <input
                  type="number"
                  value={minWidth || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    handleStyleUpdate('minWidth', val);
                  }}
                  placeholder="No minimum"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Min Height (px)</label>
                <input
                  type="number"
                  value={minHeight || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value);
                    handleStyleUpdate('minHeight', val);
                  }}
                  placeholder="No minimum"
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Opacity Control */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Opacity: {Math.round((selectedLayerObj.style?.opacity ?? 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedLayerObj.style?.opacity ?? 1}
                onChange={(e) => handleStyleUpdate('opacity', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Z-Index Control */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Z-Index (Layer Order)</label>
              <input
                type="number"
                value={selectedLayerObj.zIndex || 0}
                onChange={(e) => {
                  const newZIndex = Number(e.target.value);
                  updateLayer(selectedLayerObj.id, { ...selectedLayerObj, zIndex: newZIndex });
                }}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* Display Mode */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Display Mode</label>
              <select
                value={selectedLayerObj.style?.display || 'flex'}
                onChange={(e) => handleStyleUpdate('display', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="flex">Flex</option>
                <option value="block">Block</option>
                <option value="inline-block">Inline Block</option>
                <option value="grid">Grid</option>
              </select>
            </div>

            {/* Flexbox Controls (when display is flex) */}
            {selectedLayerObj.style?.display === 'flex' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Flex Direction</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['row', 'column'].map((dir) => (
                      <button
                        key={dir}
                        onClick={() => handleStyleUpdate('flexDirection', dir)}
                        style={{
                          padding: '8px',
                          border: `1px solid ${(selectedLayerObj.style?.flexDirection || 'column') === dir ? colors.primary[500] : colors.border.default}`,
                          borderRadius: '6px',
                          background: (selectedLayerObj.style?.flexDirection || 'column') === dir ? colors.primary[50] : 'white',
                          color: (selectedLayerObj.style?.flexDirection || 'column') === dir ? colors.primary[600] : colors.text.secondary,
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Align Items</label>
                  <select
                    value={selectedLayerObj.style?.alignItems || 'flex-start'}
                    onChange={(e) => handleStyleUpdate('alignItems', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Justify Content</label>
                  <select
                    value={selectedLayerObj.style?.justifyContent || 'flex-start'}
                    onChange={(e) => handleStyleUpdate('justifyContent', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="space-between">Space Between</option>
                    <option value="space-around">Space Around</option>
                    <option value="space-evenly">Space Evenly</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Gap (px)</label>
                  <input
                    type="number"
                    value={selectedLayerObj.style?.gap || 0}
                    onChange={(e) => handleStyleUpdate('gap', Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </>
            )}

            {/* Overflow Control */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Overflow</label>
              <select
                value={selectedLayerObj.style?.overflow || 'visible'}
                onChange={(e) => handleStyleUpdate('overflow', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="scroll">Scroll</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* Cursor Control */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Cursor Style</label>
              <select
                value={selectedLayerObj.style?.cursor || 'default'}
                onChange={(e) => handleStyleUpdate('cursor', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="default">Default</option>
                <option value="pointer">Pointer</option>
                <option value="not-allowed">Not Allowed</option>
                <option value="grab">Grab</option>
                <option value="text">Text</option>
                <option value="move">Move</option>
              </select>
            </div>

            {/* Background Image Controls (Fix 2) */}
            <div style={{ marginBottom: '16px', padding: '12px', background: colors.gray[50], borderRadius: '6px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.text.primary, marginBottom: '8px' }}>Background Image</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={selectedLayerObj.style?.backgroundImage?.replace(/^url\(['"]?|['"]?\)$/g, '') || ''}
                  onChange={(e) => handleStyleUpdate('backgroundImage', e.target.value ? `url('${e.target.value}')` : undefined)}
                  placeholder="Enter image URL"
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                />
                <label style={{
                  padding: '8px 16px',
                  background: colors.primary[500],
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'background')}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Size</label>
                  <select
                    value={(() => {
                      const size = selectedLayerObj.style?.backgroundSize;
                      if (!size || size === 'cover' || size === 'contain' || size === 'auto' || size === '100% 100%') return size || 'cover';
                      return 'custom';
                    })()}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        handleStyleUpdate('backgroundSize', '100% auto');
                      } else {
                        handleStyleUpdate('backgroundSize', e.target.value);
                      }
                    }}
                    style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto</option>
                    <option value="100% 100%">Stretch</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Repeat</label>
                  <select
                    value={selectedLayerObj.style?.backgroundRepeat || 'no-repeat'}
                    onChange={(e) => handleStyleUpdate('backgroundRepeat', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                    <option value="repeat-x">Repeat X</option>
                    <option value="repeat-y">Repeat Y</option>
                  </select>
                </div>
              </div>

              {/* Custom Size Controls */}
              {(() => {
                const size = selectedLayerObj.style?.backgroundSize;
                const isCustom = size && typeof size === 'string' && !['cover', 'contain', 'auto', '100% 100%'].includes(size);
                return isCustom ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Width (px or %)</label>
                      <input
                        type="text"
                        value={(() => {
                          if (typeof size === 'string') {
                            const parts = size.split(' ');
                            return parts[0] || '100%';
                          }
                          return '100%';
                        })()}
                        onChange={(e) => {
                          const parts = typeof size === 'string' ? size.split(' ') : ['100%', 'auto'];
                          const newValue = e.target.value.trim() || '100%';
                          handleStyleUpdate('backgroundSize', `${newValue} ${parts[1] || 'auto'}`);
                        }}
                        placeholder="100% or 200px"
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Height (px or %)</label>
                      <input
                        type="text"
                        value={(() => {
                          if (typeof size === 'string') {
                            const parts = size.split(' ');
                            return parts[1] || 'auto';
                          }
                          return 'auto';
                        })()}
                        onChange={(e) => {
                          const parts = typeof size === 'string' ? size.split(' ') : ['100%', 'auto'];
                          const newValue = e.target.value.trim() || 'auto';
                          handleStyleUpdate('backgroundSize', `${parts[0] || '100%'} ${newValue}`);
                        }}
                        placeholder="auto or 200px"
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                  </div>
                ) : null;
              })()}

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Position Presets</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  {['left top', 'center top', 'right top', 'left center', 'center center', 'right center', 'left bottom', 'center bottom', 'right bottom'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => handleStyleUpdate('backgroundPosition', pos)}
                      style={{
                        padding: '6px',
                        border: `1px solid ${selectedLayerObj.style?.backgroundPosition === pos ? colors.primary[500] : colors.border.default}`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        background: selectedLayerObj.style?.backgroundPosition === pos ? colors.primary[50] : 'white',
                        color: selectedLayerObj.style?.backgroundPosition === pos ? colors.primary[700] : colors.text.secondary
                      }}
                    >
                      {pos.split(' ').map(w => w[0].toUpperCase()).join('')}
                    </button>
                  ))}
                </div>
              </div>
            </div>





            {/* Advanced Styling Sections */}
            <div style={{ borderBottom: `1px solid ${colors.border.default}`, padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary, marginBottom: '12px' }}>
                Position & Layout
              </div>
              <PositionEditor
                style={selectedLayerObj.style}
                onChange={(updates) => {
                  Object.entries(updates).forEach(([key, value]) => {
                    handleStyleUpdate(key as any, value);
                  });
                }}
                colors={colors}
              />
            </div>

            <div style={{ borderBottom: `1px solid ${colors.border.default}`, padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary, marginBottom: '12px' }}>
                Shapes & Borders
              </div>
              <ShapeEditor
                style={selectedLayerObj.style}
                onChange={(updates) => {
                  Object.entries(updates).forEach(([key, value]) => {
                    handleStyleUpdate(key as any, value);
                  });
                }}
                colors={colors}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Padding</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <input
                  type="number"
                  value={paddingTop}
                  onChange={(e) => handleStyleUpdate('padding', { ...paddingObj, top: Number(e.target.value) })}
                  placeholder="Top"
                  style={{ padding: '8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                />
                <input
                  type="number"
                  value={paddingRight}
                  onChange={(e) => handleStyleUpdate('padding', { ...paddingObj, right: Number(e.target.value) })}
                  placeholder="Right"
                  style={{ padding: '8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                />
                <input
                  type="number"
                  value={paddingBottom}
                  onChange={(e) => handleStyleUpdate('padding', { ...paddingObj, bottom: Number(e.target.value) })}
                  placeholder="Bottom"
                  style={{ padding: '8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                />
                <input
                  type="number"
                  value={paddingLeft}
                  onChange={(e) => handleStyleUpdate('padding', { ...paddingObj, left: Number(e.target.value) })}
                  placeholder="Left"
                  style={{ padding: '8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                />
              </div>
            </div>

            {/* Margin Controls */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Margin</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <input
                  type="number"
                  value={(selectedLayerObj.style?.margin as any)?.top || 0}
                  onChange={(e) => {
                    const marginObj = typeof selectedLayerObj.style?.margin === 'object' ? selectedLayerObj.style.margin : { top: 0, right: 0, bottom: 0, left: 0 };
                    handleStyleUpdate('margin', { ...marginObj, top: Number(e.target.value) });
                  }}
                  placeholder="Top"
                  style={{ padding: '8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                />
                <input
                  type="number"
                  value={(selectedLayerObj.style?.margin as any)?.right || 0}
                  onChange={(e) => {
                    const marginObj = typeof selectedLayerObj.style?.margin === 'object' ? selectedLayerObj.style.margin : { top: 0, right: 0, bottom: 0, left: 0 };
                    handleStyleUpdate('margin', { ...marginObj, right: Number(e.target.value) });
                  }}
                  placeholder="Right"
                  style={{ padding: '8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                />
                <input
                  type="number"
                  value={(selectedLayerObj.style?.margin as any)?.bottom || 0}
                  onChange={(e) => {
                    const marginObj = typeof selectedLayerObj.style?.margin === 'object' ? selectedLayerObj.style.margin : { top: 0, right: 0, bottom: 0, left: 0 };
                    handleStyleUpdate('margin', { ...marginObj, bottom: Number(e.target.value) });
                  }}
                  placeholder="Bottom"
                  style={{ padding: '8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                />
                <input
                  type="number"
                  value={(selectedLayerObj.style?.margin as any)?.left || 0}
                  onChange={(e) => {
                    const marginObj = typeof selectedLayerObj.style?.margin === 'object' ? selectedLayerObj.style.margin : { top: 0, right: 0, bottom: 0, left: 0 };
                    handleStyleUpdate('margin', { ...marginObj, left: Number(e.target.value) });
                  }}
                  placeholder="Left"
                  style={{ padding: '8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                />
              </div>
            </div>

            {/* Border Radius Individual Corners */}

          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Default properties
    return (
      <>
        {renderBottomSheetConfig()}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Layer Properties</h5>
          <p style={{ fontSize: '13px', color: colors.text.secondary }}>Select a layer to edit its properties</p>
        </div>
        {renderCommonStyles()}
      </>
    );

  };

  const handleExperienceSelect = (id: string) => {
    setSelectedExperience(id);
    setShowExperienceModal(false);
    toast.success(`${experienceTypes.find(e => e.id === id)?.label} selected`);
  };

  const handleNudgeTypeSelect = (id: string) => {
    setSelectedNudgeType(id);

    // Show template selection for bottom sheets
    if (id === 'bottomsheet') {
      setShowTemplateModal(true);
      return;
    }

    // Create new campaign with selected nudge type
    createCampaign(
      selectedExperience as any || 'nudges',
      id as any
    );

    setShowEditor(true);
    toast.info('Opening editor...');
  };

  // Handler for template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = BOTTOM_SHEET_TEMPLATES.find(t => t.id === templateId);

    if (!template) {
      toast.error('Template not found');
      return;
    }

    // Create campaign first
    createCampaign(
      selectedExperience as any || 'nudges',
      'bottomsheet' as any
    );

    // Load template layers after campaign is created
    setTimeout(() => {
      loadTemplate(template.layers);
      setShowTemplateModal(false);
      setShowEditor(true);
      toast.success(`Template "${template.name}" loaded successfully!`);
    }, 100);
  };

  // Handler for starting from scratch
  const handleStartFromScratch = () => {
    createCampaign(
      selectedExperience as any || 'nudges',
      'bottomsheet' as any
    );

    setShowTemplateModal(false);
    setShowEditor(true);
    toast.info('Starting with blank canvas...');
  };

  // Handler for saving campaign
  const handleSaveCampaign = async () => {
    if (!currentCampaign) {
      toast.error('No campaign to save');
      return;
    }

    // FIX #5: Validate before save
    if (!currentCampaign.name || currentCampaign.name.trim() === '') {
      toast.error('Please enter a campaign name');
      return;
    }

    if (!currentCampaign.layers || currentCampaign.layers.length === 0) {
      toast.error('Campaign must have at least one layer');
      return;
    }

    try {
      const oldId = currentCampaign.id;
      await saveCampaign();
      toast.success('Campaign saved successfully!');

      // FIX #2: Update URL parameter if campaign ID changed
      const { currentCampaign: updatedCampaign } = useEditorStore.getState();
      const newId = updatedCampaign?.id;
      if (newId && newId !== oldId) {
        navigate(`/campaign-builder?id=${newId}`, { replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign');
    }
  };

  // Handler for loading campaign (for testing)
  const handleLoadCampaign = async () => {
    const campaignId = prompt('Enter campaign ID to load:');
    if (!campaignId) return;

    try {
      const { loadCampaign } = useEditorStore.getState();
      await loadCampaign(campaignId);
      toast.success('Campaign loaded successfully!');
    } catch (error) {
      toast.error('Failed to load campaign');
      console.error('Load error:', error);
    }
  };

  // Handler for launching campaign
  const handleLaunchCampaign = async () => {
    if (!currentCampaign) {
      toast.error('No campaign to launch');
      return;
    }

    // FIX #5: Validate before launch
    if (!currentCampaign.name || currentCampaign.name.trim() === '') {
      toast.error('Please enter a campaign name before launching');
      return;
    }

    if (!currentCampaign.layers || currentCampaign.layers.length === 0) {
      toast.error('Campaign must have at least one layer');
      return;
    }

    try {
      // Update campaign status to active in the store
      updateStatus('active');

      // Save the campaign with active status
      await saveCampaign();

      toast.success('🚀 Campaign launched successfully!');

      // Navigate to campaigns page after short delay
      setTimeout(() => {
        navigate('/campaigns');
      }, 1500);
    } catch (error) {
      console.error('Launch campaign error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to launch campaign');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background.page, fontFamily: 'Inter, sans-serif' }}>

      {/* Experience Selection Modal (Screenshot 7) */}
      {showExperienceModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '1100px', width: '100%', padding: '40px', position: 'relative' }}>
            <button onClick={() => setShowExperienceModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: colors.gray[500] }}>
              <X size={24} />
            </button>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: 600, color: colors.text.primary }}>Choose an Experience</h2>
            <p style={{ margin: '0 0 32px 0', fontSize: '15px', color: colors.text.secondary }}>Select the type of experience you want to create</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {experienceTypes.map(({ id, label, Icon, gradient }) => (
                <div key={id} onClick={() => handleExperienceSelect(id)} style={{ cursor: 'pointer', padding: '32px 24px', border: `2px solid ${selectedExperience === id ? colors.primary[500] : colors.border.default}`, borderRadius: '12px', textAlign: 'center', transition: 'all 0.2s', backgroundColor: 'white' }} onMouseEnter={(e) => { if (selectedExperience !== id) e.currentTarget.style.borderColor = colors.gray[300]; }} onMouseLeave={(e) => { if (selectedExperience !== id) e.currentTarget.style.borderColor = colors.border.default; }}>
                  <div style={{ width: '100px', height: '100px', margin: '0 auto 20px', borderRadius: '16px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={40} color="white" strokeWidth={2} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: colors.text.primary }}>{label}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal - PHASE 1 */}
      {showTemplateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '1200px', width: '100%', padding: '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowTemplateModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: colors.gray[500], zIndex: 1 }}>
              <X size={24} />
            </button>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 600, color: colors.text.primary }}>Choose a Template</h2>
              <p style={{ margin: 0, fontSize: '15px', color: colors.text.secondary }}>Start with a professionally designed template or build from scratch</p>
            </div>

            {/* Start from Scratch Option */}
            <div
              onClick={handleStartFromScratch}
              style={{
                padding: '24px',
                border: `2px dashed ${colors.border.default}`,
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '32px',
                textAlign: 'center',
                transition: 'all 0.2s',
                backgroundColor: colors.gray[50]
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary[500]; e.currentTarget.style.backgroundColor = colors.primary[50]; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border.default; e.currentTarget.style.backgroundColor = colors.gray[50]; }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', backgroundColor: 'white', borderRadius: '12px', marginBottom: '12px' }}>
                <Plus size={28} color={colors.primary[500]} />
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: colors.text.primary }}>Start from Scratch</h3>
              <p style={{ margin: 0, fontSize: '13px', color: colors.text.secondary }}>Build your own custom bottom sheet</p>
            </div>

            {/* Featured Templates */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: colors.text.primary }}>
                ⭐ Featured Templates
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {getFeaturedTemplates().map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    style={{
                      cursor: 'pointer',
                      border: `2px solid ${colors.border.default}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary[500]; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border.default; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ height: '160px', backgroundColor: colors.gray[100], overflow: 'hidden' }}>
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          color: colors.primary[500],
                          backgroundColor: colors.primary[50],
                          padding: '3px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          {template.category}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
                        {template.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: colors.text.secondary, lineHeight: 1.4 }}>
                        {template.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Templates */}
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: colors.text.primary }}>
                All Templates
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {BOTTOM_SHEET_TEMPLATES.filter(t => !t.featured).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    style={{
                      cursor: 'pointer',
                      border: `2px solid ${colors.border.default}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary[500]; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border.default; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ height: '160px', backgroundColor: colors.gray[100], overflow: 'hidden' }}>
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          color: colors.primary[500],
                          backgroundColor: colors.primary[50],
                          padding: '3px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          {template.category}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>
                        {template.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: colors.text.secondary, lineHeight: 1.4 }}>
                        {template.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 32px', borderBottom: `1px solid ${colors.border.default}`, backgroundColor: colors.background.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/campaigns')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.gray[600], padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => updateCampaignName(e.target.value)}
            style={{ fontSize: '20px', fontWeight: 600, border: 'none', outline: 'none', padding: '4px 8px', borderRadius: '4px', color: colors.text.primary }}
            placeholder="Campaign name"
          />

          {/* Undo/Redo buttons */}
          {showEditor && (
            <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
              <button
                onClick={undo}
                disabled={!canUndo()}
                style={{
                  padding: '8px',
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: '6px',
                  background: 'white',
                  cursor: canUndo() ? 'pointer' : 'not-allowed',
                  opacity: canUndo() ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={16} color={colors.gray[600]} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                style={{
                  padding: '8px',
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: '6px',
                  background: 'white',
                  cursor: canRedo() ? 'pointer' : 'not-allowed',
                  opacity: canRedo() ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={16} color={colors.gray[600]} />
              </button>
            </div>
          )}

          {/* Auto-save indicator */}
          {currentCampaign?.isDirty && !isSaving && (
            <span style={{ fontSize: '12px', color: colors.text.secondary, fontStyle: 'italic' }}>
              Unsaved changes
            </span>
          )}
          {isSaving && (
            <span style={{ fontSize: '12px', color: colors.primary[500], fontStyle: 'italic' }}>
              Saving...
            </span>
          )}
          {currentCampaign?.lastSaved && !currentCampaign?.isDirty && !isSaving && (
            <span style={{ fontSize: '12px', color: colors.green[500] }}>
              ✓ Saved
            </span>
          )}
          {saveError && (
            <span style={{ fontSize: '12px', color: '#EF4444', fontStyle: 'italic' }}>
              ⚠ {saveError}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleLoadCampaign}
            style={{
              padding: '10px 20px',
              border: `1px solid ${colors.border.default}`,
              borderRadius: '8px',
              background: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.text.primary
            }}>
            📂 Load
          </button>
          <button
            onClick={handleSaveCampaign}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              border: `1px solid ${colors.border.default}`,
              borderRadius: '8px',
              background: isSaving ? colors.gray[100] : 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: isSaving ? colors.gray[400] : colors.text.primary,
              opacity: isSaving ? 0.6 : 1
            }}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleLaunchCampaign}
            style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', background: colors.primary[500], color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Rocket size={16} /> Launch Campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${colors.border.default}`, backgroundColor: colors.background.card, padding: '0 32px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          <button onClick={() => setActiveTab('design')} style={{ padding: '16px 0', border: 'none', background: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: activeTab === 'design' ? colors.primary[500] : colors.text.secondary, borderBottom: activeTab === 'design' ? `2px solid ${colors.primary[500]}` : '2px solid transparent', marginBottom: '-1px' }}>
            Design Nudge
          </button>
          <button onClick={() => setActiveTab('targeting')} style={{ padding: '16px 0', border: 'none', background: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: activeTab === 'targeting' ? colors.primary[500] : colors.text.secondary, borderBottom: activeTab === 'targeting' ? `2px solid ${colors.primary[500]}` : '2px solid transparent', marginBottom: '-1px' }}>
            Targeting
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Design Tab - Nudge Selection (Screenshot 8) */}
        {activeTab === 'design' && !selectedNudgeType && (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Palette size={20} /> Design Your Nudge
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: colors.text.secondary }}>Customize the appearance and content of your in-app nudge</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '1000px' }}>
                {nudgeTypes.map(({ id, label, Icon, bg, iconBg, iconColor }) => (
                  <div key={id} onClick={() => handleNudgeTypeSelect(id)} style={{ padding: '28px 24px', border: `2px solid ${selectedNudgeType === id ? colors.primary[500] : colors.border.default}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: bg, position: 'relative', transition: 'all 0.2s' }} onMouseEnter={(e) => { if (selectedNudgeType !== id) e.currentTarget.style.borderColor = colors.gray[300]; }} onMouseLeave={(e) => { if (selectedNudgeType !== id) e.currentTarget.style.borderColor = colors.border.default; }}>
                    {selectedNudgeType === id && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: colors.primary[500], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>✓</div>
                    )}
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      <Icon size={20} color={iconColor} strokeWidth={2} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>{label}</h4>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: '400px', padding: '32px', backgroundColor: colors.gray[50], borderLeft: `1px solid ${colors.border.default}`, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>Live Preview</h4>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '280px', height: '560px', backgroundColor: 'black', borderRadius: '32px', padding: '12px', position: 'relative', marginBottom: '20px' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ padding: '60px 20px 20px', textAlign: 'center', color: colors.text.secondary, fontSize: '13px' }}>
                      {selectedNudgeType ? `${nudgeTypes.find(n => n.id === selectedNudgeType)?.label} preview` : 'Select a nudge type to preview'}
                    </div>
                  </div>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedExperience && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: colors.green[500], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: colors.text.primary }}>
                        {experienceTypes.find(e => e.id === selectedExperience)?.label} selected
                      </span>
                    </div>
                  )}
                  {selectedNudgeType && (
                    <button
                      onClick={() => handleNudgeTypeSelect(selectedNudgeType)}
                      style={{
                        width: '100%',
                        padding: '14px 24px',
                        backgroundColor: colors.primary[500],
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary[600];
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary[500];
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
                      }}
                    >
                      <Rocket size={18} />
                      Create Campaign
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design Tab - Editor (Screenshot 9) */}
        {activeTab === 'design' && selectedNudgeType && (
          <div style={{ display: 'flex', height: '100%' }}>
            {/* Left Panel - Layers */}
            <div style={{ width: '280px', borderRight: `1px solid ${colors.border.default}`, backgroundColor: colors.background.card, display: 'flex', flexDirection: 'column' }}>
              {/* Determine root container ID based on nudge type */}
              {(() => {
                // Find the root container layer based on nudge type
                const getRootContainerId = () => {
                  const containerNames = {
                    'bottomsheet': 'Bottom Sheet',
                    'modal': 'Modal Container',
                    'banner': 'Banner Container',
                    'tooltip': 'Tooltip Container'
                  };

                  const containerName = containerNames[selectedNudgeType as keyof typeof containerNames];
                  const rootContainer = currentCampaign?.layers?.find(
                    (l: any) => l.type === 'container' && l.name === containerName
                  );

                  return rootContainer?.id || null;
                };

                const rootContainerId = getRootContainerId();

                return (
                  <>
                    <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border.default}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>Layers</h4>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setShowLayerMenu(!showLayerMenu)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary[500], display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Add new layer"
                        >
                          <Plus size={18} />
                        </button>

                        {/* Layer Type Dropdown Menu - Phase 2 */}
                        {showLayerMenu && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '4px',
                            backgroundColor: 'white',
                            border: `1px solid ${colors.border.default}`,
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 50,
                            minWidth: '200px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.border.default}`, backgroundColor: colors.gray[50] }}>
                              <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: colors.text.secondary, letterSpacing: '0.5px' }}>Add Layer</p>
                            </div>

                            {/* Basic Layers */}
                            <div style={{ padding: '4px' }}>
                              <button onClick={() => { addLayer('handle', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <Menu size={16} color={colors.gray[600]} />
                                Drag Handle
                              </button>
                              <button onClick={() => { addLayer('container', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <Layout size={16} color={colors.gray[600]} />
                                Container
                              </button>
                              <button onClick={() => { addLayer('media', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <ImageIcon size={16} color={colors.gray[600]} />
                                Image
                              </button>
                              <button onClick={() => { addLayer('text', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <Type size={16} color={colors.gray[600]} />
                                Text
                              </button>
                              <button onClick={() => { addLayer('button', bottomSheetId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <Square size={16} color={colors.gray[600]} />
                                Button
                              </button>
                            </div>

                            {/* Divider */}
                            <div style={{ height: '1px', backgroundColor: colors.border.default, margin: '4px 0' }} />

                            {/* Advanced Layers - Phase 2 */}
                            <div style={{ padding: '4px' }}>
                              <div style={{ padding: '4px 12px', marginBottom: '4px' }}>
                                <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: colors.text.secondary, letterSpacing: '0.5px' }}>Advanced</p>
                              </div>
                              <button onClick={() => { addLayer('progress-bar', bottomSheetId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</span>
                                Progress Bar
                              </button>
                              <button onClick={() => { addLayer('progress-circle', bottomSheetId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</span>
                                Progress Circle
                              </button>
                              <button onClick={() => { addLayer('countdown', bottomSheetId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏱️</span>
                                Countdown Timer
                              </button>
                              <button onClick={() => { addLayer('list', bottomSheetId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📝</span>
                                List
                              </button>
                              <button onClick={() => { addLayer('input'); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</span>
                                Input Field
                              </button>
                              <button onClick={() => { addLayer('statistic'); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💯</span>
                                Statistic
                              </button>
                              <button onClick={() => { addLayer('rating'); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⭐</span>
                                Rating Stars
                              </button>
                              <button onClick={() => { addLayer('badge'); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏷️</span>
                                Badge
                              </button>
                              <button onClick={() => { addLayer('gradient-overlay'); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌈</span>
                                Gradient Overlay
                              </button>
                              <button onClick={() => { addLayer('checkbox'); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☑️</span>
                                Checkbox
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                      {/* Hierarchical Layer Tree (Fix 2) - Only render top-level layers */}
                      {campaignLayers
                        .filter(layer => !layer.parent) // Only top-level layers
                        .map(layer => renderLayerTreeItem(layer, 0))}
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Center Panel - Canvas (Fix 4: Enlarged Preview) */}
            <div style={{ flex: 1, backgroundColor: colors.gray[100], display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'auto' }}>
              <div style={{ width: '375px', height: '812px', backgroundColor: 'black', borderRadius: '50px', padding: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
                {/* Notch */}
                <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '180px', height: '28px', backgroundColor: 'black', borderRadius: '0 0 20px 20px', zIndex: 10 }}></div>
                {/* Screen */}
                <div style={{ width: '100%', height: '100%', backgroundColor: 'white', borderRadius: '40px', overflow: 'hidden', position: 'relative' }}>
                  {renderCanvasPreview()}
                </div>
              </div>
              {selectedLayerObj && (
                <div style={{ position: 'absolute', bottom: '60px', right: '60px', padding: '6px 12px', backgroundColor: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: colors.text.secondary, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {selectedLayerObj.name}
                </div>
              )}
            </div>

            {/* Right Panel - Properties */}
            <div style={{ width: '320px', borderLeft: `1px solid ${colors.border.default}`, backgroundColor: colors.background.card, display: 'flex', flexDirection: 'column' }}>
              <div style={{ borderBottom: `1px solid ${colors.border.default}`, display: 'flex' }}>
                <button onClick={() => setPropertyTab('style')} style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', borderBottom: propertyTab === 'style' ? `2px solid ${colors.primary[500]}` : '2px solid transparent', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: propertyTab === 'style' ? colors.primary[500] : colors.text.secondary, transition: 'all 0.2s' }}>
                  Style
                </button>
                <button onClick={() => setPropertyTab('actions')} style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', borderBottom: propertyTab === 'actions' ? `2px solid ${colors.primary[500]}` : '2px solid transparent', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: propertyTab === 'actions' ? colors.primary[500] : colors.text.secondary, transition: 'all 0.2s' }}>
                  Actions
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {propertyTab === 'style' && renderLayerProperties()}
                {propertyTab === 'actions' && (
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Actions</h5>
                    <p style={{ fontSize: '13px', color: colors.text.secondary, marginBottom: '16px' }}>Configure what happens when users interact with this layer</p>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>On Click</label>
                      <select style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
                        <option>No action</option>
                        <option>Open URL</option>
                        <option>Close nudge</option>
                        <option>Navigate to screen</option>
                        <option>Custom event</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Deep Link URL</label>
                      <input type="text" placeholder="myapp://screen/details" style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" /> Track as conversion
                      </label>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked /> Auto-dismiss after action
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Targeting Tab (Screenshot 10) */}
        {activeTab === 'targeting' && (
          <div style={{ padding: '32px', maxWidth: '900px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 600, color: colors.text.primary }}>Targeting & Triggers</h3>
            <p style={{ margin: '0 0 32px 0', fontSize: '14px', color: colors.text.secondary }}>Configure when and where this campaign should appear</p>

            {/* Trigger Event Selection */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: colors.gray[50], borderRadius: '12px', border: `2px solid ${colors.primary[100]}` }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color={colors.primary[500]} />
                Trigger Event *
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: colors.text.secondary }}>
                Select the event that will trigger this campaign to appear
              </p>
              <select
                value={currentCampaign?.trigger || 'screen_viewed'}
                onChange={(e) => updateTrigger(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
              >
                <optgroup label="Lifecycle Events">
                  <option value="app_opened">app_opened - App launch</option>
                  <option value="screen_viewed">screen_viewed - Screen navigation</option>
                  <option value="session_start">session_start - Session begins</option>
                  <option value="app_backgrounded">app_backgrounded - App goes to background</option>
                </optgroup>
                <optgroup label="Ecommerce Events">
                  <option value="product_viewed">product_viewed - Product page view</option>
                  <option value="product_added">product_added - Add to cart</option>
                  <option value="cart_viewed">cart_viewed - Cart page view</option>
                  <option value="checkout_started">checkout_started - Checkout begins</option>
                  <option value="payment_info_entered">payment_info_entered - Payment details</option>
                  <option value="order_completed">order_completed - Purchase complete</option>
                </optgroup>
                <optgroup label="Engagement Events">
                  <option value="button_clicked">button_clicked - Button interaction</option>
                  <option value="search_performed">search_performed - Search query</option>
                  <option value="form_submitted">form_submitted - Form completion</option>
                  <option value="link_clicked">link_clicked - Link interaction</option>
                  <option value="video_played">video_played - Video started</option>
                  <option value="share_clicked">share_clicked - Share action</option>
                </optgroup>
              </select>
            </div>

            {/* Screen/Page Selection - Only show for screen_viewed */}
            {currentCampaign?.trigger === 'screen_viewed' && (
              <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: colors.primary[50], borderRadius: '12px', border: `2px solid ${colors.primary[100]}` }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={18} color={colors.primary[500]} />
                  Target Screen (Optional)
                </h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: colors.text.secondary }}>
                  Leave empty to trigger on any screen, or specify a screen name to target (e.g., "home", "product_detail", "checkout")
                </p>
                <input
                  type="text"
                  value={currentCampaign?.screen || ''}
                  onChange={(e) => updateScreen(e.target.value)}
                  placeholder="e.g., home, checkout, profile"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    fontFamily: 'monospace'
                  }}
                />
                <div style={{ marginTop: '12px', fontSize: '12px', color: colors.text.secondary, lineHeight: 1.5 }}>
                  <strong>How it works:</strong> Campaign will show when <code style={{ backgroundColor: colors.gray[200], padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>screen_viewed</code> event is tracked with property <code style={{ backgroundColor: colors.gray[200], padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>screen_name</code> matching this value.
                </div>
              </div>
            )}

            {/* Campaign Status */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${colors.border.default}` }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>Campaign Status</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: colors.text.secondary }}>
                Set the campaign status to control its visibility
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: `2px solid ${currentCampaign?.status === 'draft' ? colors.gray[400] : colors.border.default}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: currentCampaign?.status === 'draft' ? colors.gray[50] : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={currentCampaign?.status === 'draft'}
                    onChange={(e) => updateStatus(e.target.value as any)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Draft</div>
                    <div style={{ fontSize: '12px', color: colors.text.secondary }}>Not visible to users</div>
                  </div>
                </label>
                <label style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: `2px solid ${currentCampaign?.status === 'active' ? colors.green[500] : colors.border.default}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: currentCampaign?.status === 'active' ? colors.green[50] : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={currentCampaign?.status === 'active'}
                    onChange={(e) => updateStatus(e.target.value as any)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: colors.green[700] }}>Active</div>
                    <div style={{ fontSize: '12px', color: colors.text.secondary }}>Live to users</div>
                  </div>
                </label>
                <label style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: `2px solid ${currentCampaign?.status === 'paused' ? colors.gray[400] : colors.border.default}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: currentCampaign?.status === 'paused' ? colors.gray[50] : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="radio"
                    name="status"
                    value="paused"
                    checked={currentCampaign?.status === 'paused'}
                    onChange={(e) => updateStatus(e.target.value as any)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: colors.gray[700] }}>Paused</div>
                    <div style={{ fontSize: '12px', color: colors.text.secondary }}>Temporarily disabled</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Platform Selection */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>Where should this experience run?</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px' }} /> Web
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} /> iOS
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} /> Android
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>Who will see this campaign?</h4>
              <button style={{ padding: '10px 16px', border: `1px solid ${colors.border.default}`, borderRadius: '8px', background: 'white', fontSize: '14px', cursor: 'pointer', marginBottom: '12px' }}>
                All Users
              </button>
              <div style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: colors.text.primary }}>where</span>
                <select style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px' }}>
                  <option>cityid</option>
                </select>
                <select style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px' }}>
                  <option>equal to</option>
                </select>
                <input type="text" defaultValue="1" style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px', width: '60px' }} />
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.gray[400] }}><X size={16} /></button>
              </div>
              <button style={{ padding: '6px 12px', background: 'none', border: 'none', color: colors.primary[500], fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Add Filter</button>
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: colors.text.primary }}>When will they see this campaign?</h4>
              <div style={{ padding: '12px', backgroundColor: colors.gray[50], borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: colors.text.primary }}>When user does</span>
                  <select style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px' }}>
                    <option>screen_views</option>
                  </select>
                  <select style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px' }}>
                    <option>greater than or equal to</option>
                  </select>
                  <input type="number" defaultValue="1" style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px', width: '60px' }} />
                  <span style={{ fontSize: '13px', color: colors.text.primary }}>time</span>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.gray[400] }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px' }}>
                  <span style={{ fontSize: '13px', color: colors.text.primary }}>where</span>
                  <select style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px' }}>
                    <option>eventname</option>
                  </select>
                  <select style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px' }}>
                    <option>equal to</option>
                  </select>
                  <input type="text" defaultValue="QuickCheckoutPayment" style={{ padding: '6px 8px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px' }} />
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.gray[400] }}><X size={16} /></button>
                </div>
              </div>
            </div>

            {/* Campaign Display Rules (Screenshots 11-12) */}
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: `2px solid ${colors.border.default}` }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: colors.text.primary }}>Campaign Display Rules</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: colors.text.secondary }}>Control when and how often users see this campaign.</p>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>Display Frequency</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: colors.text.secondary }}>When should users see this campaign?</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <select style={{ padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '14px', minWidth: '140px' }}>
                    <option>Once</option>
                    <option selected>Custom</option>
                    <option>Every time</option>
                  </select>
                  <span style={{ fontSize: '14px', color: colors.text.primary }}>Show</span>
                  <input type="number" defaultValue="1" style={{ padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '14px', width: '80px' }} />
                  <span style={{ fontSize: '14px', color: colors.text.primary }}>times within</span>
                  <input type="number" defaultValue="72" style={{ padding: '8px 12px', border: `1px solid ${colors.border.default}`, borderRadius: '6px', fontSize: '14px', width: '80px' }} />
                  <span style={{ fontSize: '14px', color: colors.text.primary }}>hours</span>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>Total Interaction Limit</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                    <input type="radio" name="interactionLimit" defaultChecked style={{ width: '16px', height: '16px' }} />
                    <span style={{ color: colors.text.primary }}>Unlimited</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" name="interactionLimit" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                      <span style={{ color: colors.text.primary }}>Limited to</span>
                      <input type="number" placeholder="5" style={{ padding: '6px 10px', border: `1px solid ${colors.border.default}`, borderRadius: '4px', fontSize: '13px', width: '70px' }} />
                      <span style={{ color: colors.text.primary }}>times total</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: '44px', height: '24px', backgroundColor: colors.gray[200], borderRadius: '12px', transition: 'background-color 0.2s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                  </div>
                  <span style={{ color: colors.text.primary }}>Add session limit</span>
                </label>
              </div>

              <details style={{ marginTop: '24px' }}>
                <summary style={{ padding: '12px 0', fontSize: '14px', fontWeight: 600, color: colors.primary[500], cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ChevronRight size={16} /> Advanced Options
                </summary>
                <div style={{ padding: '16px 0', display: 'flex', gap: '12px' }}>
                  <button style={{ padding: '10px 16px', border: `1px solid ${colors.primary[500]}`, borderRadius: '8px', background: colors.primary[500], color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Add Event
                  </button>
                  <button style={{ padding: '10px 16px', border: `1px solid ${colors.border.default}`, borderRadius: '8px', background: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: colors.text.primary }}>
                    <Plus size={16} /> Add Event Group
                  </button>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignBuilder;
