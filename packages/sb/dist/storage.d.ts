export declare const storage: {
    uploadFile(bucket: string, path: string, file: File | Blob, options?: {
        cacheControl?: string;
        contentType?: string;
        upsert?: boolean;
    }): Promise<{
        data: {
            path: string;
        } | null;
        error: any;
    }>;
    getPublicUrl(bucket: string, path: string): string;
    getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<{
        data: {
            signedUrl: string;
        } | null;
        error: any;
    }>;
    deleteFile(bucket: string, path: string): Promise<{
        data: any;
        error: any;
    }>;
    listFiles(bucket: string, path?: string, options?: {
        limit?: number;
        offset?: number;
        sortBy?: {
            column: string;
            order: "asc" | "desc";
        };
    }): Promise<{
        data: any[] | null;
        error: any;
    }>;
    createBucket(bucketName: string, options?: {
        public?: boolean;
        fileSizeLimit?: number;
        allowedMimeTypes?: string[];
    }): Promise<{
        data: any;
        error: any;
    }>;
    deleteBucket(bucketName: string): Promise<{
        data: any;
        error: any;
    }>;
};
export declare const buckets: {
    readonly avatars: "avatars";
    readonly listings: "listings";
    readonly products: "products";
    readonly services: "services";
    readonly vendorLogos: "vendor-logos";
    readonly documents: "documents";
    readonly attachments: "attachments";
};
export declare const storageHelpers: {
    uploadAvatar(userId: string, file: File): Promise<string>;
    uploadListingPhoto(listingId: number, file: File, index: number): Promise<string>;
    uploadProductPhoto(productId: number, file: File, index: number): Promise<string>;
    uploadServicePhoto(serviceId: number, file: File, index: number): Promise<string>;
    uploadVendorLogo(vendorId: number, file: File): Promise<string>;
    uploadDocument(userId: string, documentType: string, file: File): Promise<string>;
    uploadAttachment(conversationId: string, file: File): Promise<string>;
};
//# sourceMappingURL=storage.d.ts.map