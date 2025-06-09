import { createClient } from "@/lib/supabase/client";
import { 
  SubscriptionTier, 
  SubscriptionStatus, 
  MetricType, 
  AnalyticsEventType,
  getTierInfo,
  canAccess,
  hasFeature,
  getUsageLimit 
} from '@/types/subscription';

export interface PlanLimits {
  maxProjects: number;
  maxApplications: number;
  maxMessages: number;
  advancedFilters: boolean;
  prioritySupport: boolean;
  portfolioUpload: boolean;
  analytics: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxProjects: 2,
    maxApplications: 5,
    maxMessages: 50,
    advancedFilters: false,
    prioritySupport: false,
    portfolioUpload: false,
    analytics: false,
  },
  pro: {
    maxProjects: 10,
    maxApplications: -1, // unlimited
    maxMessages: -1, // unlimited
    advancedFilters: true,
    prioritySupport: true,
    portfolioUpload: true,
    analytics: true,
  },
  featured: {
    maxProjects: -1, // unlimited
    maxApplications: -1, // unlimited
    maxMessages: -1, // unlimited
    advancedFilters: true,
    prioritySupport: true,
    portfolioUpload: true,
    analytics: true,
  },
};

export async function getUserPlan(userId: string): Promise<string> {
  const supabase = createClient();
  
  try {
    // Get user subscription tier level
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier_id')
      .eq('user_id', userId)
      .single();

    return subscription?.tier_id || 'free';
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return 'free';
  }
}

export async function canUserPerformAction(
  userId: string,
  action: 'create_project' | 'apply_to_project' | 'send_message'
): Promise<{ allowed: boolean; limit?: number; current?: number }> {
  const supabase = createClient();
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  try {
    switch (action) {
      case 'create_project': {
        if (limits.maxProjects === -1) {
          return { allowed: true };
        }
        
        // Count user's projects created this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact' })
          .eq('client_id', userId)
          .gte('created_at', startOfMonth.toISOString());

        const current = count || 0;
        return {
          allowed: current < limits.maxProjects,
          limit: limits.maxProjects,
          current,
        };
      }

      case 'apply_to_project': {
        if (limits.maxApplications === -1) {
          return { allowed: true };
        }
        
        // Count user's applications created this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count } = await supabase
          .from('project_applications')
          .select('*', { count: 'exact' })
          .eq('editor_id', userId)
          .gte('created_at', startOfMonth.toISOString());

        const current = count || 0;
        return {
          allowed: current < limits.maxApplications,
          limit: limits.maxApplications,
          current,
        };
      }

      case 'send_message': {
        if (limits.maxMessages === -1) {
          return { allowed: true };
        }
        
        // Count user's messages sent this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('sender_id', userId)
          .gte('created_at', startOfMonth.toISOString());

        const current = count || 0;
        return {
          allowed: current < limits.maxMessages,
          limit: limits.maxMessages,
          current,
        };
      }

      default:
        return { allowed: true };
    }
  } catch (error) {
    console.error('Error checking user action:', error);
    return { allowed: false };
  }
}

export function getPlanFeatures(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function formatLimit(limit: number): string {
  return limit === -1 ? 'Unlimited' : limit.toString();
}

export function formatUsage(current: number, limit: number): string {
  if (limit === -1) return `${current} used`;
  return `${current}/${limit} used`;
}

// Create supabase client once outside class to prevent recreations
const supabase = createClient();

export class SubscriptionService {
  // Get user's current subscription tier
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('tier_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user tier:', error);
        return 'free'; // Default to free on error
      }

      return (subscription?.tier_id as SubscriptionTier) || 'free';
    } catch (error) {
      console.error('Error in getUserTier:', error);
      return 'free';
    }
  }

  // Check if user can access a feature
  async canUserAccess(userId: string, requiredTier: SubscriptionTier): Promise<boolean> {
    const userTier = await this.getUserTier(userId);
    return canAccess(userTier, requiredTier);
  }

  // Check if user has a specific feature
  async userHasFeature(userId: string, feature: string): Promise<boolean> {
    const userTier = await this.getUserTier(userId);
    return hasFeature(userTier, feature as any);
  }

  // Get current usage for a metric in the current period
  async getCurrentUsage(userId: string, metricType: MetricType): Promise<number> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('metric_value')
        .eq('user_id', userId)
        .eq('metric_type', metricType)
        .gte('period_start', monthStart.toISOString())
        .lte('period_end', monthEnd.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is expected
        console.warn('Usage tracking table not found or error:', error);
        return 0; // Return 0 usage if table doesn't exist
      }
      return data?.metric_value || 0;
    } catch (error) {
      console.warn('Error fetching current usage, returning 0:', error);
      return 0;
    }
  }

  // Check if user can perform an action (usage limit check)
  async canPerformAction(userId: string, metricType: MetricType): Promise<{
    canPerform: boolean;
    currentUsage: number;
    limit: number | null;
    tier: SubscriptionTier;
  }> {
    const userTier = await this.getUserTier(userId);
    const currentUsage = await this.getCurrentUsage(userId, metricType);
    const limit = getUsageLimit(userTier, metricType);

    return {
      canPerform: limit === null || currentUsage < limit,
      currentUsage,
      limit,
      tier: userTier
    };
  }

  // Increment usage counter
  async incrementUsage(userId: string, metricType: MetricType, incrementBy: number = 1): Promise<void> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Try to update existing record
      const { data: existingData, error: fetchError } = await supabase
        .from('usage_tracking')
        .select('id, metric_value')
        .eq('user_id', userId)
        .eq('metric_type', metricType)
        .gte('period_start', monthStart.toISOString())
        .lte('period_end', monthEnd.toISOString())
        .single();

      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('usage_tracking')
          .update({ 
            metric_value: existingData.metric_value + incrementBy,
            updated_at: now.toISOString()
          })
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: userId,
            metric_type: metricType,
            metric_value: incrementBy,
            period_start: monthStart.toISOString(),
            period_end: monthEnd.toISOString()
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.warn('Error incrementing usage (table may not exist):', error);
      // Don't throw - if usage tracking table doesn't exist, just log and continue
      // This allows the app to function without usage tracking
    }
  }

  // Track analytics event
  async trackEvent(
    eventType: AnalyticsEventType,
    userId?: string,
    targetUserId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          user_id: userId || null,
          target_user_id: targetUserId || null,
          metadata: metadata || null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw - analytics failures shouldn't break user experience
    }
  }

  // Get analytics data for a user (Pro/Featured only)
  async getAnalytics(userId: string, timeframe: 'week' | 'month' | 'quarter' = 'month') {
    const userTier = await this.getUserTier(userId);
    
    if (!hasFeature(userTier, 'analytics')) {
      throw new Error('Analytics not available for your subscription tier');
    }

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    try {
      // Get profile views
      const { data: profileViews } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'profile_view')
        .eq('target_user_id', userId)
        .gte('created_at', startDate.toISOString());

      // Get messages received
      const { data: messagesReceived } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'message_received')
        .eq('target_user_id', userId)
        .gte('created_at', startDate.toISOString());

      // Get search appearances
      const { data: searchAppearances } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'search_appearance')
        .eq('target_user_id', userId)
        .gte('created_at', startDate.toISOString());

      const analytics = {
        profile_views: profileViews?.length || 0,
        messages_received: messagesReceived?.length || 0,
        search_appearances: searchAppearances?.length || 0,
        timeframe,
        tier: userTier
      };

      // Advanced analytics for Featured tier
      if (userTier === 'featured') {
        // Add conversion rate calculation
        const conversionRate = analytics.profile_views > 0 
          ? (analytics.messages_received / analytics.profile_views * 100).toFixed(1)
          : '0';

        return {
          ...analytics,
          conversion_rate: `${conversionRate}%`,
          spotlight_data: await this.getSpotlightAnalytics(userId, timeframe)
        };
      }

      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Get spotlight analytics (Featured tier only)
  private async getSpotlightAnalytics(userId: string, timeframe: string) {
    try {
      const { data } = await supabase
        .from('spotlight_rotations')
        .select('clicks, impressions, week_start')
        .eq('user_id', userId)
        .order('week_start', { ascending: false })
        .limit(timeframe === 'quarter' ? 12 : timeframe === 'month' ? 4 : 1);

      return {
        total_clicks: data?.reduce((sum, item) => sum + item.clicks, 0) || 0,
        total_impressions: data?.reduce((sum, item) => sum + item.impressions, 0) || 0,
        weeks_featured: data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching spotlight analytics:', error);
      return { total_clicks: 0, total_impressions: 0, weeks_featured: 0 };
    }
  }

  // Update user's subscription tier
  async updateUserTier(userId: string, newTier: SubscriptionTier, subscriptionId?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          tier_id: newTier,
          status: newTier === 'free' ? 'active' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Track the tier change event
      await this.trackEvent('subscription_upgrade', userId, undefined, {
        new_tier: newTier,
        subscription_id: subscriptionId
      });
    } catch (error) {
      console.error('Error updating user tier:', error);
      throw error;
    }
  }

  // Get feature flags for user's tier
  async getFeatureFlags(userId: string): Promise<Record<string, boolean>> {
    const userTier = await this.getUserTier(userId);
    
    try {
      const { data: flags } = await supabase
        .from('feature_flags')
        .select('id, is_enabled, target_tiers')
        .eq('is_enabled', true);

      const userFlags: Record<string, boolean> = {};
      
      flags?.forEach(flag => {
        userFlags[flag.id] = flag.target_tiers?.includes(userTier) || false;
      });

      return userFlags;
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      return {};
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService(); 