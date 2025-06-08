'use client';

import { useState } from 'react';
import { useThemeCustomization } from '@/hooks/useThemeCustomization';
import { useSubscription } from '@/hooks/useSubscription';
import { CustomTheme } from '@/lib/themes/theme-system';
import { SubscriptionTier } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';

interface ThemeSelectorProps {
  onThemeChange?: (theme: CustomTheme) => void;
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { tier } = useSubscription();
  const {
    availableThemes,
    activeTheme,
    isLoading,
    error,
    switchTheme,
    canUseCustomCSS,
    canUseCustomBanner,
    canUseAdvancedLayouts
  } = useThemeCustomization();

  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'featured':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'pro':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'featured':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pro':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleThemeSelect = async (themeId: string) => {
    setSelectedTheme(themeId);
    setIsSwitching(true);

    try {
      await switchTheme(themeId);
      const theme = availableThemes.find(t => t.id === themeId);
      if (theme && onThemeChange) {
        onThemeChange(theme);
      }
    } catch (error) {
      console.error('Failed to switch theme:', error);
    } finally {
      setIsSwitching(false);
      setSelectedTheme(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading themes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error loading themes</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Profile Themes
          </CardTitle>
          <CardDescription>
            Choose a theme that reflects your style. {canUseCustomCSS && 'You can also customize colors and add CSS.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableThemes.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isActive={activeTheme?.id === theme.id}
                isSelected={selectedTheme === theme.id}
                isSwitching={isSwitching && selectedTheme === theme.id}
                onSelect={() => handleThemeSelect(theme.id)}
                getTierIcon={getTierIcon}
                getTierColor={getTierColor}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard
          title="Custom Colors & CSS"
          description="Personalize your profile with custom colors and CSS styling"
          available={canUseCustomCSS}
          tier="pro"
          currentTier={tier}
          icon={<Sparkles className="w-5 h-5" />}
        />
        <FeatureCard
          title="Custom Banner"
          description="Upload your own banner image to make your profile stand out"
          available={canUseCustomBanner}
          tier="pro"
          currentTier={tier}
          icon={<Crown className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}

interface ThemePreviewCardProps {
  theme: CustomTheme;
  isActive: boolean;
  isSelected: boolean;
  isSwitching: boolean;
  onSelect: () => void;
  getTierIcon: (tier: string) => React.ReactElement;
  getTierColor: (tier: string) => string;
}

function ThemePreviewCard({
  theme,
  isActive,
  isSelected,
  isSwitching,
  onSelect,
  getTierIcon,
  getTierColor
}: ThemePreviewCardProps) {
  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
      isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
    } ${isSelected ? 'scale-105' : 'hover:scale-105'}`}>
      <CardContent className="p-0">
        {/* Theme Preview */}
        <div 
          className="h-32 rounded-t-lg border-b relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
          }}
        >
          {/* Mock profile elements */}
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white/80" 
               style={{ backgroundColor: theme.colors.accent }}></div>
          <div className="absolute top-2 right-2">
            <Badge className={getTierColor(theme.tier)}>
              {getTierIcon(theme.tier)}
              <span className="ml-1 capitalize">{theme.tier}</span>
            </Badge>
          </div>
          
          {/* Mock content bars */}
          <div className="absolute bottom-2 left-2 right-2 space-y-1">
            <div className="h-2 rounded" style={{ backgroundColor: theme.colors.surface, opacity: 0.9 }}></div>
            <div className="h-2 rounded w-3/4" style={{ backgroundColor: theme.colors.surface, opacity: 0.7 }}></div>
          </div>
        </div>

        {/* Theme Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">{theme.name}</h3>
            {isActive && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </div>
          <p className="text-xs text-gray-600 mb-3">{theme.description}</p>
          
          {/* Color palette preview */}
          <div className="flex gap-1 mb-3">
            {Object.entries(theme.colors).slice(0, 4).map(([key, color]) => (
              <div
                key={key}
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
                title={key}
              ></div>
            ))}
          </div>

          <Button
            onClick={onSelect}
            disabled={isSwitching || isActive}
            size="sm"
            variant={isActive ? "secondary" : "default"}
            className="w-full"
          >
            {isSwitching ? (
              <>
                <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-2"></div>
                Applying...
              </>
            ) : isActive ? (
              'Active'
            ) : (
              'Select Theme'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  available: boolean;
  tier: 'pro' | 'featured';
  currentTier: SubscriptionTier;
  icon: React.ReactNode;
}

function FeatureCard({ title, description, available, tier, currentTier, icon }: FeatureCardProps) {
  if (available) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-green-500">{icon}</div>
            <div>
              <h4 className="font-medium text-sm mb-1">{title}</h4>
              <p className="text-xs text-gray-600">{description}</p>
              <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                Available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="opacity-75">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-gray-400">{icon}</div>
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1 text-gray-600">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
            <UpgradePrompt
              variant="banner"
              feature={`custom_${title.toLowerCase().replace(' ', '_')}`}
              currentTier={currentTier}
              requiredTier={tier}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 