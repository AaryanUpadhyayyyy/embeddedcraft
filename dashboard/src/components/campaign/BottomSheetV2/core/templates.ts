import type { Component } from '../core/types';

export interface BottomSheetTemplate {
  id: string;
  name: string;
  description: string;
  category: 'promotional' | 'engagement' | 'informational' | 'transactional';
  preview: string;
  components: Component[];
}

/**
 * Pre-built Bottom Sheet Templates
 * Ready-to-use patterns for common use cases
 */

// Template 1: Promotional Offer (MakeMyTrip Style)
export const PROMOTIONAL_OFFER_TEMPLATE: BottomSheetTemplate = {
  id: 'promotional-offer',
  name: 'Promotional Offer',
  description: 'Eye-catching promotional banner with discount badge and dual-action buttons',
  category: 'promotional',
  preview: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  components: [
    {
      id: 'promo-image-1',
      type: 'image',
      position: {
        type: 'absolute',
        x: 20,
        y: 20,
        width: 350,
        height: 200,
        zIndex: 1,
        rotation: 0,
      },
      style: {
        borderRadius: 12,
      },
      content: {
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
        alt: 'Promotional offer',
        aspectRatio: '16:9',
        objectFit: 'cover',
        overlay: {
          type: 'gradient',
          gradient: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
        },
      },
      visible: true,
    },
    {
      id: 'promo-badge-1',
      type: 'badge',
      position: {
        type: 'absolute',
        x: 32,
        y: 32,
        width: 80,
        height: 28,
        zIndex: 10,
        rotation: 0,
      },
      style: {},
      content: {
        text: 'LIVE NOW',
        variant: 'danger',
        size: 'sm',
        shape: 'pill',
      },
      visible: true,
    },
    {
      id: 'promo-richtext-1',
      type: 'richtext',
      position: {
        type: 'absolute',
        x: 20,
        y: 240,
        width: 350,
        height: 60,
        zIndex: 2,
        rotation: 0,
      },
      style: {},
      content: {
        html: 'Up to <b style="font-size: 24px; color: #EF4444;">30% OFF*</b> on <span style="color: #3B82F6; font-weight: 600;">International Hotels</span>',
      },
      visible: true,
    },
    {
      id: 'promo-text-disclaimer',
      type: 'text',
      position: {
        type: 'absolute',
        x: 20,
        y: 310,
        width: 350,
        height: 40,
        zIndex: 3,
        rotation: 0,
      },
      style: {
        fontSize: 13,
        color: '#6B7280',
      },
      content: {
        text: '*T&C apply. Limited time offer valid until Dec 31, 2025',
      },
      visible: true,
    },
    {
      id: 'promo-buttongroup-1',
      type: 'buttongroup',
      position: {
        type: 'absolute',
        x: 20,
        y: 360,
        width: 350,
        height: 44,
        zIndex: 4,
        rotation: 0,
      },
      style: {},
      content: {
        layout: 'horizontal',
        sticky: 'none',
        buttons: [
          { label: 'DISMISS', variant: 'outline' },
          { label: 'BOOK NOW', variant: 'default' },
        ],
      },
      visible: true,
    },
  ],
};

// Template 2: Rating Prompt
export const RATING_PROMPT_TEMPLATE: BottomSheetTemplate = {
  id: 'rating-prompt',
  name: 'Rating Prompt',
  description: 'Request user feedback with star rating and quick actions',
  category: 'engagement',
  preview: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
  components: [
    {
      id: 'rating-icon',
      type: 'shape',
      style: {
        width: 48,
        height: 48,
        backgroundColor: '#F59E0B',
        borderRadius: 24,
        marginBottom: 16,
      },
      content: {
        shape: 'circle',
      },
      visible: true,
    },
    {
      id: 'rating-title',
      type: 'text',
      style: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
      },
      content: {
        text: 'Enjoying the app?',
      },
      visible: true,
    },
    {
      id: 'rating-subtitle',
      type: 'text',
      style: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
      },
      content: {
        text: 'Help us improve by rating your experience',
      },
      visible: true,
    },
    {
      id: 'rating-buttongroup',
      type: 'buttongroup',
      style: {
        gap: 12,
      },
      content: {
        layout: 'vertical',
        sticky: 'none',
        buttons: [
          { label: 'Rate Now ⭐', variant: 'default' },
          { label: 'Maybe Later', variant: 'ghost' },
        ],
      },
      visible: true,
    },
  ],
};

// Template 3: Share Options
export const SHARE_OPTIONS_TEMPLATE: BottomSheetTemplate = {
  id: 'share-options',
  name: 'Share Options',
  description: 'Social sharing menu with multiple platform options',
  category: 'transactional',
  preview: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
  components: [
    {
      id: 'share-title',
      type: 'text',
      style: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
      },
      content: {
        text: 'Share this',
      },
      visible: true,
    },
    {
      id: 'share-button-whatsapp',
      type: 'button',
      style: {
        width: '100%',
        marginBottom: 12,
        justifyContent: 'flex-start',
      },
      content: {
        text: 'WhatsApp',
        variant: 'outline',
      },
      visible: true,
    },
    {
      id: 'share-button-twitter',
      type: 'button',
      style: {
        width: '100%',
        marginBottom: 12,
        justifyContent: 'flex-start',
      },
      content: {
        text: 'Twitter',
        variant: 'outline',
      },
      visible: true,
    },
    {
      id: 'share-button-facebook',
      type: 'button',
      style: {
        width: '100%',
        marginBottom: 12,
        justifyContent: 'flex-start',
      },
      content: {
        text: 'Facebook',
        variant: 'outline',
      },
      visible: true,
    },
    {
      id: 'share-button-copy',
      type: 'button',
      style: {
        width: '100%',
        marginBottom: 12,
        justifyContent: 'flex-start',
      },
      content: {
        text: 'Copy Link',
        variant: 'outline',
      },
      visible: true,
    },
  ],
};

// Template 4: Product Quick View
export const PRODUCT_QUICK_VIEW_TEMPLATE: BottomSheetTemplate = {
  id: 'product-quick-view',
  name: 'Product Quick View',
  description: 'E-commerce product preview with image gallery and CTA',
  category: 'transactional',
  preview: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
  components: [
    {
      id: 'product-image',
      type: 'image',
      style: {
        width: '100%',
        borderRadius: 12,
        marginBottom: 16,
      },
      content: {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
        alt: 'Product image',
        aspectRatio: '1:1',
        objectFit: 'cover',
      },
      visible: true,
    },
    {
      id: 'product-title',
      type: 'text',
      style: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
      },
      content: {
        text: 'Premium Wireless Headphones',
      },
      visible: true,
    },
    {
      id: 'product-price',
      type: 'richtext',
      style: {
        marginBottom: 12,
      },
      content: {
        html: '<span style="font-size: 24px; font-weight: 700; color: #059669;">$149.99</span> <span style="text-decoration: line-through; color: #9CA3AF;">$199.99</span>',
      },
      visible: true,
    },
    {
      id: 'product-description',
      type: 'text',
      style: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
      },
      content: {
        text: 'Experience crystal-clear audio with active noise cancellation and 30-hour battery life.',
      },
      visible: true,
    },
    {
      id: 'product-buttongroup',
      type: 'buttongroup',
      style: {
        gap: 12,
      },
      content: {
        layout: 'horizontal',
        sticky: 'bottom',
        buttons: [
          { label: 'View Details', variant: 'outline' },
          { label: 'Add to Cart', variant: 'default' },
        ],
      },
      visible: true,
    },
  ],
};

// Template 5: Newsletter Signup
export const NEWSLETTER_SIGNUP_TEMPLATE: BottomSheetTemplate = {
  id: 'newsletter-signup',
  name: 'Newsletter Signup',
  description: 'Email collection form with benefits and CTA',
  category: 'engagement',
  preview: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&h=600&fit=crop',
  components: [
    {
      id: 'newsletter-icon',
      type: 'shape',
      style: {
        width: 48,
        height: 48,
        backgroundColor: '#8B5CF6',
        borderRadius: 24,
        marginBottom: 16,
      },
      content: {
        shape: 'circle',
      },
      visible: true,
    },
    {
      id: 'newsletter-title',
      type: 'text',
      style: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
      },
      content: {
        text: 'Stay in the loop!',
      },
      visible: true,
    },
    {
      id: 'newsletter-subtitle',
      type: 'text',
      style: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
      },
      content: {
        text: 'Get exclusive offers and updates delivered to your inbox',
      },
      visible: true,
    },
    {
      id: 'newsletter-input',
      type: 'input',
      style: {
        width: '100%',
        marginBottom: 12,
      },
      content: {
        placeholder: 'Enter your email',
      },
      visible: true,
    },
    {
      id: 'newsletter-buttongroup',
      type: 'buttongroup',
      style: {
        gap: 12,
      },
      content: {
        layout: 'vertical',
        sticky: 'none',
        buttons: [
          { label: 'Subscribe', variant: 'default' },
          { label: 'No thanks', variant: 'ghost' },
        ],
      },
      visible: true,
    },
  ],
};

// Template 6: App Update Notice
export const APP_UPDATE_TEMPLATE: BottomSheetTemplate = {
  id: 'app-update',
  name: 'App Update Notice',
  description: 'Inform users about new features and updates',
  category: 'informational',
  preview: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
  components: [
    {
      id: 'update-badge',
      type: 'badge',
      style: {
        marginBottom: 16,
      },
      content: {
        text: 'NEW',
        variant: 'primary',
        size: 'md',
        shape: 'pill',
      },
      visible: true,
    },
    {
      id: 'update-title',
      type: 'text',
      style: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
      },
      content: {
        text: "What's New in Version 2.0",
      },
      visible: true,
    },
    {
      id: 'update-richtext',
      type: 'richtext',
      style: {
        marginBottom: 20,
      },
      content: {
        html: '<ul style="list-style: disc; padding-left: 20px; color: #374151;">' +
          '<li><b>Dark Mode</b> - Switch between light and dark themes</li>' +
          '<li><b>Offline Support</b> - Access your content anywhere</li>' +
          '<li><b>Performance</b> - 2x faster loading times</li>' +
          '</ul>',
      },
      visible: true,
    },
    {
      id: 'update-buttongroup',
      type: 'buttongroup',
      style: {
        gap: 12,
      },
      content: {
        layout: 'horizontal',
        sticky: 'none',
        buttons: [
          { label: 'Later', variant: 'outline' },
          { label: 'Update Now', variant: 'default' },
        ],
      },
      visible: true,
    },
  ],
};

// Export all templates
export const BOTTOM_SHEET_TEMPLATES: BottomSheetTemplate[] = [
  PROMOTIONAL_OFFER_TEMPLATE,
  RATING_PROMPT_TEMPLATE,
  SHARE_OPTIONS_TEMPLATE,
  PRODUCT_QUICK_VIEW_TEMPLATE,
  NEWSLETTER_SIGNUP_TEMPLATE,
  APP_UPDATE_TEMPLATE,
];

export default BOTTOM_SHEET_TEMPLATES;
