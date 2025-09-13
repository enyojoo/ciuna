'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, Badge } from '@ciuna/ui';
import { Star, Clock, MapPin, Users } from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import type { Service } from '@ciuna/types';

export function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data } = await db.services.getAll({}, 1, 6);
        setServices(data);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
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
      {services.map((service) => (
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
                  <span className="font-medium">4.5</span>
                  <span className="text-gray-500 ml-1">
                    (0 reviews)
                  </span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {service.max_participants} max
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>by Provider</span>
                  <span>{formatRelativeTime(service.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
