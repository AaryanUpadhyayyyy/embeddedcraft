import React, { useState } from 'react';
import { useBottomSheetState } from '../../hooks/useBottomSheetState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Grid3x3,
  Heart,
  Download,
  Plus,
  Palette,
  Shapes,
  Box,
  Star,
  Sparkles,
} from 'lucide-react';

// Mock Unsplash data (in production, this would be from the API)
const mockUnsplashPhotos = [
  { id: '1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', author: 'John Doe', likes: 234 },
  { id: '2', url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400', author: 'Jane Smith', likes: 567 },
  { id: '3', url: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400', author: 'Mike Johnson', likes: 890 },
  { id: '4', url: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=400', author: 'Sarah Wilson', likes: 123 },
  { id: '5', url: 'https://images.unsplash.com/photo-1618556450991-a6a128ef0d9d?w=400', author: 'Tom Brown', likes: 456 },
  { id: '6', url: 'https://images.unsplash.com/photo-1618556450994-2f1af64e8191?w=400', author: 'Lisa Davis', likes: 789 },
];

// Icon library data (commonly used icons)
const iconLibraries = {
  heroicons: [
    { name: 'Home', icon: '🏠', category: 'General' },
    { name: 'User', icon: '👤', category: 'General' },
    { name: 'Settings', icon: '⚙️', category: 'General' },
    { name: 'Bell', icon: '🔔', category: 'Notifications' },
    { name: 'Heart', icon: '❤️', category: 'Social' },
    { name: 'Star', icon: '⭐', category: 'Social' },
    { name: 'Search', icon: '🔍', category: 'Actions' },
    { name: 'Plus', icon: '➕', category: 'Actions' },
    { name: 'Check', icon: '✓', category: 'Status' },
    { name: 'X', icon: '✕', category: 'Status' },
  ],
  lucide: [
    { name: 'Sparkles', icon: '✨', category: 'Effects' },
    { name: 'Palette', icon: '🎨', category: 'Design' },
    { name: 'Layers', icon: '📚', category: 'Design' },
    { name: 'Grid', icon: '⊞', category: 'Layout' },
    { name: 'Box', icon: '📦', category: 'Layout' },
    { name: 'Image', icon: '🖼️', category: 'Media' },
  ],
};

export const AssetsPanel: React.FC = () => {
  const state = useBottomSheetState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'photos' | 'icons' | 'uploads'>('photos');
  const [selectedIconLibrary, setSelectedIconLibrary] = useState<'heroicons' | 'lucide'>('heroicons');
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; url: string; name: string }>>([]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setUploadedImages((prev) => [
          ...prev,
          {
            id: `upload-${Date.now()}-${Math.random()}`,
            url,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle adding image to canvas
  const handleAddImageToCanvas = (imageUrl: string) => {
    // Add new image component
    state.addComponent('image');
    
    // Get the newly added component (it will be the last one and selected)
    const newComponents = state.components;
    const newComponent = newComponents[newComponents.length - 1];

    // Update image URL in content
    if (newComponent) {
      state.updateComponent(newComponent.id, {
        content: { url: imageUrl },
        position: {
          ...newComponent.position,
          width: 300,
          height: 200,
        }
      });
    }
  };

  // Handle adding icon to canvas
  const handleAddIconToCanvas = (iconEmoji: string, iconName: string) => {
    // Add new text component with icon
    state.addComponent('text');
    
    // Get the newly added component
    const newComponents = state.components;
    const newComponent = newComponents[newComponents.length - 1];

    if (newComponent) {
      state.updateComponent(newComponent.id, {
        content: { text: `${iconEmoji} ${iconName}` },
        style: { ...newComponent.style, fontSize: '32px' },
      });
    }
  };

  // Filter photos based on search
  const filteredPhotos = mockUnsplashPhotos.filter((photo) =>
    photo.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter icons based on search
  const filteredIcons = iconLibraries[selectedIconLibrary].filter((icon) =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Assets</h3>
          <Badge variant="secondary" className="text-xs">
            {selectedTab === 'photos' && `${filteredPhotos.length} photos`}
            {selectedTab === 'icons' && `${filteredIcons.length} icons`}
            {selectedTab === 'uploads' && `${uploadedImages.length} uploads`}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${selectedTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="photos" className="text-xs">
            <ImageIcon className="w-3 h-3 mr-1" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="icons" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Icons
          </TabsTrigger>
          <TabsTrigger value="uploads" className="text-xs">
            <Upload className="w-3 h-3 mr-1" />
            Uploads
          </TabsTrigger>
        </TabsList>

        {/* Photos Tab (Unsplash) */}
        <TabsContent value="photos" className="flex-1 mt-3 px-4">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              <Alert>
                <ImageIcon className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  Browse stock photos from Unsplash. Click to add to canvas.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-3">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => handleAddImageToCanvas(photo.url)}
                  >
                    <img
                      src={photo.url}
                      alt={`Photo by ${photo.author}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-xs text-white font-medium truncate">{photo.author}</p>
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <Heart className="w-3 h-3" />
                        {photo.likes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPhotos.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No photos found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Icons Tab */}
        <TabsContent value="icons" className="flex-1 mt-3 px-4">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {/* Icon Library Selector */}
              <div className="flex gap-2">
                <Button
                  variant={selectedIconLibrary === 'heroicons' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedIconLibrary('heroicons')}
                  className="flex-1"
                >
                  <Shapes className="w-3 h-3 mr-1" />
                  Heroicons
                </Button>
                <Button
                  variant={selectedIconLibrary === 'lucide' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedIconLibrary('lucide')}
                  className="flex-1"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Lucide
                </Button>
              </div>

              <Alert>
                <Sparkles className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  Click any icon to add it to your canvas.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-4 gap-2">
                {filteredIcons.map((icon, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg border bg-card hover:bg-accent hover:border-primary cursor-pointer transition-all flex flex-col items-center justify-center p-2 group"
                    onClick={() => handleAddIconToCanvas(icon.icon, icon.name)}
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                      {icon.icon}
                    </div>
                    <p className="text-xs text-center truncate w-full">{icon.name}</p>
                  </div>
                ))}
              </div>

              {filteredIcons.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No icons found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              )}

              {/* Icon Categories */}
              <div className="pt-3 border-t">
                <Label className="text-xs mb-2 block">Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(iconLibraries[selectedIconLibrary].map(i => i.category))).map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Uploads Tab */}
        <TabsContent value="uploads" className="flex-1 mt-3 px-4">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {/* Upload Button */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Upload Images</p>
                    <p className="text-xs text-muted-foreground">
                      Click to browse or drag and drop
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    PNG, JPG, WEBP
                  </Badge>
                </label>
              </div>

              {/* Uploaded Images Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => handleAddImageToCanvas(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-xs text-white font-medium truncate">{image.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uploadedImages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No uploaded images</p>
                  <p className="text-xs">Upload images to see them here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="p-4 border-t">
        <Alert>
          <Box className="w-4 h-4" />
          <AlertDescription className="text-xs">
            <strong>Pro Tip:</strong> Drag images from any tab directly to the canvas, or click to add at default position.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default AssetsPanel;
