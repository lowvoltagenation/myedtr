"use client";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { useRequireAuth, useRequireRole } from "@/hooks/useAuth";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: 'editor' | 'client';
  fallback?: ReactNode;
  redirectTo?: string;
}

// Basic authentication guard
export function AuthGuard({ 
  children, 
  fallback = <LoadingSkeleton />,
  redirectTo = "/login"
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, shouldRedirect } = useRequireAuth();
  
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  if (shouldRedirect) {
    redirect(redirectTo);
    return null;
  }
  
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Role-based authentication guard
export function RoleGuard({ 
  children, 
  requiredRole,
  fallback = <LoadingSkeleton />,
  redirectTo = "/login"
}: RoleGuardProps) {
  const { hasRequiredRole, isLoading, shouldRedirect, userRole } = useRequireRole(requiredRole);
  
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  if (shouldRedirect) {
    // If user is authenticated but wrong role, redirect to their dashboard
    if (userRole === 'editor' && requiredRole === 'client') {
      redirect("/dashboard/editor");
    } else if (userRole === 'client' && requiredRole === 'editor') {
      redirect("/dashboard/client");
    } else {
      redirect(redirectTo);
    }
    return null;
  }
  
  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Editor-only guard (shorthand)
export function EditorGuard(props: Omit<RoleGuardProps, 'requiredRole'>) {
  return <RoleGuard {...props} requiredRole="editor" />;
}

// Client-only guard (shorthand)
export function ClientGuard(props: Omit<RoleGuardProps, 'requiredRole'>) {
  return <RoleGuard {...props} requiredRole="client" />;
}

// Hydration-safe auth guard (waits for hydration before redirecting)
export function HydratedAuthGuard({ 
  children, 
  fallback = <LoadingSkeleton />,
  redirectTo = "/login"
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, shouldRedirect } = useRequireAuth();
  
  // Always show loading until hydration is complete
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  // Only redirect after hydration
  if (shouldRedirect) {
    redirect(redirectTo);
    return null;
  }
  
  return <>{children}</>;
}

// Optional auth guard (shows different content for auth/unauth users)
interface OptionalAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function OptionalAuthGuard({ 
  children, 
  fallback = null,
  loadingFallback = <LoadingSkeleton />
}: OptionalAuthGuardProps) {
  const { isAuthenticated, isLoading } = useRequireAuth();
  
  if (isLoading) {
    return <>{loadingFallback}</>;
  }
  
  if (!isAuthenticated && fallback) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}