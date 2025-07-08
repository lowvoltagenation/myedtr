export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          user_type: 'editor' | 'client'
          avatar_url: string | null
          name: string | null
          bio: string | null
          location: string | null
          current_tier_id: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          user_type: 'editor' | 'client'
          avatar_url?: string | null
          name?: string | null
          bio?: string | null
          location?: string | null
          current_tier_id?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          user_type?: 'editor' | 'client'
          avatar_url?: string | null
          name?: string | null
          bio?: string | null
          location?: string | null
          current_tier_id?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          price_monthly: number
          features: Json
          created_at: string
        }
        Insert: {
          id: string
          name: string
          price_monthly: number
          features: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_monthly?: number
          features?: Json
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          metric_type: string
          metric_value: number
          period_start: string
          period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_type: string
          metric_value?: number
          period_start: string
          period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_type?: string
          metric_value?: number
          period_start?: string
          period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          visitor_id: string | null
          event_type: string
          target_user_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          visitor_id?: string | null
          event_type: string
          target_user_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          visitor_id?: string | null
          event_type?: string
          target_user_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      spotlight_rotations: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          position: number
          clicks: number
          impressions: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          week_end: string
          position: number
          clicks?: number
          impressions?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          week_end?: string
          position?: number
          clicks?: number
          impressions?: number
          created_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          name: string
          description: string | null
          is_enabled: boolean
          target_tiers: string[] | null
          rollout_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          is_enabled?: boolean
          target_tiers?: string[] | null
          rollout_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_enabled?: boolean
          target_tiers?: string[] | null
          rollout_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      editor_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          bio: string | null
          avatar_url: string | null
          location: string | null
          per_video_rate: number | null
          specialties: string[]
          industry_niches: string[]
          tier_level: 'free' | 'pro' | 'premium'
          years_experience: number | null
          portfolio_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          per_video_rate?: number | null
          specialties?: string[]
          industry_niches?: string[]
          tier_level?: 'free' | 'pro' | 'premium'
          years_experience?: number | null
          portfolio_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          per_video_rate?: number | null
          specialties?: string[]
          industry_niches?: string[]
          tier_level?: 'free' | 'pro' | 'premium'
          years_experience?: number | null
          portfolio_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string
          budget: number | null
          deadline: string | null
          status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          video_style: string | null
          duration_minutes: number | null
          project_type: string | null
          urgency: string | null
          requirements: string | null
          video_length: string | null
          style_preferences: string | null
          additional_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description: string
          budget?: number | null
          deadline?: string | null
          status?: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          video_style?: string | null
          duration_minutes?: number | null
          project_type?: string | null
          urgency?: string | null
          requirements?: string | null
          video_length?: string | null
          style_preferences?: string | null
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string
          budget?: number | null
          deadline?: string | null
          status?: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          video_style?: string | null
          duration_minutes?: number | null
          project_type?: string | null
          urgency?: string | null
          requirements?: string | null
          video_length?: string | null
          style_preferences?: string | null
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          project_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          project_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      enhanced_profile_data: {
        Row: {
          id: string
          user_id: string
          bio_headline: string | null
          bio_description: string | null
          bio_experience: string | null
          bio_achievements: string | null
          skills_primary: string[] | null
          skills_secondary: string[] | null
          expertise_level: string | null
          years_experience: number | null
          intro_video_url: string | null
          intro_video_title: string | null
          intro_video_description: string | null
          case_studies: Json | null
          social_links: Json | null
          contact_preferences: Json | null
          current_position: string | null
          company: string | null
          location: string | null
          per_video_rate: number | null
          currency: string | null
          show_experience: boolean | null
          show_skills: boolean | null
          show_achievements: boolean | null
          show_contact_info: boolean | null
          show_rates: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio_headline?: string | null
          bio_description?: string | null
          bio_experience?: string | null
          bio_achievements?: string | null
          skills_primary?: string[] | null
          skills_secondary?: string[] | null
          expertise_level?: string | null
          years_experience?: number | null
          intro_video_url?: string | null
          intro_video_title?: string | null
          intro_video_description?: string | null
          case_studies?: Json | null
          social_links?: Json | null
          contact_preferences?: Json | null
          current_position?: string | null
          company?: string | null
          location?: string | null
          per_video_rate?: number | null
          currency?: string | null
          show_experience?: boolean | null
          show_skills?: boolean | null
          show_achievements?: boolean | null
          show_contact_info?: boolean | null
          show_rates?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio_headline?: string | null
          bio_description?: string | null
          bio_experience?: string | null
          bio_achievements?: string | null
          skills_primary?: string[] | null
          skills_secondary?: string[] | null
          expertise_level?: string | null
          years_experience?: number | null
          intro_video_url?: string | null
          intro_video_title?: string | null
          intro_video_description?: string | null
          case_studies?: Json | null
          social_links?: Json | null
          contact_preferences?: Json | null
          current_position?: string | null
          company?: string | null
          location?: string | null
          per_video_rate?: number | null
          currency?: string | null
          show_experience?: boolean | null
          show_skills?: boolean | null
          show_achievements?: boolean | null
          show_contact_info?: boolean | null
          show_rates?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'editor' | 'client'
      tier_level: 'free' | 'pro' | 'premium'
      project_status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific types
export type User = Tables<'users'>
export type EditorProfile = Tables<'editor_profiles'>
export type EnhancedProfileData = Tables<'enhanced_profile_data'>
export type Project = Tables<'projects'>
export type Message = Tables<'messages'>
export type Review = Tables<'reviews'> 