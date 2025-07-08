"use client";

import { useContext } from "react";
import { AuthContext, type AuthContextType } from "@/contexts/AuthContext";

// Main auth hook with full context - simplified
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Simplified auth state hook
export function useAuthState() {
  const { user, loading, hydrated, error, clearAuth, isAuthenticated } = useAuth();
  
  return {
    user,
    loading,
    hydrated,
    error,
    clearAuth,
    isAuthenticated,
  };
}

// Role hooks for cleaner component logic
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

// Simplified loading state
export function useAuthLoading() {
  const { loading, hydrated } = useAuth();
  
  return {
    loading,
    hydrated,
    isInitializing: loading && !hydrated,
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
  const { refreshProfile, error, retry } = useAuth();
  
  return {
    refreshProfile,
    retry,
    error,
  };
}

// Route protection helpers
export function useRequireAuth() {
  const { isAuthenticated, loading, hydrated } = useAuth();
  
  return {
    isAuthenticated,
    isLoading: loading || !hydrated,
    shouldRedirect: hydrated && !loading && !isAuthenticated,
  };
}

export function useRequireRole(requiredRole: 'editor' | 'client') {
  const { isAuthenticated, profile, loading, hydrated } = useAuth();
  
  const hasRequiredRole = profile?.user_type === requiredRole;
  const isLoading = loading || !hydrated;
  
  return {
    hasRequiredRole,
    isLoading,
    shouldRedirect: hydrated && !loading && (!isAuthenticated || !hasRequiredRole),
    userRole: profile?.user_type || null,
  };
}

// Subscription tier helpers
export function useHasTier(requiredTier: 'free' | 'pro' | 'premium') {
  const { profile } = useAuth();
  
  const tierHierarchy = { free: 0, pro: 1, premium: 2 };
  const userTier = profile?.tier_level || 'free';
  
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

// Avatar helpers with retry mechanism
export function useAvatar() {
  const { profile, user, refreshProfile } = useAuth();
  
  const avatarUrl = profile?.avatar_url;
  const fallbackLetter = (profile?.name || user?.email || 'U').charAt(0).toUpperCase();
  
  return {
    avatarUrl,
    fallbackLetter,
    hasAvatar: !!avatarUrl,
    retryAvatar: refreshProfile, // Built-in retry mechanism
  };
}