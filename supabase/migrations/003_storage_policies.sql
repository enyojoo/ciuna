-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('listing-images', 'listing-images', true),
    ('vendor-images', 'vendor-images', true),
    ('service-images', 'service-images', true);

-- Storage policies for listing-images
CREATE POLICY "Public read access for approved listing images" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Users can upload listing images to own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own listing images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'listing-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own listing images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'listing-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for vendor-images
CREATE POLICY "Public read access for approved vendor images" ON storage.objects
    FOR SELECT USING (bucket_id = 'vendor-images');

CREATE POLICY "Vendor owners can upload vendor images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vendor-images' AND
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE id::text = (storage.foldername(name))[1] AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Vendor owners can update vendor images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'vendor-images' AND
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE id::text = (storage.foldername(name))[1] AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Vendor owners can delete vendor images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'vendor-images' AND
        EXISTS (
            SELECT 1 FROM vendors 
            WHERE id::text = (storage.foldername(name))[1] AND owner_id = auth.uid()
        )
    );

-- Storage policies for service-images
CREATE POLICY "Public read access for approved service images" ON storage.objects
    FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Service providers can upload service images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'service-images' AND
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id::text = (storage.foldername(name))[1] AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Service providers can update service images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'service-images' AND
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id::text = (storage.foldername(name))[1] AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Service providers can delete service images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'service-images' AND
        EXISTS (
            SELECT 1 FROM service_providers 
            WHERE id::text = (storage.foldername(name))[1] AND profile_id = auth.uid()
        )
    );
