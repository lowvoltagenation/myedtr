'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

// Create supabase client once outside component to prevent recreations
const supabase = createClient();

export function useSubscription(userId?: string): UseSubscriptionResult {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  
  // Circuit breaker to prevent infinite loops
  const errorCount = useRef(0);
  const lastErrorTime = useRef<number>(0);
  const isLoadingRef = useRef(false);

  // Reset circuit breaker after 30 seconds
  const resetCircuitBreaker = useCallback(() => {
    if (Date.now() - lastErrorTime.current > 30000) {
      errorCount.current = 0;
    }
  }, []);

  // Wrap in useCallback to prevent recreation on every render
  const loadTierData = useCallback(async () => {
    if (!userId || isLoadingRef.current) {
      setLoading(false);
      return;
    }

    // Circuit breaker: stop trying if too many errors
    resetCircuitBreaker();
    if (errorCount.current >= 3) {
      console.warn('Circuit breaker active: too many subscription errors');
      setError('Subscription service temporarily unavailable');
      setLoading(false);
      return;
    }

    isLoadingRef.current = true;

    try {
      setError(null);
      
      const [userTier, flags] = await Promise.all([
        subscriptionService.getUserTier(userId).catch(err => {
          console.warn('Failed to get user tier:', err);
          return 'free' as SubscriptionTier;
        }),
        subscriptionService.getFeatureFlags(userId).catch(err => {
          console.warn('Failed to get feature flags:', err);
          return {};
        })
      ]);
      
      setTier(userTier);
      setFeatureFlags(flags);
      
      // Reset error count on success
      errorCount.current = 0;
    } catch (err) {
      errorCount.current++;
      lastErrorTime.current = Date.now();
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription data';
      setError(errorMessage);
      console.error('Error loading subscription data:', err);
      
      // Set safe defaults to prevent further issues
      setTier('free');
      setFeatureFlags({});
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [userId, resetCircuitBreaker]);

  // Load tier data when userId changes
  useEffect(() => {
    if (userId) {
      loadTierData();
    } else {
      setLoading(false);
      setTier('free');
      setFeatureFlags({});
      setError(null);
    }
  }, [userId, loadTierData]);

  // Listen for subscription changes with error protection
  useEffect(() => {
    if (!userId || errorCount.current >= 3) return;

    let channel: any = null;

    try {
      channel = supabase
        .channel(`subscription-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log('Subscription change detected:', payload);
            try {
              // Add delay to prevent rapid fire updates
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              if (!isLoadingRef.current) {
                await loadTierData();
              }
            } catch (error) {
              console.error('Error reloading tier data from realtime listener:', error);
              // Don't throw - just log the error to prevent infinite loops
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Realtime subscription error:', status);
            errorCount.current++;
          }
        });

    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      errorCount.current++;
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      }
    };
  }, [userId, loadTierData]);

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
    if (errorCount.current < 3) {
      await loadTierData();
    }
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
        const [userTier, tierInfoResponse] = await Promise.all([
          subscriptionService.getUserTier(userId),
          fetch('/api/subscription/tiers').then(r => r.json()).catch(() => [])
        ]);
        
        setData({
          tier: userTier,
          tierInfo: Array.isArray(tierInfoResponse) ? tierInfoResponse.find((t: any) => t.id === userTier) : null,
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