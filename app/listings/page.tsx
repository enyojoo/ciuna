'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Badge, Button, Input } from '@ciuna/ui';
import { Search, Filter, MapPin, Eye, Heart, SlidersHorizontal } from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import type { Listing, ListingFilters } from '@ciuna/types';

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category_id: searchParams.get('category') || undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        const { data } = await db.listings.getAll(filters, 1, 20);
        setListings(data);
      } catch (error) {
        console.error('Error loading listings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;
    setFilters(prev => ({ ...prev, search }));
  };

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Browse Listings
        </h1>
        <p className="text-lg text-gray-600">
          Discover amazing products from fellow expats and local vendors
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                name="search"
                placeholder="Search for products..."
                defaultValue={filters.search}
                className="pl-10"
              />
            </div>
          </form>

          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Cities</option>
                  <option value="Moscow">Moscow</option>
                  <option value="St. Petersburg">St. Petersburg</option>
                  <option value="Novosibirsk">Novosibirsk</option>
                  <option value="Yekaterinburg">Yekaterinburg</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={filters.condition || ''}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Conditions</option>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price || ''}
                    onChange={(e) => handleFilterChange('min_price', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price || ''}
                    onChange={(e) => handleFilterChange('max_price', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          {listings.length} listings found
        </p>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No listings found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or browse all listings
          </p>
          <Button asChild>
            <Link href="/listings">
              Browse All Listings
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    <span>by Unknown Seller</span>
                    <span>{formatRelativeTime(listing.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
