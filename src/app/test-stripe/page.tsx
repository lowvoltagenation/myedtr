'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, CreditCard, Settings } from "lucide-react";
import { useStripe } from "@/hooks/useStripe";
import { useSubscription } from "@/hooks/useSubscription";
import { createClient } from "@/lib/supabase/client";

export default function StripeTestPage() {
  const [user, setUser] = useState<any>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const { createCheckoutSession, createPortalSession, loading, error } = useStripe();
  const subscription = useSubscription(user?.id);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const testAPI = async (testName: string, apiCall: () => Promise<any>) => {
    setTesting(prev => ({ ...prev, [testName]: true }));
    try {
      await apiCall();
      setTestResults(prev => ({ ...prev, [testName]: true }));
    } catch (err) {
      console.error(`${testName} failed:`, err);
      setTestResults(prev => ({ ...prev, [testName]: false }));
    } finally {
      setTesting(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testCheckoutSession = () => testAPI('checkout', async () => {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'pro',
        successUrl: `${window.location.origin}/pricing?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      }),
    });
    if (!response.ok) throw new Error('Checkout session creation failed');
    const data = await response.json();
    if (!data.url) throw new Error('No checkout URL returned');
  });

  const testPortalSession = () => testAPI('portal', async () => {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/settings`,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      if (data.error === 'No active subscription found') {
        throw new Error('Expected error for user without subscription');
      }
      throw new Error('Portal session creation failed');
    }
  });

  const testSubscriptionHook = () => testAPI('subscription-hook', async () => {
    if (subscription.loading) throw new Error('Subscription still loading');
    if (!['free', 'pro', 'featured'].includes(subscription.tier)) {
      throw new Error(`Invalid tier: ${subscription.tier}`);
    }
  });

  const testTierEndpoint = () => testAPI('tier-endpoint', async () => {
    const response = await fetch('/api/subscription/tiers');
    if (!response.ok) throw new Error('Tiers endpoint failed');
    const data = await response.json();
    if (!Array.isArray(data) || data.length !== 3) {
      throw new Error('Invalid tiers data');
    }
  });

  const runAllTests = async () => {
    if (!user) return;
    await Promise.all([
      testCheckoutSession(),
      testPortalSession(),
      testSubscriptionHook(),
      testTierEndpoint(),
    ]);
  };

  const getTestIcon = (testName: string) => {
    if (testing[testName]) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (testResults[testName] === true) return <Check className="w-4 h-4 text-green-500" />;
    if (testResults[testName] === false) return <X className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to test Stripe integration</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Stripe Integration Test Suite
          </h1>
          <p className="text-gray-600">
            Phase 2 Testing - Verify all Stripe components are working
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <div className="flex items-center gap-2">
                  <strong>Subscription Tier:</strong>
                  <Badge>{subscription.tier}</Badge>
                </div>
                <p><strong>Loading:</strong> {subscription.loading ? 'Yes' : 'No'}</p>
                {subscription.error && (
                  <p className="text-red-600"><strong>Error:</strong> {subscription.error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                API endpoint and integration tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Checkout Session API</span>
                  {getTestIcon('checkout')}
                </div>
                <div className="flex items-center justify-between">
                  <span>Portal Session API</span>
                  {getTestIcon('portal')}
                </div>
                <div className="flex items-center justify-between">
                  <span>Subscription Hook</span>
                  {getTestIcon('subscription-hook')}
                </div>
                <div className="flex items-center justify-between">
                  <span>Tiers Endpoint</span>
                  {getTestIcon('tier-endpoint')}
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button 
                  onClick={runAllTests} 
                  className="w-full"
                  disabled={Object.values(testing).some(Boolean)}
                >
                  {Object.values(testing).some(Boolean) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    'Run All Tests'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Stripe Actions</CardTitle>
              <CardDescription>
                Test actual Stripe integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={() => createCheckoutSession('pro')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Test Pro Checkout
                </Button>
                
                <Button 
                  onClick={() => createCheckoutSession('featured')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Test Featured Checkout
                </Button>
                
                <Button 
                  onClick={createPortalSession}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Test Customer Portal
                </Button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Check */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Status</CardTitle>
              <CardDescription>
                Required configuration check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Publishable Key</span>
                  {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 
                    <Check className="w-4 h-4 text-green-500" /> : 
                    <X className="w-4 h-4 text-red-500" />
                  }
                </div>
                <div className="flex items-center justify-between">
                  <span>User Authenticated</span>
                  {user ? 
                    <Check className="w-4 h-4 text-green-500" /> : 
                    <X className="w-4 h-4 text-red-500" />
                  }
                </div>
                <div className="flex items-center justify-between">
                  <span>Subscription Hook</span>
                  {!subscription.loading ? 
                    <Check className="w-4 h-4 text-green-500" /> : 
                    <Loader2 className="w-4 h-4 animate-spin" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose text-sm">
              <ol className="space-y-2">
                <li><strong>Environment Setup:</strong> Ensure all Stripe environment variables are configured</li>
                <li><strong>Run Tests:</strong> Click "Run All Tests" to verify API endpoints</li>
                <li><strong>Test Checkout:</strong> Use test card numbers to verify payment flow</li>
                <li><strong>Check Webhooks:</strong> Monitor Stripe Dashboard for webhook delivery</li>
                <li><strong>Verify Database:</strong> Check Supabase for subscription updates</li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Test Card:</strong> 4242424242424242 | <strong>Expiry:</strong> Any future date | <strong>CVC:</strong> Any 3 digits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 