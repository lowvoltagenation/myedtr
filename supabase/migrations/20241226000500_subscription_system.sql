-- Create subscription system tables
-- This migration adds the core subscription infrastructure for the 3-tier system (Free, Pro, Featured)

-- Subscription tiers configuration table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
    id text PRIMARY KEY,
    name text NOT NULL,
    price_monthly integer NOT NULL, -- in cents
    stripe_price_id text,
    features jsonb NOT NULL DEFAULT '{}',
    limits jsonb NOT NULL DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tier_level text NOT NULL DEFAULT 'free' CHECK (tier_level IN ('free', 'pro', 'featured')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
    stripe_customer_id text,
    stripe_subscription_id text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Usage tracking table for feature limits
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    metric_type text NOT NULL, -- 'portfolio_uploads', 'messages_sent', 'analytics_views'
    metric_value integer NOT NULL DEFAULT 0,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_tier_level_idx ON public.subscriptions(tier_level);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS usage_tracking_user_id_idx ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_metric_type_idx ON public.usage_tracking(metric_type);
CREATE INDEX IF NOT EXISTS usage_tracking_period_idx ON public.usage_tracking(period_start, period_end);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (public read access)
CREATE POLICY "subscription_tiers_select_policy" ON public.subscription_tiers
    FOR SELECT USING (true);

-- RLS Policies for subscriptions (users can only see their own)
CREATE POLICY "subscriptions_select_policy" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_policy" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_policy" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for usage_tracking (users can only see their own)
CREATE POLICY "usage_tracking_select_policy" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usage_tracking_insert_policy" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_tracking_update_policy" ON public.usage_tracking
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_subscription_tiers_updated_at BEFORE UPDATE ON public.subscription_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default tier configurations
INSERT INTO public.subscription_tiers (id, name, price_monthly, features, limits) VALUES
('free', 'Free', 0, 
 '{"portfolio_samples": 3, "messaging": "limited", "analytics": false, "search_priority": "low", "themes": 1, "custom_css": false, "enhanced_profile": false}',
 '{"portfolio_uploads": 3, "messages_per_month": 5, "analytics_access": false}'),
('pro', 'Pro', 2900,
 '{"portfolio_samples": "unlimited", "messaging": "standard", "analytics": "basic", "search_priority": "high", "themes": 3, "custom_css": true, "enhanced_profile": true, "banner_upload": true}',
 '{"portfolio_uploads": -1, "messages_per_month": 50, "analytics_access": "basic"}'),
('featured', 'Featured', 5900,
 '{"portfolio_samples": "unlimited", "messaging": "unlimited", "analytics": "advanced", "search_priority": "top", "themes": 5, "custom_css": true, "enhanced_profile": true, "banner_upload": true, "video_introduction": true, "case_studies": true, "spotlight": true}',
 '{"portfolio_uploads": -1, "messages_per_month": -1, "analytics_access": "advanced"}')
ON CONFLICT (id) DO NOTHING;

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, tier_level, status)
    VALUES (NEW.id, 'free', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create subscription for new users
CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Function to get user tier
CREATE OR REPLACE FUNCTION public.get_user_tier(user_uuid uuid)
RETURNS text AS $$
DECLARE
    user_tier text;
BEGIN
    SELECT tier_level INTO user_tier
    FROM public.subscriptions
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(user_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check feature access
CREATE OR REPLACE FUNCTION public.user_can_access_feature(user_uuid uuid, feature_name text)
RETURNS boolean AS $$
DECLARE
    user_tier text;
    tier_features jsonb;
    can_access boolean DEFAULT false;
BEGIN
    -- Get user tier
    SELECT tier_level INTO user_tier
    FROM public.subscriptions
    WHERE user_id = user_uuid;
    
    -- Default to free if no subscription found
    user_tier := COALESCE(user_tier, 'free');
    
    -- Get tier features
    SELECT features INTO tier_features
    FROM public.subscription_tiers
    WHERE id = user_tier;
    
    -- Check if feature is available
    IF tier_features ? feature_name THEN
        can_access := (tier_features ->> feature_name)::boolean;
    END IF;
    
    RETURN can_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 