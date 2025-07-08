-- Fix RLS policies to enable proper messaging functionality
-- This migration addresses the 406 errors and real-time subscription issues

-- First, drop the existing restrictive policies on users table
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Public can view basic editor user info" ON public.users;

-- Recreate the policies with proper messaging support
-- 1. Allow users to see their own data
CREATE POLICY "Users can view own data" ON public.users 
FOR SELECT USING (auth.uid() = id);

-- 2. Allow public read access to basic editor info (for browsing)
CREATE POLICY "Public can view basic editor user info" ON public.users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.editor_profiles 
    WHERE editor_profiles.user_id = users.id
  )
);

-- 3. NEW: Allow messaging participants to see each other's basic info
-- This is the key fix for the 406 errors - allows clients and editors
-- involved in the same project to see each other's names and avatars
CREATE POLICY "Messaging participants can view each other" ON public.users 
FOR SELECT USING (
  -- Allow if user is involved in any project with the target user
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.project_applications pa ON p.id = pa.project_id
    WHERE pa.status = 'accepted' AND (
      -- Current user is client, target user is the accepted editor
      (p.client_id = auth.uid() AND pa.editor_id = users.id) OR
      -- Current user is editor, target user is the client
      (p.client_id = users.id AND pa.editor_id = auth.uid())
    )
  )
);

-- Optimize the messages table RLS policy for better performance
-- Drop the existing complex policy that was causing subscription timeouts
DROP POLICY IF EXISTS "Messages visible to project participants" ON public.messages;

-- Create a simpler, more efficient policy
CREATE POLICY "Messages visible to project participants" ON public.messages FOR SELECT USING (
  -- User is the sender
  auth.uid() = sender_id OR
  -- User is the client of the project
  auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_id) OR
  -- User is the accepted editor for the project
  auth.uid() IN (SELECT editor_id FROM public.project_applications WHERE project_id = messages.project_id AND status = 'accepted')
);

-- Add indexes for improved RLS policy performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_project_editor ON public.project_applications(project_id, editor_id) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_messages_sender_project ON public.messages(sender_id, project_id);

-- Add index for the new messaging participants policy
CREATE INDEX IF NOT EXISTS idx_project_applications_messaging ON public.project_applications(project_id, editor_id, status);