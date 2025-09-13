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
export declare class SearchService {
    /**
     * Search content across all types
     */
    static search(query: string, contentType?: 'ALL' | 'LISTINGS' | 'VENDORS' | 'SERVICES' | 'PRODUCTS', limit?: number, offset?: number, filters?: Record<string, any>, userId?: string): Promise<SearchResult[]>;
    /**
     * Get search suggestions
     */
    static getSuggestions(query: string, limit?: number): Promise<SearchSuggestion[]>;
    /**
     * Get available search filters
     */
    static getFilters(): Promise<SearchFilter[]>;
    /**
     * Get user search preferences
     */
    static getUserPreferences(userId: string): Promise<UserSearchPreferences | null>;
    /**
     * Update user search preferences
     */
    static updateUserPreferences(userId: string, preferences: Partial<UserSearchPreferences>): Promise<boolean>;
    /**
     * Get search recommendations for user
     */
    static getRecommendations(userId?: string, recommendationType?: string, limit?: number): Promise<SearchRecommendation[]>;
    /**
     * Track search result click
     */
    static trackClick(queryId: string, resultId: string, resultType: string): Promise<boolean>;
    /**
     * Get search analytics
     */
    static getAnalytics(startDate: string, endDate: string, queryText?: string): Promise<SearchAnalytics[]>;
    /**
     * Get trending searches
     */
    static getTrendingSearches(limit?: number): Promise<SearchSuggestion[]>;
    /**
     * Get popular searches
     */
    static getPopularSearches(limit?: number): Promise<SearchSuggestion[]>;
    /**
     * Add search suggestion
     */
    static addSuggestion(suggestionText: string, suggestionType: string, categoryId?: string, locationData?: Record<string, any>): Promise<boolean>;
    /**
     * Update suggestion popularity
     */
    static updateSuggestionPopularity(suggestionText: string, increment?: number): Promise<boolean>;
    /**
     * Get search history for user
     */
    static getSearchHistory(userId: string, limit?: number): Promise<SearchQuery[]>;
    /**
     * Clear search history for user
     */
    static clearSearchHistory(userId: string): Promise<boolean>;
    /**
     * Get search performance metrics
     */
    static getPerformanceMetrics(startDate: string, endDate: string): Promise<{
        totalSearches: number;
        avgResponseTime: number;
        clickThroughRate: number;
        topQueries: Array<{
            query: string;
            count: number;
        }>;
    }>;
}
//# sourceMappingURL=search.d.ts.map