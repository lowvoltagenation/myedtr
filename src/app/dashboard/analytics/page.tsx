"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Eye, 
  BarChart3, 
  PieChart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import { useAnalyticsAccess } from "@/hooks/useFeatureGate";
import { AnalyticsUpgradePrompt, AdvancedAnalyticsUpgradePrompt } from "@/components/ui/upgrade-prompt";
import { TierBadge } from "@/components/ui/tier-badge";

interface AnalyticsData {
  profileViews: {
    total: number;
    thisWeek: number;
    change: number;
  };
  messages: {
    received: number;
    sent: number;
    thisWeek: number;
    change: number;
  };
  portfolioViews: {
    total: number;
    thisWeek: number;
    change: number;
  };
  engagement: {
    responseRate: number;
    averageResponseTime: number; // in hours
  };
  topSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  peakHours: Array<{
    hour: number;
    views: number;
  }>;
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const subscription = useSubscription(user?.id);
  const analyticsAccess = useAnalyticsAccess(subscription.tier);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadAnalyticsData(session.user.id);
      } else {
        router.push('/auth/login');
      }
    };

    getUser();
  }, []);

  const loadAnalyticsData = async (userId: string) => {
    try {
      // Mock analytics data for now - in production this would query real data
      const mockData: AnalyticsData = {
        profileViews: {
          total: 1247,
          thisWeek: 89,
          change: 12.3
        },
        messages: {
          received: 23,
          sent: 15,
          thisWeek: 8,
          change: -2.1
        },
        portfolioViews: {
          total: 456,
          thisWeek: 34,
          change: 18.7
        },
        engagement: {
          responseRate: 78.5,
          averageResponseTime: 4.2
        },
        topSources: [
          { source: 'Direct Search', visits: 234, percentage: 45.2 },
          { source: 'Featured Listings', visits: 123, percentage: 23.8 },
          { source: 'Social Media', visits: 89, percentage: 17.2 },
          { source: 'Referrals', visits: 71, percentage: 13.8 }
        ],
        peakHours: [
          { hour: 9, views: 45 },
          { hour: 14, views: 52 },
          { hour: 16, views: 38 },
          { hour: 20, views: 41 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Show upgrade prompt for free users
  if (!analyticsAccess.hasBasicAnalytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your profile performance and client engagement</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <AnalyticsUpgradePrompt />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your profile performance and client engagement</p>
            </div>
            <div className="flex items-center gap-3">
              <TierBadge tier={subscription.tier} size="lg" />
              <Link href="/dashboard/editor">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData!.profileViews.total)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {analyticsData!.profileViews.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={analyticsData!.profileViews.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(analyticsData!.profileViews.change)}
                </span>
                <span className="ml-1">this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Received</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData!.messages.received}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {analyticsData!.messages.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={analyticsData!.messages.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(analyticsData!.messages.change)}
                </span>
                <span className="ml-1">this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(analyticsData!.portfolioViews.total)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {analyticsData!.portfolioViews.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={analyticsData!.portfolioViews.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatPercentage(analyticsData!.portfolioViews.change)}
                </span>
                <span className="ml-1">this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData!.engagement.responseRate}%</div>
              <p className="text-xs text-muted-foreground">
                Avg response in {analyticsData!.engagement.averageResponseTime.toFixed(1)} hours
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Traffic Sources
              </CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData!.topSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{source.source}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold">{source.visits}</p>
                      <p className="text-xs text-gray-500">{source.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Analytics - Featured Only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Peak Activity Hours
                {!analyticsAccess.hasAdvancedAnalytics && (
                  <Badge variant="outline" className="ml-2">
                    <Lock className="w-3 h-3 mr-1" />
                    Featured Only
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {analyticsAccess.hasAdvancedAnalytics 
                  ? "When your profile gets the most attention"
                  : "Advanced insights available with Featured plan"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsAccess.hasAdvancedAnalytics ? (
                <div className="space-y-4">
                  {analyticsData!.peakHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {hour.hour}:00 - {hour.hour + 1}:00
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(hour.views / 60) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{hour.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AdvancedAnalyticsUpgradePrompt />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 