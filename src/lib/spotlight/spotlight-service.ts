import { createClient } from '@/lib/supabase/client';
import { SubscriptionTier } from '@/types/subscription';

export interface SpotlightUser {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  spotlight_bio: string;
  spotlight_image_url?: string;
  featured_work_ids: string[];
  spotlight_tags: string[];
  priority_score: number;
  total_spotlight_views: number;
  total_spotlight_clicks: number;
  last_featured_date?: string;
}

export interface SpotlightRotation {
  id: string;
  user_id: string;
  rotation_week: string;
  position: number;
  status: 'scheduled' | 'active' | 'completed';
  views: number;
  clicks: number;
  user?: SpotlightUser;
}

export interface SpotlightMetrics {
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  topPerformers: Array<{
    user_id: string;
    username: string;
    views: number;
    clicks: number;
    ctr: number;
  }>;
}

export class SpotlightService {
  private static instance: SpotlightService;
  
  public static getInstance(): SpotlightService {
    if (!SpotlightService.instance) {
      SpotlightService.instance = new SpotlightService();
    }
    return SpotlightService.instance;
  }

  private get supabase() {
    return createClient();
  }

  /**
   * Get users eligible for spotlight (Featured tier only)
   */
  async getEligibleUsers(): Promise<SpotlightUser[]> {
    const { data, error } = await this.supabase
      .from('user_spotlight_config')
      .select(`
        user_id,
        is_eligible,
        is_active,
        spotlight_bio,
        spotlight_image_url,
        featured_work_ids,
        spotlight_tags,
        priority_score,
        total_spotlight_views,
        total_spotlight_clicks,
        last_featured_date,
        users:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('is_eligible', true)
      .eq('is_active', true)
      .order('priority_score', { ascending: false });

    if (error) {
      console.error('Error fetching eligible users:', error);
      throw error;
    }

    return data?.map(item => ({
      user_id: item.user_id,
      username: (item.users as any)?.username || '',
      full_name: (item.users as any)?.full_name || '',
      avatar_url: (item.users as any)?.avatar_url,
      spotlight_bio: item.spotlight_bio || '',
      spotlight_image_url: item.spotlight_image_url,
      featured_work_ids: item.featured_work_ids || [],
      spotlight_tags: item.spotlight_tags || [],
      priority_score: item.priority_score || 0,
      total_spotlight_views: item.total_spotlight_views || 0,
      total_spotlight_clicks: item.total_spotlight_clicks || 0,
      last_featured_date: item.last_featured_date
    })) || [];
  }

  /**
   * Get current week's spotlight rotation
   */
  async getCurrentSpotlight(): Promise<SpotlightRotation[]> {
    const weekStart = this.getWeekStart(new Date());
    
    const { data, error } = await this.supabase
      .from('spotlight_rotation')
      .select(`
        id,
        user_id,
        rotation_week,
        position,
        status,
        views,
        clicks,
        user_spotlight_config:user_id (
          user_id,
          spotlight_bio,
          spotlight_image_url,
          featured_work_ids,
          spotlight_tags,
          total_spotlight_views,
          total_spotlight_clicks,
          users:user_id (
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('rotation_week', weekStart.toISOString().split('T')[0])
      .eq('status', 'active')
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching current spotlight:', error);
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      user_id: item.user_id,
      rotation_week: item.rotation_week,
      position: item.position,
      status: item.status as 'scheduled' | 'active' | 'completed',
      views: item.views || 0,
      clicks: item.clicks || 0,
      user: (item.user_spotlight_config as any) ? {
        user_id: (item.user_spotlight_config as any).user_id,
        username: ((item.user_spotlight_config as any).users as any)?.username || '',
        full_name: ((item.user_spotlight_config as any).users as any)?.full_name || '',
        avatar_url: ((item.user_spotlight_config as any).users as any)?.avatar_url,
        spotlight_bio: (item.user_spotlight_config as any).spotlight_bio || '',
        spotlight_image_url: (item.user_spotlight_config as any).spotlight_image_url,
        featured_work_ids: (item.user_spotlight_config as any).featured_work_ids || [],
        spotlight_tags: (item.user_spotlight_config as any).spotlight_tags || [],
        priority_score: 0,
        total_spotlight_views: (item.user_spotlight_config as any).total_spotlight_views || 0,
        total_spotlight_clicks: (item.user_spotlight_config as any).total_spotlight_clicks || 0
      } : undefined
    })) || [];
  }

  /**
   * Get upcoming spotlight schedule
   */
  async getUpcomingSchedule(weeksAhead: number = 4): Promise<SpotlightRotation[]> {
    const startDate = this.getWeekStart(new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (weeksAhead * 7));

    const { data, error } = await this.supabase
      .from('spotlight_rotation')
      .select(`
        id,
        user_id,
        rotation_week,
        position,
        status,
        views,
        clicks,
        user_spotlight_config:user_id (
          users:user_id (
            username,
            full_name
          )
        )
      `)
      .gte('rotation_week', startDate.toISOString().split('T')[0])
      .lte('rotation_week', endDate.toISOString().split('T')[0])
      .order('rotation_week', { ascending: true })
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming schedule:', error);
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      user_id: item.user_id,
      rotation_week: item.rotation_week,
      position: item.position,
      status: item.status as 'scheduled' | 'active' | 'completed',
      views: item.views || 0,
      clicks: item.clicks || 0,
      user: (item.user_spotlight_config as any) ? {
        user_id: item.user_id,
        username: ((item.user_spotlight_config as any).users as any)?.username || '',
        full_name: ((item.user_spotlight_config as any).users as any)?.full_name || '',
        avatar_url: '',
        spotlight_bio: '',
        spotlight_image_url: '',
        featured_work_ids: [],
        spotlight_tags: [],
        priority_score: 0,
        total_spotlight_views: 0,
        total_spotlight_clicks: 0
      } : undefined
    })) || [];
  }

  /**
   * Track spotlight view
   */
  async trackView(rotationId: string): Promise<void> {
    try {
      // Update rotation views
      const { error: rotationError } = await this.supabase
        .from('spotlight_rotation')
        .update({ 
          views: this.supabase.rpc('increment_views', { row_id: rotationId })
        })
        .eq('id', rotationId);

      if (rotationError) {
        console.error('Error updating rotation views:', rotationError);
      }

      // Update user total views
      const { data: rotation } = await this.supabase
        .from('spotlight_rotation')
        .select('user_id')
        .eq('id', rotationId)
        .single();

      if (rotation) {
        const { error: userError } = await this.supabase
          .from('user_spotlight_config')
          .update({
            total_spotlight_views: this.supabase.rpc('increment_user_views', { user_id: rotation.user_id })
          })
          .eq('user_id', rotation.user_id);

        if (userError) {
          console.error('Error updating user views:', userError);
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  /**
   * Track spotlight click
   */
  async trackClick(rotationId: string): Promise<void> {
    try {
      // Update rotation clicks
      const { error: rotationError } = await this.supabase
        .from('spotlight_rotation')
        .update({ 
          clicks: this.supabase.rpc('increment_clicks', { row_id: rotationId })
        })
        .eq('id', rotationId);

      if (rotationError) {
        console.error('Error updating rotation clicks:', rotationError);
      }

      // Update user total clicks
      const { data: rotation } = await this.supabase
        .from('spotlight_rotation')
        .select('user_id')
        .eq('id', rotationId)
        .single();

      if (rotation) {
        const { error: userError } = await this.supabase
          .from('user_spotlight_config')
          .update({
            total_spotlight_clicks: this.supabase.rpc('increment_user_clicks', { user_id: rotation.user_id })
          })
          .eq('user_id', rotation.user_id);

        if (userError) {
          console.error('Error updating user clicks:', userError);
        }
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  /**
   * Update user spotlight configuration
   */
  async updateSpotlightConfig(
    userId: string, 
    config: {
      spotlight_bio?: string;
      spotlight_image_url?: string;
      featured_work_ids?: string[];
      spotlight_tags?: string[];
      is_active?: boolean;
    }
  ): Promise<void> {
    const { error } = await this.supabase
      .from('user_spotlight_config')
      .upsert({
        user_id: userId,
        ...config,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating spotlight config:', error);
      throw error;
    }
  }

  /**
   * Generate spotlight schedule for upcoming weeks
   * This would typically be run by a scheduled function
   */
  async generateSchedule(weeksAhead: number = 4): Promise<void> {
    const eligibleUsers = await this.getEligibleUsers();
    
    if (eligibleUsers.length === 0) {
      console.log('No eligible users for spotlight');
      return;
    }

    const startDate = this.getNextWeekStart();
    const spotlightPositions = 5; // 5 spotlight positions per week

    for (let week = 0; week < weeksAhead; week++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(weekDate.getDate() + (week * 7));
      const weekString = weekDate.toISOString().split('T')[0];

      // Check if this week already has a schedule
      const { data: existingSchedule } = await this.supabase
        .from('spotlight_rotation')
        .select('id')
        .eq('rotation_week', weekString)
        .limit(1);

      if (existingSchedule && existingSchedule.length > 0) {
        continue; // Skip this week, already scheduled
      }

      // Select users for this week using weighted random selection
      const selectedUsers = this.selectUsersForWeek(eligibleUsers, spotlightPositions);

      // Create rotation entries
      const rotationEntries = selectedUsers.map((user, index) => ({
        user_id: user.user_id,
        rotation_week: weekString,
        position: index + 1,
        status: 'scheduled' as const
      }));

      const { error } = await this.supabase
        .from('spotlight_rotation')
        .insert(rotationEntries);

      if (error) {
        console.error(`Error creating schedule for week ${weekString}:`, error);
      }
    }
  }

  /**
   * Get spotlight metrics and analytics
   */
  async getSpotlightMetrics(days: number = 30): Promise<SpotlightMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('spotlight_rotation')
      .select(`
        user_id,
        views,
        clicks,
        user_spotlight_config:user_id (
          users:user_id (
            username
          )
        )
      `)
      .gte('rotation_week', startDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching spotlight metrics:', error);
      throw error;
    }

    const totalImpressions = data?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
    const totalClicks = data?.reduce((sum, item) => sum + (item.clicks || 0), 0) || 0;
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Calculate top performers
    const userMetrics = new Map<string, { username: string; views: number; clicks: number }>();
    
    data?.forEach(item => {
      const userId = item.user_id;
      const username = ((item.user_spotlight_config as any)?.users as any)?.username || 'Unknown';
      const existing = userMetrics.get(userId) || { username, views: 0, clicks: 0 };
      
      userMetrics.set(userId, {
        username,
        views: existing.views + (item.views || 0),
        clicks: existing.clicks + (item.clicks || 0)
      });
    });

    const topPerformers = Array.from(userMetrics.entries())
      .map(([user_id, metrics]) => ({
        user_id,
        username: metrics.username,
        views: metrics.views,
        clicks: metrics.clicks,
        ctr: metrics.views > 0 ? (metrics.clicks / metrics.views) * 100 : 0
      }))
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, 10);

    return {
      totalImpressions,
      totalClicks,
      averageCTR,
      topPerformers
    };
  }

  /**
   * Activate current week's spotlight
   */
  async activateCurrentWeek(): Promise<void> {
    const weekStart = this.getWeekStart(new Date());
    const weekString = weekStart.toISOString().split('T')[0];

    // Mark previous week as completed
    const { error: completeError } = await this.supabase
      .from('spotlight_rotation')
      .update({ status: 'completed' })
      .eq('status', 'active');

    if (completeError) {
      console.error('Error completing previous spotlight:', completeError);
    }

    // Activate current week
    const { error: activateError } = await this.supabase
      .from('spotlight_rotation')
      .update({ status: 'active' })
      .eq('rotation_week', weekString)
      .eq('status', 'scheduled');

    if (activateError) {
      console.error('Error activating current week spotlight:', activateError);
      throw activateError;
    }
  }

  // Helper methods

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private getNextWeekStart(): Date {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return this.getWeekStart(nextWeek);
  }

  private selectUsersForWeek(users: SpotlightUser[], count: number): SpotlightUser[] {
    // Implement weighted selection based on priority score and last featured date
    const now = new Date();
    const weights = users.map(user => {
      let weight = user.priority_score || 1;
      
      // Boost users who haven't been featured recently
      if (user.last_featured_date) {
        const daysSinceLastFeatured = Math.floor(
          (now.getTime() - new Date(user.last_featured_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        weight += Math.min(daysSinceLastFeatured / 7, 10); // Max 10 point boost after 10 weeks
      } else {
        weight += 5; // Boost for never featured users
      }

      return { user, weight };
    });

    // Select users using weighted random selection
    const selected: SpotlightUser[] = [];
    const availableUsers = [...weights];

    for (let i = 0; i < Math.min(count, availableUsers.length); i++) {
      const totalWeight = availableUsers.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (let j = 0; j < availableUsers.length; j++) {
        random -= availableUsers[j].weight;
        if (random <= 0) {
          selected.push(availableUsers[j].user);
          availableUsers.splice(j, 1);
          break;
        }
      }
    }

    return selected;
  }
}

export const spotlightService = SpotlightService.getInstance(); 