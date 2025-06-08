import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { useMessagingLimits } from "@/hooks/useFeatureGate";
import { useSubscription } from "@/hooks/useSubscription";
import { ProtectedMessageButton } from "@/components/ui/protected-button";
import { MessagingUpgradePrompt } from "@/components/ui/upgrade-prompt";
import { createClient } from "@/lib/supabase/client";

interface MessageComposerProps {
  recipientId: string;
  recipientName: string;
  onMessageSent?: () => void;
  placeholder?: string;
}

export function MessageComposer({
  recipientId,
  recipientName,
  onMessageSent,
  placeholder = "Type your message..."
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  
  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const subscription = useSubscription(user?.id);
  const messagingLimits = useMessagingLimits(user?.id, subscription.tier);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    setError(null);

    try {
      // Insert message
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: message.trim(),
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Increment usage
      await subscription.incrementUsage('messages_sent');
      await messagingLimits.refresh();

      // Clear form and notify parent
      setMessage('');
      onMessageSent?.();

    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Send Message to {recipientName}
        </CardTitle>
        
        {/* Show usage info for free users */}
        {subscription.tier === 'free' && !messagingLimits.loading && (
          <p className="text-sm text-gray-600">
            You have {messagingLimits.monthlyLimit! - messagingLimits.messagesSent} of {messagingLimits.monthlyLimit} messages remaining this month
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          rows={4}
          disabled={sending || !messagingLimits.canSend}
          className={!messagingLimits.canSend ? 'opacity-50' : ''}
        />

        {messagingLimits.canSend ? (
          <Button
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <ProtectedMessageButton
              canSend={messagingLimits.canSend}
              currentTier={subscription.tier}
              messagesSent={messagingLimits.messagesSent}
              limit={messagingLimits.monthlyLimit || 0}
              onSend={sendMessage}
              disabled={!message.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </ProtectedMessageButton>

            {/* Show upgrade prompt */}
            {subscription.tier !== 'featured' && (
              <MessagingUpgradePrompt 
                messagesSent={messagingLimits.messagesSent}
                limit={messagingLimits.monthlyLimit || 0}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 