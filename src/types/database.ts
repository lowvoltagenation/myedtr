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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          user_type: 'editor' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          user_type?: 'editor' | 'client'
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
          hourly_rate: number | null
          specialties: string[] | null
          portfolio_urls: string[] | null
          tier_level: 'free' | 'pro' | 'premium'
          availability_status: 'available' | 'busy' | 'unavailable'
          avatar_url: string | null
          website_url: string | null
          location: string | null
          years_experience: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bio?: string | null
          hourly_rate?: number | null
          specialties?: string[] | null
          portfolio_urls?: string[] | null
          tier_level?: 'free' | 'pro' | 'premium'
          availability_status?: 'available' | 'busy' | 'unavailable'
          avatar_url?: string | null
          website_url?: string | null
          location?: string | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bio?: string | null
          hourly_rate?: number | null
          specialties?: string[] | null
          portfolio_urls?: string[] | null
          tier_level?: 'free' | 'pro' | 'premium'
          availability_status?: 'available' | 'busy' | 'unavailable'
          avatar_url?: string | null
          website_url?: string | null
          location?: string | null
          years_experience?: number | null
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
      availability_status: 'available' | 'busy' | 'unavailable'
      project_status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
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
export type Project = Tables<'projects'>
export type Message = Tables<'messages'>
export type Review = Tables<'reviews'> 