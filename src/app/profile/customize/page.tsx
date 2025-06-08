'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { ThemeSelector } from '@/components/profile/theme-selector';
import { EnhancedProfileEditor } from '@/components/profile/enhanced-profile-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  User, 
  Crown, 
  Settings, 
  Star, 
  Upload,
  Eye,
  BarChart3,
  Save
} from 'lucide-react';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';

export default function ProfileCustomizePage() {
  const { tier, loading: subscriptionLoading } = useSubscription();
  const [activeTab, setActiveTab] = useState('themes');

  if (subscriptionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const canUseThemes = true; // All users can use basic themes
  const canUseEnhancedProfile = ['pro', 'featured'].includes(tier);
  const canUseSpotlight = tier === 'featured';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Customization</h1>
            <p className="text-gray-600">
              Personalize your MyEdtr profile to stand out and attract clients
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={
                  tier === 'featured' 
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : tier === 'pro'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }
              >
                {tier === 'featured' && <Crown className="w-3 h-3 mr-1" />}
                {tier === 'pro' && <Star className="w-3 h-3 mr-1" />}
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {tier === 'free' && 'Upgrade for more customization options'}
              {tier === 'pro' && 'Access to themes and enhanced features'}
              {tier === 'featured' && 'Full access to all premium features'}
            </p>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <FeatureOverviewCard
            icon={<Palette className="w-5 h-5" />}
            title="Profile Themes"
            description="Choose from beautiful themes"
            available={canUseThemes}
            tier="All plans"
          />
          <FeatureOverviewCard
            icon={<User className="w-5 h-5" />}
            title="Enhanced Profile"
            description="Detailed bio, skills, and case studies"
            available={canUseEnhancedProfile}
            tier="Pro+"
          />
          <FeatureOverviewCard
            icon={<Crown className="w-5 h-5" />}
            title="Weekly Spotlight"
            description="Featured on homepage rotation"
            available={canUseSpotlight}
            tier="Featured"
          />
        </div>
      </div>

      {/* Main Customization Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Themes
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2"
            disabled={!canUseEnhancedProfile}
          >
            <User className="w-4 h-4" />
            Enhanced Profile
            {!canUseEnhancedProfile && <Badge variant="outline" className="ml-1 text-xs">Pro+</Badge>}
          </TabsTrigger>
          <TabsTrigger 
            value="spotlight" 
            className="flex items-center gap-2"
            disabled={!canUseSpotlight}
          >
            <Crown className="w-4 h-4" />
            Spotlight
            {!canUseSpotlight && <Badge variant="outline" className="ml-1 text-xs">Featured</Badge>}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          <ThemeSelector />
        </TabsContent>

        {/* Enhanced Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {canUseEnhancedProfile ? (
            <EnhancedProfileEditor />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <User className="w-5 h-5" />
                  Enhanced Profile Features
                </CardTitle>
                <CardDescription>
                  Unlock powerful profile customization with Pro or Featured plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeaturePreview
                      title="Enhanced Bio Sections"
                      description="Multiple bio sections including experience, achievements, and detailed descriptions"
                      tier="Pro+"
                    />
                    <FeaturePreview
                      title="Skills Management"
                      description="Organize and showcase your skills with primary and secondary categories"
                      tier="Pro+"
                    />
                    <FeaturePreview
                      title="Video Introduction"
                      description="Add a personal video introduction to your profile"
                      tier="Featured"
                    />
                    <FeaturePreview
                      title="Case Studies"
                      description="Showcase detailed project case studies with rich content"
                      tier="Featured"
                    />
                  </div>
                  <UpgradePrompt
                    variant="card"
                    feature="enhanced_profile"
                    currentTier={tier}
                    requiredTier="pro"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Spotlight Tab */}
        <TabsContent value="spotlight" className="space-y-6">
          {canUseSpotlight ? (
            <SpotlightConfiguration />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <Crown className="w-5 h-5" />
                  Weekly Spotlight Feature
                </CardTitle>
                <CardDescription>
                  Get featured on MyEdtr's homepage with our exclusive spotlight system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Featured Tier Exclusive</h3>
                    <p className="text-gray-600 mb-4">
                      The Weekly Spotlight feature showcases top editors on our homepage,
                      driving traffic and potential clients to your profile.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Homepage Visibility</h4>
                      <p className="text-sm text-gray-600">Featured prominently on our main page</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <BarChart3 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Analytics Tracking</h4>
                      <p className="text-sm text-gray-600">Detailed view and click metrics</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Priority Placement</h4>
                      <p className="text-sm text-gray-600">Higher search ranking boost</p>
                    </div>
                  </div>

                  <UpgradePrompt
                    variant="card"
                    feature="weekly_spotlight"
                    currentTier={tier}
                    requiredTier="featured"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <ProfileSettings tier={tier} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FeatureOverviewCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  available: boolean;
  tier: string;
}

function FeatureOverviewCard({ icon, title, description, available, tier }: FeatureOverviewCardProps) {
  return (
    <Card className={!available ? 'opacity-75' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={available ? 'text-blue-500' : 'text-gray-400'}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            <Badge 
              variant="outline" 
              className={available ? 'border-green-200 text-green-800' : 'border-gray-200 text-gray-600'}
            >
              {available ? 'Available' : tier}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeaturePreviewProps {
  title: string;
  description: string;
  tier: string;
}

function FeaturePreview({ title, description, tier }: FeaturePreviewProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{title}</h4>
        <Badge variant="outline" className="text-xs">
          {tier}
        </Badge>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function SpotlightConfiguration() {
  const [spotlightData, setSpotlightData] = useState({
    bio: '',
    tags: [],
    isActive: false
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Spotlight Configuration
          </CardTitle>
          <CardDescription>
            Set up your profile for the weekly homepage spotlight rotation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Spotlight Bio</label>
            <textarea
              value={spotlightData.bio}
              onChange={(e) => setSpotlightData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Write a compelling bio for your spotlight feature..."
              className="w-full p-3 border rounded-md resize-none"
              rows={4}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {spotlightData.bio.length}/200 characters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="spotlight-active"
              checked={spotlightData.isActive}
              onChange={(e) => setSpotlightData(prev => ({ ...prev, isActive: e.target.checked }))}
            />
            <label htmlFor="spotlight-active" className="text-sm">
              Enable spotlight rotation (you'll be included in weekly selections)
            </label>
          </div>

          <Button className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Spotlight Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spotlight Performance</CardTitle>
          <CardDescription>Your spotlight statistics and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Times Featured</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Profile Clicks</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0%</div>
              <div className="text-sm text-gray-600">Click Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSettings({ tier }: { tier: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>Control how your profile appears to others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Public Profile</h4>
              <p className="text-sm text-gray-600">Allow your profile to be discovered in searches</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Contact Information</h4>
              <p className="text-sm text-gray-600">Display your contact details to potential clients</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Hourly Rates</h4>
              <p className="text-sm text-gray-600">Display your pricing information on your profile</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription & Billing</CardTitle>
          <CardDescription>Manage your MyEdtr subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Current Plan: {tier}</h4>
              <p className="text-sm text-gray-600">
                {tier === 'free' && 'Basic features with limited customization'}
                {tier === 'pro' && 'Advanced features and customization options'}
                {tier === 'featured' && 'All premium features including spotlight'}
              </p>
            </div>
            <Button variant="outline">
              {tier === 'free' ? 'Upgrade Plan' : 'Manage Billing'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 