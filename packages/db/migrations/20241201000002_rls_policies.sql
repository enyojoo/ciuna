-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE intl_shipment_quotes ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Categories RLS Policies
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Addresses RLS Policies
CREATE POLICY "Users can view their own addresses" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Listings RLS Policies
CREATE POLICY "Active listings are viewable by everyone" ON listings
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Users can view their own listings" ON listings
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert their own listings" ON listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" ON listings
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings" ON listings
    FOR DELETE USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all listings" ON listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Conversations RLS Policies
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = conversations.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update conversations they participate in" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = conversations.id AND user_id = auth.uid()
        )
    );

-- Conversation Participants RLS Policies
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id 
            AND cp2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert themselves into conversations" ON conversation_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON conversation_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Messages RLS Policies
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Vendors RLS Policies
CREATE POLICY "Active vendors are viewable by everyone" ON vendors
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Vendor owners can view their own vendors" ON vendors
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Vendor owners can insert their own vendors" ON vendors
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Vendor owners can update their own vendors" ON vendors
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all vendors" ON vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Vendor Products RLS Policies
CREATE POLICY "Active products are viewable by everyone" ON vendor_products
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Vendor owners can view their own products" ON vendor_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE id = vendor_products.vendor_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Vendor owners can insert their own products" ON vendor_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE id = vendor_products.vendor_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Vendor owners can update their own products" ON vendor_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE id = vendor_products.vendor_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all products" ON vendor_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Group Buy Deals RLS Policies
CREATE POLICY "Active group buy deals are viewable by everyone" ON group_buy_deals
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Vendor owners can manage their own deals" ON group_buy_deals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM vendor_products vp
            JOIN vendors v ON v.id = vp.vendor_id
            WHERE vp.id = group_buy_deals.vendor_product_id AND v.owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all group buy deals" ON group_buy_deals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Group Buy Orders RLS Policies
CREATE POLICY "Users can view their own group buy orders" ON group_buy_orders
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can insert their own group buy orders" ON group_buy_orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own group buy orders" ON group_buy_orders
    FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Vendor owners can view orders for their deals" ON group_buy_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_buy_deals gbd
            JOIN vendor_products vp ON vp.id = gbd.vendor_product_id
            JOIN vendors v ON v.id = vp.vendor_id
            WHERE gbd.id = group_buy_orders.deal_id AND v.owner_id = auth.uid()
        )
    );

-- Service Providers RLS Policies
CREATE POLICY "Active service providers are viewable by everyone" ON service_providers
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Service providers can view their own profile" ON service_providers
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Service providers can insert their own profile" ON service_providers
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Service providers can update their own profile" ON service_providers
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Admins can manage all service providers" ON service_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Services RLS Policies
CREATE POLICY "Active services are viewable by everyone" ON services
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Service providers can view their own services" ON services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id = services.provider_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Service providers can insert their own services" ON services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id = services.provider_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Service providers can update their own services" ON services
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id = services.provider_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Service Bookings RLS Policies
CREATE POLICY "Clients can view their own bookings" ON service_bookings
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own bookings" ON service_bookings
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own bookings" ON service_bookings
    FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Service providers can view bookings for their services" ON service_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM services s
            JOIN service_providers sp ON sp.id = s.provider_id
            WHERE s.id = service_bookings.service_id AND sp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Service providers can update bookings for their services" ON service_bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM services s
            JOIN service_providers sp ON sp.id = s.provider_id
            WHERE s.id = service_bookings.service_id AND sp.profile_id = auth.uid()
        )
    );

-- Orders RLS Policies
CREATE POLICY "Buyers can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their items" ON orders
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update orders for their items" ON orders
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Payments RLS Policies
CREATE POLICY "Users can view payments for their orders" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE payment_id = payments.id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Reviews RLS Policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = reviewer_id);

-- Deliveries RLS Policies
CREATE POLICY "Users can view deliveries for their orders" ON deliveries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = deliveries.order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Couriers can view their assigned deliveries" ON deliveries
    FOR SELECT USING (auth.uid() = courier_id);

CREATE POLICY "Users can insert deliveries" ON deliveries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Couriers can update their assigned deliveries" ON deliveries
    FOR UPDATE USING (auth.uid() = courier_id);

CREATE POLICY "Admins can manage all deliveries" ON deliveries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- International Shipment Quotes RLS Policies
CREATE POLICY "Shipment quotes are viewable by everyone" ON intl_shipment_quotes
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage shipment quotes" ON intl_shipment_quotes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );
