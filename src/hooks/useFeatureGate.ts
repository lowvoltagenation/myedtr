import { useState, useEffect, useCallback } from 'react';
import { FeatureAccess, featureGate } from '@/lib/feature-gates';
import { SubscriptionTier } from '@/types/subscription';

// Hook for checking a single feature
export function useFeatureAccess(
  userId?: string,
  userTier?: SubscriptionTier,
  feature?: 'portfolio' | 'messaging' | 'analytics' | 'advanced_analytics' | 'custom_themes' | 'spotlight' | 'video_intro' | 'early_access'
) {
  const [access, setAccess] = useState<FeatureAccess>({ canAccess: false });
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    if (!userId || !userTier || !feature) {
      setLoading(false);
      return;
    }

    try {
      let result: FeatureAccess;

      switch (feature) {
        case 'portfolio':
          result = await featureGate.canUploadPortfolio(userId, userTier);
          break;
        case 'messaging':
          result = await featureGate.canSendMessage(userId, userTier);
          break;
        case 'analytics':
          result = featureGate.canAccessAnalytics(userTier);
          break;
        case 'advanced_analytics':
          result = featureGate.canAccessAdvancedAnalytics(userTier);
          break;
        case 'custom_themes':
          result = featureGate.canUseCustomThemes(userTier);
          break;
        case 'spotlight':
          result = featureGate.canAccessSpotlight(userTier);
          break;
        case 'video_intro':
          result = featureGate.canAddVideoIntro(userTier);
          break;
        case 'early_access':
          result = featureGate.hasEarlyAccess(userTier);
          break;
        default:
          result = { canAccess: false };
      }

      setAccess(result);
    } catch (error) {
      console.error('Error checking feature access:', error);
      setAccess({ 
        canAccess: false, 
        message: 'Unable to verify feature access. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  }, [userId, userTier, feature]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const refresh = useCallback(async () => {
    if (!userId || !userTier || !feature) return;
    setLoading(true);
    await checkAccess();
    setLoading(false);
  }, [userId, userTier, feature, checkAccess]);

  return { access, loading, refresh };
}

// Hook for checking multiple features at once
export function useMultipleFeatures(
  userId?: string,
  userTier?: SubscriptionTier,
  features?: Array<'portfolio' | 'messaging' | 'analytics' | 'advanced_analytics' | 'custom_themes' | 'spotlight' | 'video_intro' | 'early_access'>
) {
  const [access, setAccess] = useState<Record<string, FeatureAccess>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!userId || !userTier || !features || features.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const results = await featureGate.checkMultipleFeatures(userId, userTier, features);
        setAccess(results);
      } catch (error) {
        console.error('Error checking multiple features:', error);
        // Set all features to no access on error
        const errorResults: Record<string, FeatureAccess> = {};
        features.forEach(feature => {
          errorResults[feature] = { 
            canAccess: false, 
            message: 'Unable to verify feature access. Please try again.' 
          };
        });
        setAccess(errorResults);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [userId, userTier, features]);

  return { access, loading };
}

// Hook specifically for portfolio upload limits
export function usePortfolioLimits(userId?: string, userTier?: SubscriptionTier) {
  const { access, loading, refresh } = useFeatureAccess(userId, userTier, 'portfolio');

  return {
    canUpload: access.canAccess,
    currentCount: access.currentUsage || 0,
    limit: access.limit,
    message: access.message,
    upgradeRequired: access.upgradeRequired,
    loading,
    refresh
  };
}

// Hook specifically for messaging limits
export function useMessagingLimits(userId?: string, userTier?: SubscriptionTier) {
  const { access, loading, refresh } = useFeatureAccess(userId, userTier, 'messaging');

  return {
    canSend: access.canAccess,
    messagesSent: access.currentUsage || 0,
    monthlyLimit: access.limit,
    message: access.message,
    upgradeRequired: access.upgradeRequired,
    loading,
    refresh
  };
}

// Hook for analytics access
export function useAnalyticsAccess(userTier?: SubscriptionTier) {
  const basicAccess = featureGate.canAccessAnalytics(userTier || 'free');
  const advancedAccess = featureGate.canAccessAdvancedAnalytics(userTier || 'free');

  return {
    hasBasicAnalytics: basicAccess.canAccess,
    hasAdvancedAnalytics: advancedAccess.canAccess,
    basicUpgradeRequired: basicAccess.upgradeRequired,
    advancedUpgradeRequired: advancedAccess.upgradeRequired,
    basicMessage: basicAccess.message,
    advancedMessage: advancedAccess.message
  };
}

// Hook for search priority
export function useSearchPriority(userTier?: SubscriptionTier) {
  const priority = featureGate.getSearchPriority(userTier || 'free');
  
  return {
    priority,
    isLowPriority: priority === 'low',
    isHighPriority: priority === 'high', 
    isFeaturedPriority: priority === 'featured'
  };
} 