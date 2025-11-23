import React, { useState } from 'react';
import BottomSheetModal from './BottomSheetModal';
import Badge from './Badge';
import RichText from './RichText';
import ButtonGroup from './ButtonGroup';
import { Button } from '@/components/ui/button';

/**
 * BottomSheetDemo - Example usage of BottomSheetModal with new components
 * 
 * This demonstrates the MakeMyTrip-style bottom sheet pattern:
 * - Modal overlay with backdrop blur
 * - Badge for "LIVE NOW" indicator
 * - RichText for promotional copy
 * - ButtonGroup for dual actions (DISMISS + BOOK NOW)
 * - Professional layout and spacing
 */
export const BottomSheetDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleBookNow = () => {
    alert('Booking now!');
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button onClick={() => setIsOpen(true)}>
        Open Promotional Offer
      </Button>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        isOpen={isOpen}
        onClose={handleDismiss}
        height="auto"
        showDragHandle={true}
        backdropBlur={true}
        dismissOnBackdropClick={true}
      >
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Image with Badge Overlay */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
              alt="Travel Deals"
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="danger" size="sm" shape="pill">
                LIVE NOW
              </Badge>
            </div>
          </div>

          {/* Rich Text Content */}
          <div className="space-y-2">
            <RichText
              content="Up to <b style='font-size: 28px;'>30% OFF*</b> on<br/><span style='font-size: 24px; font-weight: 600;'>International Hotels.</span>"
              className="text-gray-900"
            />
            <p className="text-sm text-gray-600">
              Valid from 16th to 18th May ONLY!
            </p>
          </div>

          {/* Button Group (Sticky Footer) */}
          <ButtonGroup
            layout="horizontal"
            sticky="none"
            gap={12}
            buttons={[
              {
                label: 'DISMISS',
                variant: 'outline',
                onClick: handleDismiss,
              },
              {
                label: 'BOOK NOW',
                variant: 'default',
                onClick: handleBookNow,
                className: 'bg-blue-600 hover:bg-blue-700',
              },
            ]}
          />
        </div>
      </BottomSheetModal>
    </>
  );
};

export default BottomSheetDemo;
