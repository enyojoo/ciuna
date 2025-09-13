-- Business Features System
-- This migration creates tables for subscriptions, reporting, and business tools

-- Create subscription plans table
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('BASIC', 'PREMIUM', 'ENTERPRISE', 'CUSTOM')),
    price_monthly INTEGER NOT NULL, -- Price in cents
    price_yearly INTEGER, -- Price in cents
    currency_code TEXT NOT NULL DEFAULT 'RUB',
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    trial_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
        'TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'PAST_DUE'
    )),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
    price INTEGER NOT NULL,
    currency_code TEXT NOT NULL,
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business reports table
CREATE TABLE business_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'SALES', 'REVENUE', 'ORDERS', 'CUSTOMERS', 'INVENTORY', 'PERFORMANCE', 'CUSTOM'
    )),
    title TEXT NOT NULL,
    description TEXT,
    date_range_start TIMESTAMPTZ NOT NULL,
    date_range_end TIMESTAMPTZ NOT NULL,
    filters JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'GENERATING' CHECK (status IN (
        'GENERATING', 'COMPLETED', 'FAILED', 'CANCELLED'
    )),
    generated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business metrics table
CREATE TABLE business_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT,
    date DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, metric_type, metric_name, date)
);

-- Create inventory items table
CREATE TABLE inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    category TEXT,
    price INTEGER NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'RUB',
    cost INTEGER, -- Cost price for profit calculation
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    unit TEXT DEFAULT 'piece',
    weight DECIMAL(10,3),
    dimensions JSONB DEFAULT '{}', -- {length, width, height}
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory movements table
CREATE TABLE inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN (
        'IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN', 'DAMAGE', 'LOSS'
    )),
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference_id UUID, -- Reference to order, transfer, etc.
    reference_type TEXT, -- 'ORDER', 'TRANSFER', 'ADJUSTMENT', etc.
    cost_per_unit INTEGER,
    total_cost INTEGER,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business analytics table
CREATE TABLE business_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    analytics_type TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    metrics JSONB NOT NULL,
    insights JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business goals table
CREATE TABLE business_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL CHECK (goal_type IN (
        'REVENUE', 'SALES', 'CUSTOMERS', 'ORDERS', 'INVENTORY', 'CUSTOM'
    )),
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    unit TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
        'ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'
    )),
    progress_percentage NUMERIC DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business notifications table
CREATE TABLE business_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'LOW_INVENTORY', 'GOAL_ACHIEVED', 'GOAL_AT_RISK', 'REVENUE_MILESTONE',
        'ORDER_ALERT', 'CUSTOMER_INSIGHT', 'PERFORMANCE_ALERT', 'CUSTOM'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business integrations table
CREATE TABLE business_integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    integration_type TEXT NOT NULL CHECK (integration_type IN (
        'ACCOUNTING', 'INVENTORY', 'SHIPPING', 'PAYMENT', 'ANALYTICS', 'CUSTOM'
    )),
    provider_name TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'PENDING' CHECK (sync_status IN (
        'PENDING', 'SYNCING', 'SUCCESS', 'FAILED', 'DISABLED'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add business fields to existing tables
ALTER TABLE profiles ADD COLUMN business_type TEXT CHECK (business_type IN (
    'INDIVIDUAL', 'SMALL_BUSINESS', 'ENTERPRISE', 'NON_PROFIT'
));
ALTER TABLE profiles ADD COLUMN business_name TEXT;
ALTER TABLE profiles ADD COLUMN business_registration TEXT;
ALTER TABLE profiles ADD COLUMN tax_id TEXT;
ALTER TABLE profiles ADD COLUMN business_address JSONB;
ALTER TABLE profiles ADD COLUMN business_phone TEXT;
ALTER TABLE profiles ADD COLUMN business_email TEXT;
ALTER TABLE profiles ADD COLUMN business_website TEXT;
ALTER TABLE profiles ADD COLUMN business_description TEXT;

-- Create indexes for performance
CREATE INDEX idx_subscription_plans_type ON subscription_plans(plan_type);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

CREATE INDEX idx_business_reports_user_id ON business_reports(user_id);
CREATE INDEX idx_business_reports_type ON business_reports(report_type);
CREATE INDEX idx_business_reports_status ON business_reports(status);
CREATE INDEX idx_business_reports_date_range ON business_reports(date_range_start, date_range_end);

CREATE INDEX idx_business_metrics_user_id ON business_metrics(user_id);
CREATE INDEX idx_business_metrics_type ON business_metrics(metric_type);
CREATE INDEX idx_business_metrics_date ON business_metrics(date);

CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_active ON inventory_items(is_active);

CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);

CREATE INDEX idx_business_analytics_user_id ON business_analytics(user_id);
CREATE INDEX idx_business_analytics_type ON business_analytics(analytics_type);
CREATE INDEX idx_business_analytics_period ON business_analytics(period_start, period_end);

CREATE INDEX idx_business_goals_user_id ON business_goals(user_id);
CREATE INDEX idx_business_goals_type ON business_goals(goal_type);
CREATE INDEX idx_business_goals_status ON business_goals(status);
CREATE INDEX idx_business_goals_dates ON business_goals(start_date, end_date);

CREATE INDEX idx_business_notifications_user_id ON business_notifications(user_id);
CREATE INDEX idx_business_notifications_type ON business_notifications(notification_type);
CREATE INDEX idx_business_notifications_read ON business_notifications(is_read);
CREATE INDEX idx_business_notifications_created_at ON business_notifications(created_at);

CREATE INDEX idx_business_integrations_user_id ON business_integrations(user_id);
CREATE INDEX idx_business_integrations_type ON business_integrations(integration_type);
CREATE INDEX idx_business_integrations_active ON business_integrations(is_active);

-- Add triggers for updated_at columns
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at 
    BEFORE UPDATE ON inventory_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_goals_updated_at 
    BEFORE UPDATE ON business_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_integrations_updated_at 
    BEFORE UPDATE ON business_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, plan_type, price_monthly, price_yearly, currency_code, features, limits) VALUES
('Basic', 'Perfect for individuals and small sellers', 'BASIC', 9900, 99000, 'RUB', 
 '{"listings": 10, "images_per_listing": 5, "analytics": true, "support": "email"}',
 '{"max_listings": 10, "max_images": 50, "storage_gb": 1}'),

('Premium', 'Ideal for growing businesses', 'PREMIUM', 29900, 299000, 'RUB',
 '{"listings": 100, "images_per_listing": 10, "analytics": true, "support": "priority", "promotion": true}',
 '{"max_listings": 100, "max_images": 1000, "storage_gb": 10}'),

('Enterprise', 'For large businesses and enterprises', 'ENTERPRISE', 99900, 999000, 'RUB',
 '{"listings": -1, "images_per_listing": 20, "analytics": true, "support": "dedicated", "promotion": true, "api_access": true}',
 '{"max_listings": -1, "max_images": -1, "storage_gb": 100}');

-- Create business functions
CREATE OR REPLACE FUNCTION create_business_report(
    p_user_id UUID,
    p_report_type TEXT,
    p_title TEXT,
    p_date_range_start TIMESTAMPTZ,
    p_date_range_end TIMESTAMPTZ,
    p_filters JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    report_id UUID;
BEGIN
    INSERT INTO business_reports (
        user_id, report_type, title, date_range_start, date_range_end, filters
    ) VALUES (
        p_user_id, p_report_type, p_title, p_date_range_start, p_date_range_end, p_filters
    ) RETURNING id INTO report_id;
    
    -- Generate report data asynchronously
    -- This would trigger a background job in a real implementation
    
    RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_inventory_quantity(
    p_inventory_item_id UUID,
    p_quantity_change INTEGER,
    p_movement_type TEXT,
    p_reason TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_quantity INTEGER;
    new_quantity INTEGER;
BEGIN
    -- Get current quantity
    SELECT quantity INTO current_quantity
    FROM inventory_items
    WHERE id = p_inventory_item_id;
    
    IF current_quantity IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new quantity based on movement type
    IF p_movement_type = 'IN' OR p_movement_type = 'RETURN' THEN
        new_quantity := current_quantity + p_quantity_change;
    ELSIF p_movement_type = 'OUT' OR p_movement_type = 'DAMAGE' OR p_movement_type = 'LOSS' THEN
        new_quantity := current_quantity - p_quantity_change;
    ELSIF p_movement_type = 'ADJUSTMENT' THEN
        new_quantity := p_quantity_change;
    ELSE
        RETURN FALSE;
    END IF;
    
    -- Ensure quantity doesn't go negative
    IF new_quantity < 0 THEN
        new_quantity := 0;
    END IF;
    
    -- Update inventory quantity
    UPDATE inventory_items
    SET quantity = new_quantity, updated_at = NOW()
    WHERE id = p_inventory_item_id;
    
    -- Record movement
    INSERT INTO inventory_movements (
        inventory_item_id, movement_type, quantity, reason,
        reference_id, reference_type, created_by
    ) VALUES (
        p_inventory_item_id, p_movement_type, p_quantity_change, p_reason,
        p_reference_id, p_reference_type, p_created_by
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_business_metrics(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS JSONB AS $$
DECLARE
    metrics JSONB;
    total_revenue INTEGER;
    total_orders INTEGER;
    total_customers INTEGER;
    avg_order_value NUMERIC;
BEGIN
    -- Calculate revenue
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue
    FROM payment_transactions pt
    JOIN orders o ON o.id = pt.order_id
    WHERE o.seller_id = p_user_id
    AND pt.status = 'COMPLETED'
    AND DATE(pt.created_at) BETWEEN p_start_date AND p_end_date;
    
    -- Calculate orders
    SELECT COUNT(*) INTO total_orders
    FROM orders
    WHERE seller_id = p_user_id
    AND DATE(created_at) BETWEEN p_start_date AND p_end_date;
    
    -- Calculate unique customers
    SELECT COUNT(DISTINCT buyer_id) INTO total_customers
    FROM orders
    WHERE seller_id = p_user_id
    AND DATE(created_at) BETWEEN p_start_date AND p_end_date;
    
    -- Calculate average order value
    IF total_orders > 0 THEN
        avg_order_value := total_revenue::NUMERIC / total_orders;
    ELSE
        avg_order_value := 0;
    END IF;
    
    metrics := jsonb_build_object(
        'total_revenue', total_revenue,
        'total_orders', total_orders,
        'total_customers', total_customers,
        'avg_order_value', avg_order_value,
        'period_start', p_start_date,
        'period_end', p_end_date
    );
    
    RETURN metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_integrations ENABLE ROW LEVEL SECURITY;

-- Subscription plans: public read access
CREATE POLICY "Subscription plans are publicly readable" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- User subscriptions: users can manage their own
CREATE POLICY "Users can manage their own subscriptions" ON user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Business reports: users can manage their own
CREATE POLICY "Users can manage their own reports" ON business_reports
    FOR ALL USING (auth.uid() = user_id);

-- Business metrics: users can manage their own
CREATE POLICY "Users can manage their own metrics" ON business_metrics
    FOR ALL USING (auth.uid() = user_id);

-- Inventory items: users can manage their own
CREATE POLICY "Users can manage their own inventory" ON inventory_items
    FOR ALL USING (auth.uid() = user_id);

-- Inventory movements: users can view their own
CREATE POLICY "Users can view their own inventory movements" ON inventory_movements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM inventory_items 
            WHERE inventory_items.id = inventory_movements.inventory_item_id 
            AND inventory_items.user_id = auth.uid()
        )
    );

-- Business analytics: users can manage their own
CREATE POLICY "Users can manage their own analytics" ON business_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Business goals: users can manage their own
CREATE POLICY "Users can manage their own goals" ON business_goals
    FOR ALL USING (auth.uid() = user_id);

-- Business notifications: users can manage their own
CREATE POLICY "Users can manage their own notifications" ON business_notifications
    FOR ALL USING (auth.uid() = user_id);

-- Business integrations: users can manage their own
CREATE POLICY "Users can manage their own integrations" ON business_integrations
    FOR ALL USING (auth.uid() = user_id);
