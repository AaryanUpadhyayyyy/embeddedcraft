import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BottomSheetHeight = 'auto' | 'half' | 'full';

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: BottomSheetHeight | number;
  showDragHandle?: boolean;
  showCloseButton?: boolean;
  backdropBlur?: boolean;
  dismissOnBackdropClick?: boolean;
  className?: string;
}

/**
 * BottomSheetModal - Modal wrapper for bottom sheet pattern
 * 
 * Features:
 * - Slide-up animation from bottom
 * - Backdrop overlay with blur
 * - Drag handle for visual affordance
 * - Close button (X)
 * - Click outside to dismiss
 * - Responsive height options
 * - Body scroll lock when open
 * - Rounded top corners
 * - Shadow above content
 * 
 * Usage:
 * ```tsx
 * <BottomSheetModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   height="auto"
 *   showDragHandle={true}
 *   backdropBlur={true}
 * >
 *   <YourContent />
 * </BottomSheetModal>
 * ```
 */
export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isOpen,
  onClose,
  children,
  height = 'auto',
  showDragHandle = true,
  showCloseButton = true,
  backdropBlur = true,
  dismissOnBackdropClick = true,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Lock body scroll when modal opens
      document.body.style.overflow = 'hidden';
      
      // Trigger animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      
      // Unlock body scroll and remove from DOM after animation
      setTimeout(() => {
        document.body.style.overflow = '';
        setShouldRender(false);
      }, 300); // Match animation duration
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = () => {
    if (dismissOnBackdropClick) {
      onClose();
    }
  };

  const getHeightClass = () => {
    switch (height) {
      case 'half':
        return 'h-[50vh]';
      case 'full':
        return 'h-[90vh]';
      case 'auto':
        return 'max-h-[90vh]';
      default:
        return typeof height === 'number' ? `h-[${height}px]` : 'max-h-[90vh]';
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          backdropBlur && 'backdrop-blur-sm',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out',
          getHeightClass(),
          isAnimating ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Section: Drag Handle + Close Button */}
        <div className="relative flex items-center justify-center pt-3 pb-2 border-b border-gray-100">
          {/* Drag Handle */}
          {showDragHandle && (
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          )}

          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-4 top-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content Area with Scroll */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 50px)' }}>
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheetModal;
