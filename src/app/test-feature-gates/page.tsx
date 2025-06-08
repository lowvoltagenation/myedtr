"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  MessageSquare, 
  BarChart3, 
  Search,
  Star,
  Crown,
  Lock,
  CheckCircle,
  X,
  Loader2
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePortfolioLimits, useMessagingLimits, useAnalyticsAccess, useSearchPriority } from "@/hooks/useFeatureGate";
import { ProtectedUploadButton, ProtectedMessageButton } from "@/components/ui/protected-button";
import { UpgradePrompt, PortfolioUpgradePrompt, MessagingUpgradePrompt, AnalyticsUpgradePrompt } from "@/components/ui/upgrade-prompt";
import { TierBadge } from "@/components/ui/tier-badge";
import { UsageMeter } from "@/components/ui/usage-meter";
import { searchService, EditorResult } from "@/lib/search/search-service";

export default function TestFeatureGatesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<EditorResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const supabase = createClient();

  const subscription = useSubscription(user?.id);
  const portfolioLimits = usePortfolioLimits(user?.id, subscription.tier);
  const messagingLimits = useMessagingLimits(user?.id, subscription.tier);
  const analyticsAccess = useAnalyticsAccess(subscription.tier);
  const searchPriority = useSearchPriority(subscription.tier);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const testSearch = async () => {
    setSearchLoading(true);
    try {
      const results = await searchService.searchEditors('video editor', {}, 10);
      setSearchResults(results.results);
    } catch (error) {
      console.error('Search test failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const testFeature = (featureName: string, available: boolean) => {
    alert(`${featureName}: ${available ? 'Available ✅' : 'Restricted ❌'}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔒 Feature Gates Test Suite
          </h1>
          <p className="text-gray-600 text-lg">
            Phase 3: Feature Gating & Restrictions Demo
          </p>
          {user && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-sm text-gray-600">Current Plan:</span>
              <TierBadge tier={subscription.tier} size="lg" />
            </div>
          )}
        </div>

        {!user && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">Please log in to test feature gating functionality.</p>
              <Button asChild>
                <a href="/auth/login">Log In</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Portfolio Upload Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Portfolio Upload Limits
                </CardTitle>
                <CardDescription>
                  Free: 3 videos max | Pro/Featured: Unlimited
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Current Usage:</span>
                  <span>{portfolioLimits.currentCount} / {portfolioLimits.limit || '∞'}</span>
                </div>

                <UsageMeter
                  metricName="Portfolio Videos"
                  current={portfolioLimits.currentCount}
                  limit={portfolioLimits.limit || null}
                  tier={subscription.tier}
                />

                <ProtectedUploadButton
                  canUpload={portfolioLimits.canUpload}
                  currentTier={subscription.tier}
                  currentCount={portfolioLimits.currentCount}
                  limit={portfolioLimits.limit || 0}
                  onUpload={() => testFeature('Portfolio Upload', true)}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </ProtectedUploadButton>

                {!portfolioLimits.canUpload && subscription.tier === 'free' && (
                  <PortfolioUpgradePrompt 
                    currentCount={portfolioLimits.currentCount}
                    limit={portfolioLimits.limit || 3}
                  />
                )}
              </CardContent>
            </Card>

            {/* Messaging Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messaging Limits
                </CardTitle>
                <CardDescription>
                  Free: 5/month | Pro: 50/month | Featured: Unlimited
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">This Month:</span>
                  <span>{messagingLimits.messagesSent} / {messagingLimits.monthlyLimit || '∞'}</span>
                </div>

                <UsageMeter
                  metricName="Messages Sent"
                  current={messagingLimits.messagesSent}
                  limit={messagingLimits.monthlyLimit || null}
                  tier={subscription.tier}
                />

                <ProtectedMessageButton
                  canSend={messagingLimits.canSend}
                  currentTier={subscription.tier}
                  messagesSent={messagingLimits.messagesSent}
                  limit={messagingLimits.monthlyLimit || 0}
                  onSend={() => testFeature('Send Message', true)}
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </ProtectedMessageButton>

                {!messagingLimits.canSend && (
                  <MessagingUpgradePrompt 
                    messagesSent={messagingLimits.messagesSent}
                    limit={messagingLimits.monthlyLimit || 0}
                  />
                )}
              </CardContent>
            </Card>

            {/* Analytics Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics Access
                </CardTitle>
                <CardDescription>
                  Free: None | Pro: Basic | Featured: Advanced
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Basic Analytics</span>
                    {analyticsAccess.hasBasicAnalytics ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Advanced Analytics</span>
                    {analyticsAccess.hasAdvancedAnalytics ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => testFeature('Analytics Access', analyticsAccess.hasBasicAnalytics)}
                  disabled={!analyticsAccess.hasBasicAnalytics}
                  className="w-full"
                >
                  {!analyticsAccess.hasBasicAnalytics && <Lock className="w-4 h-4 mr-2" />}
                  View Analytics
                </Button>

                {!analyticsAccess.hasBasicAnalytics && (
                  <AnalyticsUpgradePrompt />
                )}
              </CardContent>
            </Card>

            {/* Search Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Priority
                </CardTitle>
                <CardDescription>
                  Free: Low | Pro: High | Featured: Top + Spotlight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Your Priority:</span>
                  <Badge variant={
                    searchPriority.isFeaturedPriority ? 'default' : 
                    searchPriority.isHighPriority ? 'secondary' : 
                    'outline'
                  }>
                    {searchPriority.isFeaturedPriority && <Crown className="w-3 h-3 mr-1" />}
                    {searchPriority.isHighPriority && !searchPriority.isFeaturedPriority && <Star className="w-3 h-3 mr-1" />}
                    {searchPriority.priority}
                  </Badge>
                </div>

                <Button
                  onClick={testSearch}
                  disabled={searchLoading}
                  className="w-full"
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Test Search Ranking
                </Button>

                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Search Results (Priority Order):</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {searchResults.slice(0, 5).map((result, index) => (
                        <div key={result.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm">#{index + 1} {result.name}</span>
                          <TierBadge tier={result.tier_level} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Comparison Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🎯 Feature Comparison by Tier</CardTitle>
            <CardDescription>
              Complete overview of what's available at each subscription level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Feature</th>
                    <th className="text-center p-3">
                      <TierBadge tier="free" size="sm" />
                    </th>
                    <th className="text-center p-3">
                      <TierBadge tier="pro" size="sm" />
                    </th>
                    <th className="text-center p-3">
                      <TierBadge tier="featured" size="sm" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Portfolio Videos</td>
                    <td className="p-3 text-center">3 max</td>
                    <td className="p-3 text-center">Unlimited</td>
                    <td className="p-3 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Messages per Month</td>
                    <td className="p-3 text-center">5</td>
                    <td className="p-3 text-center">50</td>
                    <td className="p-3 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Analytics Access</td>
                    <td className="p-3 text-center">❌</td>
                    <td className="p-3 text-center">Basic</td>
                    <td className="p-3 text-center">Advanced</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Search Priority</td>
                    <td className="p-3 text-center">Low</td>
                    <td className="p-3 text-center">High</td>
                    <td className="p-3 text-center">Featured</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Custom Themes</td>
                    <td className="p-3 text-center">❌</td>
                    <td className="p-3 text-center">✅</td>
                    <td className="p-3 text-center">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Weekly Spotlight</td>
                    <td className="p-3 text-center">❌</td>
                    <td className="p-3 text-center">❌</td>
                    <td className="p-3 text-center">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Video Introduction</td>
                    <td className="p-3 text-center">❌</td>
                    <td className="p-3 text-center">❌</td>
                    <td className="p-3 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Priority Support</td>
                    <td className="p-3 text-center">Community</td>
                    <td className="p-3 text-center">48h Email</td>
                    <td className="p-3 text-center">24h Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {user && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>✅ Phase 3 Implementation Status</CardTitle>
              <CardDescription>
                Feature gating system implementation progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Portfolio Limits</h4>
                  <p className="text-sm text-gray-600">Implemented ✅</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Messaging Limits</h4>
                  <p className="text-sm text-gray-600">Implemented ✅</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Analytics Gating</h4>
                  <p className="text-sm text-gray-600">Implemented ✅</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Search Priority</h4>
                  <p className="text-sm text-gray-600">Implemented ✅</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 