"use client";

import { createContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const supabase = createClient();

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    hydrated: false,
    error: null,
  });
  
  // Use ref to track current state for closures
  const stateRef = useRef(state);
  stateRef.current = state;

  // Simplified profile loading
  const loadUserProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      console.log('🔧 Loading profile for user:', user.id);
      
      // Get user type and basic info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type, avatar_url, name, bio, location')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.warn('User data query failed:', userError.message);
        return {
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          user_type: 'client',
          tier_level: 'free'
        };
      }

      if (userData?.user_type === 'editor') {
        // Get editor profile
        const { data: editorProfile } = await supabase
          .from('editor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (editorProfile) {
          return {
            ...editorProfile,
            user_type: 'editor'
          };
        }
      }

      // Return basic profile for clients or fallback
      return {
        id: user.id,
        name: userData.name || user.email?.split('@')[0] || 'User',
        user_type: userData.user_type || 'client',
        tier_level: 'free',
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        location: userData.location
      };
    } catch (error) {
      console.error('Profile loading error:', error);
      return {
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        user_type: 'client',
        tier_level: 'free'
      };
    }
  }, []);

  // Single initialization effect
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔧 AuthContext: Initializing...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setState({
            user: null,
            profile: null,
            loading: false,
            hydrated: true,
            error: error.message,
          });
          return;
        }

        if (session?.user) {
          console.log('🔧 AuthContext: User found, loading profile');
          const profile = await loadUserProfile(session.user);
          
          if (mounted) {
            setState({
              user: session.user,
              profile,
              loading: false,
              hydrated: true,
              error: null,
            });
          }
        } else {
          console.log('🔧 AuthContext: No user session');
          if (mounted) {
            setState({
              user: null,
              profile: null,
              loading: false,
              hydrated: true,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setState({
            user: null,
            profile: null,
            loading: false,
            hydrated: true,
            error: error instanceof Error ? error.message : 'Auth initialization failed',
          });
        }
      }
    };

    // Initialize
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔧 AuthContext: Auth state change:', event);
        
        if (!mounted) return;

        try {
          if (session?.user) {
            // Use ref to get current state
            const currentState = stateRef.current;
            const userChanged = currentState.user?.id !== session.user.id;
            const needsProfile = !currentState.profile;
            
            if (userChanged || needsProfile) {
              console.log('🔧 AuthContext: Auth change - loading profile');
              setState(prev => ({ ...prev, loading: true }));
              const profile = await loadUserProfile(session.user);
              
              if (mounted) {
                setState({
                  user: session.user,
                  profile,
                  loading: false,
                  hydrated: true,
                  error: null,
                });
              }
            } else {
              // Just update user without loading state
              console.log('🔧 AuthContext: Auth change - updating user only');
              setState(prev => ({
                ...prev,
                user: session.user,
                hydrated: true,
                error: null,
              }));
            }
          } else {
            console.log('🔧 AuthContext: Auth change - clearing state');
            if (mounted) {
              setState({
                user: null,
                profile: null,
                loading: false,
                hydrated: true,
                error: null,
              });
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          if (mounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: error instanceof Error ? error.message : 'Auth error',
            }));
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  // Helper functions
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const profile = await loadUserProfile(state.user);
        setState(prev => ({ ...prev, profile, loading: false }));
      } catch (error) {
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
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
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
      setState({
        user: null,
        profile: null,
        loading: false,
        hydrated: true,
        error: error instanceof Error ? error.message : 'Retry failed',
      });
    }
  }, [loadUserProfile]);

  // Computed values
  const isAuthenticated = !!state.user;
  const isEditor = state.profile?.user_type === 'editor';
  const isClient = state.profile?.user_type === 'client';

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

export { AuthContext };