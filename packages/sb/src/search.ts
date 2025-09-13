import { createClient } from './client';

const supabase = createClient();

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  content_type: 'LISTING' | 'VENDOR' | 'SERVICE' | 'PRODUCT';
  score: number;
  metadata: Record<string, any>;
}

export interface SearchSuggestion {
  suggestion: string;
  type: 'AUTOCOMPLETE' | 'POPULAR' | 'TRENDING' | 'CATEGORY' | 'LOCATION';
  score: number;
}

export interface SearchFilter {
  id: string;
  filter_key: string;
  filter_name: string;
  filter_type: 'RANGE' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN' | 'LOCATION' | 'DATE';
  filter_options: Record<string, any>;
  is_active: boolean;
  sort_order: number;
}

export interface SearchQuery {
  id: string;
  user_id?: string;
  query_text: string;
  filters: Record<string, any>;
  results_count: number;
  response_time_ms: number;
  clicked_result_id?: string;
  clicked_result_type?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  location_data: Record<string, any>;
  created_at: string;
}

export interface UserSearchPreferences {
  id: string;
  user_id: string;
  preferred_categories: string[];
  preferred_locations: Record<string, any>;
  price_range_min?: number;
  price_range_max?: number;
  preferred_currency: string;
  search_radius_km: number;
  notification_frequency: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  created_at: string;
  updated_at: string;
}

export interface SearchRecommendation {
  id: string;
  user_id?: string;
  recommendation_type: 'SIMILAR' | 'TRENDING' | 'PERSONALIZED' | 'CATEGORY' | 'LOCATION';
  target_id: string;
  target_type: 'LISTING' | 'VENDOR' | 'SERVICE' | 'PRODUCT';
  score: number;
  reason?: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface SearchAnalytics {
  id: string;
  date: string;
  query_text?: string;
  results_count: number;
  click_count: number;
  conversion_count: number;
  avg_response_time_ms: number;
  unique_searches: number;
  unique_users: number;
  created_at: string;
}

export class SearchService {
  /**
   * Search content across all types
   */
  static async search(
    query: string,
    contentType: 'ALL' | 'LISTINGS' | 'VENDORS' | 'SERVICES' | 'PRODUCTS' = 'ALL',
    limit: number = 20,
    offset: number = 0,
    filters: Record<string, any> = {},
    userId?: string
  ): Promise<SearchResult[]> {
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.rpc('search_content', {
        p_query: query,
        p_content_type: contentType,
        p_limit: limit,
        p_offset: offset,
        p_filters: filters,
        p_user_id: userId || null,
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        console.error('Error searching content:', error);
        return [];
      }

      // Update search query with response time
      if (userId) {
        await supabase
          .from('search_queries')
          .update({ 
            response_time_ms: responseTime,
            results_count: data?.length || 0
          })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
      }

      return data || [];
    } catch (error) {
      console.error('Error in search:', error);
      return [];
    }
  }

  /**
   * Get search suggestions
   */
  static async getSuggestions(
    query: string,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    try {
      const { data, error } = await supabase.rpc('get_search_suggestions', {
        p_query: query,
        p_limit: limit,
      });

      if (error) {
        console.error('Error getting search suggestions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSuggestions:', error);
      return [];
    }
  }

  /**
   * Get available search filters
   */
  static async getFilters(): Promise<SearchFilter[]> {
    try {
      const { data, error } = await supabase
        .from('search_filters')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error fetching search filters:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFilters:', error);
      return [];
    }
  }

  /**
   * Get user search preferences
   */
  static async getUserPreferences(userId: string): Promise<UserSearchPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_search_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, return default
          return {
            id: '',
            user_id: userId,
            preferred_categories: [],
            preferred_locations: {},
            price_range_min: undefined,
            price_range_max: undefined,
            preferred_currency: 'RUB',
            search_radius_km: 50,
            notification_frequency: 'DAILY',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  }

  /**
   * Update user search preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<UserSearchPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_search_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return false;
    }
  }

  /**
   * Get search recommendations for user
   */
  static async getRecommendations(
    userId?: string,
    recommendationType?: string,
    limit: number = 10
  ): Promise<SearchRecommendation[]> {
    try {
      let query = supabase
        .from('search_recommendations')
        .select('*')
        .eq('is_active', true)
        .order('score', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      } else {
        query = query.is('user_id', null);
      }

      if (recommendationType) {
        query = query.eq('recommendation_type', recommendationType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      return [];
    }
  }

  /**
   * Track search result click
   */
  static async trackClick(
    queryId: string,
    resultId: string,
    resultType: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_queries')
        .update({
          clicked_result_id: resultId,
          clicked_result_type: resultType,
        })
        .eq('id', queryId);

      if (error) {
        console.error('Error tracking click:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in trackClick:', error);
      return false;
    }
  }

  /**
   * Get search analytics
   */
  static async getAnalytics(
    startDate: string,
    endDate: string,
    queryText?: string
  ): Promise<SearchAnalytics[]> {
    try {
      let query = supabase
        .from('search_analytics')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (queryText) {
        query = query.eq('query_text', queryText);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching search analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return [];
    }
  }

  /**
   * Get trending searches
   */
  static async getTrendingSearches(limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .eq('is_active', true)
        .eq('suggestion_type', 'TRENDING')
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending searches:', error);
        return [];
      }

      return data?.map(item => ({
        suggestion: item.suggestion_text,
        type: item.suggestion_type,
        score: item.popularity_score,
      })) || [];
    } catch (error) {
      console.error('Error in getTrendingSearches:', error);
      return [];
    }
  }

  /**
   * Get popular searches
   */
  static async getPopularSearches(limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .eq('is_active', true)
        .eq('suggestion_type', 'POPULAR')
        .order('click_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular searches:', error);
        return [];
      }

      return data?.map(item => ({
        suggestion: item.suggestion_text,
        type: item.suggestion_type,
        score: item.popularity_score,
      })) || [];
    } catch (error) {
      console.error('Error in getPopularSearches:', error);
      return [];
    }
  }

  /**
   * Add search suggestion
   */
  static async addSuggestion(
    suggestionText: string,
    suggestionType: string,
    categoryId?: string,
    locationData?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_suggestions')
        .insert({
          suggestion_text: suggestionText,
          suggestion_type: suggestionType,
          category_id: categoryId,
          location_data: locationData || {},
          popularity_score: 0,
          click_count: 0,
        });

      if (error) {
        console.error('Error adding search suggestion:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addSuggestion:', error);
      return false;
    }
  }

  /**
   * Update suggestion popularity
   */
  static async updateSuggestionPopularity(
    suggestionText: string,
    increment: number = 1
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_suggestions')
        .update({
          click_count: supabase.raw('click_count + ?', [increment]),
          popularity_score: supabase.raw('popularity_score + ?', [increment * 0.1]),
        })
        .eq('suggestion_text', suggestionText);

      if (error) {
        console.error('Error updating suggestion popularity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSuggestionPopularity:', error);
      return false;
    }
  }

  /**
   * Get search history for user
   */
  static async getSearchHistory(
    userId: string,
    limit: number = 20
  ): Promise<SearchQuery[]> {
    try {
      const { data, error } = await supabase
        .from('search_queries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching search history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSearchHistory:', error);
      return [];
    }
  }

  /**
   * Clear search history for user
   */
  static async clearSearchHistory(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_queries')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing search history:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearSearchHistory:', error);
      return false;
    }
  }

  /**
   * Get search performance metrics
   */
  static async getPerformanceMetrics(
    startDate: string,
    endDate: string
  ): Promise<{
    totalSearches: number;
    avgResponseTime: number;
    clickThroughRate: number;
    topQueries: Array<{ query: string; count: number }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('search_queries')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {
        console.error('Error fetching performance metrics:', error);
        return {
          totalSearches: 0,
          avgResponseTime: 0,
          clickThroughRate: 0,
          topQueries: [],
        };
      }

      const searches = data || [];
      const totalSearches = searches.length;
      const avgResponseTime = searches.reduce((sum, s) => sum + (s.response_time_ms || 0), 0) / totalSearches;
      const clickThroughRate = searches.filter(s => s.clicked_result_id).length / totalSearches;

      // Get top queries
      const queryCounts: { [key: string]: number } = {};
      searches.forEach(s => {
        queryCounts[s.query_text] = (queryCounts[s.query_text] || 0) + 1;
      });

      const topQueries = Object.entries(queryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      return {
        totalSearches,
        avgResponseTime: Math.round(avgResponseTime),
        clickThroughRate: Math.round(clickThroughRate * 100) / 100,
        topQueries,
      };
    } catch (error) {
      console.error('Error in getPerformanceMetrics:', error);
      return {
        totalSearches: 0,
        avgResponseTime: 0,
        clickThroughRate: 0,
        topQueries: [],
      };
    }
  }
}
