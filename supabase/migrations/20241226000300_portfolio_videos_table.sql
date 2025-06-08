-- Create portfolio_videos table for tracking video uploads
CREATE TABLE IF NOT EXISTS portfolio_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  video_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  video_type VARCHAR(50), -- 'youtube', 'vimeo', 'direct_upload', etc.
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE portfolio_videos ENABLE ROW LEVEL SECURITY;

-- Users can read their own portfolio videos
CREATE POLICY "Users can read own portfolio videos" ON portfolio_videos
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own portfolio videos (subject to usage limits)
CREATE POLICY "Users can insert own portfolio videos" ON portfolio_videos
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolio videos
CREATE POLICY "Users can update own portfolio videos" ON portfolio_videos
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own portfolio videos
CREATE POLICY "Users can delete own portfolio videos" ON portfolio_videos
FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access for viewing portfolios
CREATE POLICY "Public read access to portfolio videos" ON portfolio_videos
FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_portfolio_videos_user_id ON portfolio_videos(user_id);
CREATE INDEX idx_portfolio_videos_created_at ON portfolio_videos(created_at);
CREATE INDEX idx_portfolio_videos_featured ON portfolio_videos(is_featured);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portfolio_videos_updated_at 
    BEFORE UPDATE ON portfolio_videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 