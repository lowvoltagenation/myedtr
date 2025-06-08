-- User theme settings table
CREATE TABLE IF NOT EXISTS user_theme_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    active_theme_id TEXT NOT NULL DEFAULT 'basic',
    custom_colors JSONB,
    custom_layout JSONB,
    custom_typography JSONB,
    custom_css TEXT,
    is_custom_theme_enabled BOOLEAN DEFAULT false,
    banner_image_url TEXT,
    logo_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_user_theme_settings UNIQUE (user_id)
);

-- Enhanced profile data table
CREATE TABLE IF NOT EXISTS enhanced_profile_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Enhanced bio sections
    bio_headline TEXT,
    bio_description TEXT,
    bio_experience TEXT,
    bio_achievements TEXT,
    
    -- Skills and expertise
    skills_primary TEXT[], -- Array of primary skills
    skills_secondary TEXT[], -- Array of secondary skills
    expertise_level TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
    years_experience INTEGER,
    
    -- Video introduction (Featured tier only)
    intro_video_url TEXT,
    intro_video_title TEXT,
    intro_video_description TEXT,
    
    -- Case studies (Featured tier only)
    case_studies JSONB DEFAULT '[]'::jsonb,
    
    -- Social links and contact
    social_links JSONB DEFAULT '{}'::jsonb,
    contact_preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Professional info
    current_position TEXT,
    company TEXT,
    location TEXT,
    availability_status TEXT DEFAULT 'available', -- available, busy, unavailable
    hourly_rate DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    
    -- Profile customization flags
    show_experience BOOLEAN DEFAULT true,
    show_skills BOOLEAN DEFAULT true,
    show_achievements BOOLEAN DEFAULT true,
    show_contact_info BOOLEAN DEFAULT true,
    show_rates BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_enhanced_profile UNIQUE (user_id)
);

-- Profile banners table for custom banner management
CREATE TABLE IF NOT EXISTS profile_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banner_url TEXT NOT NULL,
    banner_name TEXT,
    banner_description TEXT,
    is_active BOOLEAN DEFAULT false,
    file_size INTEGER,
    file_type TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT valid_file_type CHECK (file_type IN ('image/jpeg', 'image/png', 'image/webp'))
);

-- Skills taxonomy table for standardized skills
CREATE TABLE IF NOT EXISTS skills_taxonomy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- design, development, marketing, etc.
    subcategory TEXT,
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User spotlight configuration (Featured tier only)
CREATE TABLE IF NOT EXISTS user_spotlight_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_eligible BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    spotlight_bio TEXT,
    spotlight_image_url TEXT,
    featured_work_ids UUID[], -- References to portfolio items
    spotlight_tags TEXT[],
    priority_score INTEGER DEFAULT 0,
    last_featured_date TIMESTAMP WITH TIME ZONE,
    total_spotlight_views INTEGER DEFAULT 0,
    total_spotlight_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_user_spotlight UNIQUE (user_id)
);

-- Spotlight rotation schedule
CREATE TABLE IF NOT EXISTS spotlight_rotation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rotation_week DATE NOT NULL, -- Week starting date
    position INTEGER NOT NULL, -- 1-5 for 5 spotlight positions
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed')),
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_week_position UNIQUE (rotation_week, position)
);

-- Create indexes for performance
CREATE INDEX idx_user_theme_settings_user_id ON user_theme_settings(user_id);
CREATE INDEX idx_enhanced_profile_user_id ON enhanced_profile_data(user_id);
CREATE INDEX idx_enhanced_profile_skills ON enhanced_profile_data USING GIN (skills_primary, skills_secondary);
CREATE INDEX idx_profile_banners_user_id ON profile_banners(user_id);
CREATE INDEX idx_profile_banners_active ON profile_banners(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_skills_taxonomy_category ON skills_taxonomy(category);
CREATE INDEX idx_skills_taxonomy_usage ON skills_taxonomy(usage_count DESC);
CREATE INDEX idx_user_spotlight_eligible ON user_spotlight_config(is_eligible, is_active) WHERE is_eligible = true;
CREATE INDEX idx_spotlight_rotation_week ON spotlight_rotation(rotation_week);
CREATE INDEX idx_spotlight_rotation_status ON spotlight_rotation(status);

-- RLS Policies

-- User theme settings policies
ALTER TABLE user_theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own theme settings"
    ON user_theme_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own theme settings"
    ON user_theme_settings FOR ALL
    USING (auth.uid() = user_id);

-- Enhanced profile data policies
ALTER TABLE enhanced_profile_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enhanced profile"
    ON enhanced_profile_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view public enhanced profiles"
    ON enhanced_profile_data FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own enhanced profile"
    ON enhanced_profile_data FOR ALL
    USING (auth.uid() = user_id);

-- Profile banners policies
ALTER TABLE profile_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own banners"
    ON profile_banners FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active banners"
    ON profile_banners FOR SELECT
    USING (is_active = true);

-- Skills taxonomy policies
ALTER TABLE skills_taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view skills taxonomy"
    ON skills_taxonomy FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify skills taxonomy"
    ON skills_taxonomy FOR ALL
    USING (false); -- Will be handled by admin functions

-- User spotlight policies
ALTER TABLE user_spotlight_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own spotlight config"
    ON user_spotlight_config FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active spotlights"
    ON user_spotlight_config FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can update their own spotlight config"
    ON user_spotlight_config FOR ALL
    USING (auth.uid() = user_id);

-- Spotlight rotation policies
ALTER TABLE spotlight_rotation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view spotlight rotation"
    ON spotlight_rotation FOR SELECT
    USING (true);

CREATE POLICY "Only system can manage spotlight rotation"
    ON spotlight_rotation FOR ALL
    USING (false); -- Will be handled by scheduled functions

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_theme_settings_updated_at
    BEFORE UPDATE ON user_theme_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_profile_data_updated_at
    BEFORE UPDATE ON enhanced_profile_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_spotlight_config_updated_at
    BEFORE UPDATE ON user_spotlight_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default skills into taxonomy
INSERT INTO skills_taxonomy (skill_name, category, subcategory, description, is_verified) VALUES
-- Design skills
('Video Editing', 'design', 'video', 'Professional video editing and post-production', true),
('Motion Graphics', 'design', 'video', 'Animated graphics and visual effects', true),
('Color Grading', 'design', 'video', 'Color correction and grading for video', true),
('Cinematography', 'design', 'video', 'Camera work and visual storytelling', true),
('Audio Editing', 'design', 'audio', 'Audio post-production and sound design', true),
('3D Animation', 'design', 'video', '3D modeling and animation', true),
('UI/UX Design', 'design', 'digital', 'User interface and experience design', true),
('Graphic Design', 'design', 'digital', 'Visual design and branding', true),
('Photography', 'design', 'visual', 'Photography and photo editing', true),
('Illustration', 'design', 'visual', 'Digital and traditional illustration', true),

-- Development skills
('Frontend Development', 'development', 'web', 'Client-side web development', true),
('Backend Development', 'development', 'web', 'Server-side development', true),
('Mobile Development', 'development', 'mobile', 'iOS and Android app development', true),
('Database Design', 'development', 'data', 'Database architecture and optimization', true),
('API Development', 'development', 'web', 'RESTful and GraphQL API development', true),

-- Marketing skills
('Content Marketing', 'marketing', 'content', 'Content strategy and creation', true),
('Social Media', 'marketing', 'social', 'Social media management and strategy', true),
('SEO', 'marketing', 'digital', 'Search engine optimization', true),
('Brand Strategy', 'marketing', 'branding', 'Brand development and strategy', true),
('Copywriting', 'marketing', 'content', 'Marketing and sales copywriting', true)

ON CONFLICT (skill_name) DO NOTHING; 