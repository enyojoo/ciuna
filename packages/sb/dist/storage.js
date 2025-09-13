import { supabase } from './client';
// Storage utilities
export const storage = {
    // Upload file to storage
    async uploadFile(bucket, path, file, options) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
            cacheControl: options?.cacheControl || '3600',
            upsert: options?.upsert || false,
            contentType: options?.contentType || file.type,
        });
        return { data, error };
    },
    // Get public URL for file
    getPublicUrl(bucket, path) {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
        return data.publicUrl;
    },
    // Get signed URL for file (for private files)
    async getSignedUrl(bucket, path, expiresIn = 3600) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);
        return { data, error };
    },
    // Delete file from storage
    async deleteFile(bucket, path) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .remove([path]);
        return { data, error };
    },
    // List files in bucket
    async listFiles(bucket, path = '', options) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(path, {
            limit: options?.limit || 100,
            offset: options?.offset || 0,
            sortBy: options?.sortBy || { column: 'name', order: 'asc' },
        });
        return { data, error };
    },
    // Create bucket
    async createBucket(bucketName, options) {
        const { data, error } = await supabase.storage
            .createBucket(bucketName, {
            public: options?.public || false,
            fileSizeLimit: options?.fileSizeLimit || 52428800,
            allowedMimeTypes: options?.allowedMimeTypes || null,
        });
        return { data, error };
    },
    // Delete bucket
    async deleteBucket(bucketName) {
        const { data, error } = await supabase.storage
            .deleteBucket(bucketName);
        return { data, error };
    },
};
// Specific storage buckets for Ciuna
export const buckets = {
    // User avatars
    avatars: 'avatars',
    // Listing photos
    listings: 'listings',
    // Product photos
    products: 'products',
    // Service photos
    services: 'services',
    // Vendor logos
    vendorLogos: 'vendor-logos',
    // Documents (verification, contracts, etc.)
    documents: 'documents',
    // Chat attachments
    attachments: 'attachments',
};
// Helper functions for common storage operations
export const storageHelpers = {
    // Upload user avatar
    async uploadAvatar(userId, file) {
        const path = `${userId}/avatar.${file.name.split('.').pop()}`;
        const { data, error } = await storage.uploadFile(buckets.avatars, path, file);
        if (error)
            throw error;
        return storage.getPublicUrl(buckets.avatars, data.path);
    },
    // Upload listing photo
    async uploadListingPhoto(listingId, file, index) {
        const path = `${listingId}/photo_${index}.${file.name.split('.').pop()}`;
        const { data, error } = await storage.uploadFile(buckets.listings, path, file);
        if (error)
            throw error;
        return storage.getPublicUrl(buckets.listings, data.path);
    },
    // Upload product photo
    async uploadProductPhoto(productId, file, index) {
        const path = `${productId}/photo_${index}.${file.name.split('.').pop()}`;
        const { data, error } = await storage.uploadFile(buckets.products, path, file);
        if (error)
            throw error;
        return storage.getPublicUrl(buckets.products, data.path);
    },
    // Upload service photo
    async uploadServicePhoto(serviceId, file, index) {
        const path = `${serviceId}/photo_${index}.${file.name.split('.').pop()}`;
        const { data, error } = await storage.uploadFile(buckets.services, path, file);
        if (error)
            throw error;
        return storage.getPublicUrl(buckets.services, data.path);
    },
    // Upload vendor logo
    async uploadVendorLogo(vendorId, file) {
        const path = `${vendorId}/logo.${file.name.split('.').pop()}`;
        const { data, error } = await storage.uploadFile(buckets.vendorLogos, path, file);
        if (error)
            throw error;
        return storage.getPublicUrl(buckets.vendorLogos, data.path);
    },
    // Upload document
    async uploadDocument(userId, documentType, file) {
        const path = `${userId}/${documentType}/${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await storage.uploadFile(buckets.documents, path, file);
        if (error)
            throw error;
        return storage.getPublicUrl(buckets.documents, data.path);
    },
    // Upload chat attachment
    async uploadAttachment(conversationId, file) {
        const path = `${conversationId}/${Date.now()}_${file.name}`;
        const { data, error } = await storage.uploadFile(buckets.attachments, path, file);
        if (error)
            throw error;
        return storage.getPublicUrl(buckets.attachments, data.path);
    },
};
//# sourceMappingURL=storage.js.map