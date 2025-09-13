-- Notification System for Ciuna Marketplace

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_CANCELLED', 'ORDER_COMPLETED',
  'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED',
  'LISTING_APPROVED', 'LISTING_REJECTED', 'LISTING_EXPIRED',
  'VENDOR_APPROVED', 'VENDOR_REJECTED', 'VENDOR_SUSPENDED',
  'SERVICE_BOOKED', 'SERVICE_CONFIRMED', 'SERVICE_CANCELLED',
  'MESSAGE_RECEIVED', 'MESSAGE_READ',
  'GROUP_BUY_JOINED', 'GROUP_BUY_COMPLETED', 'GROUP_BUY_CANCELLED',
  'DELIVERY_PICKED_UP', 'DELIVERY_IN_TRANSIT', 'DELIVERY_DELIVERED',
  'REVIEW_RECEIVED', 'REVIEW_RESPONDED',
  'SYSTEM_ANNOUNCEMENT', 'SECURITY_ALERT'
);

-- Create notification channels enum
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- Create notification status enum
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- Create notification templates table
CREATE TABLE notification_templates (
    id BIGSERIAL PRIMARY KEY,
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'en',
    subject TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(type, channel, language_code)
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    status notification_status DEFAULT 'PENDING',
    subject TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    recipient_email TEXT,
    recipient_phone TEXT,
    recipient_device_token TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user notification preferences table
CREATE TABLE user_notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, type, channel)
);

-- Create notification queues table for processing
CREATE TABLE notification_queues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE NOT NULL,
    priority INTEGER DEFAULT 0,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);

CREATE INDEX idx_notification_templates_type_channel ON notification_templates(type, channel);
CREATE INDEX idx_notification_templates_language ON notification_templates(language_code);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX idx_user_notification_preferences_enabled ON user_notification_preferences(enabled) WHERE enabled = TRUE;

CREATE INDEX idx_notification_queues_status ON notification_queues(status);
CREATE INDEX idx_notification_queues_scheduled_for ON notification_queues(scheduled_for);
CREATE INDEX idx_notification_queues_priority ON notification_queues(priority DESC);

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type notification_type,
    p_channel notification_channel,
    p_title TEXT,
    p_content TEXT,
    p_data JSONB DEFAULT '{}',
    p_scheduled_for TIMESTAMPTZ DEFAULT NOW()
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    user_prefs RECORD;
    template RECORD;
    final_subject TEXT;
    final_title TEXT;
    final_content TEXT;
BEGIN
    -- Check user preferences
    SELECT enabled INTO user_prefs
    FROM user_notification_preferences
    WHERE user_id = p_user_id
      AND type = p_type
      AND channel = p_channel;
    
    -- If user has disabled this notification type/channel, skip
    IF user_prefs.enabled = FALSE THEN
        RETURN NULL;
    END IF;
    
    -- Get notification template
    SELECT * INTO template
    FROM notification_templates
    WHERE type = p_type
      AND channel = p_channel
      AND language_code = 'en' -- Default to English for now
      AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Use template if available, otherwise use provided content
    IF template IS NOT NULL THEN
        final_subject := template.subject;
        final_title := template.title;
        final_content := template.content;
    ELSE
        final_subject := NULL;
        final_title := p_title;
        final_content := p_content;
    END IF;
    
    -- Create notification
    INSERT INTO notifications (
        user_id, type, channel, subject, title, content, data, scheduled_for
    ) VALUES (
        p_user_id, p_type, p_channel, final_subject, final_title, final_content, p_data, p_scheduled_for
    ) RETURNING id INTO notification_id;
    
    -- Add to processing queue
    INSERT INTO notification_queues (notification_id, scheduled_for)
    VALUES (notification_id, p_scheduled_for);
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications
    SET read_at = NOW(), updated_at = NOW()
    WHERE id = p_notification_id
      AND read_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_unread_only BOOLEAN DEFAULT FALSE
) RETURNS TABLE (
    id UUID,
    type notification_type,
    channel notification_channel,
    status notification_status,
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
        n.id, n.type, n.channel, n.status, n.subject, n.title, n.content, n.data,
        n.sent_at, n.read_at, n.created_at
    FROM notifications n
    WHERE n.user_id = p_user_id
      AND (NOT p_unread_only OR n.read_at IS NULL)
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification templates
INSERT INTO notification_templates (type, channel, language_code, subject, title, content) VALUES
-- Order notifications
('ORDER_CREATED', 'EMAIL', 'en', 'New Order Created - Ciuna', 'Order Created', 'Your order for {{item_name}} has been created successfully. Order ID: {{order_id}}'),
('ORDER_CREATED', 'PUSH', 'en', NULL, 'New Order', 'Order for {{item_name}} created'),
('ORDER_UPDATED', 'EMAIL', 'en', 'Order Updated - Ciuna', 'Order Updated', 'Your order {{order_id}} status has been updated to {{status}}'),
('ORDER_COMPLETED', 'EMAIL', 'en', 'Order Completed - Ciuna', 'Order Completed', 'Your order {{order_id}} has been completed successfully!'),
('ORDER_CANCELLED', 'EMAIL', 'en', 'Order Cancelled - Ciuna', 'Order Cancelled', 'Your order {{order_id}} has been cancelled. Reason: {{reason}}'),

-- Payment notifications
('PAYMENT_RECEIVED', 'EMAIL', 'en', 'Payment Received - Ciuna', 'Payment Received', 'Payment of {{amount}} {{currency}} has been received for order {{order_id}}'),
('PAYMENT_FAILED', 'EMAIL', 'en', 'Payment Failed - Ciuna', 'Payment Failed', 'Payment for order {{order_id}} failed. Please try again.'),
('PAYMENT_REFUNDED', 'EMAIL', 'en', 'Payment Refunded - Ciuna', 'Payment Refunded', 'A refund of {{amount}} {{currency}} has been processed for order {{order_id}}'),

-- Listing notifications
('LISTING_APPROVED', 'EMAIL', 'en', 'Listing Approved - Ciuna', 'Listing Approved', 'Your listing "{{listing_title}}" has been approved and is now live!'),
('LISTING_REJECTED', 'EMAIL', 'en', 'Listing Rejected - Ciuna', 'Listing Rejected', 'Your listing "{{listing_title}}" was rejected. Reason: {{reason}}'),
('LISTING_EXPIRED', 'EMAIL', 'en', 'Listing Expired - Ciuna', 'Listing Expired', 'Your listing "{{listing_title}}" has expired and is no longer visible.'),

-- Message notifications
('MESSAGE_RECEIVED', 'PUSH', 'en', NULL, 'New Message', 'You have a new message from {{sender_name}}'),
('MESSAGE_RECEIVED', 'EMAIL', 'en', 'New Message - Ciuna', 'New Message', 'You have received a new message from {{sender_name}} regarding {{item_name}}'),

-- System notifications
('SYSTEM_ANNOUNCEMENT', 'EMAIL', 'en', 'System Announcement - Ciuna', 'System Announcement', '{{announcement_title}}: {{announcement_content}}'),
('SECURITY_ALERT', 'EMAIL', 'en', 'Security Alert - Ciuna', 'Security Alert', '{{alert_message}} Please review your account security.');

-- Add updated_at triggers
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_queues_updated_at BEFORE UPDATE ON notification_queues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

