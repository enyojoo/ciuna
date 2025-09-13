'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Badge, Button, Input } from '@ciuna/ui';
import { Search, MapPin, Star, Shield, Filter, SlidersHorizontal } from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice } from '@/lib/utils';
import type { Vendor } from '@ciuna/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    verified: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadVendors();
  }, [filters]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const { data } = await db.vendors.getAll(filters, 1, 20);
      setVendors(data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic
  };

  const filteredVendors = vendors.filter(vendor => {
    if (searchQuery) {
      return vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
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
          Verified Vendors
        </h1>
        <p className="text-lg text-gray-600">
          Discover trusted vendors with quality products and excellent service
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
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="LOCAL">Local</option>
                  <option value="INTERNATIONAL">International</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Cities</option>
                  <option value="Moscow">Moscow</option>
                  <option value="St. Petersburg">St. Petersburg</option>
                  <option value="Novosibirsk">Novosibirsk</option>
                  <option value="Yekaterinburg">Yekaterinburg</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="ml-2 block text-sm text-gray-900">
                  Verified only
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredVendors.length} vendors found
        </p>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No vendors found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or browse all vendors
          </p>
          <Button asChild>
            <Link href="/vendors">
              Browse All Vendors
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative">
                  {vendor.logo_url ? (
                    <Image
                      src={vendor.logo_url}
                      alt={vendor.name}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                      <span className="text-4xl">🏪</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Badge variant={vendor.type === 'LOCAL' ? 'default' : 'secondary'}>
                      {vendor.type}
                    </Badge>
                    {vendor.verified && (
                      <Badge variant="success" className="bg-green-500">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {vendor.name}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vendor.city}, {vendor.country}
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
                    <span className="text-gray-500">
                      by Vendor
                    </span>
                    <span className="text-gray-500">
                      {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : ''}
                    </span>
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
