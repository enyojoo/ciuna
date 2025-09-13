-- Analytics and monitoring system
-- This migration creates tables for tracking user behavior, system metrics, and business analytics

-- Create analytics events table for tracking user actions
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    event_action TEXT NOT NULL,
    event_label TEXT,
    event_value NUMERIC,
    properties JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country_code TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create page views table for detailed page tracking
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    page_path TEXT NOT NULL,
    page_title TEXT,
    page_category TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    duration_seconds INTEGER,
    scroll_depth INTEGER,
    exit_page BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversion events table for tracking business metrics
CREATE TABLE IF NOT EXISTS conversion_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    conversion_type TEXT NOT NULL CHECK (conversion_type IN (
        'LISTING_CREATED', 'LISTING_PURCHASED', 'VENDOR_REGISTERED', 'SERVICE_BOOKED',
        'PAYMENT_COMPLETED', 'REVIEW_SUBMITTED', 'MESSAGE_SENT', 'PROFILE_COMPLETED'
    )),
    conversion_value NUMERIC,
    currency_code TEXT DEFAULT 'RUB',
    item_id UUID,
    item_type TEXT,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system metrics table for monitoring
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT,
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create user sessions table for session tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT UNIQUE NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country_code TEXT,
    city TEXT,
    is_mobile BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_path TEXT,
    load_time_ms INTEGER,
    first_contentful_paint_ms INTEGER,
    largest_contentful_paint_ms INTEGER,
    first_input_delay_ms INTEGER,
    cumulative_layout_shift NUMERIC,
    time_to_interactive_ms INTEGER,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    device_type TEXT,
    browser TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create error tracking table
CREATE TABLE IF NOT EXISTS error_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    page_url TEXT,
    user_agent TEXT,
    properties JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id ON conversion_events(session_id);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_path ON performance_metrics(page_path);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_error_events_type ON error_events(error_type);
CREATE INDEX IF NOT EXISTS idx_error_events_created_at ON error_events(created_at);
CREATE INDEX IF NOT EXISTS idx_error_events_resolved ON error_events(resolved);

-- Create RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_events ENABLE ROW LEVEL SECURITY;

-- Analytics events: users can view their own events, admins can view all
CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all analytics events" ON analytics_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Page views: users can view their own, admins can view all
CREATE POLICY "Users can view their own page views" ON page_views
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all page views" ON page_views
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Conversion events: users can view their own, admins can view all
CREATE POLICY "Users can view their own conversion events" ON conversion_events
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all conversion events" ON conversion_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- System metrics: admins only
CREATE POLICY "Only admins can access system metrics" ON system_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- User sessions: users can view their own, admins can view all
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Performance metrics: admins only
CREATE POLICY "Only admins can access performance metrics" ON performance_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Error events: users can view their own, admins can view all
CREATE POLICY "Users can view their own error events" ON error_events
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all error events" ON error_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS track_event(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, JSONB, TEXT, TEXT, TEXT, INET, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS track_conversion(UUID, TEXT, TEXT, NUMERIC, TEXT, UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS get_analytics_dashboard_data(TIMESTAMPTZ, TIMESTAMPTZ);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION track_event(
    p_user_id UUID,
    p_session_id TEXT,
    p_event_type TEXT,
    p_event_category TEXT,
    p_event_action TEXT,
    p_event_label TEXT DEFAULT NULL,
    p_event_value NUMERIC DEFAULT NULL,
    p_properties JSONB DEFAULT '{}',
    p_page_url TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_country_code TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_device_type TEXT DEFAULT NULL,
    p_browser TEXT DEFAULT NULL,
    p_os TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO analytics_events (
        user_id, session_id, event_type, event_category, event_action,
        event_label, event_value, properties, page_url, referrer,
        user_agent, ip_address, country_code, city, device_type,
        browser, os
    ) VALUES (
        p_user_id, p_session_id, p_event_type, p_event_category, p_event_action,
        p_event_label, p_event_value, p_properties, p_page_url, p_referrer,
        p_user_agent, p_ip_address, p_country_code, p_city, p_device_type,
        p_browser, p_os
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION track_conversion(
    p_user_id UUID,
    p_session_id TEXT,
    p_conversion_type TEXT,
    p_conversion_value NUMERIC DEFAULT NULL,
    p_currency_code TEXT DEFAULT 'RUB',
    p_item_id UUID DEFAULT NULL,
    p_item_type TEXT DEFAULT NULL,
    p_properties JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    conversion_id UUID;
BEGIN
    INSERT INTO conversion_events (
        user_id, session_id, conversion_type, conversion_value,
        currency_code, item_id, item_type, properties
    ) VALUES (
        p_user_id, p_session_id, p_conversion_type, p_conversion_value,
        p_currency_code, p_item_id, p_item_type, p_properties
    ) RETURNING id INTO conversion_id;
    
    RETURN conversion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_analytics_dashboard_data(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
) RETURNS TABLE (
    total_users BIGINT,
    total_sessions BIGINT,
    total_page_views BIGINT,
    total_conversions BIGINT,
    conversion_rate NUMERIC,
    avg_session_duration NUMERIC,
    bounce_rate NUMERIC,
    top_pages JSONB,
    top_events JSONB,
    device_breakdown JSONB,
    country_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Total users
        (SELECT COUNT(DISTINCT user_id) FROM analytics_events 
         WHERE created_at BETWEEN p_start_date AND p_end_date) as total_users,
        
        -- Total sessions
        (SELECT COUNT(DISTINCT session_id) FROM user_sessions 
         WHERE started_at BETWEEN p_start_date AND p_end_date) as total_sessions,
        
        -- Total page views
        (SELECT COUNT(*) FROM page_views 
         WHERE created_at BETWEEN p_start_date AND p_end_date) as total_page_views,
        
        -- Total conversions
        (SELECT COUNT(*) FROM conversion_events 
         WHERE created_at BETWEEN p_start_date AND p_end_date) as total_conversions,
        
        -- Conversion rate
        (SELECT 
            CASE 
                WHEN COUNT(DISTINCT session_id) > 0 
                THEN (COUNT(*)::NUMERIC / COUNT(DISTINCT session_id)) * 100 
                ELSE 0 
            END
         FROM conversion_events 
         WHERE created_at BETWEEN p_start_date AND p_end_date) as conversion_rate,
        
        -- Average session duration
        (SELECT AVG(duration_seconds) FROM user_sessions 
         WHERE started_at BETWEEN p_start_date AND p_end_date 
         AND duration_seconds IS NOT NULL) as avg_session_duration,
        
        -- Bounce rate (sessions with only 1 page view)
        (SELECT 
            CASE 
                WHEN COUNT(*) > 0 
                THEN (COUNT(*) FILTER (WHERE page_views = 1)::NUMERIC / COUNT(*)) * 100 
                ELSE 0 
            END
         FROM user_sessions 
         WHERE started_at BETWEEN p_start_date AND p_end_date) as bounce_rate,
        
        -- Top pages
        (SELECT jsonb_agg(jsonb_build_object('page', page_path, 'views', view_count))
         FROM (
             SELECT page_path, COUNT(*) as view_count
             FROM page_views 
             WHERE created_at BETWEEN p_start_date AND p_end_date
             GROUP BY page_path
             ORDER BY view_count DESC
             LIMIT 10
         ) top_pages) as top_pages,
        
        -- Top events
        (SELECT jsonb_agg(jsonb_build_object('event', event_type, 'count', event_count))
         FROM (
             SELECT event_type, COUNT(*) as event_count
             FROM analytics_events 
             WHERE created_at BETWEEN p_start_date AND p_end_date
             GROUP BY event_type
             ORDER BY event_count DESC
             LIMIT 10
         ) top_events) as top_events,
        
        -- Device breakdown
        (SELECT jsonb_agg(jsonb_build_object('device', device_type, 'count', device_count))
         FROM (
             SELECT device_type, COUNT(*) as device_count
             FROM user_sessions 
             WHERE started_at BETWEEN p_start_date AND p_end_date
             GROUP BY device_type
             ORDER BY device_count DESC
         ) device_breakdown) as device_breakdown,
        
        -- Country breakdown
        (SELECT jsonb_agg(jsonb_build_object('country', country_code, 'count', country_count))
         FROM (
             SELECT country_code, COUNT(*) as country_count
             FROM user_sessions 
             WHERE started_at BETWEEN p_start_date AND p_end_date
             GROUP BY country_code
             ORDER BY country_count DESC
             LIMIT 10
         ) country_breakdown) as country_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
