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
  const subscriptionRef = useRef<any>(null);

  // SAFETY: If there are too many errors, disable subscription functionality entirely
  const [disableSubscriptions, setDisableSubscriptions] = useState(false);

  // Reset circuit breaker after 30 seconds
  const resetCircuitBreaker = useCallback(() => {
    if (Date.now() - lastErrorTime.current > 30000) {
      errorCount.current = 0;
    }
  }, []);

  // Wrap in useCallback to prevent recreation on every render
  const loadTierData = useCallback(async () => {
    if (!userId || isLoadingRef.current || disableSubscriptions) {
      setLoading(false);
      return;
    }

    // Circuit breaker: stop trying if too many errors
    resetCircuitBreaker();
    if (errorCount.current >= 3) {
      console.warn('Subscription system disabled due to repeated errors');
      setDisableSubscriptions(true);
      setError(null); // Clear error to prevent UI issues
      setTier('free'); // Safe default
      setLoading(false);
      return;
    }

    isLoadingRef.current = true;

    try {
      setError(null);
      
      const [userTier, flags] = await Promise.all([
        subscriptionService.getUserTier(userId).catch(err => {
          console.warn('Failed to get user tier, using default:', err);
          return 'free' as SubscriptionTier;
        }),
        subscriptionService.getFeatureFlags(userId).catch(err => {
          console.warn('Failed to get feature flags, using defaults:', err);
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
      
      console.warn('Subscription error, using safe defaults:', err);
      
      // Set safe defaults to prevent further issues
      setTier('free');
      setFeatureFlags({});
      setError(null); // Don't show errors to users - just use defaults
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [userId, resetCircuitBreaker, disableSubscriptions]);

  // Stable callback for realtime updates
  const handleRealtimeUpdate = useCallback(async (payload: any) => {
    console.log('Subscription change detected:', payload);
    try {
      // Add delay to prevent rapid fire updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isLoadingRef.current && userId) {
        // Call loadTierData directly without depending on the callback
        isLoadingRef.current = true;
        try {
          const [userTier, flags] = await Promise.all([
            subscriptionService.getUserTier(userId).catch(() => 'free' as SubscriptionTier),
            subscriptionService.getFeatureFlags(userId).catch(() => ({}))
          ]);
          
          setTier(userTier);
          setFeatureFlags(flags);
        } catch (error) {
          console.error('Error in realtime update:', error);
        } finally {
          isLoadingRef.current = false;
        }
      }
    } catch (error) {
      console.error('Error reloading tier data from realtime listener:', error);
    }
  }, [userId]);

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
    // TEMPORARILY DISABLED: Realtime subscriptions are causing infinite loops and production crashes
    // TODO: Re-implement realtime subscriptions with proper error handling later
    console.log('Realtime subscriptions temporarily disabled to prevent infinite loops');
    return;

    if (!userId || errorCount.current >= 3) return;

    // Clean up existing subscription first
    if (subscriptionRef.current) {
      try {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      } catch (error) {
        console.error('Error removing existing channel:', error);
      }
    }

    try {
      const channel = supabase
        .channel(`subscription-changes-${userId}-${Date.now()}`) // Add timestamp to ensure uniqueness
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${userId}`
          },
          handleRealtimeUpdate
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.warn('Realtime subscription issue:', status);
            errorCount.current++;
            
            // If realtime fails, continue without it - don't block other functionality
            if (subscriptionRef.current) {
              try {
                supabase.removeChannel(subscriptionRef.current);
                subscriptionRef.current = null;
              } catch (error) {
                console.error('Error cleaning up failed subscription:', error);
              }
            }
            
            // Schedule retry with exponential backoff if under error limit
            if (errorCount.current < 3) {
              const retryDelay = Math.min(1000 * Math.pow(2, errorCount.current), 30000); // Max 30 seconds
              console.log(`Retrying realtime subscription in ${retryDelay}ms`);
              setTimeout(() => {
                if (errorCount.current < 3 && userId) {
                  console.log('Retrying realtime subscription setup');
                  // Trigger re-setup by updating a dependency (but this would cause infinite loops)
                  // Instead, we'll just log and let the user continue without realtime
                }
              }, retryDelay);
            }
          }
        });

      subscriptionRef.current = channel;

    } catch (error) {
      console.warn('Error setting up realtime subscription - continuing without realtime updates:', error);
      errorCount.current++;
      // Don't throw or block - let the app continue without realtime subscription
    }

    return () => {
      if (subscriptionRef.current) {
        try {
          supabase.removeChannel(subscriptionRef.current);
          subscriptionRef.current = null;
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      }
    };
  }, [userId, handleRealtimeUpdate]); // Only depend on userId and stable callback

  const canAccess = useCallback((requiredTier: SubscriptionTier): boolean => {
    const tierHierarchy = { free: 0, pro: 1, featured: 2 };
    return tierHierarchy[tier] >= tierHierarchy[requiredTier];
  }, [tier]);

  const hasFeature = useCallback((feature: string): boolean => {
    return featureFlags[feature] || false;
  }, [featureFlags]);

  const checkUsageLimit = useCallback(async (metricType: MetricType) => {
    if (!userId || disableSubscriptions) {
      return { canPerform: true, currentUsage: 0, limit: null };
    }

    try {
      const result = await subscriptionService.canPerformAction(userId, metricType);
      return {
        canPerform: result.canPerform,
        currentUsage: result.currentUsage,
        limit: result.limit
      };
    } catch (error) {
      console.warn('Error checking usage limit, allowing action:', error);
      return { canPerform: true, currentUsage: 0, limit: null };
    }
  }, [userId, disableSubscriptions]);

  const incrementUsage = useCallback(async (metricType: MetricType) => {
    if (!userId || disableSubscriptions) return;

    try {
      await subscriptionService.incrementUsage(userId, metricType);
    } catch (error) {
      console.warn('Error incrementing usage (non-blocking):', error);
      // Don't throw - analytics failures shouldn't break UX
    }
  }, [userId, disableSubscriptions]);

  const trackEvent = useCallback(async (eventType: string, metadata?: any) => {
    if (!userId || disableSubscriptions) return;

    try {
      await subscriptionService.trackEvent(eventType as any, userId, undefined, metadata);
    } catch (error) {
      console.warn('Error tracking event (non-blocking):', error);
      // Don't throw - analytics failures shouldn't break UX
    }
  }, [userId, disableSubscriptions]);

  const refreshTier = useCallback(async () => {
    if (errorCount.current < 3 && !disableSubscriptions && userId) {
      console.log('🔄 Refreshing subscription data...');
      
      try {
        // First try to sync with Stripe directly (useful for test mode)
        const response = await fetch('/api/stripe/sync-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Subscription synced with Stripe:', result);
          
          // Wait a moment for database to update, then refresh local data
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.warn('⚠️ Stripe sync failed, falling back to local refresh');
        }
      } catch (error) {
        console.warn('⚠️ Stripe sync error, falling back to local refresh:', error);
      }
      
      // Always refresh local data after sync attempt
      await loadTierData();
    }
  }, [loadTierData, disableSubscriptions, userId]);

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