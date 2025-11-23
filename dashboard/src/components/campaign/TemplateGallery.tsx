import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, TrendingUp, X } from "lucide-react";
import templatesData from "@/data/templates.json";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  tags: string[];
  popularity: number;
  config: any;
  editableFields: Record<string, any>;
}

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  onStartBlank: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onStartBlank,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const templates: Template[] = templatesData.templates;
  const categories = templatesData.categories;

  // Filter templates based on category and search
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sort by popularity
  const sortedTemplates = [...filteredTemplates].sort((a, b) => b.popularity - a.popularity);

  const handleUseTemplate = (template: Template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <>
      {/* Main Template Gallery Dialog */}
      <Dialog open={isOpen && !previewTemplate} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">Choose a Template</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Start with a professional design and customize it to your needs
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="gap-1"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Button>
              ))}
            </div>
          </DialogHeader>

          {/* Template Grid */}
          <ScrollArea className="flex-1 px-6">
            <div className="grid grid-cols-3 gap-6 py-6">
              {sortedTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-200 overflow-hidden"
                  onClick={() => setPreviewTemplate(template)}
                >
                  {/* Thumbnail Preview */}
                  <div className="h-56 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center border-b relative overflow-hidden">
                    <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                      {template.thumbnail}
                    </div>
                    
                    {/* Popularity Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="gap-1 bg-white/90">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs">{template.popularity}</span>
                      </Badge>
                    </div>

                    {/* Quick Use Button (shows on hover) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseTemplate(template);
                        }}
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    
                    {/* Tags */}
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Blank Canvas Option */}
              <Card
                className="group cursor-pointer hover:shadow-xl transition-all duration-200 border-2 border-dashed"
                onClick={() => {
                  onStartBlank();
                  onClose();
                }}
              >
                <div className="h-56 bg-gray-50 flex items-center justify-center border-b">
                  <div className="text-center">
                    <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">✨</div>
                    <p className="text-gray-600 font-medium">Start from Scratch</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">Blank Canvas</h3>
                  <p className="text-sm text-gray-600">
                    Create your own design from scratch with complete freedom
                  </p>
                </div>
              </Card>
            </div>

            {/* No Results */}
            {sortedTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">No templates found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or category filter
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      {previewTemplate && (
        <Dialog open={true} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <span className="text-4xl">{previewTemplate.thumbnail}</span>
                {previewTemplate.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <p className="text-gray-700">{previewTemplate.description}</p>
              </div>

              {/* Category & Popularity */}
              <div className="flex gap-4 items-center">
                <Badge variant="secondary" className="capitalize">
                  {categories.find((c) => c.id === previewTemplate.category)?.name || previewTemplate.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Used {previewTemplate.popularity} times</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-sm font-semibold mb-2">Tags:</p>
                <div className="flex gap-2 flex-wrap">
                  {previewTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Component Breakdown */}
              <div>
                <p className="text-sm font-semibold mb-2">Includes:</p>
                <div className="grid grid-cols-2 gap-2">
                  {previewTemplate.config.components.map((comp: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="capitalize">{comp.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Fields */}
              {Object.keys(previewTemplate.editableFields).length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Easily customize:</p>
                  <div className="space-y-1">
                    {Object.values(previewTemplate.editableFields).map((field: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>{field.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  Use This Template
                </Button>
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Back to Gallery
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
