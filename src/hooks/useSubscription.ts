'use client';

import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '@/lib/subscription';
import { SubscriptionTier, MetricType } from '@/types/subscription';
import { createClient } from '@/lib/supabase/client';

interface UseSubscriptionResult {
  tier: SubscriptionTier;
  loading: boolean;
  error: string | null;
  canAccess: (requiredTier: SubscriptionTier) => boolean;
  hasFeature: (feature: string) => boolean;
  checkUsageLimit: (metricType: MetricType) => Promise<{
    canPerform: boolean;
    currentUsage: number;
    limit: number | null;
  }>;
  incrementUsage: (metricType: MetricType) => Promise<void>;
  trackEvent: (eventType: string, metadata?: any) => Promise<void>;
  refreshTier: () => Promise<void>;
}

export function useSubscription(userId?: string): UseSubscriptionResult {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  const loadTierData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [userTier, flags] = await Promise.all([
        subscriptionService.getUserTier(userId),
        subscriptionService.getFeatureFlags(userId)
      ]);
      
      setTier(userTier);
      setFeatureFlags(flags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
      console.error('Error loading subscription data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTierData();
  }, [loadTierData]);

  // Listen for subscription changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Subscription change detected:', payload);
          loadTierData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadTierData, supabase]);

  const canAccess = useCallback((requiredTier: SubscriptionTier): boolean => {
    const tierHierarchy = { free: 0, pro: 1, featured: 2 };
    return tierHierarchy[tier] >= tierHierarchy[requiredTier];
  }, [tier]);

  const hasFeature = useCallback((feature: string): boolean => {
    return featureFlags[feature] || false;
  }, [featureFlags]);

  const checkUsageLimit = useCallback(async (metricType: MetricType) => {
    if (!userId) {
      return { canPerform: false, currentUsage: 0, limit: 0 };
    }

    try {
      const result = await subscriptionService.canPerformAction(userId, metricType);
      return {
        canPerform: result.canPerform,
        currentUsage: result.currentUsage,
        limit: result.limit
      };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { canPerform: false, currentUsage: 0, limit: 0 };
    }
  }, [userId]);

  const incrementUsage = useCallback(async (metricType: MetricType) => {
    if (!userId) return;

    try {
      await subscriptionService.incrementUsage(userId, metricType);
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }, [userId]);

  const trackEvent = useCallback(async (eventType: string, metadata?: any) => {
    if (!userId) return;

    try {
      await subscriptionService.trackEvent(eventType as any, userId, undefined, metadata);
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw - analytics failures shouldn't break UX
    }
  }, [userId]);

  const refreshTier = useCallback(async () => {
    await loadTierData();
  }, [loadTierData]);

  return {
    tier,
    loading,
    error,
    canAccess,
    hasFeature,
    checkUsageLimit,
    incrementUsage,
    trackEvent,
    refreshTier
  };
}

// Hook for getting subscription info without real-time updates
export function useSubscriptionInfo(userId?: string) {
  const [data, setData] = useState<{
    tier: SubscriptionTier;
    tierInfo: any;
    loading: boolean;
  }>({
    tier: 'free',
    tierInfo: null,
    loading: true
  });

  useEffect(() => {
    if (!userId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const loadData = async () => {
      try {
        const userTier = await subscriptionService.getUserTier(userId);
        const tierInfo = await fetch('/api/subscription/tiers').then(r => r.json());
        
        setData({
          tier: userTier,
          tierInfo: tierInfo.find((t: any) => t.id === userTier),
          loading: false
        });
      } catch (error) {
        console.error('Error loading subscription info:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, [userId]);

  return data;
} 