import { BottomSheetTemplate, Layer } from '@/store/useEditorStore';

/**
 * PHASE 1: Default Bottom Sheet Templates
 * Industrial-level templates based on real-world apps
 */

export const BOTTOM_SHEET_TEMPLATES: BottomSheetTemplate[] = [
  // Template 1: Dunzo - Cart Value Increase
  {
    id: 'dunzo-cart-value',
    name: 'Cart Value Increase (Dunzo)',
    category: 'ecommerce',
    thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=150&fit=crop',
    description: 'Encourage users to add more items to cart for free delivery. Includes progress bar and motivational messaging.',
    featured: true,
    tags: ['ecommerce', 'cart', 'delivery', 'progress'],
    layers: [
      {
        id: 'dunzo-container',
        type: 'container',
        name: 'Bottom Sheet Container',
        parent: null,
        visible: true,
        locked: false,
        zIndex: 0,
        position: { x: 0, y: 0 },
        size: { width: 360, height: 'auto' },
        content: {},
        style: { 
          backgroundColor: '#FFFFFF', 
          borderRadius: 24, 
          padding: { top: 24, right: 20, bottom: 24, left: 20 },
          layout: 'stack',
          gap: 16
        },
        children: ['dunzo-progress', 'dunzo-text', 'dunzo-subtext', 'dunzo-cta']
      },
      {
        id: 'dunzo-progress',
        type: 'progress-bar',
        name: 'Cart Progress Bar',
        parent: 'dunzo-container',
        visible: true,
        locked: false,
        zIndex: 1,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 8 },
        content: { 
          value: 150, 
          max: 300, 
          showPercentage: false,
          milestones: [
            { value: 300, label: 'Free delivery unlocked! 🎉', color: '#22C55E' }
          ]
        },
        style: { 
          backgroundColor: '#22C55E', 
          borderRadius: 4 
        },
        children: []
      },
      {
        id: 'dunzo-text',
        type: 'text',
        name: 'Progress Text',
        parent: 'dunzo-container',
        visible: true,
        locked: false,
        zIndex: 2,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: '₹150 away from free delivery', 
          fontSize: 14,
          fontWeight: 'semibold',
          textColor: '#111827',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'dunzo-subtext',
        type: 'text',
        name: 'Description',
        parent: 'dunzo-container',
        visible: true,
        locked: false,
        zIndex: 3,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'You\'re halfway there! Add more items to unlock free delivery.', 
          fontSize: 13,
          fontWeight: 'normal',
          textColor: '#6B7280',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'dunzo-cta',
        type: 'button',
        name: 'Add Items Button',
        parent: 'dunzo-container',
        visible: true,
        locked: false,
        zIndex: 4,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 48 },
        content: { 
          label: 'Add Items',
          textColor: '#FFFFFF',
          buttonStyle: 'primary',
          action: { type: 'deeplink', url: '/products', trackConversion: true }
        },
        style: { 
          backgroundColor: '#22C55E', 
          borderRadius: 10 
        },
        children: []
      }
    ],
    config: {
      height: 'auto',
      minHeight: 280,
      maxHeight: 400,
      dragHandle: true,
      swipeToDismiss: true,
      swipeThreshold: 100,
      dismissVelocity: 0.5,
      backgroundColor: '#FFFFFF',
      borderRadius: { topLeft: 24, topRight: 24 },
      elevation: 4,
      overlay: { 
        enabled: true, 
        opacity: 0.5, 
        blur: 0, 
        color: '#000000', 
        dismissOnClick: true 
      },
      animation: { 
        type: 'slide', 
        duration: 300, 
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      },
      safeArea: { top: false, bottom: true }
    }
  },

  // Template 2: Headway - Daily Goal Motivation
  {
    id: 'headway-goal',
    name: 'Daily Goal Motivation (Headway)',
    category: 'engagement',
    thumbnail: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=200&h=150&fit=crop',
    description: 'Motivate users to complete their daily reading goal with progress visualization.',
    featured: true,
    tags: ['engagement', 'gamification', 'progress', 'motivation'],
    layers: [
      {
        id: 'headway-container',
        type: 'container',
        name: 'Bottom Sheet Container',
        parent: null,
        visible: true,
        locked: false,
        zIndex: 0,
        position: { x: 0, y: 0 },
        size: { width: 360, height: 'auto' },
        content: {},
        style: { 
          backgroundColor: '#FFFFFF', 
          borderRadius: 24, 
          padding: { top: 32, right: 24, bottom: 32, left: 24 },
          layout: 'stack',
          gap: 16,
          alignItems: 'center'
        },
        children: ['headway-icon', 'headway-title', 'headway-desc', 'headway-progress', 'headway-cta']
      },
      {
        id: 'headway-icon',
        type: 'media',
        name: 'Goal Icon',
        parent: 'headway-container',
        visible: true,
        locked: false,
        zIndex: 1,
        position: { x: 0, y: 0 },
        size: { width: 80, height: 80 },
        content: { 
          imageUrl: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=100&h=100&fit=crop',
          imageSize: { width: 80, height: 80 }
        },
        style: { borderRadius: 40 },
        children: []
      },
      {
        id: 'headway-title',
        type: 'text',
        name: 'Title',
        parent: 'headway-container',
        visible: true,
        locked: false,
        zIndex: 2,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'You\'re 75% to your daily goal! 🎯', 
          fontSize: 18,
          fontWeight: 'bold',
          textColor: '#111827',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'headway-desc',
        type: 'text',
        name: 'Description',
        parent: 'headway-container',
        visible: true,
        locked: false,
        zIndex: 3,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'Just 5 more minutes to reach your daily reading target!', 
          fontSize: 14,
          fontWeight: 'normal',
          textColor: '#6B7280',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'headway-progress',
        type: 'progress-circle',
        name: 'Progress Circle',
        parent: 'headway-container',
        visible: true,
        locked: false,
        zIndex: 4,
        position: { x: 0, y: 0 },
        size: { width: 120, height: 120 },
        content: { 
          value: 75,
          max: 100,
          showPercentage: true
        },
        style: { 
          backgroundColor: '#6366F1',
          borderRadius: 60
        },
        children: []
      },
      {
        id: 'headway-cta',
        type: 'button',
        name: 'Continue Button',
        parent: 'headway-container',
        visible: true,
        locked: false,
        zIndex: 5,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 48 },
        content: { 
          label: 'Continue Reading',
          textColor: '#FFFFFF',
          buttonStyle: 'primary'
        },
        style: { 
          backgroundColor: '#6366F1', 
          borderRadius: 10 
        },
        children: []
      }
    ],
    config: {
      height: 'auto',
      minHeight: 420,
      dragHandle: true,
      swipeToDismiss: true,
      backgroundColor: '#FFFFFF',
      borderRadius: { topLeft: 24, topRight: 24 },
      elevation: 3,
      overlay: { 
        enabled: true, 
        opacity: 0.6, 
        blur: 4, 
        color: '#000000', 
        dismissOnClick: true 
      },
      animation: { 
        type: 'slide', 
        duration: 350, 
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      }
    }
  },

  // Template 3: MakeMyTrip - Limited Time Offer
  {
    id: 'makemytrip-offer',
    name: 'Limited Time Offer (MakeMyTrip)',
    category: 'promotion',
    thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=150&fit=crop',
    description: 'Create urgency with time-limited offers and countdown timer.',
    featured: true,
    tags: ['promotion', 'urgency', 'countdown', 'offer'],
    layers: [
      {
        id: 'mmt-container',
        type: 'container',
        name: 'Bottom Sheet Container',
        parent: null,
        visible: true,
        locked: false,
        zIndex: 0,
        position: { x: 0, y: 0 },
        size: { width: 360, height: 'auto' },
        content: {},
        style: { 
          backgroundColor: '#FFFFFF', 
          borderRadius: 24, 
          padding: { top: 20, right: 20, bottom: 20, left: 20 },
          layout: 'stack',
          gap: 16
        },
        children: ['mmt-media', 'mmt-timer', 'mmt-title', 'mmt-desc', 'mmt-cta-row']
      },
      {
        id: 'mmt-media',
        type: 'media',
        name: 'Offer Image',
        parent: 'mmt-container',
        visible: true,
        locked: false,
        zIndex: 1,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 160 },
        content: { 
          imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop',
          imageSize: { width: 320, height: 160 }
        },
        style: { borderRadius: 12 },
        children: []
      },
      {
        id: 'mmt-timer',
        type: 'countdown',
        name: 'Countdown Timer',
        parent: 'mmt-container',
        visible: true,
        locked: false,
        zIndex: 2,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          format: 'HH:MM:SS',
          urgencyThreshold: 300, // 5 minutes in seconds
          autoHide: false
        },
        style: { 
          backgroundColor: '#FEE2E2',
          borderRadius: 8,
          padding: 12
        },
        children: []
      },
      {
        id: 'mmt-title',
        type: 'text',
        name: 'Title',
        parent: 'mmt-container',
        visible: true,
        locked: false,
        zIndex: 3,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'Get 30% off on all flights! ✈️', 
          fontSize: 20,
          fontWeight: 'bold',
          textColor: '#111827',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'mmt-desc',
        type: 'text',
        name: 'Description',
        parent: 'mmt-container',
        visible: true,
        locked: false,
        zIndex: 4,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'Limited time offer! Book your tickets before the deal expires.', 
          fontSize: 14,
          fontWeight: 'normal',
          textColor: '#6B7280',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'mmt-cta-row',
        type: 'container',
        name: 'Button Row',
        parent: 'mmt-container',
        visible: true,
        locked: false,
        zIndex: 5,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: {},
        style: {
          layout: 'row',
          gap: 12
        },
        children: ['mmt-skip', 'mmt-book']
      },
      {
        id: 'mmt-skip',
        type: 'button',
        name: 'Skip Button',
        parent: 'mmt-cta-row',
        visible: true,
        locked: false,
        zIndex: 6,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 44 },
        content: { 
          label: 'Maybe Later',
          textColor: '#6B7280',
          buttonStyle: 'outline',
          action: { type: 'close' }
        },
        style: { 
          backgroundColor: 'transparent',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          borderRadius: 8,
          padding: 12
        },
        children: []
      },
      {
        id: 'mmt-book',
        type: 'button',
        name: 'Book Now Button',
        parent: 'mmt-cta-row',
        visible: true,
        locked: false,
        zIndex: 7,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 44 },
        content: { 
          label: 'Book Now',
          textColor: '#FFFFFF',
          buttonStyle: 'primary',
          action: { type: 'deeplink', url: '/flights', trackConversion: true }
        },
        style: { 
          backgroundColor: '#EF4444', 
          borderRadius: 8,
          padding: 12
        },
        children: []
      }
    ],
    config: {
      height: 'auto',
      dragHandle: true,
      swipeToDismiss: true,
      backgroundColor: '#FFFFFF',
      borderRadius: { topLeft: 24, topRight: 24 },
      elevation: 4,
      overlay: { 
        enabled: true, 
        opacity: 0.7, 
        blur: 2, 
        color: '#000000', 
        dismissOnClick: false 
      },
      animation: { 
        type: 'bounce', 
        duration: 400, 
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
      }
    }
  },

  // Template 4: Khatabook - Festive Offer
  {
    id: 'khatabook-festive',
    name: 'Festive Offer (Khatabook)',
    category: 'promotion',
    thumbnail: 'https://images.unsplash.com/photo-1543946602-a0fce8117697?w=200&h=150&fit=crop',
    description: 'Celebrate festivals with special rewards and coin offers.',
    featured: false,
    tags: ['festive', 'rewards', 'coins', 'gamification'],
    layers: [
      {
        id: 'khata-container',
        type: 'container',
        name: 'Bottom Sheet Container',
        parent: null,
        visible: true,
        locked: false,
        zIndex: 0,
        position: { x: 0, y: 0 },
        size: { width: 360, height: 'auto' },
        content: {},
        style: { 
          backgroundColor: '#FEF3C7',
          borderRadius: 24, 
          padding: { top: 24, right: 20, bottom: 24, left: 20 },
          layout: 'stack',
          gap: 16
        },
        children: ['khata-media', 'khata-title', 'khata-reward', 'khata-desc', 'khata-cta']
      },
      {
        id: 'khata-media',
        type: 'media',
        name: 'Festive Banner',
        parent: 'khata-container',
        visible: true,
        locked: false,
        zIndex: 1,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 120 },
        content: { 
          imageUrl: 'https://images.unsplash.com/photo-1543946602-a0fce8117697?w=400&h=150&fit=crop',
          imageSize: { width: 320, height: 120 }
        },
        style: { borderRadius: 12 },
        children: []
      },
      {
        id: 'khata-title',
        type: 'text',
        name: 'Title',
        parent: 'khata-container',
        visible: true,
        locked: false,
        zIndex: 2,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'Diwali Special! 🪔', 
          fontSize: 22,
          fontWeight: 'bold',
          textColor: '#92400E',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'khata-reward',
        type: 'statistic',
        name: 'Reward Amount',
        parent: 'khata-container',
        visible: true,
        locked: false,
        zIndex: 3,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          value: 500,
          prefix: '₹',
          suffix: 'FREE COINS',
          text: '500',
          fontSize: 36,
          fontWeight: 'bold',
          textColor: '#D97706',
          textAlign: 'center',
          animateOnLoad: true
        },
        style: {},
        children: []
      },
      {
        id: 'khata-desc',
        type: 'text',
        name: 'Description',
        parent: 'khata-container',
        visible: true,
        locked: false,
        zIndex: 4,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'Complete your first transaction and get 500 coins instantly!', 
          fontSize: 14,
          fontWeight: 'normal',
          textColor: '#78350F',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'khata-cta',
        type: 'button',
        name: 'Claim Button',
        parent: 'khata-container',
        visible: true,
        locked: false,
        zIndex: 5,
        position: { x: 0, y: 0 },
        size: { width: 'auto', height: 52 },
        content: { 
          label: 'Claim Reward 🎁',
          textColor: '#FFFFFF',
          buttonStyle: 'primary',
          action: { type: 'deeplink', url: '/rewards', trackConversion: true }
        },
        style: { 
          backgroundColor: '#F59E0B', 
          borderRadius: 12 
        },
        children: []
      }
    ],
    config: {
      height: 'auto',
      dragHandle: true,
      swipeToDismiss: true,
      backgroundColor: '#FEF3C7',
      borderRadius: { topLeft: 24, topRight: 24 },
      elevation: 3,
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        opacity: 1
      },
      overlay: { 
        enabled: true, 
        opacity: 0.5, 
        blur: 0, 
        color: '#000000', 
        dismissOnClick: true 
      },
      animation: { 
        type: 'slide', 
        duration: 300, 
        easing: 'ease-out' 
      }
    }
  },

  // Fix 9: Image-Based Templates
  // Template: E-commerce Flash Sale
  {
    id: 'ecommerce-flash-sale',
    name: 'Flash Sale Banner',
    category: 'ecommerce',
    thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=150&fit=crop',
    description: 'Eye-catching flash sale with full-image background, curved top design, perfect for limited-time offers.',
    featured: true,
    tags: ['ecommerce', 'sale', 'image-background', 'curved'],
    layers: [
      {
        id: 'flash-sale-container',
        type: 'container',
        name: 'Bottom Sheet Container',
        parent: null,
        visible: true,
        locked: false,
        zIndex: 0,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 375, height: 'auto' },
        content: {},
        style: { 
          backgroundImage: 'url(https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          clipPath: 'ellipse(100% 90% at 50% 0%)',
          borderRadius: 0,
          padding: { top: 40, right: 24, bottom: 32, left: 24 },
          layout: 'stack',
          gap: 16
        },
        children: ['flash-badge', 'flash-title', 'flash-subtitle', 'flash-button']
      },
      {
        id: 'flash-badge',
        type: 'badge',
        name: 'Sale Badge',
        parent: 'flash-sale-container',
        visible: true,
        locked: false,
        zIndex: 1,
        position: { x: 24, y: 16, type: 'absolute' },
        size: { width: 'auto', height: 'auto' },
        content: { badgeText: '70% OFF', badgeVariant: 'error' },
        style: { 
          badgeBackgroundColor: '#EF4444',
          badgeTextColor: '#FFFFFF',
          badgeBorderRadius: 20,
          badgePadding: { horizontal: 16, vertical: 8 }
        },
        children: []
      },
      {
        id: 'flash-title',
        type: 'text',
        name: 'Sale Title',
        parent: 'flash-sale-container',
        visible: true,
        locked: false,
        zIndex: 2,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'MEGA FLASH SALE', 
          fontSize: 28,
          fontWeight: 'bold',
          textColor: '#FFFFFF',
          textAlign: 'center'
        },
        style: { textShadow: '0 2px 8px rgba(0,0,0,0.3)' },
        children: []
      },
      {
        id: 'flash-subtitle',
        type: 'text',
        name: 'Sale Description',
        parent: 'flash-sale-container',
        visible: true,
        locked: false,
        zIndex: 3,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'Ends in 2 hours • Limited Stock', 
          fontSize: 14,
          fontWeight: 'medium',
          textColor: '#FFFFFF',
          textAlign: 'center'
        },
        style: { opacity: 0.9 },
        children: []
      },
      {
        id: 'flash-button',
        type: 'button',
        name: 'Shop Now Button',
        parent: 'flash-sale-container',
        visible: true,
        locked: false,
        zIndex: 4,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: '100%', height: 'auto' },
        content: { 
          label: 'Shop Now',
          buttonStyle: 'primary'
        },
        style: { 
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: { top: 16, right: 24, bottom: 16, left: 24 }
        },
        children: []
      }
    ],
    config: {
      height: 420,
      dragHandle: false,
      swipeToDismiss: true,
      backgroundColor: 'transparent',
      borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      elevation: 3,
      overlay: { enabled: true, opacity: 0.6, blur: 2, color: '#000000', dismissOnClick: true },
      animation: { type: 'slide', duration: 400, easing: 'ease-out' }
    }
  },

  // Template: Food Delivery Offer
  {
    id: 'food-delivery-offer',
    name: 'Food Delivery Promo',
    category: 'delivery',
    thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop',
    description: 'Appetizing food delivery promotion with full-image background and curved design.',
    featured: true,
    tags: ['food', 'delivery', 'image-background', 'curved'],
    layers: [
      {
        id: 'food-container',
        type: 'container',
        name: 'Bottom Sheet Container',
        parent: null,
        visible: true,
        locked: false,
        zIndex: 0,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 375, height: 'auto' },
        content: {},
        style: { 
          backgroundImage: 'url(https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          clipPath: 'polygon(0% 8%, 4% 0%, 96% 0%, 100% 8%, 100% 100%, 0% 100%)',
          padding: { top: 32, right: 24, bottom: 32, left: 24 },
          layout: 'stack',
          gap: 12
        },
        children: ['food-emoji', 'food-title', 'food-subtitle', 'food-cta']
      },
      {
        id: 'food-emoji',
        type: 'text',
        name: 'Food Emoji',
        parent: 'food-container',
        visible: true,
        locked: false,
        zIndex: 1,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: '🍔🍕🍜', 
          fontSize: 48,
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'food-title',
        type: 'text',
        name: 'Offer Title',
        parent: 'food-container',
        visible: true,
        locked: false,
        zIndex: 2,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'FREE DELIVERY', 
          fontSize: 32,
          fontWeight: 'bold',
          textColor: '#FFFFFF',
          textAlign: 'center'
        },
        style: { textShadow: '0 2px 12px rgba(0,0,0,0.4)' },
        children: []
      },
      {
        id: 'food-subtitle',
        type: 'text',
        name: 'Offer Details',
        parent: 'food-container',
        visible: true,
        locked: false,
        zIndex: 3,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'On orders above ₹199', 
          fontSize: 16,
          fontWeight: 'medium',
          textColor: '#FFFFFF',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'food-cta',
        type: 'button',
        name: 'Order Now Button',
        parent: 'food-container',
        visible: true,
        locked: false,
        zIndex: 4,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: '100%', height: 'auto' },
        content: { 
          label: 'Order Now',
          buttonStyle: 'primary'
        },
        style: { 
          backgroundColor: '#FBBF24',
          borderRadius: 16,
          padding: { top: 16, right: 24, bottom: 16, left: 24 }
        },
        children: []
      }
    ],
    config: {
      height: 380,
      dragHandle: false,
      swipeToDismiss: true,
      backgroundColor: 'transparent',
      borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      elevation: 3,
      overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
      animation: { type: 'slide', duration: 350, easing: 'ease-out' }
    }
  },

  // Template: Ride Sharing Welcome
  {
    id: 'ride-sharing-welcome',
    name: 'Ride Promo (Uber Style)',
    category: 'transport',
    thumbnail: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=150&fit=crop',
    description: 'Modern ride-sharing welcome offer with pill-shaped design and gradient overlay.',
    featured: true,
    tags: ['transport', 'ride', 'image-background', 'pill'],
    layers: [
      {
        id: 'ride-container',
        type: 'container',
        name: 'Bottom Sheet Container',
        parent: null,
        visible: true,
        locked: false,
        zIndex: 0,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 375, height: 'auto' },
        content: {},
        style: { 
          backgroundImage: 'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          clipPath: 'ellipse(80% 100% at 50% 50%)',
          padding: { top: 40, right: 28, bottom: 40, left: 28 },
          layout: 'stack',
          gap: 20
        },
        children: ['ride-overlay', 'ride-title', 'ride-subtitle', 'ride-code', 'ride-button']
      },
      {
        id: 'ride-overlay',
        type: 'gradient-overlay',
        name: 'Dark Gradient Overlay',
        parent: 'ride-container',
        visible: true,
        locked: false,
        zIndex: 0,
        position: { x: 0, y: 0, type: 'absolute' },
        size: { width: '100%', height: '100%' },
        content: {
          gradientType: 'linear',
          gradientDirection: 'to-bottom',
          gradientStops: [
            { color: 'rgba(0,0,0,0.7)', position: 0 },
            { color: 'rgba(0,0,0,0.4)', position: 100 }
          ]
        },
        style: {},
        children: []
      },
      {
        id: 'ride-title',
        type: 'text',
        name: 'Welcome Title',
        parent: 'ride-container',
        visible: true,
        locked: false,
        zIndex: 1,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'Welcome Aboard!', 
          fontSize: 28,
          fontWeight: 'bold',
          textColor: '#FFFFFF',
          textAlign: 'center'
        },
        style: {},
        children: []
      },
      {
        id: 'ride-subtitle',
        type: 'text',
        name: 'Offer Description',
        parent: 'ride-container',
        visible: true,
        locked: false,
        zIndex: 2,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 'auto', height: 'auto' },
        content: { 
          text: 'Get ₹200 OFF on your first ride', 
          fontSize: 16,
          fontWeight: 'medium',
          textColor: '#FFFFFF',
          textAlign: 'center'
        },
        style: { opacity: 0.95 },
        children: []
      },
      {
        id: 'ride-code',
        type: 'badge',
        name: 'Promo Code',
        parent: 'ride-container',
        visible: true,
        locked: false,
        zIndex: 3,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: 'auto', height: 'auto' },
        content: { badgeText: 'FIRST200', badgeVariant: 'success' },
        style: { 
          badgeBackgroundColor: '#10B981',
          badgeTextColor: '#FFFFFF',
          badgeBorderRadius: 8,
          badgePadding: { horizontal: 20, vertical: 10 }
        },
        children: []
      },
      {
        id: 'ride-button',
        type: 'button',
        name: 'Book Ride Button',
        parent: 'ride-container',
        visible: true,
        locked: false,
        zIndex: 4,
        position: { x: 0, y: 0, type: 'relative' },
        size: { width: '100%', height: 'auto' },
        content: { 
          label: 'Book Your First Ride',
          buttonStyle: 'primary'
        },
        style: { 
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: { top: 16, right: 24, bottom: 16, left: 24 }
        },
        children: []
      }
    ],
    config: {
      height: 450,
      dragHandle: false,
      swipeToDismiss: true,
      backgroundColor: 'transparent',
      borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
      elevation: 4,
      overlay: { enabled: true, opacity: 0.7, blur: 3, color: '#000000', dismissOnClick: false },
      animation: { type: 'slide', duration: 400, easing: 'ease-out' }
    }
  }
];

// Helper function to get template by ID
export const getTemplateById = (id: string): BottomSheetTemplate | undefined => {
  return BOTTOM_SHEET_TEMPLATES.find(t => t.id === id);
};

// Helper function to get templates by category
export const getTemplatesByCategory = (category: BottomSheetTemplate['category']): BottomSheetTemplate[] => {
  return BOTTOM_SHEET_TEMPLATES.filter(t => t.category === category);
};

// Helper function to get featured templates
export const getFeaturedTemplates = (): BottomSheetTemplate[] => {
  return BOTTOM_SHEET_TEMPLATES.filter(t => t.featured);
};
