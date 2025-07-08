"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ContactEditorButtonProps {
  editorId: string;
  editorName: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
}

export function ContactEditorButton({ 
  editorId, 
  editorName, 
  className = "",
  size = "lg",
  variant = "default"
}: ContactEditorButtonProps) {
  const [loading, setLoading] = useState(false);
  const [existingConversations, setExistingConversations] = useState<any[]>([]);
  const { user, isClient, isAuthenticated } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (isAuthenticated && isClient && user?.id) {
      checkExistingConversations();
    }
  }, [isAuthenticated, isClient, user?.id, editorId]);

  const checkExistingConversations = async () => {
    if (!user?.id) return;

    try {
      // Check for existing projects where this client has worked with this editor
      const { data: conversations } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          status,
          project_applications!inner (
            editor_id,
            status
          ),
          messages (
            id
          )
        `)
        .eq('client_id', user.id)
        .eq('project_applications.editor_id', editorId)
        .eq('project_applications.status', 'accepted')
        .not('messages', 'is', null);

      if (conversations) {
        setExistingConversations(conversations);
      }
    } catch (error) {
      console.error('Error checking conversations:', error);
    }
  };

  const handleContactEditor = async () => {
    setLoading(true);

    try {
      // Check authentication
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Only clients can contact editors
      if (!isClient) {
        // If user is an editor, redirect to browse projects or show message
        router.push('/dashboard/editor/browse-projects');
        return;
      }

      // If there are existing conversations, go to the most recent one
      if (existingConversations.length > 0) {
        const mostRecentProject = existingConversations[0];
        router.push(`/messages/${mostRecentProject.id}`);
        return;
      }

      // If no existing conversations, redirect to post a project
      // We could potentially pre-fill the editor preference or add a query param
      router.push(`/dashboard/client/post-project?preferred_editor=${editorId}`);

    } catch (error) {
      console.error('Error handling contact editor:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show different text based on state
  const getButtonText = () => {
    if (!isAuthenticated) return "Contact Editor";
    if (!isClient) return "View Projects";
    if (existingConversations.length > 0) return "Continue Conversation";
    return "Start Project";
  };

  const getButtonIcon = () => {
    if (existingConversations.length > 0) {
      return <MessageCircle className="w-4 h-4 mr-2" />;
    }
    return <Plus className="w-4 h-4 mr-2" />;
  };

  return (
    <Button 
      size={size}
      variant={variant}
      className={`w-full md:w-auto ${className}`}
      onClick={handleContactEditor}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        getButtonIcon()
      )}
      {loading ? "Loading..." : getButtonText()}
    </Button>
  );
}