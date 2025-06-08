// Subscription tier types
export type SubscriptionTier = 'free' | 'pro' | 'featured';

export interface TierFeatures {
  portfolio_limit: number | null; // null = unlimited
  messages_per_month: number | null; // null = unlimited
  search_priority: 'low' | 'high' | 'featured';
  analytics: false | 'basic' | 'advanced';
  custom_themes: boolean;
  badge: null | 'pro' | 'verified';
  support: 'community' | 'email_48h' | 'priority_24h';
  spotlight?: boolean;
  early_access?: boolean;
  video_intro?: boolean;
}

export interface SubscriptionTierInfo {
  id: SubscriptionTier;
  name: string;
  price_monthly: number;
  features: TierFeatures;
  description?: string;
  popular?: boolean;
}

// Subscription status types
export type SubscriptionStatus = 
  | 'free'
  | 'active' 
  | 'canceled' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'past_due' 
  | 'trialing' 
  | 'unpaid';

// Usage tracking types
export type MetricType = 
  | 'portfolio_uploads'
  | 'messages_sent' 
  | 'profile_views'
  | 'search_appearances'
  | 'spotlight_clicks'
  | 'spotlight_impressions';

export interface UsageMetric {
  metric_type: MetricType;
  metric_value: number;
  period_start: string;
  period_end: string;
}

// Analytics event types
export type AnalyticsEventType = 
  | 'profile_view'
  | 'message_sent'
  | 'message_received'
  | 'search_appearance'
  | 'spotlight_click'
  | 'spotlight_impression'
  | 'subscription_upgrade'
  | 'subscription_downgrade'
  | 'subscription_cancel';

export interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  user_id?: string;
  target_user_id?: string;
  metadata?: Record<string, any>;
}

// Feature flag types
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  target_tiers: SubscriptionTier[];
  rollout_percentage: number;
}

// Subscription tier configurations
export const TIER_CONFIG: Record<SubscriptionTier, SubscriptionTierInfo> = {
  free: {
    id: 'free',
    name: 'Basic Profile',
    price_monthly: 0,
    description: 'Entry-level access with intentional limitations',
    features: {
      portfolio_limit: 3,
      messages_per_month: 5,
      search_priority: 'low',
      analytics: false,
      custom_themes: false,
      badge: null,
      support: 'community'
    }
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price_monthly: 29,
    description: 'Core professional features for serious editors',
    popular: true,
    features: {
      portfolio_limit: null,
      messages_per_month: 50,
      search_priority: 'high',
      analytics: 'basic',
      custom_themes: true,
      badge: 'pro',
      support: 'email_48h'
    }
  },
  featured: {
    id: 'featured',
    name: 'MyEdtr Verified',
    price_monthly: 59,
    description: 'Premium tier with maximum visibility and features',
    features: {
      portfolio_limit: null,
      messages_per_month: null,
      search_priority: 'featured',
      analytics: 'advanced',
      custom_themes: true,
      badge: 'verified',
      support: 'priority_24h',
      spotlight: true,
      early_access: true,
      video_intro: true
    }
  }
};

// Utility functions
export function getTierInfo(tier: SubscriptionTier): SubscriptionTierInfo {
  return TIER_CONFIG[tier];
}

export function canAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierHierarchy = { free: 0, pro: 1, featured: 2 };
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

export function hasFeature(userTier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  const tierInfo = getTierInfo(userTier);
  return !!tierInfo.features[feature];
}

export function getUsageLimit(userTier: SubscriptionTier, metric: MetricType): number | null {
  const tierInfo = getTierInfo(userTier);
  
  switch (metric) {
    case 'portfolio_uploads':
      return tierInfo.features.portfolio_limit;
    case 'messages_sent':
      return tierInfo.features.messages_per_month;
    default:
      return null; // No limit for other metrics
  }
}

export function isUpgrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean {
  const tierHierarchy = { free: 0, pro: 1, featured: 2 };
  return tierHierarchy[toTier] > tierHierarchy[fromTier];
} 