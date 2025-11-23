import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  segment: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion: string;
  config: {
    type: string;
    text: string;
    backgroundColor: string;
    textColor: string;
    buttonText?: string;
    position?: string;
    [key: string]: any;
  };
  rules: Rule[];
  createdAt: string;
  updatedAt: string;
}

export interface Rule {
  id: number;
  type: 'event' | 'attribute';
  field: string;
  operator: string;
  value: string;
}

export interface Segment {
  id: string;
  name: string;
  conditions: string;
  users: number;
  rules: Rule[];
  createdAt: string;
}

export interface AnalyticsData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface Store {
  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string) => void;
  updateCampaignStatus: (id: string, status: 'active' | 'paused' | 'draft') => void;
  syncCampaigns: (campaigns: Campaign[]) => void;

  // Segments
  segments: Segment[];
  addSegment: (segment: Omit<Segment, 'id' | 'createdAt'>) => void;
  updateSegment: (id: string, segment: Partial<Segment>) => void;
  deleteSegment: (id: string) => void;

  // Analytics
  analyticsData: AnalyticsData[];
  updateAnalytics: (data: AnalyticsData) => void;

  // Real-time simulation
  simulateEvent: (campaignId: string, eventType: 'impression' | 'click' | 'conversion') => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      campaigns: [
        {
          id: '1',
          name: 'Checkout Boost',
          status: 'active',
          trigger: 'Checkout_Started',
          segment: 'Cart Value ≥ ₹150',
          impressions: 45200,
          clicks: 3816,
          conversions: 382,
          conversion: '8.4%',
          config: {
            type: 'floater',
            text: 'Get Free Delivery on orders above ₹150!',
            backgroundColor: '#8B5CF6',
            textColor: '#FFFFFF',
            buttonText: 'Claim Now',
            position: 'bottom',
          },
          rules: [
            { id: 1, type: 'attribute', field: 'cart_total', operator: '>=', value: '150' },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'KYC Reminder',
          status: 'active',
          trigger: 'HomeScreen_Viewed',
          segment: 'KYC Incomplete',
          impressions: 28900,
          clicks: 2312,
          conversions: 208,
          conversion: '8.0%',
          config: {
            type: 'modal',
            text: 'Complete your KYC to unlock exclusive benefits!',
            backgroundColor: '#10B981',
            textColor: '#FFFFFF',
            buttonText: 'Complete KYC',
            position: 'center',
          },
          rules: [
            { id: 1, type: 'attribute', field: 'kyc_status', operator: '==', value: 'false' },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Gold Tier Welcome',
          status: 'paused',
          trigger: 'App_Opened',
          segment: 'User Tier: Gold',
          impressions: 12400,
          clicks: 1116,
          conversions: 123,
          conversion: '9.0%',
          config: {
            type: 'floater',
            text: 'Welcome back, Gold Member! Enjoy your exclusive perks.',
            backgroundColor: '#F59E0B',
            textColor: '#000000',
            buttonText: 'View Perks',
            position: 'top',
          },
          rules: [
            { id: 1, type: 'attribute', field: 'user_tier', operator: '==', value: 'Gold' },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      segments: [
        {
          id: '1',
          name: 'High Value Customers',
          conditions: 'cart_total >= 150 AND purchase_count > 5',
          users: 24500,
          rules: [
            { id: 1, type: 'attribute', field: 'cart_total', operator: '>=', value: '150' },
            { id: 2, type: 'attribute', field: 'purchase_count', operator: '>', value: '5' },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'KYC Incomplete',
          conditions: 'kyc_status == false AND account_age < 30d',
          users: 8900,
          rules: [
            { id: 1, type: 'attribute', field: 'kyc_status', operator: '==', value: 'false' },
            { id: 2, type: 'attribute', field: 'account_age', operator: '<', value: '30' },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Gold Tier Members',
          conditions: "user_tier == 'Gold'",
          users: 12400,
          rules: [
            { id: 1, type: 'attribute', field: 'user_tier', operator: '==', value: 'Gold' },
          ],
          createdAt: new Date().toISOString(),
        },
      ],

      analyticsData: [
        { date: 'Mon', impressions: 120000, clicks: 8400, conversions: 672 },
        { date: 'Tue', impressions: 145000, clicks: 10150, conversions: 812 },
        { date: 'Wed', impressions: 132000, clicks: 9240, conversions: 739 },
        { date: 'Thu', impressions: 168000, clicks: 11760, conversions: 941 },
        { date: 'Fri', impressions: 189000, clicks: 13230, conversions: 1058 },
        { date: 'Sat', impressions: 156000, clicks: 10920, conversions: 874 },
        { date: 'Sun', impressions: 142000, clicks: 9940, conversions: 795 },
      ],

      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [
            {
              ...campaign,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.campaigns,
          ],
        })),

      updateCampaign: (id, campaign) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...campaign, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),

      syncCampaigns: (campaigns) =>
        set(() => ({
          campaigns: campaigns,
        })),

      toggleCampaignStatus: (id) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id
              ? {
                ...c,
                status: c.status === 'active' ? 'paused' : 'active',
                updatedAt: new Date().toISOString(),
              }
              : c
          ),
        })),

      addSegment: (segment) =>
        set((state) => ({
          segments: [
            {
              ...segment,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
            ...state.segments,
          ],
        })),

      updateSegment: (id, segment) =>
        set((state) => ({
          segments: state.segments.map((s) => (s.id === id ? { ...s, ...segment } : s)),
        })),

      deleteSegment: (id) =>
        set((state) => ({
          segments: state.segments.filter((s) => s.id !== id),
        })),

      updateAnalytics: (data) =>
        set((state) => ({
          analyticsData: [...state.analyticsData.slice(-6), data],
        })),

      simulateEvent: (campaignId, eventType) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) => {
            if (c.id !== campaignId) return c;

            const increment = Math.floor(Math.random() * 50) + 10;
            const updates: Partial<Campaign> = {
              updatedAt: new Date().toISOString(),
            };

            if (eventType === 'impression') {
              updates.impressions = c.impressions + increment;
            } else if (eventType === 'click') {
              updates.clicks = c.clicks + Math.floor(increment * 0.08);
              updates.impressions = c.impressions + increment;
            } else if (eventType === 'conversion') {
              updates.conversions = c.conversions + Math.floor(increment * 0.01);
              updates.clicks = c.clicks + Math.floor(increment * 0.08);
              updates.impressions = c.impressions + increment;
            }

            const newCampaign = { ...c, ...updates };
            newCampaign.conversion = ((newCampaign.conversions / newCampaign.clicks) * 100).toFixed(1) + '%';

            return newCampaign;
          }),
        })),
    }),
    {
      name: 'nudge-platform-storage',
    }
  )
);
