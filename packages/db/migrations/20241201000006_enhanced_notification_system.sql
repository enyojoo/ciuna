-- Enhanced notification system with templates and user preferences
-- This migration extends the basic notification system with advanced features

-- Create notification templates table
CREATE TABLE notification_templates (
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

-- Create user notification preferences table
CREATE TABLE user_notification_preferences (
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

-- Create notification queue table for background processing
CREATE TABLE notification_queues (
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

-- Add indexes for performance
CREATE INDEX idx_notification_templates_type_channel ON notification_templates(type, channel);
CREATE INDEX idx_notification_templates_language ON notification_templates(language_code);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);

CREATE INDEX idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX idx_user_notification_preferences_type_channel ON user_notification_preferences(type, channel);

CREATE INDEX idx_notification_queues_status ON notification_queues(status);
CREATE INDEX idx_notification_queues_scheduled ON notification_queues(scheduled_for);
CREATE INDEX idx_notification_queues_priority ON notification_queues(priority DESC, scheduled_for ASC);

-- Add triggers for updated_at columns
CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON notification_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at 
    BEFORE UPDATE ON user_notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_queues_updated_at 
    BEFORE UPDATE ON notification_queues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification templates
INSERT INTO notification_templates (type, channel, language_code, subject, title, content, html_content, variables) VALUES
-- Welcome notifications
('WELCOME', 'EMAIL', 'en', 'Welcome to Ciuna!', 'Welcome to Ciuna!', 'Welcome to Ciuna, {{user_name}}! We''re excited to have you join our expat community marketplace.', '<h1>Welcome to Ciuna!</h1><p>Welcome to Ciuna, {{user_name}}! We''re excited to have you join our expat community marketplace.</p>', ARRAY['user_name']),
('WELCOME', 'PUSH', 'en', NULL, 'Welcome to Ciuna!', 'Welcome to Ciuna, {{user_name}}! Start exploring our marketplace.', NULL, ARRAY['user_name']),

-- Order notifications
('ORDER_UPDATE', 'EMAIL', 'en', 'Order Update: {{order_id}}', 'Order Update', 'Your order {{order_id}} has been updated: {{status}}. {{message}}', '<h2>Order Update</h2><p>Your order <strong>{{order_id}}</strong> has been updated: <strong>{{status}}</strong>.</p><p>{{message}}</p>', ARRAY['order_id', 'status', 'message']),
('ORDER_UPDATE', 'PUSH', 'en', NULL, 'Order Update', 'Order {{order_id}}: {{status}}', NULL, ARRAY['order_id', 'status']),

-- Payment notifications
('PAYMENT_RECEIVED', 'EMAIL', 'en', 'Payment Received: {{amount}}', 'Payment Received', 'You received a payment of {{amount}} {{currency}} for {{item_name}}.', '<h2>Payment Received</h2><p>You received a payment of <strong>{{amount}} {{currency}}</strong> for {{item_name}}.</p>', ARRAY['amount', 'currency', 'item_name']),
('PAYMENT_RECEIVED', 'SMS', 'en', NULL, 'Payment Received', 'Payment of {{amount}} {{currency}} received for {{item_name}}.', NULL, ARRAY['amount', 'currency', 'item_name']),

-- Message notifications
('MESSAGE', 'PUSH', 'en', NULL, 'New Message', 'New message from {{sender_name}}: {{message_preview}}', NULL, ARRAY['sender_name', 'message_preview']),
('MESSAGE', 'IN_APP', 'en', NULL, 'New Message', 'New message from {{sender_name}}', NULL, ARRAY['sender_name']),

-- Security notifications
('SECURITY_ALERT', 'EMAIL', 'en', 'Security Alert', 'Security Alert', 'We detected unusual activity on your account. {{message}}', '<h2>Security Alert</h2><p>We detected unusual activity on your account.</p><p>{{message}}</p>', ARRAY['message']),
('SECURITY_ALERT', 'SMS', 'en', NULL, 'Security Alert', 'Security alert: {{message}}', NULL, ARRAY['message']),

-- Listing notifications
('LISTING_APPROVED', 'EMAIL', 'en', 'Listing Approved', 'Your listing has been approved', 'Great news! Your listing "{{listing_title}}" has been approved and is now live.', '<h2>Listing Approved</h2><p>Great news! Your listing "<strong>{{listing_title}}</strong>" has been approved and is now live.</p>', ARRAY['listing_title']),
('LISTING_REJECTED', 'EMAIL', 'en', 'Listing Rejected', 'Your listing needs changes', 'Your listing "{{listing_title}}" was rejected. Reason: {{reason}}', '<h2>Listing Rejected</h2><p>Your listing "<strong>{{listing_title}}</strong>" was rejected.</p><p><strong>Reason:</strong> {{reason}}</p>', ARRAY['listing_title', 'reason']),

-- Service booking notifications
('SERVICE_BOOKING', 'EMAIL', 'en', 'New Service Booking', 'New Service Booking', 'You have a new service booking for "{{service_name}}" on {{booking_date}} at {{booking_time}}.', '<h2>New Service Booking</h2><p>You have a new service booking for "<strong>{{service_name}}</strong>" on {{booking_date}} at {{booking_time}}.</p>', ARRAY['service_name', 'booking_date', 'booking_time']),
('SERVICE_BOOKING', 'PUSH', 'en', NULL, 'New Service Booking', 'New booking for {{service_name}} on {{booking_date}}', NULL, ARRAY['service_name', 'booking_date']),

-- Russian language templates
('WELCOME', 'EMAIL', 'ru', 'Добро пожаловать в Ciuna!', 'Добро пожаловать в Ciuna!', 'Добро пожаловать в Ciuna, {{user_name}}! Мы рады, что вы присоединились к нашему маркетплейсу для экспатов.', '<h1>Добро пожаловать в Ciuna!</h1><p>Добро пожаловать в Ciuna, {{user_name}}! Мы рады, что вы присоединились к нашему маркетплейсу для экспатов.</p>', ARRAY['user_name']),
('ORDER_UPDATE', 'EMAIL', 'ru', 'Обновление заказа: {{order_id}}', 'Обновление заказа', 'Ваш заказ {{order_id}} был обновлен: {{status}}. {{message}}', '<h2>Обновление заказа</h2><p>Ваш заказ <strong>{{order_id}}</strong> был обновлен: <strong>{{status}}</strong>.</p><p>{{message}}</p>', ARRAY['order_id', 'status', 'message']),
('PAYMENT_RECEIVED', 'EMAIL', 'ru', 'Платеж получен: {{amount}}', 'Платеж получен', 'Вы получили платеж в размере {{amount}} {{currency}} за {{item_name}}.', '<h2>Платеж получен</h2><p>Вы получили платеж в размере <strong>{{amount}} {{currency}}</strong> за {{item_name}}.</p>', ARRAY['amount', 'currency', 'item_name']);

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
            AND profiles.role = 'admin'
        )
    );

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
