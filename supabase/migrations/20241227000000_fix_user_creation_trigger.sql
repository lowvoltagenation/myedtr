-- Fix user creation trigger to properly handle user_type from signup metadata
-- This fixes the 500 error during signup by ensuring the trigger respects the user_type
-- passed during signup instead of hardcoding 'client'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, user_type)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')::user_type
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 