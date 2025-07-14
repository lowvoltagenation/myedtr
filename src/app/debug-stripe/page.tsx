"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';

interface StripeDebugInfo {
  mode: 'test' | 'live';
  isConfigured: boolean;
  hasSecretKey: boolean;
  hasPublishableKey: boolean;
  hasClientPublishableKey: boolean;
  hasWebhookSecret: boolean;
  requiresPriceIds: boolean;
  usesPriceData: boolean;
  timestamp: string;
  message: string;
}

// Manual subscription sync component
function SubscriptionSyncTool() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      console.log('🔄 Starting subscription sync...');
      
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Sync API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      let result;
      try {
        result = await response.json();
        console.log('📋 Sync API Result:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        setSyncError(`Failed to parse response: ${response.status} ${response.statusText}`);
        return;
      }

      if (response.ok) {
        setSyncResult(result);
        console.log('✅ Subscription sync successful:', result);
        
        // Trigger a page refresh or reload subscription data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorMessage = result?.error || `HTTP ${response.status}: ${response.statusText}`;
        setSyncError(errorMessage);
        console.error('❌ Subscription sync failed:', {
          status: response.status,
          result,
          errorMessage
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setSyncError(errorMessage);
      console.error('❌ Subscription sync network error:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-muted-foreground">
        This will query Stripe directly and sync your subscription status with the database.
        Useful when webhooks aren't working in test mode.
      </div>
      
      <Button 
        onClick={handleSync} 
        disabled={syncing}
        className="w-full"
      >
        {syncing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Syncing with Stripe...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Sync Subscription Now
          </>
        )}
      </Button>

      {syncResult && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            ✅ Sync Successful
          </h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <div><strong>Message:</strong> {syncResult.message}</div>
            {syncResult.subscription && (
              <>
                <div><strong>Status:</strong> {syncResult.subscription.status}</div>
                {syncResult.subscription.plan && (
                  <div><strong>Plan:</strong> {syncResult.subscription.plan}</div>
                )}
                {syncResult.subscription.tier && (
                  <div><strong>Tier:</strong> {syncResult.subscription.tier}</div>
                )}
              </>
            )}
          </div>
          <div className="mt-3 text-xs text-green-600 dark:text-green-400">
            💡 Page will refresh automatically in 2 seconds to show updated status.
          </div>
        </div>
      )}

      {syncError && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            ❌ Sync Failed
          </h4>
          <div className="text-sm text-red-700 dark:text-red-300">
            {syncError}
          </div>
        </div>
      )}
    </div>
  );
}

// Current subscription status display
function CurrentSubscriptionStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function getUser() {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  // Always call the hook, but pass null if no user - this avoids Rules of Hooks violation
  const subscription = useSubscription(user?.id || null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="ml-2 text-sm">Loading user...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-sm text-gray-600 dark:text-muted-foreground">
        Not logged in
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm space-y-2">
        <div><strong>User:</strong> {user.email}</div>
        <div><strong>Current Tier:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            subscription.tier === 'free' ? 'bg-gray-100 text-gray-700' :
            subscription.tier === 'pro' ? 'bg-blue-100 text-blue-700' :
            subscription.tier === 'featured' ? 'bg-purple-100 text-purple-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {subscription.loading ? 'Loading...' : subscription.tier}
          </span>
        </div>
      </div>
      
      {subscription.tier === 'free' && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
          ⚠️ If you just made a payment, use the sync button above to update your status.
        </div>
      )}
    </div>
  );
}

export default function DebugStripePage() {
  const [debugInfo, setDebugInfo] = useState<StripeDebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/debug');
      if (!response.ok) {
        throw new Error('Failed to fetch debug info');
      }
      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean }) => 
    status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );

  const StatusBadge = ({ status }: { status: boolean }) => (
    <Badge variant={status ? "default" : "destructive"}>
      {status ? 'Configured' : 'Missing'}
    </Badge>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-lg">Loading Stripe configuration...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
            <AlertDescription className="text-red-700 dark:text-red-300">
              Error loading Stripe configuration: {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Stripe Configuration Debug
            </h1>
            <p className="text-gray-600 dark:text-muted-foreground mt-2">
              Modern price_data approach - No manual product setup required
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/pricing')}>
              Test Pricing Page
            </Button>
            <Button onClick={fetchDebugInfo} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </div>

        {debugInfo && (
          <div className="space-y-6">
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon status={debugInfo.isConfigured} />
                  Overall Status
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Current mode: <Badge variant="outline">{debugInfo.mode}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {debugInfo.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
                  Last updated: {new Date(debugInfo.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Configuration Status */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>
                  Required environment variables for {debugInfo.mode} mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.hasSecretKey} />
                      <span className="text-sm">Secret Key</span>
                    </div>
                    <StatusBadge status={debugInfo.hasSecretKey} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.hasPublishableKey} />
                      <span className="text-sm">Publishable Key</span>
                    </div>
                    <StatusBadge status={debugInfo.hasPublishableKey} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.hasClientPublishableKey} />
                      <span className="text-sm">Client Publishable Key</span>
                    </div>
                    <StatusBadge status={debugInfo.hasClientPublishableKey} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={debugInfo.hasWebhookSecret} />
                      <span className="text-sm">Webhook Secret</span>
                    </div>
                    <StatusBadge status={debugInfo.hasWebhookSecret} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Subscription Sync Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Manual Subscription Sync
                </CardTitle>
                <CardDescription>
                  Force sync subscription status with Stripe (useful for test mode)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionSyncTool />
              </CardContent>
            </Card>

            {/* Current Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Current Subscription Status
                </CardTitle>
                <CardDescription>
                  Display of your current subscription tier based on Stripe data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CurrentSubscriptionStatus />
              </CardContent>
            </Card>

            {/* Modern Approach Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Modern Stripe Integration
                </CardTitle>
                <CardDescription>
                  Using price_data approach - No manual product setup required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      ✅ Benefits of Modern Approach:
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• No need to create products in Stripe dashboard</li>
                      <li>• No price ID environment variables required</li>
                      <li>• Pricing is defined inline using price_data</li>
                      <li>• Easier to maintain and update</li>
                      <li>• Works in both test and live modes seamlessly</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      💡 Current Plan Configuration:
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <div>• <strong>MyEdtr Pro:</strong> $29/month - Core professional features</div>
                      <div>• <strong>MyEdtr Featured:</strong> $59/month - Premium tier with maximum visibility</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
                <CardDescription>
                  How to configure Stripe for {debugInfo.mode} mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debugInfo.isConfigured ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        ✅ Stripe is properly configured!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You can now test payment flows. The system will automatically create products 
                        and prices using the modern price_data approach.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        ⚠️ Configuration Required
                      </h4>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                        <p>Follow these steps to configure Stripe:</p>
                        <ol className="list-decimal list-inside space-y-1 pl-4">
                          <li>Go to your Stripe dashboard</li>
                          <li>Copy your {debugInfo.mode} mode API keys</li>
                          <li>Add the missing environment variables to your .env.local file</li>
                          <li>Restart your development server</li>
                        </ol>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(`https://dashboard.stripe.com${debugInfo.mode === 'test' ? '/test' : ''}/apikeys`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Stripe Dashboard
                    </Button>
                    {debugInfo.isConfigured && (
                      <Button onClick={() => router.push('/pricing')}>
                        Test Payment Flow
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables Template */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables Template</CardTitle>
                <CardDescription>
                  Copy these to your .env.local file (replace with your actual keys)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
{`# Stripe Configuration
STRIPE_MODE=${debugInfo.mode}

# ${debugInfo.mode.charAt(0).toUpperCase() + debugInfo.mode.slice(1)} mode keys
STRIPE_${debugInfo.mode.toUpperCase()}_SECRET_KEY=sk_${debugInfo.mode}_...
STRIPE_${debugInfo.mode.toUpperCase()}_PUBLISHABLE_KEY=pk_${debugInfo.mode}_...
NEXT_PUBLIC_STRIPE_${debugInfo.mode.toUpperCase()}_PUBLISHABLE_KEY=pk_${debugInfo.mode}_...
STRIPE_${debugInfo.mode.toUpperCase()}_WEBHOOK_SECRET=whsec_...

# Note: No price IDs needed with modern approach!`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 