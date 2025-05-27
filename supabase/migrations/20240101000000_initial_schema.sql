-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_type AS ENUM ('editor', 'client');
CREATE TYPE tier_level AS ENUM ('free', 'pro', 'premium');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE project_status AS ENUM ('open', 'assigned', 'in_progress', 'completed', 'cancelled');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_type user_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create editor_profiles table
CREATE TABLE public.editor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    specialties TEXT[],
    portfolio_urls TEXT[],
    tier_level tier_level DEFAULT 'free',
    availability_status availability_status DEFAULT 'available',
    avatar_url TEXT,
    website_url TEXT,
    location VARCHAR(255),
    years_experience INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10, 2),
    deadline TIMESTAMPTZ,
    status project_status DEFAULT 'open',
    video_style VARCHAR(255),
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_applications table for editor applications
CREATE TABLE public.project_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    editor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    proposed_rate DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, editor_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_editor_profiles_updated_at BEFORE UPDATE ON public.editor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Editor profiles are publicly readable, but only editable by owner
CREATE POLICY "Editor profiles are publicly readable" ON public.editor_profiles FOR SELECT USING (true);
CREATE POLICY "Editors can manage own profile" ON public.editor_profiles FOR ALL USING (auth.uid() = user_id);

-- Projects are publicly readable, but only manageable by client
CREATE POLICY "Projects are publicly readable" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Clients can manage own projects" ON public.projects FOR ALL USING (auth.uid() = client_id);

-- Messages are only visible to project participants
CREATE POLICY "Messages visible to project participants" ON public.messages FOR SELECT USING (
    auth.uid() IN (
        SELECT client_id FROM public.projects WHERE id = project_id
        UNION
        SELECT editor_id FROM public.project_applications WHERE project_id = messages.project_id AND status = 'accepted'
    )
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews are publicly readable
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Project applications
CREATE POLICY "Applications visible to relevant parties" ON public.project_applications FOR SELECT USING (
    auth.uid() = editor_id OR 
    auth.uid() IN (SELECT client_id FROM public.projects WHERE id = project_id)
);
CREATE POLICY "Editors can apply to projects" ON public.project_applications FOR INSERT WITH CHECK (auth.uid() = editor_id);
CREATE POLICY "Editors can update own applications" ON public.project_applications FOR UPDATE USING (auth.uid() = editor_id);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, user_type)
    VALUES (NEW.id, NEW.email, 'client'); -- Default to client, can be changed later
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record when auth.users is inserted
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_editor_profiles_user_id ON public.editor_profiles(user_id);
CREATE INDEX idx_editor_profiles_tier_level ON public.editor_profiles(tier_level);
CREATE INDEX idx_editor_profiles_availability ON public.editor_profiles(availability_status);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_messages_project_id ON public.messages(project_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_project_applications_project_id ON public.project_applications(project_id);
CREATE INDEX idx_project_applications_editor_id ON public.project_applications(editor_id); 