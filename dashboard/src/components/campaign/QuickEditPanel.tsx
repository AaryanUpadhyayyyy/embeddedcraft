import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Wand2, X } from "lucide-react";

interface QuickEditPanelProps {
  template: any;
  components: any[];
  onUpdate: (componentId: string, property: string, value: any) => void;
  onClose: () => void;
}

export const QuickEditPanel: React.FC<QuickEditPanelProps> = ({
  template,
  components,
  onUpdate,
  onClose,
}) => {
  if (!template || !template.editableFields) return null;

  const editableFields = Object.entries(template.editableFields);

  const getComponentValue = (field: any) => {
    const component = components.find((c) => c.id.startsWith(field.componentId));
    if (!component) return "";

    const [section, key] = field.property.split(".");
    if (section === "content") {
      return component.content[key] || "";
    } else if (section === "style") {
      return component.style[key] || "";
    }
    return "";
  };

  const handleUpdate = (field: any, value: any) => {
    const component = components.find((c) => c.id.startsWith(field.componentId));
    if (!component) return;

    const [section, key] = field.property.split(".");
    onUpdate(component.id, field.property, value);
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-lg border-l-2 border-purple-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            <h3 className="font-bold text-lg">Quick Edit</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-white/80 mt-1">
          Edit key template fields quickly
        </p>
      </div>

      {/* Editable Fields */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-340px)]">
        {editableFields.map(([fieldKey, field]: [string, any], index) => {
          const currentValue = getComponentValue(field);
          const isColor = field.property.includes("Color") || field.property.includes("color");
          const isLongText = field.label.toLowerCase().includes("description") || 
                           field.label.toLowerCase().includes("message") ||
                           field.label.toLowerCase().includes("features");

          return (
            <div key={fieldKey}>
              {index > 0 && <Separator className="my-3" />}
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  {field.label}
                </Label>

                {isColor ? (
                  // Color picker
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentValue}
                      onChange={(e) => handleUpdate(field, e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleUpdate(field, e.target.value)}
                      className="flex-1 h-10"
                      placeholder="#000000"
                    />
                  </div>
                ) : isLongText ? (
                  // Textarea for long text
                  <Textarea
                    value={currentValue}
                    onChange={(e) => handleUpdate(field, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="min-h-[80px] resize-none"
                    rows={3}
                  />
                ) : field.property.includes("url") || field.property.includes("Url") ? (
                  // URL input with preview icon
                  <div className="space-y-2">
                    <Input
                      type="url"
                      value={currentValue}
                      onChange={(e) => handleUpdate(field, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="h-10"
                    />
                    {currentValue && field.property.includes("image") && (
                      <div className="relative h-32 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={currentValue}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/300x200?text=Invalid+URL";
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular text input
                  <Input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleUpdate(field, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="h-10"
                  />
                )}

                {/* Helper text */}
                <p className="text-xs text-gray-500">
                  {field.property.includes("text") && "Double-click on canvas to edit inline"}
                  {field.property.includes("url") && "Enter image URL or upload"}
                  {field.property.includes("Color") && "Choose color or enter hex code"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Changes apply instantly</span>
        </div>
      </div>
    </div>
  );
};
