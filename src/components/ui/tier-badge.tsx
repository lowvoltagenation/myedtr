import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";
import { SubscriptionTier } from "@/types/subscription";

interface TierBadgeProps {
  tier: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = 'md', showIcon = true, className = '' }: TierBadgeProps) {
  const getBadgeConfig = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'featured':
        return {
          label: 'MyEdtr Verified',
          icon: Crown,
          className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg',
          iconColor: 'text-yellow-300'
        };
      case 'pro':
        return {
          label: 'Pro',
          icon: Star,
          className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none shadow-md',
          iconColor: 'text-blue-100'
        };
      case 'free':
      default:
        return {
          label: 'Free',
          icon: Zap,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          iconColor: 'text-gray-500'
        };
    }
  };

  const config = getBadgeConfig(tier);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${config.className} ${sizeClasses[size]} ${className} inline-flex items-center gap-1.5 font-medium`}
    >
      {showIcon && (
        <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      )}
      {config.label}
    </Badge>
  );
} 