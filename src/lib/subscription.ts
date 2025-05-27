import { createClient } from "@/lib/supabase/client";

export interface PlanLimits {
  maxProjects: number;
  maxApplications: number;
  maxMessages: number;
  advancedFilters: boolean;
  prioritySupport: boolean;
  portfolioUpload: boolean;
  analytics: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxProjects: 2,
    maxApplications: 5,
    maxMessages: 50,
    advancedFilters: false,
    prioritySupport: false,
    portfolioUpload: false,
    analytics: false,
  },
  pro: {
    maxProjects: 10,
    maxApplications: -1, // unlimited
    maxMessages: -1, // unlimited
    advancedFilters: true,
    prioritySupport: true,
    portfolioUpload: true,
    analytics: true,
  },
  premium: {
    maxProjects: -1, // unlimited
    maxApplications: -1, // unlimited
    maxMessages: -1, // unlimited
    advancedFilters: true,
    prioritySupport: true,
    portfolioUpload: true,
    analytics: true,
  },
};

export async function getUserPlan(userId: string): Promise<string> {
  const supabase = createClient();
  
  try {
    // Get editor profile tier level
    const { data: profile } = await supabase
      .from('editor_profiles')
      .select('tier_level')
      .eq('user_id', userId)
      .single();

    return profile?.tier_level || 'free';
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return 'free';
  }
}

export async function canUserPerformAction(
  userId: string,
  action: 'create_project' | 'apply_to_project' | 'send_message'
): Promise<{ allowed: boolean; limit?: number; current?: number }> {
  const supabase = createClient();
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  try {
    switch (action) {
      case 'create_project': {
        if (limits.maxProjects === -1) {
          return { allowed: true };
        }
        
        // Count user's projects created this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact' })
          .eq('client_id', userId)
          .gte('created_at', startOfMonth.toISOString());

        const current = count || 0;
        return {
          allowed: current < limits.maxProjects,
          limit: limits.maxProjects,
          current,
        };
      }

      case 'apply_to_project': {
        if (limits.maxApplications === -1) {
          return { allowed: true };
        }
        
        // Count user's applications created this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count } = await supabase
          .from('project_applications')
          .select('*', { count: 'exact' })
          .eq('editor_id', userId)
          .gte('created_at', startOfMonth.toISOString());

        const current = count || 0;
        return {
          allowed: current < limits.maxApplications,
          limit: limits.maxApplications,
          current,
        };
      }

      case 'send_message': {
        if (limits.maxMessages === -1) {
          return { allowed: true };
        }
        
        // Count user's messages sent this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('sender_id', userId)
          .gte('created_at', startOfMonth.toISOString());

        const current = count || 0;
        return {
          allowed: current < limits.maxMessages,
          limit: limits.maxMessages,
          current,
        };
      }

      default:
        return { allowed: true };
    }
  } catch (error) {
    console.error('Error checking user action:', error);
    return { allowed: false };
  }
}

export function getPlanFeatures(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function formatLimit(limit: number): string {
  return limit === -1 ? 'Unlimited' : limit.toString();
}

export function formatUsage(current: number, limit: number): string {
  if (limit === -1) return `${current} used`;
  return `${current}/${limit} used`;
} 