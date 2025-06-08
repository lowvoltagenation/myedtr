import { createClient } from '@/lib/supabase/client';
import { SubscriptionTier } from '@/types/subscription';

export interface SearchFilters {
  specialties?: string[];
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  yearsSince?: number;
}

export interface EditorResult {
  id: string;
  name: string;
  bio: string;
  avatar_url?: string;
  location?: string;
  specialties: string[];
  hourly_rate?: number;
  years_experience?: number;
  availability_status: string;
  tier_level: SubscriptionTier;
  created_at: string;
  updated_at: string;
  
  // Search relevance scoring
  searchScore: number;
  tierBonus: number;
  
  // Analytics for ranking
  profile_views?: number;
  response_rate?: number;
  portfolio_count?: number;
}

export class SearchService {
  private supabase = createClient();

  /**
   * Search for editors with tier-based priority ranking
   */
  async searchEditors(
    query: string = '',
    filters: SearchFilters = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    results: EditorResult[];
    total: number;
    featuredCount: number;
    proCount: number;
    freeCount: number;
  }> {
    try {
      // Build the base query
      let queryBuilder = this.supabase
        .from('editor_profiles')
        .select(`
          *,
          users!inner(tier_level)
        `);

      // Apply text search if provided
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`
          name.ilike.%${query}%,
          bio.ilike.%${query}%,
          specialties.cs.{${query}}
        `);
      }

      // Apply filters
      if (filters.specialties?.length) {
        queryBuilder = queryBuilder.overlaps('specialties', filters.specialties);
      }

      if (filters.location) {
        queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
      }

      if (filters.minPrice !== undefined) {
        queryBuilder = queryBuilder.gte('hourly_rate', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        queryBuilder = queryBuilder.lte('hourly_rate', filters.maxPrice);
      }

      if (filters.availability) {
        queryBuilder = queryBuilder.eq('availability_status', filters.availability);
      }

      if (filters.yearsSince !== undefined) {
        queryBuilder = queryBuilder.gte('years_experience', filters.yearsSince);
      }

      // Execute the query
      const { data: rawResults, error, count } = await queryBuilder
        .range(offset, offset + limit - 1)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        throw new Error('Search failed');
      }

      // Process and rank results
      const processedResults = await this.processSearchResults(rawResults || [], query);
      
      // Sort by final ranking (tier priority + relevance)
      const rankedResults = this.applyTierPriorityRanking(processedResults);

      // Calculate tier distribution
      const tierCounts = this.calculateTierDistribution(rankedResults);

      return {
        results: rankedResults,
        total: count || 0,
        ...tierCounts
      };
    } catch (error) {
      console.error('Search service error:', error);
      return {
        results: [],
        total: 0,
        featuredCount: 0,
        proCount: 0,
        freeCount: 0
      };
    }
  }

  /**
   * Process raw search results and calculate relevance scores
   */
  private async processSearchResults(results: any[], query: string): Promise<EditorResult[]> {
    return results.map(result => {
      const tierLevel = result.users?.tier_level || 'free';
      
      // Calculate search relevance score (0-100)
      let searchScore = this.calculateRelevanceScore(result, query);
      
      // Add tier-based bonus points for ranking
      const tierBonus = this.getTierBonus(tierLevel);
      
      return {
        id: result.id,
        name: result.name,
        bio: result.bio,
        avatar_url: result.avatar_url,
        location: result.location,
        specialties: result.specialties || [],
        hourly_rate: result.hourly_rate,
        years_experience: result.years_experience,
        availability_status: result.availability_status,
        tier_level: tierLevel,
        created_at: result.created_at,
        updated_at: result.updated_at,
        searchScore,
        tierBonus,
        profile_views: result.profile_views || 0,
        response_rate: result.response_rate || 0,
        portfolio_count: result.portfolio_count || 0
      };
    });
  }

  /**
   * Calculate relevance score based on query match
   */
  private calculateRelevanceScore(result: any, query: string): number {
    if (!query.trim()) return 50; // Base score for no query

    let score = 0;
    const queryLower = query.toLowerCase();

    // Name match (highest weight)
    if (result.name?.toLowerCase().includes(queryLower)) {
      score += 40;
    }

    // Specialty match (high weight)
    if (result.specialties?.some((spec: string) => 
      spec.toLowerCase().includes(queryLower)
    )) {
      score += 30;
    }

    // Bio match (medium weight)
    if (result.bio?.toLowerCase().includes(queryLower)) {
      score += 20;
    }

    // Location match (low weight)
    if (result.location?.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Get tier bonus points for ranking
   */
  private getTierBonus(tier: SubscriptionTier): number {
    switch (tier) {
      case 'featured':
        return 1000; // Featured gets top priority
      case 'pro':
        return 500;  // Pro gets high priority
      case 'free':
      default:
        return 0;    // Free gets no bonus
    }
  }

  /**
   * Apply tier-based priority ranking
   */
  private applyTierPriorityRanking(results: EditorResult[]): EditorResult[] {
    return results.sort((a, b) => {
      // Primary sort: tier bonus (Featured > Pro > Free)
      const tierDiff = b.tierBonus - a.tierBonus;
      if (tierDiff !== 0) return tierDiff;

      // Secondary sort: search relevance score
      const scoreDiff = b.searchScore - a.searchScore;
      if (scoreDiff !== 0) return scoreDiff;

      // Tertiary sort: profile engagement metrics
      const engagementA = (a.profile_views || 0) + (a.response_rate || 0) * 10;
      const engagementB = (b.profile_views || 0) + (b.response_rate || 0) * 10;
      const engagementDiff = engagementB - engagementA;
      if (engagementDiff !== 0) return engagementDiff;

      // Final sort: most recently updated
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }

  /**
   * Calculate distribution of tiers in results
   */
  private calculateTierDistribution(results: EditorResult[]) {
    const distribution = results.reduce((acc, result) => {
      switch (result.tier_level) {
        case 'featured':
          acc.featuredCount++;
          break;
        case 'pro':
          acc.proCount++;
          break;
        case 'free':
        default:
          acc.freeCount++;
          break;
      }
      return acc;
    }, { featuredCount: 0, proCount: 0, freeCount: 0 });

    return distribution;
  }

  /**
   * Get featured editors for spotlight (Featured tier only)
   */
  async getFeaturedEditors(limit: number = 6): Promise<EditorResult[]> {
    try {
      const { data: results, error } = await this.supabase
        .from('editor_profiles')
        .select(`
          *,
          users!inner(tier_level)
        `)
        .eq('users.tier_level', 'featured')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return await this.processSearchResults(results || [], '');
    } catch (error) {
      console.error('Error fetching featured editors:', error);
      return [];
    }
  }

  /**
   * Get search suggestions based on user tier
   */
  getSearchSuggestions(userTier: SubscriptionTier): string[] {
    const baseSuggestions = [
      'Motion Graphics',
      'Color Grading',
      'Wedding Videos',
      'Commercial',
      'Documentary'
    ];

    // Pro and Featured users get more detailed suggestions
    if (userTier === 'pro' || userTier === 'featured') {
      return [
        ...baseSuggestions,
        'YouTube Content',
        'Social Media',
        'Corporate Videos',
        'Music Videos',
        'Storytelling'
      ];
    }

    return baseSuggestions;
  }
}

// Export singleton instance
export const searchService = new SearchService(); 