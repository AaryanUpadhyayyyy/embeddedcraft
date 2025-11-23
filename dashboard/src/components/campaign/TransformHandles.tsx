import React from 'react';
import { RotateCw } from 'lucide-react';

interface TransformHandlesProps {
  bounds: DOMRect;
  onResize: (corner: string, deltaX: number, deltaY: number) => void;
  onRotate: (angle: number) => void;
  showRotate?: boolean;
}

export function TransformHandles({ bounds, onResize, onRotate, showRotate = false }: TransformHandlesProps) {
  const [isDragging, setIsDragging] = React.useState<string | null>(null);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

  const handleMouseDown = (corner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(corner);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      
      if (isDragging === 'rotate') {
        // Calculate rotation angle
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        onRotate(angle);
      } else {
        onResize(isDragging, deltaX, deltaY);
      }
      
      setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, bounds, onResize, onRotate]);

  const handleSize = 8;
  const offset = -handleSize / 2;

  const handles = [
    { name: 'nw', cursor: 'nw-resize', x: offset, y: offset },
    { name: 'n', cursor: 'n-resize', x: bounds.width / 2 + offset, y: offset },
    { name: 'ne', cursor: 'ne-resize', x: bounds.width + offset, y: offset },
    { name: 'e', cursor: 'e-resize', x: bounds.width + offset, y: bounds.height / 2 + offset },
    { name: 'se', cursor: 'se-resize', x: bounds.width + offset, y: bounds.height + offset },
    { name: 's', cursor: 's-resize', x: bounds.width / 2 + offset, y: bounds.height + offset },
    { name: 'sw', cursor: 'sw-resize', x: offset, y: bounds.height + offset },
    { name: 'w', cursor: 'w-resize', x: offset, y: bounds.height / 2 + offset },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width: bounds.width, height: bounds.height }}>
      {/* Resize Handles */}
      {handles.map((handle) => (
        <div
          key={handle.name}
          className="absolute bg-white border-2 border-blue-500 rounded-sm pointer-events-auto hover:bg-blue-500 transition-colors"
          style={{
            width: handleSize,
            height: handleSize,
            left: handle.x,
            top: handle.y,
            cursor: handle.cursor,
          }}
          onMouseDown={(e) => handleMouseDown(handle.name, e)}
        />
      ))}

      {/* Rotation Handle */}
      {showRotate && (
        <div
          className="absolute pointer-events-auto -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleMouseDown('rotate', e)}
        >
          <div className="w-0.5 h-6 bg-blue-500" />
          <div className="w-6 h-6 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors">
            <RotateCw className="h-3 w-3 text-blue-500" />
          </div>
        </div>
      )}
    </div>
  );
}
