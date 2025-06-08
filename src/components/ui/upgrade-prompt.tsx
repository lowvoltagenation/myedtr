import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, ArrowRight, X, Lock } from "lucide-react";
import { SubscriptionTier } from "@/types/subscription";
import { TierBadge } from "./tier-badge";
import Link from "next/link";

interface UpgradePromptProps {
  feature: string;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  message?: string;
  onDismiss?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'banner' | 'modal';
}

export function UpgradePrompt({
  feature,
  currentTier,
  requiredTier,
  message,
  onDismiss,
  size = 'md',
  variant = 'card'
}: UpgradePromptProps) {
  const getTierInfo = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro':
        return {
          name: 'Pro',
          price: '$29/month',
          icon: Star,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'featured':
        return {
          name: 'Featured',
          price: '$59/month',
          icon: Crown,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          name: 'Free',
          price: 'Free',
          icon: Lock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const tierInfo = getTierInfo(requiredTier);
  const Icon = tierInfo.icon;

  const sizeClasses = {
    sm: 'text-sm p-3',
    md: 'text-base p-4',
    lg: 'text-lg p-6'
  };

  if (variant === 'banner') {
    return (
      <div className={`${tierInfo.bgColor} ${tierInfo.borderColor} border rounded-lg ${sizeClasses[size]} relative`}>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${tierInfo.color} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <p className={`font-medium ${tierInfo.color}`}>
              {feature} requires {tierInfo.name} plan
            </p>
            {message && (
              <p className="text-gray-600 text-sm mt-1">{message}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Link href="/pricing">
                <Button size="sm" className="text-xs">
                  Upgrade to {tierInfo.name}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
              <span className="text-xs text-gray-500">{tierInfo.price}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${tierInfo.bgColor}`}>
              <Icon className={`w-8 h-8 ${tierInfo.color}`} />
            </div>
          </div>
          <CardTitle className="text-xl">
            Upgrade to {tierInfo.name}
          </CardTitle>
          <CardDescription>
            {feature} is available with the {tierInfo.name} plan
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {message && (
            <p className="text-gray-600 text-sm">{message}</p>
          )}
          
          <div className="flex items-center justify-center gap-2">
            <TierBadge tier={requiredTier} size="lg" />
            <span className="text-lg font-semibold">{tierInfo.price}</span>
          </div>
          
          <div className="flex gap-2">
            {onDismiss && (
              <Button variant="outline" onClick={onDismiss} className="flex-1">
                Maybe Later
              </Button>
            )}
            <Link href="/pricing" className="flex-1">
              <Button className="w-full">
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default card variant
  return (
    <Card className={`${tierInfo.borderColor} border ${sizeClasses[size]}`}>
      <CardContent className="p-0">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            style={{ position: 'absolute' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${tierInfo.bgColor} flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${tierInfo.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 mb-1">
              {feature} requires {tierInfo.name}
            </h4>
            
            {message && (
              <p className="text-gray-600 text-sm mb-3">{message}</p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TierBadge tier={requiredTier} size="sm" />
                <span className="text-sm font-medium">{tierInfo.price}</span>
              </div>
              
              <Link href="/pricing">
                <Button size="sm" variant="outline">
                  Upgrade
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized components for common use cases
export function PortfolioUpgradePrompt({ currentCount, limit }: { currentCount: number; limit: number }) {
  return (
    <UpgradePrompt
      feature="Unlimited Portfolio Uploads"
      currentTier="free"
      requiredTier="pro"
      message={`You've uploaded ${currentCount}/${limit} videos. Upgrade to Pro for unlimited portfolio uploads.`}
      variant="banner"
    />
  );
}

export function MessagingUpgradePrompt({ messagesSent, limit }: { messagesSent: number; limit: number }) {
  return (
    <UpgradePrompt
      feature="More Messages"
      currentTier="free"
      requiredTier="pro"
      message={`You've sent ${messagesSent}/${limit} messages this month. Upgrade to Pro for 50 messages/month.`}
      variant="banner"
    />
  );
}

export function AnalyticsUpgradePrompt() {
  return (
    <UpgradePrompt
      feature="Analytics Dashboard"
      currentTier="free"
      requiredTier="pro"
      message="Track your profile views, message stats, and performance metrics with Pro analytics."
      variant="card"
    />
  );
}

export function AdvancedAnalyticsUpgradePrompt() {
  return (
    <UpgradePrompt
      feature="Advanced Analytics"
      currentTier="pro"
      requiredTier="featured"
      message="Get detailed insights, trends, and competitor analysis with Featured plan analytics."
      variant="card"
    />
  );
} 