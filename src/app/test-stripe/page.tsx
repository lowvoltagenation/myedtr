'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, CreditCard, Settings } from "lucide-react";
import { useStripe } from "@/hooks/useStripe";
import { useSubscription } from "@/hooks/useSubscription";
import { createClient } from "@/lib/supabase/client";

// Create supabase client once outside component to prevent recreations
const supabase = createClient();

export default function StripeTestPage() {
  const [user, setUser] = useState<any>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [stripeConfig, setStripeConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);

  const { createCheckoutSession, createPortalSession, loading, error } = useStripe();
  const subscription = useSubscription(user?.id);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []); // Remove supabase from dependency array since it's now stable

  useEffect(() => {
    const fetchStripeConfig = async () => {
      setConfigLoading(true);
      try {
        const response = await fetch('/api/stripe/config');
        if (response.ok) {
          const config = await response.json();
          setStripeConfig(config);
        }
      } catch (error) {
        console.error('Failed to fetch Stripe config:', error);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchStripeConfig();
  }, []);

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

        {stripeConfig && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Stripe Configuration Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    stripeConfig.mode === 'live' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {stripeConfig.mode.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Configured:</span>
                  <span className={`w-3 h-3 rounded-full ${
                    stripeConfig.isConfigured ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Secret Key:</span>
                  <span className={`w-3 h-3 rounded-full ${
                    stripeConfig.hasSecretKey ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Publishable Key:</span>
                  <span className={`w-3 h-3 rounded-full ${
                    stripeConfig.hasPublishableKey ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Webhook Secret:</span>
                  <span className={`w-3 h-3 rounded-full ${
                    stripeConfig.hasWebhookSecret ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Configuration:
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pro Plan:</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {stripeConfig.plans.pro.displayPrice || `$${stripeConfig.plans.pro.amount / 100}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Featured Plan:</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {stripeConfig.plans.featured.displayPrice || `$${stripeConfig.plans.featured.amount / 100}`}
                    </span>
                  </div>
                </div>
                
                {user && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Details:</div>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <div>Pro: {stripeConfig.plans.pro.name} - {stripeConfig.plans.pro.description}</div>
                      <div>Featured: {stripeConfig.plans.featured.name} - {stripeConfig.plans.featured.description}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {!stripeConfig.isConfigured && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <div className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Configuration Issues:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {!stripeConfig.hasSecretKey && (
                      <li>Missing {stripeConfig.mode.toUpperCase()} secret key</li>
                    )}
                    {!stripeConfig.hasPublishableKey && (
                      <li>Missing {stripeConfig.mode.toUpperCase()} publishable key</li>
                    )}
                    {!stripeConfig.hasWebhookSecret && (
                      <li>Missing {stripeConfig.mode.toUpperCase()} webhook secret</li>
                    )}
                  </ul>
                  <div className="mt-2 text-green-600 dark:text-green-400">
                    ✅ Using modern price_data approach - No price IDs needed!
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 