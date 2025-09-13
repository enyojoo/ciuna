import { Suspense } from 'react';
import { Hero } from '@/components/hero';
import { CategoryGrid } from '@/components/category-grid';
import { FeaturedListings } from '@/components/featured-listings';
import { FeaturedServices } from '@/components/featured-services';
import { FeaturedVendors } from '@/components/featured-vendors';
import { Stats } from '@/components/stats';
import { Testimonials } from '@/components/testimonials';
import { LoadingSpinner } from '@ciuna/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Stats Section */}
      <Stats />
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find exactly what you're looking for
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto" />}>
            <CategoryGrid />
          </Suspense>
        </div>
      </section>
      
      {/* Featured Listings Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Listings
            </h2>
            <p className="text-lg text-gray-600">
              Discover amazing items from fellow expats
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto" />}>
            <FeaturedListings />
          </Suspense>
        </div>
      </section>
      
      {/* Featured Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Services
            </h2>
            <p className="text-lg text-gray-600">
              Professional services from verified providers
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto" />}>
            <FeaturedServices />
          </Suspense>
        </div>
      </section>
      
      {/* Featured Vendors Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Vendors
            </h2>
            <p className="text-lg text-gray-600">
              Trusted vendors with quality products
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto" />}>
            <FeaturedVendors />
          </Suspense>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg text-gray-600">
              Real experiences from expats in Russia
            </p>
          </div>
          <Testimonials />
        </div>
      </section>
    </div>
  );
}
