'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, Badge, Button, Input } from '@ciuna/ui';
import { Search, MapPin, Star, Clock, Users, Filter, SlidersHorizontal } from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import type { ServiceWithRelations, ServiceFilters } from '@ciuna/types';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ServiceFilters>({
    category: undefined,
    is_online: undefined,
    is_in_person: undefined,
    location: '',
    min_price: undefined,
    max_price: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadServices();
  }, [filters]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data } = await db.services.getAll(filters, 1, 20);
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  const filteredServices = services.filter(service => {
    if (searchQuery) {
      return service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             service.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const serviceCategories = [
    { value: 'LEGAL', label: 'Legal Services' },
    { value: 'FINANCIAL', label: 'Financial Services' },
    { value: 'PERSONAL', label: 'Personal Services' },
    { value: 'EVENT', label: 'Event Services' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
  ];

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
          Professional Services
        </h1>
        <p className="text-lg text-gray-600">
          Find trusted professionals for all your needs in Russia
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
                placeholder="Search services..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {serviceCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  <option value="Moscow">Moscow</option>
                  <option value="St. Petersburg">St. Petersburg</option>
                  <option value="Online">Online</option>
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
                    onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Service Type
                </label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.is_online === true}
                      onChange={(e) => setFilters(prev => ({ ...prev, is_online: e.target.checked ? true : undefined }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Online</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.is_in_person === true}
                      onChange={(e) => setFilters(prev => ({ ...prev, is_in_person: e.target.checked ? true : undefined }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">In-Person</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredServices.length} services found
        </p>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or browse all services
          </p>
          <Button asChild>
            <Link href="/services">
              Browse All Services
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {service.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {service.location || 'Online'}
                    {service.is_online && service.is_in_person && ' • Online'}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(service.price_rub)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration_minutes} min
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{service.rating.toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">
                        ({service.review_count} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {service.max_participants} max
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>by {service.provider.name}</span>
                      <span>{formatRelativeTime(service.created_at)}</span>
                    </div>
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
