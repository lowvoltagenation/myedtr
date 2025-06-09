import { SubscriptionTier, TIER_CONFIG } from '@/types/subscription';
import { createClient } from '@/lib/supabase/client';

export interface FeatureAccess {
  canAccess: boolean;
  currentUsage?: number;
  limit?: number | null;
  upgradeRequired?: SubscriptionTier;
  message?: string;
}

// Create supabase client once outside class to prevent recreations
const supabase = createClient();

export class FeatureGate {
  /**
   * Check if user can upload portfolio videos
   */
  async canUploadPortfolio(userId: string, userTier: SubscriptionTier): Promise<FeatureAccess> {
    const tierConfig = TIER_CONFIG[userTier];
    const limit = tierConfig.features.portfolio_limit;

    // Unlimited for pro/featured
    if (limit === null) {
      return { canAccess: true };
    }

    // Count current portfolio videos
    const { count: currentCount, error } = await supabase
      .from('portfolio_videos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking portfolio count:', error);
      return { 
        canAccess: false, 
        message: 'Unable to verify portfolio limit. Please try again.' 
      };
    }

    const currentUsage = currentCount || 0;
    const canAccess = currentUsage < limit;

    return {
      canAccess,
      currentUsage,
      limit,
      upgradeRequired: canAccess ? undefined : 'pro',
      message: canAccess 
        ? `You have ${limit - currentUsage} video upload${limit - currentUsage === 1 ? '' : 's'} remaining`
        : `You've reached your ${limit} video limit. Upgrade to Pro for unlimited uploads.`
    };
  }

  /**
   * Check if user can send messages this month
   */
  async canSendMessage(userId: string, userTier: SubscriptionTier): Promise<FeatureAccess> {
    const tierConfig = TIER_CONFIG[userTier];
    const limit = tierConfig.features.messages_per_month;

    // Unlimited for featured
    if (limit === null) {
      return { canAccess: true };
    }

    // Get current month's message count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: currentCount, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error checking message count:', error);
      return { 
        canAccess: false, 
        message: 'Unable to verify message limit. Please try again.' 
      };
    }

    const currentUsage = currentCount || 0;
    const canAccess = currentUsage < limit;

    return {
      canAccess,
      currentUsage,
      limit,
      upgradeRequired: canAccess ? undefined : (userTier === 'free' ? 'pro' : 'featured'),
      message: canAccess 
        ? `You have ${limit - currentUsage} message${limit - currentUsage === 1 ? '' : 's'} remaining this month`
        : `You've reached your ${limit} monthly message limit. ${userTier === 'free' ? 'Upgrade to Pro for 50 messages/month' : 'Upgrade to Featured for unlimited messaging'}.`
    };
  }

  /**
   * Check if user can access analytics
   */
  canAccessAnalytics(userTier: SubscriptionTier): FeatureAccess {
    const tierConfig = TIER_CONFIG[userTier];
    const analyticsLevel = tierConfig.features.analytics;

    if (analyticsLevel === false) {
      return {
        canAccess: false,
        upgradeRequired: 'pro',
        message: 'Analytics are available with Pro and Featured plans. Upgrade to see detailed insights about your profile performance.'
      };
    }

    return { canAccess: true };
  }

  /**
   * Check if user can access advanced analytics
   */
  canAccessAdvancedAnalytics(userTier: SubscriptionTier): FeatureAccess {
    const tierConfig = TIER_CONFIG[userTier];
    const analyticsLevel = tierConfig.features.analytics;

    if (analyticsLevel !== 'advanced') {
      return {
        canAccess: false,
        upgradeRequired: 'featured',
        message: 'Advanced analytics with insights and trends are available with the Featured plan.'
      };
    }

    return { canAccess: true };
  }

  /**
   * Check if user can use custom themes
   */
  canUseCustomThemes(userTier: SubscriptionTier): FeatureAccess {
    const tierConfig = TIER_CONFIG[userTier];

    if (!tierConfig.features.custom_themes) {
      return {
        canAccess: false,
        upgradeRequired: 'pro',
        message: 'Custom profile themes are available with Pro and Featured plans.'
      };
    }

    return { canAccess: true };
  }

  /**
   * Check if user gets spotlight features
   */
  canAccessSpotlight(userTier: SubscriptionTier): FeatureAccess {
    const tierConfig = TIER_CONFIG[userTier];

    if (!tierConfig.features.spotlight) {
      return {
        canAccess: false,
        upgradeRequired: 'featured',
        message: 'Weekly editor spotlight is exclusive to Featured plan members.'
      };
    }

    return { canAccess: true };
  }

  /**
   * Check if user can add video introductions
   */
  canAddVideoIntro(userTier: SubscriptionTier): FeatureAccess {
    const tierConfig = TIER_CONFIG[userTier];

    if (!tierConfig.features.video_intro) {
      return {
        canAccess: false,
        upgradeRequired: 'featured',
        message: 'Video introduction capability is available with the Featured plan.'
      };
    }

    return { canAccess: true };
  }

  /**
   * Check if user has early access to features
   */
  hasEarlyAccess(userTier: SubscriptionTier): FeatureAccess {
    const tierConfig = TIER_CONFIG[userTier];

    if (!tierConfig.features.early_access) {
      return {
        canAccess: false,
        upgradeRequired: 'featured',
        message: 'Early access to new features is available with the Featured plan.'
      };
    }

    return { canAccess: true };
  }

  /**
   * Get search priority level for user
   */
  getSearchPriority(userTier: SubscriptionTier): 'low' | 'high' | 'featured' {
    const tierConfig = TIER_CONFIG[userTier];
    return tierConfig.features.search_priority;
  }

  /**
   * Get support level for user
   */
  getSupportLevel(userTier: SubscriptionTier): 'community' | 'email_48h' | 'priority_24h' {
    const tierConfig = TIER_CONFIG[userTier];
    return tierConfig.features.support;
  }

  /**
   * Check multiple features at once
   */
  async checkMultipleFeatures(
    userId: string, 
    userTier: SubscriptionTier, 
    features: Array<'portfolio' | 'messaging' | 'analytics' | 'advanced_analytics' | 'custom_themes' | 'spotlight' | 'video_intro' | 'early_access'>
  ): Promise<Record<string, FeatureAccess>> {
    const results: Record<string, FeatureAccess> = {};

    for (const feature of features) {
      switch (feature) {
        case 'portfolio':
          results[feature] = await this.canUploadPortfolio(userId, userTier);
          break;
        case 'messaging':
          results[feature] = await this.canSendMessage(userId, userTier);
          break;
        case 'analytics':
          results[feature] = this.canAccessAnalytics(userTier);
          break;
        case 'advanced_analytics':
          results[feature] = this.canAccessAdvancedAnalytics(userTier);
          break;
        case 'custom_themes':
          results[feature] = this.canUseCustomThemes(userTier);
          break;
        case 'spotlight':
          results[feature] = this.canAccessSpotlight(userTier);
          break;
        case 'video_intro':
          results[feature] = this.canAddVideoIntro(userTier);
          break;
        case 'early_access':
          results[feature] = this.hasEarlyAccess(userTier);
          break;
      }
    }

    return results;
  }
}

// Create singleton instance
export const featureGate = new FeatureGate(); 