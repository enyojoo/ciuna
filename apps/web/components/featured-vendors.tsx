'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, Badge, Avatar } from '@ciuna/ui';
import { Star, MapPin, Shield, ExternalLink } from 'lucide-react';
import { db } from '@ciuna/sb';
import type { VendorWithOwner } from '@ciuna/types';

export function FeaturedVendors() {
  const [vendors, setVendors] = useState<VendorWithOwner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const { data } = await db.vendors.getAll({ verified: true }, 1, 6);
        setVendors(data);
      } catch (error) {
        console.error('Error loading vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 rounded h-4"></div>
              <div className="bg-gray-200 rounded h-4 w-3/4"></div>
              <div className="bg-gray-200 rounded h-6 w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vendors.map((vendor) => (
        <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <Avatar
                  src={vendor.logo_url || undefined}
                  fallback={vendor.name.charAt(0)}
                  size="lg"
                  className="w-16 h-16"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors truncate">
                      {vendor.name}
                    </h3>
                    {vendor.verified && (
                      <Shield className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vendor.city}, {vendor.country}
                  </div>
                  <Badge variant={vendor.type === 'LOCAL' ? 'default' : 'secondary'}>
                    {vendor.type}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {vendor.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">
                    ({vendor.review_count} reviews)
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {vendor.total_sales} sales
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">
                    by {vendor.owner.email}
                  </span>
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </a>
                  )}
                </div>
                <span className="text-gray-500">
                  {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
