"use client";

import { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  tier_level: 'free' | 'pro' | 'premium';
  user_type: 'editor' | 'client';
  bio?: string;
  location?: string;
  per_video_rate?: number;
  specialties?: string[];
  industry_niches?: string[];
  years_experience?: number;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  refreshProfile: () => Promise<void>;
  clearAuth: () => void;
  isAuthenticated: boolean;
  isEditor: boolean;
  isClient: boolean;
  retry: () => Promise<void>;
}

// Single auth context - no dual contexts
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create supabase client once
const supabase = createClient();

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Single consolidated state
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    hydrated: false,
    error: null,
  });

  // Profile loading function - simplified and more reliable
  const loadUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      // Check if user is an editor or client
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type, avatar_url, name, bio, location')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.warn('User data query failed, using fallback profile:', userError.message);
        // Return basic fallback profile
        return {
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          user_type: 'client',
          tier_level: 'free'
        };
      }

      if (userData?.user_type === 'editor') {
        // Get editor profile
        const { data: editorProfile, error: profileError } = await supabase
          .from('editor_profiles')
          .select('id, name, avatar_url, tier_level, bio, location, per_video_rate, specialties, industry_niches, years_experience')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.warn('Editor profile query failed, using basic profile:', profileError.message);
          return {
            id: user.id,
            name: userData.name || user.email?.split('@')[0] || 'Editor',
            user_type: 'editor',
            tier_level: 'free',
            avatar_url: userData.avatar_url,
          };
        }

        return {
          ...editorProfile,
          user_type: 'editor'
        };
      } else {
        // For clients, use user data from users table
        return {
          id: user.id,
          name: userData.name || user.email?.split('@')[0] || 'Client',
          user_type: userData.user_type || 'client',
          tier_level: 'free',
          avatar_url: userData.avatar_url,
          bio: userData.bio,
          location: userData.location
        };
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Return basic fallback profile
      return {
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        user_type: 'client',
        tier_level: 'free'
      };
    }
  }, []);

  // Initialize auth state - single initialization
  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (session?.user) {
        const profile = await loadUserProfile(session.user);
        setState({
          user: session.user,
          profile,
          loading: false,
          hydrated: true,
          error: null,
        });
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          hydrated: true,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setState({
        user: null,
        profile: null,
        loading: false,
        hydrated: true,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  }, [loadUserProfile]);

  // Setup auth listener - single listener
  useEffect(() => {
    let mounted = true;
    
    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          if (session?.user) {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const profile = await loadUserProfile(session.user);
            setState({
              user: session.user,
              profile,
              loading: false,
              hydrated: true,
              error: null,
            });
          } else {
            setState({
              user: null,
              profile: null,
              loading: false,
              hydrated: true,
              error: null,
            });
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication error',
          }));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializeAuth, loadUserProfile]);

  // Utility functions
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const profile = await loadUserProfile(state.user);
        setState(prev => ({ ...prev, profile, loading: false }));
      } catch (error) {
        console.error('Profile refresh failed:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Profile refresh failed' 
        }));
      }
    }
  }, [state.user, loadUserProfile]);

  const clearAuth = useCallback(() => {
    setState({
      user: null,
      profile: null,
      loading: false,
      hydrated: true,
      error: null,
    });
  }, []);

  const retry = useCallback(async () => {
    await initializeAuth();
  }, [initializeAuth]);

  // Computed values
  const isAuthenticated = !!state.user;
  const isEditor = state.profile?.user_type === 'editor';
  const isClient = state.profile?.user_type === 'client';

  // Single context value
  const contextValue: AuthContextType = {
    ...state,
    refreshProfile,
    clearAuth,
    isAuthenticated,
    isEditor,
    isClient,
    retry,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Export single context
export { AuthContext };