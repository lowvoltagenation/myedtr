import { useState } from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpgradePrompt } from "./upgrade-prompt";
import { Lock } from "lucide-react";
import { SubscriptionTier } from "@/types/subscription";

interface ProtectedButtonProps extends ButtonProps {
  feature: string;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  canAccess: boolean;
  upgradeMessage?: string;
  children: React.ReactNode;
  onAuthorizedClick?: () => void;
  showLockIcon?: boolean;
}

export function ProtectedButton({
  feature,
  currentTier,
  requiredTier,
  canAccess,
  upgradeMessage,
  children,
  onAuthorizedClick,
  showLockIcon = true,
  onClick,
  disabled,
  ...props
}: ProtectedButtonProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canAccess) {
      e.preventDefault();
      setShowUpgradeModal(true);
      return;
    }

    if (onAuthorizedClick) {
      onAuthorizedClick();
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <>
      <Button
        {...props}
        onClick={handleClick}
        disabled={disabled}
        className={`${props.className || ''} ${!canAccess ? 'relative' : ''}`}
      >
        {!canAccess && showLockIcon && (
          <Lock className="w-4 h-4 mr-2" />
        )}
        {children}
      </Button>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <UpgradePrompt
            feature={feature}
            currentTier={currentTier}
            requiredTier={requiredTier}
            message={upgradeMessage}
            variant="modal"
            onDismiss={() => setShowUpgradeModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Specialized protected buttons for common features
export function ProtectedUploadButton({
  canUpload,
  currentTier,
  currentCount,
  limit,
  onUpload,
  children,
  ...props
}: {
  canUpload: boolean;
  currentTier: SubscriptionTier;
  currentCount: number;
  limit: number;
  onUpload?: () => void;
  children: React.ReactNode;
} & Omit<ButtonProps, 'onClick'>) {
  return (
    <ProtectedButton
      feature="Portfolio Upload"
      currentTier={currentTier}
      requiredTier="pro"
      canAccess={canUpload}
      upgradeMessage={`You've uploaded ${currentCount}/${limit} videos. Upgrade to Pro for unlimited uploads.`}
      onAuthorizedClick={onUpload}
      {...props}
    >
      {children}
    </ProtectedButton>
  );
}

export function ProtectedMessageButton({
  canSend,
  currentTier,
  messagesSent,
  limit,
  onSend,
  children,
  ...props
}: {
  canSend: boolean;
  currentTier: SubscriptionTier;
  messagesSent: number;
  limit: number;
  onSend?: () => void;
  children: React.ReactNode;
} & Omit<ButtonProps, 'onClick'>) {
  return (
    <ProtectedButton
      feature="Send Message"
      currentTier={currentTier}
      requiredTier={currentTier === 'free' ? 'pro' : 'featured'}
      canAccess={canSend}
      upgradeMessage={`You've sent ${messagesSent}/${limit} messages this month. ${
        currentTier === 'free' 
          ? 'Upgrade to Pro for 50 messages/month.' 
          : 'Upgrade to Featured for unlimited messaging.'
      }`}
      onAuthorizedClick={onSend}
      {...props}
    >
      {children}
    </ProtectedButton>
  );
} 