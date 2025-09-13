import { supabase } from './client';
export class SearchService {
    /**
     * Search content across all types
     */
    static async search(query, contentType = 'ALL', limit = 20, offset = 0, filters = {}, userId) {
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
        }
        catch (error) {
            console.error('Error in search:', error);
            return [];
        }
    }
    /**
     * Get search suggestions
     */
    static async getSuggestions(query, limit = 10) {
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
        }
        catch (error) {
            console.error('Error in getSuggestions:', error);
            return [];
        }
    }
    /**
     * Get available search filters
     */
    static async getFilters() {
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
        }
        catch (error) {
            console.error('Error in getFilters:', error);
            return [];
        }
    }
    /**
     * Get user search preferences
     */
    static async getUserPreferences(userId) {
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
        }
        catch (error) {
            console.error('Error in getUserPreferences:', error);
            return null;
        }
    }
    /**
     * Update user search preferences
     */
    static async updateUserPreferences(userId, preferences) {
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
        }
        catch (error) {
            console.error('Error in updateUserPreferences:', error);
            return false;
        }
    }
    /**
     * Get search recommendations for user
     */
    static async getRecommendations(userId, recommendationType, limit = 10) {
        try {
            let query = supabase
                .from('search_recommendations')
                .select('*')
                .eq('is_active', true)
                .order('score', { ascending: false })
                .limit(limit);
            if (userId) {
                query = query.or(`user_id.eq.${userId},user_id.is.null`);
            }
            else {
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
        }
        catch (error) {
            console.error('Error in getRecommendations:', error);
            return [];
        }
    }
    /**
     * Track search result click
     */
    static async trackClick(queryId, resultId, resultType) {
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
        }
        catch (error) {
            console.error('Error in trackClick:', error);
            return false;
        }
    }
    /**
     * Get search analytics
     */
    static async getAnalytics(startDate, endDate, queryText) {
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
        }
        catch (error) {
            console.error('Error in getAnalytics:', error);
            return [];
        }
    }
    /**
     * Get trending searches
     */
    static async getTrendingSearches(limit = 10) {
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
            return data?.map((item) => ({
                suggestion: item.suggestion_text,
                type: item.suggestion_type,
                score: item.popularity_score,
            })) || [];
        }
        catch (error) {
            console.error('Error in getTrendingSearches:', error);
            return [];
        }
    }
    /**
     * Get popular searches
     */
    static async getPopularSearches(limit = 10) {
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
            return data?.map((item) => ({
                suggestion: item.suggestion_text,
                type: item.suggestion_type,
                score: item.popularity_score,
            })) || [];
        }
        catch (error) {
            console.error('Error in getPopularSearches:', error);
            return [];
        }
    }
    /**
     * Add search suggestion
     */
    static async addSuggestion(suggestionText, suggestionType, categoryId, locationData) {
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
        }
        catch (error) {
            console.error('Error in addSuggestion:', error);
            return false;
        }
    }
    /**
     * Update suggestion popularity
     */
    static async updateSuggestionPopularity(suggestionText, increment = 1) {
        try {
            const { error } = await supabase
                .from('search_suggestions')
                .update({
                click_count: `click_count + ${increment}`,
                popularity_score: `popularity_score + ${increment * 0.1}`,
            })
                .eq('suggestion_text', suggestionText);
            if (error) {
                console.error('Error updating suggestion popularity:', error);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Error in updateSuggestionPopularity:', error);
            return false;
        }
    }
    /**
     * Get search history for user
     */
    static async getSearchHistory(userId, limit = 20) {
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
        }
        catch (error) {
            console.error('Error in getSearchHistory:', error);
            return [];
        }
    }
    /**
     * Clear search history for user
     */
    static async clearSearchHistory(userId) {
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
        }
        catch (error) {
            console.error('Error in clearSearchHistory:', error);
            return false;
        }
    }
    /**
     * Get search performance metrics
     */
    static async getPerformanceMetrics(startDate, endDate) {
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
            const clickThroughRate = searches.filter((s) => s.clicked_result_id).length / totalSearches;
            // Get top queries
            const queryCounts = {};
            searches.forEach((s) => {
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
        }
        catch (error) {
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
//# sourceMappingURL=search.js.map