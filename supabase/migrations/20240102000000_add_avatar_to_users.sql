-- Add avatar_url to users table for client avatars
ALTER TABLE public.users 
ADD COLUMN avatar_url TEXT;

-- Add name column to users table for display names
ALTER TABLE public.users 
ADD COLUMN name VARCHAR(255); 