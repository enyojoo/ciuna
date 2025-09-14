-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE intl_shipment_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_ledger ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON listings
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Sellers can manage own listings" ON listings
    FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Admins can moderate listings" ON listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Vendors policies
CREATE POLICY "Anyone can view active vendors" ON vendors
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Vendor owners can manage own vendors" ON vendors
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all vendors" ON vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Vendor products policies
CREATE POLICY "Anyone can view active vendor products" ON vendor_products
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Vendor owners can manage their products" ON vendor_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE id = vendor_products.vendor_id AND owner_id = auth.uid()
        )
    );

-- Group buy deals policies
CREATE POLICY "Anyone can view active group buy deals" ON group_buy_deals
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Vendor owners can manage their group buy deals" ON group_buy_deals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM vendor_products vp
            JOIN vendors v ON v.id = vp.vendor_id
            WHERE vp.id = group_buy_deals.vendor_product_id AND v.owner_id = auth.uid()
        )
    );

-- Group buy orders policies
CREATE POLICY "Buyers and vendors can view group buy orders" ON group_buy_orders
    FOR SELECT USING (
        buyer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM group_buy_deals gbd
            JOIN vendor_products vp ON vp.id = gbd.vendor_product_id
            JOIN vendors v ON v.id = vp.vendor_id
            WHERE gbd.id = group_buy_orders.deal_id AND v.owner_id = auth.uid()
        )
    );

CREATE POLICY "Buyers can create group buy orders" ON group_buy_orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Service providers policies
CREATE POLICY "Anyone can view active service providers" ON service_providers
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Providers can manage own profile" ON service_providers
    FOR ALL USING (profile_id = auth.uid());

-- Services policies
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Service providers can manage their services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id = services.provider_id AND profile_id = auth.uid()
        )
    );

-- Service bookings policies
CREATE POLICY "Clients and providers can view bookings" ON service_bookings
    FOR SELECT USING (
        client_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM services s
            JOIN service_providers sp ON sp.id = s.provider_id
            WHERE s.id = service_bookings.service_id AND sp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Clients can create bookings" ON service_bookings
    FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Providers can update their bookings" ON service_bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM services s
            JOIN service_providers sp ON sp.id = s.provider_id
            WHERE s.id = service_bookings.service_id AND sp.profile_id = auth.uid()
        )
    );

-- Conversations policies
CREATE POLICY "Participants can view conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = conversations.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Conversation participants policies
CREATE POLICY "Participants can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id 
            AND cp2.user_id = auth.uid()
        )
    );

CREATE POLICY "Conversation creators can add participants" ON conversation_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_participants.conversation_id AND created_by = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Participants can view messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- Addresses policies
CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Buyers and sellers can view orders" ON orders
    FOR SELECT USING (
        buyer_id = auth.uid() OR 
        seller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers and admins can update orders" ON orders
    FOR UPDATE USING (
        seller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Payments policies
CREATE POLICY "Order participants can view payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE payment_id = payments.id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Reviews policies
CREATE POLICY "Order participants can view reviews" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = reviews.order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Buyers can create reviews" ON reviews
    FOR INSERT WITH CHECK (
        reviewer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = reviews.order_id AND buyer_id = auth.uid()
        )
    );

-- Deliveries policies
CREATE POLICY "Order participants can view deliveries" ON deliveries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = deliveries.order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- International shipment quotes policies (public read)
CREATE POLICY "Anyone can view shipment quotes" ON intl_shipment_quotes
    FOR SELECT USING (true);

-- Payout ledger policies
CREATE POLICY "Users can view own payouts" ON payout_ledger
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payouts" ON payout_ledger
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );
