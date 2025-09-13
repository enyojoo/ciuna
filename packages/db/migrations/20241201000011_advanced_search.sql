-- Advanced Search & Discovery System
-- This migration creates tables for search functionality, filters, and recommendations

-- Create search indexes table for tracking search performance
CREATE TABLE IF NOT EXISTS search_indexes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    index_name TEXT NOT NULL UNIQUE,
    index_type TEXT NOT NULL CHECK (index_type IN ('LISTINGS', 'VENDORS', 'SERVICES', 'USERS')),
    elasticsearch_index TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    document_count INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create search queries table for analytics
CREATE TABLE IF NOT EXISTS search_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    response_time_ms INTEGER DEFAULT 0,
    clicked_result_id UUID,
    clicked_result_type TEXT,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create search suggestions table
CREATE TABLE IF NOT EXISTS search_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    suggestion_text TEXT NOT NULL,
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('AUTOCOMPLETE', 'POPULAR', 'TRENDING', 'CATEGORY', 'LOCATION')),
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    location_data JSONB DEFAULT '{}',
    popularity_score NUMERIC(5,2) DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create search filters table for dynamic filtering
CREATE TABLE IF NOT EXISTS search_filters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filter_key TEXT NOT NULL,
    filter_name TEXT NOT NULL,
    filter_type TEXT NOT NULL CHECK (filter_type IN ('RANGE', 'SELECT', 'MULTISELECT', 'BOOLEAN', 'LOCATION', 'DATE')),
    filter_options JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user search preferences
CREATE TABLE IF NOT EXISTS user_search_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    preferred_categories UUID[] DEFAULT '{}',
    preferred_locations JSONB DEFAULT '{}',
    price_range_min INTEGER,
    price_range_max INTEGER,
    preferred_currency TEXT DEFAULT 'RUB',
    search_radius_km INTEGER DEFAULT 50,
    notification_frequency TEXT DEFAULT 'DAILY' CHECK (notification_frequency IN ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create search recommendations table
CREATE TABLE IF NOT EXISTS search_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('SIMILAR', 'TRENDING', 'PERSONALIZED', 'CATEGORY', 'LOCATION')),
    target_id UUID NOT NULL, -- ID of the item being recommended
    target_type TEXT NOT NULL CHECK (target_type IN ('LISTING', 'VENDOR', 'SERVICE')),
    score NUMERIC(5,4) DEFAULT 0,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Create search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    query_text TEXT,
    results_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    unique_searches INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, query_text)
);

-- Add search-related fields to existing tables
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_keywords TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_metadata JSONB DEFAULT '{}';

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS search_keywords TEXT[];
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS search_metadata JSONB DEFAULT '{}';

ALTER TABLE services ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE services ADD COLUMN IF NOT EXISTS search_keywords TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS search_metadata JSONB DEFAULT '{}';

-- Products table doesn't exist in current schema - using vendor_products instead

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_indexes_type ON search_indexes(index_type);
CREATE INDEX IF NOT EXISTS idx_search_indexes_active ON search_indexes(is_active);

CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_search_queries_query_text ON search_queries USING gin(to_tsvector('english', query_text));

CREATE INDEX IF NOT EXISTS idx_search_suggestions_type ON search_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_active ON search_suggestions(is_active);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_popularity ON search_suggestions(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_text ON search_suggestions USING gin(to_tsvector('english', suggestion_text));

CREATE INDEX IF NOT EXISTS idx_search_filters_type ON search_filters(filter_type);
CREATE INDEX IF NOT EXISTS idx_search_filters_active ON search_filters(is_active);
CREATE INDEX IF NOT EXISTS idx_search_filters_sort ON search_filters(sort_order);

CREATE INDEX IF NOT EXISTS idx_user_search_preferences_user_id ON user_search_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_search_recommendations_user_id ON search_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_search_recommendations_type ON search_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_search_recommendations_target ON search_recommendations(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_search_recommendations_active ON search_recommendations(is_active);
CREATE INDEX IF NOT EXISTS idx_search_recommendations_score ON search_recommendations(score DESC);

CREATE INDEX IF NOT EXISTS idx_search_analytics_date ON search_analytics(date);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(query_text);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_listings_search_keywords ON listings USING gin(search_keywords);

CREATE INDEX IF NOT EXISTS idx_vendors_search_vector ON vendors USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_vendors_search_keywords ON vendors USING gin(search_keywords);

CREATE INDEX IF NOT EXISTS idx_services_search_vector ON services USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_services_search_keywords ON services USING gin(search_keywords);

-- Products table doesn't exist - indexes removed

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_search_indexes_updated_at ON search_indexes;
CREATE TRIGGER update_search_indexes_updated_at 
    BEFORE UPDATE ON search_indexes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_suggestions_updated_at ON search_suggestions;
CREATE TRIGGER update_search_suggestions_updated_at 
    BEFORE UPDATE ON search_suggestions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_filters_updated_at ON search_filters;
CREATE TRIGGER update_search_filters_updated_at 
    BEFORE UPDATE ON search_filters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_search_preferences_updated_at ON user_search_preferences;
CREATE TRIGGER update_user_search_preferences_updated_at 
    BEFORE UPDATE ON user_search_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create search functions
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    -- Update search vector for listings
    IF TG_TABLE_NAME = 'listings' THEN
        NEW.search_vector := to_tsvector('english', 
            COALESCE(NEW.title, '') || ' ' || 
            COALESCE(NEW.description, '') || ' ' ||
            COALESCE(NEW.city, '') || ' ' ||
            COALESCE(NEW.district, '') || ' ' ||
            COALESCE(array_to_string(NEW.tags, ' '), '')
        );
        NEW.search_keywords := string_to_array(
            lower(regexp_replace(
                COALESCE(NEW.title, '') || ' ' || 
                COALESCE(NEW.description, '') || ' ' ||
                COALESCE(NEW.city, '') || ' ' ||
                COALESCE(NEW.district, '') || ' ' ||
                COALESCE(array_to_string(NEW.tags, ' '), ''),
                '[^a-zA-Z0-9\s]', '', 'g'
            )), ' '
        );
    END IF;

    -- Update search vector for vendors
    IF TG_TABLE_NAME = 'vendors' THEN
        NEW.search_vector := to_tsvector('english',
            COALESCE(NEW.name, '') || ' ' ||
            COALESCE(NEW.description, '') || ' ' ||
            COALESCE(NEW.city, '') || ' ' ||
            COALESCE(NEW.district, '')
        );
        NEW.search_keywords := string_to_array(
            lower(regexp_replace(
                COALESCE(NEW.name, '') || ' ' ||
                COALESCE(NEW.description, '') || ' ' ||
                COALESCE(NEW.city, '') || ' ' ||
                COALESCE(NEW.district, ''),
                '[^a-zA-Z0-9\s]', '', 'g'
            )), ' '
        );
    END IF;

    -- Update search vector for services
    IF TG_TABLE_NAME = 'services' THEN
        NEW.search_vector := to_tsvector('english',
            COALESCE(NEW.title, '') || ' ' ||
            COALESCE(NEW.description, '') || ' ' ||
            COALESCE(NEW.category::text, '') || ' ' ||
            COALESCE(NEW.location, '') || ' ' ||
            COALESCE(array_to_string(NEW.tags, ' '), '')
        );
        NEW.search_keywords := string_to_array(
            lower(regexp_replace(
                COALESCE(NEW.title, '') || ' ' ||
                COALESCE(NEW.description, '') || ' ' ||
                COALESCE(NEW.category::text, '') || ' ' ||
                COALESCE(NEW.location, '') || ' ' ||
                COALESCE(array_to_string(NEW.tags, ' '), ''),
                '[^a-zA-Z0-9\s]', '', 'g'
            )), ' '
        );
    END IF;

    -- Products table doesn't exist - search vector update removed

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for search vector updates
DROP TRIGGER IF EXISTS update_listings_search_vector ON listings;
CREATE TRIGGER update_listings_search_vector
    BEFORE INSERT OR UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS update_vendors_search_vector ON vendors;
CREATE TRIGGER update_vendors_search_vector
    BEFORE INSERT OR UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS update_services_search_vector ON services;
CREATE TRIGGER update_services_search_vector
    BEFORE INSERT OR UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Products table doesn't exist - trigger removed

-- Create search function
CREATE OR REPLACE FUNCTION search_content(
    p_query TEXT,
    p_content_type TEXT DEFAULT 'ALL',
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_filters JSONB DEFAULT '{}',
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    content_type TEXT,
    score REAL,
    metadata JSONB
) AS $$
DECLARE
    search_query tsquery;
BEGIN
    -- Convert search query to tsquery
    search_query := plainto_tsquery('english', p_query);
    
    -- Log search query
    INSERT INTO search_queries (user_id, query_text, filters, session_id)
    VALUES (p_user_id, p_query, p_filters, gen_random_uuid()::text);
    
    -- Search listings
    IF p_content_type = 'ALL' OR p_content_type = 'LISTINGS' THEN
        RETURN QUERY
        SELECT 
            l.id,
            l.title,
            l.description,
            'LISTING'::TEXT as content_type,
            ts_rank(l.search_vector, search_query) as score,
            jsonb_build_object(
                'price', l.price,
                'currency', l.currency,
                'location', l.location,
                'category', l.category_name,
                'user_id', l.user_id,
                'created_at', l.created_at
            ) as metadata
        FROM listings l
        WHERE l.search_vector @@ search_query
        AND l.status = 'ACTIVE'
        ORDER BY score DESC
        LIMIT p_limit OFFSET p_offset;
    END IF;
    
    -- Search vendors
    IF p_content_type = 'ALL' OR p_content_type = 'VENDORS' THEN
        RETURN QUERY
        SELECT 
            v.id,
            v.business_name as title,
            v.description,
            'VENDOR'::TEXT as content_type,
            ts_rank(v.search_vector, search_query) as score,
            jsonb_build_object(
                'location', v.location,
                'rating', v.rating,
                'user_id', v.user_id,
                'created_at', v.created_at
            ) as metadata
        FROM vendors v
        WHERE v.search_vector @@ search_query
        AND v.is_active = true
        ORDER BY score DESC
        LIMIT p_limit OFFSET p_offset;
    END IF;
    
    -- Search services
    IF p_content_type = 'ALL' OR p_content_type = 'SERVICES' THEN
        RETURN QUERY
        SELECT 
            s.id,
            s.title,
            s.description,
            'SERVICE'::TEXT as content_type,
            ts_rank(s.search_vector, search_query) as score,
            jsonb_build_object(
                'price', s.price,
                'currency', s.currency,
                'location', s.location,
                'category', s.category_name,
                'provider_id', s.provider_id,
                'created_at', s.created_at
            ) as metadata
        FROM services s
        WHERE s.search_vector @@ search_query
        AND s.is_active = true
        ORDER BY score DESC
        LIMIT p_limit OFFSET p_offset;
    END IF;
    
    -- Products table doesn't exist - search section removed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
    p_query TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    suggestion TEXT,
    type TEXT,
    score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.suggestion_text as suggestion,
        s.suggestion_type as type,
        s.popularity_score as score
    FROM search_suggestions s
    WHERE s.is_active = true
    AND s.suggestion_text ILIKE '%' || p_query || '%'
    ORDER BY s.popularity_score DESC, s.click_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default search filters
INSERT INTO search_filters (filter_key, filter_name, filter_type, filter_options, sort_order) VALUES
('price_range', 'Price Range', 'RANGE', '{"min": 0, "max": 1000000, "step": 100}', 1),
('category', 'Category', 'MULTISELECT', '{"source": "categories"}', 2),
('location', 'Location', 'LOCATION', '{"radius": 50, "unit": "km"}', 3),
('condition', 'Condition', 'SELECT', '{"options": ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]}', 4),
('rating', 'Rating', 'RANGE', '{"min": 1, "max": 5, "step": 0.1}', 5),
('availability', 'Availability', 'BOOLEAN', '{"label": "Available Now"}', 6),
('delivery', 'Delivery', 'BOOLEAN', '{"label": "Free Delivery"}', 7);

-- Insert default search suggestions
INSERT INTO search_suggestions (suggestion_text, suggestion_type, popularity_score) VALUES
('iPhone', 'POPULAR', 0.9),
('MacBook', 'POPULAR', 0.8),
('Samsung Galaxy', 'POPULAR', 0.7),
('Nike shoes', 'POPULAR', 0.6),
('Adidas', 'POPULAR', 0.5),
('Furniture', 'CATEGORY', 0.8),
('Electronics', 'CATEGORY', 0.9),
('Clothing', 'CATEGORY', 0.7),
('Books', 'CATEGORY', 0.6),
('Moscow', 'LOCATION', 0.9),
('Saint Petersburg', 'LOCATION', 0.8),
('Novosibirsk', 'LOCATION', 0.7);

-- Create RLS policies
ALTER TABLE search_indexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Search indexes: public read access
DROP POLICY IF EXISTS "Search indexes are publicly readable" ON search_indexes;
CREATE POLICY "Search indexes are publicly readable" ON search_indexes
    FOR SELECT USING (is_active = true);

-- Search queries: users can view their own, admins can view all
DROP POLICY IF EXISTS "Users can view their own search queries" ON search_queries;
CREATE POLICY "Users can view their own search queries" ON search_queries
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can view all search queries" ON search_queries;
CREATE POLICY "Admins can view all search queries" ON search_queries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Search suggestions: public read access
DROP POLICY IF EXISTS "Search suggestions are publicly readable" ON search_suggestions;
CREATE POLICY "Search suggestions are publicly readable" ON search_suggestions
    FOR SELECT USING (is_active = true);

-- Search filters: public read access
DROP POLICY IF EXISTS "Search filters are publicly readable" ON search_filters;
CREATE POLICY "Search filters are publicly readable" ON search_filters
    FOR SELECT USING (is_active = true);

-- User search preferences: users can manage their own
DROP POLICY IF EXISTS "Users can manage their own search preferences" ON user_search_preferences;
CREATE POLICY "Users can manage their own search preferences" ON user_search_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Search recommendations: users can view their own
DROP POLICY IF EXISTS "Users can view their own recommendations" ON search_recommendations;
CREATE POLICY "Users can view their own recommendations" ON search_recommendations
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Search analytics: admins only
DROP POLICY IF EXISTS "Admins can view search analytics" ON search_analytics;
CREATE POLICY "Admins can view search analytics" ON search_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );