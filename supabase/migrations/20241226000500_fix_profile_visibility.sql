-- Fix profile visibility by allowing public access to basic user info for editors
-- This allows logged-in users to view other editors' public profiles

-- Add a policy to allow reading basic user info for editors with public profiles
CREATE POLICY "Public can view basic editor user info" ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.editor_profiles 
    WHERE editor_profiles.user_id = users.id
  )
); 