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
  years_experience?: number;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  profileLoading: boolean;
  hydrated: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  clearAuth: () => void;
  isAuthenticated: boolean;
  isEditor: boolean;
  isClient: boolean;
}

export interface ProfileContextType {
  profile: UserProfile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  error: string | null;
}

// Separate contexts to prevent over-rendering
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Create supabase client once
const supabase = createClient();

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  
  // Profile state  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent concurrent profile loads
  const profileLoadingRef = useRef(false);

  // Profile loading function
  const loadUserProfile = useCallback(async (userId: string, sessionUser: User) => {
    if (profileLoadingRef.current) return;
    
    profileLoadingRef.current = true;
    setProfileLoading(true);
    setError(null);
    
    try {
      // Check if user is an editor or client
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type, avatar_url, name, bio, location')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        // Fallback to basic profile if user query fails
        setProfile({
          id: userId,
          name: sessionUser?.email?.split('@')[0] || 'User',
          user_type: 'client',
          tier_level: 'free'
        });
        return;
      }

      if (userData?.user_type === 'editor') {
        // Get editor profile with explicit avatar_url selection
        const { data: editorProfile, error: profileError } = await supabase
          .from('editor_profiles')
          .select('id, name, avatar_url, tier_level, bio, location, per_video_rate, specialties, years_experience')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching editor profile:', profileError);
        }

        if (editorProfile) {
          setProfile({
            ...editorProfile,
            user_type: 'editor'
          });
        } else {
          // Editor profile doesn't exist yet
          setProfile({
            id: userId,
            name: sessionUser?.email?.split('@')[0] || 'Editor',
            user_type: 'editor',
            tier_level: 'free'
          });
        }
      } else {
        // For clients, use user data from users table
        setProfile({
          id: userId,
          name: userData?.name || sessionUser?.email?.split('@')[0] || 'Client',
          user_type: userData?.user_type || 'client',
          tier_level: 'free',
          avatar_url: userData?.avatar_url,
          bio: userData?.bio,
          location: userData?.location
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
      // Fallback profile
      setProfile({
        id: userId,
        name: sessionUser?.email?.split('@')[0] || 'User',
        user_type: 'client',
        tier_level: 'free'
      });
    } finally {
      profileLoadingRef.current = false;
      setProfileLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setAuthLoading(false);
        setHydrated(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthLoading(false);
          setHydrated(true);
          setError('Failed to initialize authentication');
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          if (session?.user) {
            setUser(session.user);
            await loadUserProfile(session.user.id, session.user);
          } else {
            setUser(null);
            setProfile(null);
            setProfileLoading(false);
          }
        } catch (error) {
          console.error('Error handling auth change:', error);
          setError('Authentication error occurred');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Handle profile update events
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user?.id) {
        loadUserProfile(user.id, user);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user?.id, loadUserProfile]);

  // Utility functions
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadUserProfile(user.id, user);
    }
  }, [user?.id, loadUserProfile]);

  const clearAuth = useCallback(() => {
    setUser(null);
    setProfile(null);
    setError(null);
    setProfileLoading(false);
  }, []);

  // Computed values
  const isAuthenticated = !!user;
  const isEditor = profile?.user_type === 'editor';
  const isClient = profile?.user_type === 'client';

  // Auth context value
  const authValue: AuthContextType = {
    user,
    profile,
    authLoading,
    profileLoading,
    hydrated,
    error,
    refreshProfile,
    clearAuth,
    isAuthenticated,
    isEditor,
    isClient,
  };

  // Profile context value (separate to prevent over-rendering)
  const profileValue: ProfileContextType = {
    profile,
    profileLoading,
    refreshProfile,
    error,
  };

  return (
    <AuthContext.Provider value={authValue}>
      <ProfileContext.Provider value={profileValue}>
        {children}
      </ProfileContext.Provider>
    </AuthContext.Provider>
  );
}

// Export context for advanced usage
export { AuthContext, ProfileContext };