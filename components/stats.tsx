'use client';

import { useState, useEffect } from 'react';

interface StatsData {
  totalUsers: number;
  totalListings: number;
  totalVendors: number;
  totalServices: number;
}

export function Stats() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalListings: 0,
    totalVendors: 0,
    totalServices: 0,
  });

  useEffect(() => {
    // Simulate loading stats data
    const loadStats = async () => {
      // In a real app, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 1250,
        totalListings: 3400,
        totalVendors: 180,
        totalServices: 420,
      });
    };

    loadStats();
  }, []);

  const statItems = [
    {
      label: 'Active Users',
      value: stats.totalUsers.toLocaleString(),
      description: 'Expat community members',
    },
    {
      label: 'Listings',
      value: stats.totalListings.toLocaleString(),
      description: 'Products for sale',
    },
    {
      label: 'Vendors',
      value: stats.totalVendors.toLocaleString(),
      description: 'Verified sellers',
    },
    {
      label: 'Services',
      value: stats.totalServices.toLocaleString(),
      description: 'Professional services',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {item.value}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {item.label}
              </div>
              <div className="text-sm text-gray-600">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
