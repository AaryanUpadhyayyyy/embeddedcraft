import React, { useState } from 'react';
import { Sparkles, LayoutTemplate, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import { BOTTOM_SHEET_TEMPLATES, type BottomSheetTemplate } from '../../core/templates';

interface TemplatesPanelProps {
  state: BottomSheetState;
}

/**
 * TemplatesPanel - Browse and insert pre-built bottom sheet templates
 * 
 * Features:
 * - 6 professional templates (Promotional, Rating, Share, Product, Newsletter, Update)
 * - Category filtering (promotional, engagement, informational, transactional)
 * - One-click template insertion
 * - Preview thumbnails
 * - Template descriptions
 */
export default function TemplatesPanel({ state }: TemplatesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [insertedTemplateId, setInsertedTemplateId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates', count: BOTTOM_SHEET_TEMPLATES.length },
    { id: 'promotional', label: 'Promotional', count: BOTTOM_SHEET_TEMPLATES.filter(t => t.category === 'promotional').length },
    { id: 'engagement', label: 'Engagement', count: BOTTOM_SHEET_TEMPLATES.filter(t => t.category === 'engagement').length },
    { id: 'transactional', label: 'Transactional', count: BOTTOM_SHEET_TEMPLATES.filter(t => t.category === 'transactional').length },
    { id: 'informational', label: 'Informational', count: BOTTOM_SHEET_TEMPLATES.filter(t => t.category === 'informational').length },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? BOTTOM_SHEET_TEMPLATES
    : BOTTOM_SHEET_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleInsertTemplate = (template: BottomSheetTemplate) => {
    console.log('🎯 Template clicked:', template.name);
    console.log('📦 Template data:', template);
    
    // Clear existing components
    state.components.forEach(comp => {
      state.deleteComponent(comp.id);
    });

    // Insert template components with proper position data
    let yPosition = 20; // Start from top
    const componentsWithValidatedIds = template.components.map((comp, index) => {
      const componentHeight = comp.style?.height || 60;
      const componentWidth = comp.style?.width || 350;
      const marginBottom = comp.style?.marginBottom || 16;
      
      const newComponent = {
        ...comp,
        // Ensure unique IDs
        id: `${comp.type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        // Add position data if missing
        position: comp.position || {
          type: 'absolute' as const,
          x: 20,
          y: yPosition,
          width: typeof componentWidth === 'number' ? componentWidth : 350,
          height: typeof componentHeight === 'number' ? componentHeight : 60,
          zIndex: index + 1,
          rotation: 0,
        },
      };
      
      // Update y position for next component
      yPosition += (typeof componentHeight === 'number' ? componentHeight : 60) + (typeof marginBottom === 'number' ? marginBottom : 16);
      
      return newComponent;
    });
    
    console.log('✅ Components with positions:', componentsWithValidatedIds);
    state.setComponentsWithHistory(componentsWithValidatedIds);
    
    // Update canvas height to fit all components
    const totalHeight = yPosition + 40; // Add some bottom padding
    state.updateCanvasHeight(Math.max(totalHeight, 600));
    console.log('📏 Canvas height updated to:', Math.max(totalHeight, 600));

    // Show success feedback
    setInsertedTemplateId(template.id);
    setTimeout(() => setInsertedTemplateId(null), 2000);
    
    console.log('🎉 Template insertion complete!');
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      promotional: 'bg-red-100 text-red-700',
      engagement: 'bg-purple-100 text-purple-700',
      transactional: 'bg-blue-100 text-blue-700',
      informational: 'bg-green-100 text-green-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
        </div>
        <p className="text-sm text-gray-600">
          Start with professional bottom sheet designs
        </p>
      </div>

      {/* Category Tabs */}
      <div className="px-4 pt-4 border-b">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-5 gap-1 h-auto p-1">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="text-xs py-2 px-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">{cat.label}</span>
                  <span className="text-[10px] opacity-70">{cat.count}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No templates in this category</p>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
              >
                {/* Template Preview Image */}
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={getCategoryBadgeColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>

                  {/* Template Stats */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    <span>{template.components.length} components</span>
                    <span>•</span>
                    <span>Ready to use</span>
                  </div>

                  {/* Insert Button */}
                  <Button
                    onClick={() => handleInsertTemplate(template)}
                    className="w-full"
                    variant={insertedTemplateId === template.id ? 'outline' : 'default'}
                    disabled={insertedTemplateId === template.id}
                  >
                    {insertedTemplateId === template.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Inserted!
                      </>
                    ) : (
                      <>
                        <LayoutTemplate className="w-4 h-4 mr-2" />
                        Use This Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-4 border-t bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          💡 Tip: Templates will replace your current design. Save your work before applying.
        </p>
      </div>
    </div>
  );
}
