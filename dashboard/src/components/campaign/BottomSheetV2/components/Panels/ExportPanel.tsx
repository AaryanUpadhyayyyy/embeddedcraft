import React, { useState } from 'react';
import { useBottomSheetState } from '../../hooks/useBottomSheetState';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  Code,
  Image as ImageIcon,
  FileCode,
  Smartphone,
  Copy,
  Check,
  Eye,
  Settings,
  Layers as LayersIcon,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateSVG, generateReactCode, generateFlutterCode } from '../../utils/codeGenerators';

export const ExportPanel: React.FC = () => {
  const state = useBottomSheetState();
  const selectedComponent = state.selectedComponents.length === 1
    ? state.selectedComponents[0]
    : undefined;

  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'react' | 'flutter'>('png');
  const [pngScale, setPngScale] = useState<'1x' | '2x' | '3x'>('2x');
  const [reactStyle, setReactStyle] = useState<'tailwind' | 'styled-components' | 'css-modules'>('tailwind');
  const [flutterTheme, setFlutterTheme] = useState<'material' | 'cupertino'>('material');
  const [copiedCode, setCopiedCode] = useState(false);
  const [exportScope, setExportScope] = useState<'selected' | 'all'>('selected');

  const handleExportPNG = async () => {
    // PNG export using html2canvas
    const scale = pngScale === '1x' ? 1 : pngScale === '2x' ? 2 : 3;
    
    try {
      // This will be implemented with html2canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Get component to export
      const componentToExport = exportScope === 'selected' ? selectedComponent : null;
      
      // For now, show success message
      alert(`PNG export at ${scale}x scale - Implementation in progress`);
      
      // TODO: Implement html2canvas conversion
      // const blob = await canvas.toBlob();
      // const url = URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `component-${scale}x.png`;
      // link.click();
    } catch (error) {
      console.error('PNG export error:', error);
    }
  };

  const handleExportSVG = () => {
    // SVG export
    const componentToExport = exportScope === 'selected' ? selectedComponent : null;
    
    if (!componentToExport) {
      alert('Please select a component to export');
      return;
    }
    
    // Generate SVG from component using advanced generator
    const svg = generateSVG(componentToExport, state.components);
    
    // Download SVG
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${componentToExport.name || 'component'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportReact = () => {
    const componentToExport = exportScope === 'selected' ? selectedComponent : null;
    
    if (!componentToExport) {
      alert('Please select a component to export');
      return;
    }
    
    // Generate React code using advanced generator
    const code = generateReactCode(componentToExport, state.components, reactStyle);
    
    // Copy to clipboard
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportFlutter = () => {
    const componentToExport = exportScope === 'selected' ? selectedComponent : null;
    
    if (!componentToExport) {
      alert('Please select a component to export');
      return;
    }
    
    // Generate Flutter code using advanced generator
    const code = generateFlutterCode(componentToExport, state.components, flutterTheme);
    
    // Copy to clipboard
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getExportButton = () => {
    switch (exportFormat) {
      case 'png':
        return (
          <Button onClick={handleExportPNG} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download PNG ({pngScale})
          </Button>
        );
      case 'svg':
        return (
          <Button onClick={handleExportSVG} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download SVG
          </Button>
        );
      case 'react':
        return (
          <Button onClick={handleExportReact} className="w-full">
            {copiedCode ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copiedCode ? 'Copied!' : 'Copy React Code'}
          </Button>
        );
      case 'flutter':
        return (
          <Button onClick={handleExportFlutter} className="w-full">
            {copiedCode ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copiedCode ? 'Copied!' : 'Copy Flutter Code'}
          </Button>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Export</h3>
          <Badge variant="secondary" className="text-xs">
            {state.components.length} components
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Export your design as image, code, or vector format
        </p>
      </div>

      <Separator />

      {/* Export Scope */}
      <div className="space-y-2">
        <Label className="text-xs">Export Scope</Label>
        <Select value={exportScope} onValueChange={(v) => setExportScope(v as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="selected">
              <div className="flex items-center gap-2">
                <LayersIcon className="w-3 h-3" />
                Selected Component
              </div>
            </SelectItem>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <LayersIcon className="w-3 h-3" />
                All Components
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Export Format Tabs */}
      <Tabs value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="png" className="text-xs">
            <ImageIcon className="w-3 h-3 mr-1" />
            PNG
          </TabsTrigger>
          <TabsTrigger value="svg" className="text-xs">
            <FileCode className="w-3 h-3 mr-1" />
            SVG
          </TabsTrigger>
          <TabsTrigger value="react" className="text-xs">
            <Code className="w-3 h-3 mr-1" />
            React
          </TabsTrigger>
          <TabsTrigger value="flutter" className="text-xs">
            <Smartphone className="w-3 h-3 mr-1" />
            Flutter
          </TabsTrigger>
        </TabsList>

        {/* PNG Export */}
        <TabsContent value="png" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label className="text-xs">Resolution</Label>
            <Select value={pngScale} onValueChange={(v) => setPngScale(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1x">1x (Standard)</SelectItem>
                <SelectItem value="2x">2x (Retina)</SelectItem>
                <SelectItem value="3x">3x (High DPI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <ImageIcon className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Export as raster image. Perfect for sharing mockups and presentations.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* SVG Export */}
        <TabsContent value="svg" className="space-y-3 mt-3">
          <Alert>
            <FileCode className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Export as vector graphic. Scalable and perfect for web use.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* React Export */}
        <TabsContent value="react" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label className="text-xs">Style Library</Label>
            <Select value={reactStyle} onValueChange={(v) => setReactStyle(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                <SelectItem value="styled-components">Styled Components</SelectItem>
                <SelectItem value="css-modules">CSS Modules</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Code className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Generate production-ready React component code with {reactStyle}.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flutter Export */}
        <TabsContent value="flutter" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label className="text-xs">Widget Theme</Label>
            <Select value={flutterTheme} onValueChange={(v) => setFlutterTheme(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">Material Design</SelectItem>
                <SelectItem value="cupertino">Cupertino (iOS)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Smartphone className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Generate Flutter widget code with {flutterTheme === 'material' ? 'Material' : 'iOS'} theme.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="pt-2">
        {getExportButton()}
      </div>

      {/* Developer Inspect */}
      <Separator />
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <Label className="text-xs">Developer Inspect</Label>
        </div>
        
        {selectedComponent ? (
          <ScrollArea className="h-32 rounded border bg-muted/30 p-3">
            <pre className="text-xs font-mono">
              {JSON.stringify(
                {
                  id: selectedComponent.id,
                  type: selectedComponent.type,
                  width: selectedComponent.position?.width,
                  height: selectedComponent.position?.height,
                  style: selectedComponent.style,
                },
                null,
                2
              )}
            </pre>
          </ScrollArea>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-4 border rounded bg-muted/20">
            Select a component to inspect
          </div>
        )}
        
        {selectedComponent && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(selectedComponent, null, 2));
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
          >
            {copiedCode ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
            {copiedCode ? 'Copied JSON!' : 'Copy Component JSON'}
          </Button>
        )}
      </div>

      {/* Quick Tips */}
      <Alert>
        <Settings className="w-4 h-4" />
        <AlertDescription className="text-xs">
          <strong>Pro Tip:</strong> Use React/Flutter export for production code, PNG for mockups, and SVG for scalable graphics.
        </AlertDescription>
      </Alert>
    </div>
  );
};
