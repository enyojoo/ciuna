-- Enhanced notification system with templates and user preferences
-- This migration extends the basic notification system with advanced features

-- Create notification templates table (if not exists)
CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN (
        'ORDER_UPDATE', 'MESSAGE', 'BOOKING_CONFIRMATION', 'DEAL_CLOSED', 
        'ADMIN_ALERT', 'PROMOTION', 'PAYMENT_RECEIVED', 'PAYMENT_SENT',
        'SHIPPING_UPDATE', 'REVIEW_REQUEST', 'LISTING_APPROVED', 'LISTING_REJECTED',
        'VENDOR_APPROVED', 'VENDOR_REJECTED', 'SERVICE_BOOKING', 'GROUP_BUY_UPDATE',
        'SECURITY_ALERT', 'WELCOME', 'PASSWORD_RESET', 'EMAIL_VERIFICATION'
    )),
    channel TEXT NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')),
    language_code TEXT NOT NULL DEFAULT 'en' CHECK (LENGTH(language_code) = 2),
    subject TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing notification_templates table
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Add missing values to notification_type enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'WELCOME';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'ORDER_UPDATE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'MESSAGE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'BOOKING_CONFIRMATION';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'DEAL_CLOSED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'ADMIN_ALERT';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PROMOTION';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PAYMENT_SENT';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'SHIPPING_UPDATE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'REVIEW_REQUEST';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'SERVICE_BOOKING';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'GROUP_BUY_UPDATE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PASSWORD_RESET';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'EMAIL_VERIFICATION';

-- Create function to convert JSONB to TEXT array
CREATE OR REPLACE FUNCTION jsonb_to_text_array(jsonb_val JSONB)
RETURNS TEXT[] AS $$
BEGIN
    IF jsonb_val IS NULL THEN
        RETURN ARRAY[]::TEXT[];
    ELSIF jsonb_typeof(jsonb_val) = 'array' THEN
        RETURN ARRAY(SELECT jsonb_array_elements_text(jsonb_val));
    ELSE
        RETURN ARRAY[]::TEXT[];
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Convert JSONB variables to TEXT array using the function
-- First drop the default constraint, then alter the type, then set new default
ALTER TABLE notification_templates ALTER COLUMN variables DROP DEFAULT;
ALTER TABLE notification_templates ALTER COLUMN variables TYPE TEXT[] USING jsonb_to_text_array(variables);
ALTER TABLE notification_templates ALTER COLUMN variables SET DEFAULT ARRAY[]::TEXT[];

-- Drop the temporary function
DROP FUNCTION jsonb_to_text_array(JSONB);

-- Create user notification preferences table (if not exists)
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'ORDER_UPDATE', 'MESSAGE', 'BOOKING_CONFIRMATION', 'DEAL_CLOSED', 
        'ADMIN_ALERT', 'PROMOTION', 'PAYMENT_RECEIVED', 'PAYMENT_SENT',
        'SHIPPING_UPDATE', 'REVIEW_REQUEST', 'LISTING_APPROVED', 'LISTING_REJECTED',
        'VENDOR_APPROVED', 'VENDOR_REJECTED', 'SERVICE_BOOKING', 'GROUP_BUY_UPDATE',
        'SECURITY_ALERT', 'WELCOME', 'PASSWORD_RESET', 'EMAIL_VERIFICATION'
    )),
    channel TEXT NOT NULL CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, type, channel)
);

-- Create notification queue table for background processing (if not exists)
CREATE TABLE IF NOT EXISTS notification_queues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    priority INTEGER DEFAULT 0,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_notification_templates_type_channel ON notification_templates(type, channel);
CREATE INDEX IF NOT EXISTS idx_notification_templates_language ON notification_templates(language_code);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_type_channel ON user_notification_preferences(type, channel);

CREATE INDEX IF NOT EXISTS idx_notification_queues_status ON notification_queues(status);
CREATE INDEX IF NOT EXISTS idx_notification_queues_scheduled ON notification_queues(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queues_priority ON notification_queues(priority DESC, scheduled_for ASC);

-- Add triggers for updated_at columns (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON notification_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_user_notification_preferences_updated_at 
    BEFORE UPDATE ON user_notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_queues_updated_at ON notification_queues;
CREATE TRIGGER update_notification_queues_updated_at 
    BEFORE UPDATE ON notification_queues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification templates (only for existing enum values)
INSERT INTO notification_templates (type, channel, language_code, subject, title, content, html_content, variables) VALUES
-- Payment notifications (using existing enum values)
('PAYMENT_RECEIVED', 'EMAIL', 'en', 'Payment Received: {{amount}}', 'Payment Received', 'You received a payment of {{amount}} {{currency}} for {{item_name}}.', '<h2>Payment Received</h2><p>You received a payment of <strong>{{amount}} {{currency}}</strong> for {{item_name}}.</p>', ARRAY['amount', 'currency', 'item_name']),
('PAYMENT_RECEIVED', 'SMS', 'en', NULL, 'Payment Received', 'Payment of {{amount}} {{currency}} received for {{item_name}}.', NULL, ARRAY['amount', 'currency', 'item_name']),

-- Security notifications
('SECURITY_ALERT', 'EMAIL', 'en', 'Security Alert', 'Security Alert', 'We detected unusual activity on your account. {{message}}', '<h2>Security Alert</h2><p>We detected unusual activity on your account.</p><p>{{message}}</p>', ARRAY['message']),
('SECURITY_ALERT', 'SMS', 'en', NULL, 'Security Alert', 'Security alert: {{message}}', NULL, ARRAY['message']),

-- Listing notifications
('LISTING_APPROVED', 'EMAIL', 'en', 'Listing Approved', 'Your listing has been approved', 'Great news! Your listing "{{listing_title}}" has been approved and is now live.', '<h2>Listing Approved</h2><p>Great news! Your listing "<strong>{{listing_title}}</strong>" has been approved and is now live.</p>', ARRAY['listing_title']),
('LISTING_REJECTED', 'EMAIL', 'en', 'Listing Rejected', 'Your listing needs changes', 'Your listing "{{listing_title}}" was rejected. Reason: {{reason}}', '<h2>Listing Rejected</h2><p>Your listing "<strong>{{listing_title}}</strong>" was rejected.</p><p><strong>Reason:</strong> {{reason}}</p>', ARRAY['listing_title', 'reason']),

-- Message notifications (using existing enum values)
('MESSAGE_RECEIVED', 'PUSH', 'en', NULL, 'New Message', 'New message from {{sender_name}}: {{message_preview}}', NULL, ARRAY['sender_name', 'message_preview']),
('MESSAGE_RECEIVED', 'IN_APP', 'en', NULL, 'New Message', 'New message from {{sender_name}}', NULL, ARRAY['sender_name']),

-- Order notifications (using existing enum values)
('ORDER_UPDATED', 'EMAIL', 'en', 'Order Update: {{order_id}}', 'Order Update', 'Your order {{order_id}} has been updated: {{status}}. {{message}}', '<h2>Order Update</h2><p>Your order <strong>{{order_id}}</strong> has been updated: <strong>{{status}}</strong>.</p><p>{{message}}</p>', ARRAY['order_id', 'status', 'message']),
('ORDER_UPDATED', 'PUSH', 'en', NULL, 'Order Update', 'Order {{order_id}}: {{status}}', NULL, ARRAY['order_id', 'status']),

-- Service booking notifications (using existing enum values)
('SERVICE_BOOKED', 'EMAIL', 'en', 'New Service Booking', 'New Service Booking', 'You have a new service booking for "{{service_name}}" on {{booking_date}} at {{booking_time}}.', '<h2>New Service Booking</h2><p>You have a new service booking for "<strong>{{service_name}}</strong>" on {{booking_date}} at {{booking_time}}.</p>', ARRAY['service_name', 'booking_date', 'booking_time']),
('SERVICE_BOOKED', 'PUSH', 'en', NULL, 'New Service Booking', 'New booking for {{service_name}} on {{booking_date}}', NULL, ARRAY['service_name', 'booking_date']),

-- Russian language templates (using existing enum values)
('PAYMENT_RECEIVED', 'EMAIL', 'ru', 'Платеж получен: {{amount}}', 'Платеж получен', 'Вы получили платеж в размере {{amount}} {{currency}} за {{item_name}}.', '<h2>Платеж получен</h2><p>Вы получили платеж в размере <strong>{{amount}} {{currency}}</strong> за {{item_name}}.</p>', ARRAY['amount', 'currency', 'item_name']),
('ORDER_UPDATED', 'EMAIL', 'ru', 'Обновление заказа: {{order_id}}', 'Обновление заказа', 'Ваш заказ {{order_id}} был обновлен: {{status}}. {{message}}', '<h2>Обновление заказа</h2><p>Ваш заказ <strong>{{order_id}}</strong> был обновлен: <strong>{{status}}</strong>.</p><p>{{message}}</p>', ARRAY['order_id', 'status', 'message'])
ON CONFLICT DO NOTHING;

-- Create RLS policies for notification templates (public read access)
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notification templates are publicly readable" ON notification_templates
    FOR SELECT USING (is_active = true);

-- Create RLS policies for user notification preferences
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences" ON user_notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON user_notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" ON user_notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notification queues (admin only)
ALTER TABLE notification_queues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access notification queues" ON notification_queues
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS create_notification_with_queue(UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, INTEGER);
DROP FUNCTION IF EXISTS mark_notification_read(UUID);

-- Create function to create notification with queue entry
CREATE OR REPLACE FUNCTION create_notification_with_queue(
    p_user_id UUID,
    p_type TEXT,
    p_channel TEXT,
    p_title TEXT,
    p_content TEXT,
    p_data JSONB DEFAULT '{}',
    p_scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    p_priority INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Create notification
    INSERT INTO notifications (
        recipient_id, type, channel, title, message, data, status
    ) VALUES (
        p_user_id, p_type, p_channel, p_title, p_content, p_data, 'PENDING'
    ) RETURNING id INTO notification_id;

    -- Create queue entry
    INSERT INTO notification_queues (
        notification_id, priority, scheduled_for
    ) VALUES (
        notification_id, p_priority, p_scheduled_for
    );

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_user_notifications(UUID, INTEGER, INTEGER, BOOLEAN);

-- Create function to get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_unread_only BOOLEAN DEFAULT FALSE
) RETURNS TABLE (
    id UUID,
    type TEXT,
    channel TEXT,
    status TEXT,
    subject TEXT,
    title TEXT,
    content TEXT,
    data JSONB,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.type,
        n.channel,
        n.status,
        n.subject,
        n.title,
        n.content,
        n.data,
        n.sent_at,
        n.read_at,
        n.created_at
    FROM notifications n
    WHERE n.recipient_id = p_user_id
    AND (NOT p_unread_only OR n.read_at IS NULL)
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET read_at = NOW(), updated_at = NOW()
    WHERE id = p_notification_id 
    AND recipient_id = auth.uid()
    AND read_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
