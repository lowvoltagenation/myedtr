"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function DebugSubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      // Get subscription data
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      setSubscriptionData(subData);

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        throw userError;
      }

      setUserData(userData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncWithStripe = async () => {
    setSyncing(true);
    setSyncResult(null);
    setError(null);

    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Sync failed');
      }

      setSyncResult(result);
      
      // Reload data after sync
      await loadData();
    } catch (err: any) {
      setError(err.message);
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <p>Please log in to debug subscription</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subscription Debug</h1>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={syncWithStripe} disabled={syncing}>
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync with Stripe
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="py-4">
              <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {syncResult && (
          <Card className={syncResult.success ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {syncResult.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Sync Successful
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    Sync Failed
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(syncResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">User ID:</span>
                <span className="font-mono text-sm">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              {userData && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">User Type:</span>
                    <Badge>{userData.user_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{userData.name || 'Not set'}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Data</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Tier:</span>
                  <Badge className={subscriptionData.tier_id === 'pro' ? 'bg-purple-600' : ''}>{subscriptionData.tier_id}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={subscriptionData.status === 'active' ? 'default' : 'secondary'}>{subscriptionData.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Stripe Customer ID:</span>
                  <span className="font-mono text-xs">{subscriptionData.stripe_customer_id || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Stripe Subscription ID:</span>
                  <span className="font-mono text-xs">{subscriptionData.stripe_subscription_id || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Current Period End:</span>
                  <span>{subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end).toLocaleDateString() : 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Updated At:</span>
                  <span>{new Date(subscriptionData.updated_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No subscription data found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <details>
              <summary className="cursor-pointer text-sm font-medium mb-2">View raw subscription data</summary>
              <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {JSON.stringify(subscriptionData, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}