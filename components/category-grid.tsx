'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@ciuna/ui';
import { db } from '@ciuna/sb';
import type { Category } from '@ciuna/types';

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await db.categories.getAll();
        setCategories(data.slice(0, 8)); // Show first 8 categories
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
            <div className="mt-2 bg-gray-200 rounded h-4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/listings?category=${category.slug}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {category.icon || '📦'}
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600">
                {category.description || 'Browse items in this category'}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
