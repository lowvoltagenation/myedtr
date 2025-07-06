"use client";

import { useContext } from "react";
import { AuthContext, ProfileContext, type AuthContextType, type ProfileContextType } from "@/contexts/AuthContext";

// Main auth hook with full context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Profile-only hook to prevent unnecessary re-renders
export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  
  if (context === undefined) {
    throw new Error('useProfile must be used within an AuthProvider');
  }
  
  return context;
}

// Auth-only hook (no profile data) for components that only need auth state
export function useAuthState() {
  const { user, authLoading, hydrated, error, clearAuth, isAuthenticated } = useAuth();
  
  return {
    user,
    authLoading,
    hydrated,
    error,
    clearAuth,
    isAuthenticated,
  };
}

// Specific role hooks for cleaner component logic
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useIsEditor(): boolean {
  const { isEditor } = useAuth();
  return isEditor;
}

export function useIsClient(): boolean {
  const { isClient } = useAuth();
  return isClient;
}

export function useUserRole(): 'editor' | 'client' | null {
  const { profile } = useAuth();
  return profile?.user_type || null;
}

// Loading state helpers
export function useAuthLoading() {
  const { authLoading, profileLoading, hydrated } = useAuth();
  
  return {
    authLoading,
    profileLoading,
    hydrated,
    isLoading: authLoading || profileLoading,
    isInitializing: authLoading && !hydrated,
  };
}

// User info helpers
export function useUserInfo() {
  const { user, profile } = useAuth();
  
  return {
    userId: user?.id || null,
    email: user?.email || null,
    name: profile?.name || user?.email?.split('@')[0] || null,
    avatarUrl: profile?.avatar_url || null,
    tierLevel: profile?.tier_level || 'free',
    userType: profile?.user_type || null,
  };
}

// Profile management helpers
export function useProfileActions() {
  const { refreshProfile, error } = useAuth();
  
  return {
    refreshProfile,
    error,
  };
}

// Route protection helpers
export function useRequireAuth() {
  const { isAuthenticated, authLoading, hydrated } = useAuth();
  
  return {
    isAuthenticated,
    isLoading: authLoading || !hydrated,
    shouldRedirect: hydrated && !authLoading && !isAuthenticated,
  };
}

export function useRequireRole(requiredRole: 'editor' | 'client') {
  const { isAuthenticated, profile, authLoading, profileLoading, hydrated } = useAuth();
  
  const hasRequiredRole = profile?.user_type === requiredRole;
  const isLoading = authLoading || profileLoading || !hydrated;
  
  return {
    hasRequiredRole,
    isLoading,
    shouldRedirect: hydrated && !authLoading && (!isAuthenticated || (!profileLoading && !hasRequiredRole)),
    userRole: profile?.user_type || null,
  };
}

// Subscription tier helpers (works with existing useSubscription hook)
export function useHasTier(requiredTier: 'free' | 'pro' | 'premium') {
  const { profile } = useAuth();
  
  const tierHierarchy = { free: 0, pro: 1, premium: 2 };
  const userTier = profile?.tier_level || 'free';
  
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

// Avatar helpers
export function useAvatar() {
  const { profile, user } = useAuth();
  
  const avatarUrl = profile?.avatar_url;
  const fallbackLetter = (profile?.name || user?.email || 'U').charAt(0).toUpperCase();
  
  return {
    avatarUrl,
    fallbackLetter,
    hasAvatar: !!avatarUrl,
  };
}