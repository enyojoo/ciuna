'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Badge } from '@ciuna/ui';
import { MapPin, Eye, Heart } from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import type { Listing } from '@ciuna/types';

export function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadListings = async () => {
      try {
        const { data } = await db.listings.getAll({}, 1, 6);
        setListings(data);
      } catch (error) {
        console.error('Error loading listings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
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
      {listings.map((listing) => (
        <Link key={listing.id} href={`/listings/${listing.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="relative">
              {listing.photo_urls && listing.photo_urls.length > 0 ? (
                <Image
                  src={listing.photo_urls[0]}
                  alt={listing.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-400 text-4xl">📦</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  {listing.condition}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {listing.title}
              </h3>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.city}
                {listing.district && `, ${listing.district}`}
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(listing.price_rub)}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {listing.view_count}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {listing.favorite_count}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>by Seller</span>
                <span>{formatRelativeTime(listing.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
