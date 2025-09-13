'use client';

import { Button } from '@ciuna/ui';
import { Search, MapPin, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to{' '}
            <span className="ciuna-text-gradient">Ciuna</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            The ultimate marketplace for expats in Russia. Connect, buy, sell, and discover amazing products and services from fellow expats and local vendors.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for products, services, or vendors..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Cities</option>
                  <option value="moscow">Moscow</option>
                  <option value="st-petersburg">St. Petersburg</option>
                  <option value="novosibirsk">Novosibirsk</option>
                  <option value="yekaterinburg">Yekaterinburg</option>
                </select>
              </div>
              <Button size="lg" className="px-8">
                Search
              </Button>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/listings">
                Browse Listings
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/sell/new">
                Start Selling
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expat Community</h3>
            <p className="text-blue-100">
              Connect with fellow expats who understand your needs and challenges in Russia.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Trusted</h3>
            <p className="text-blue-100">
              All transactions are protected with escrow payments and verified user profiles.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Local & International</h3>
            <p className="text-blue-100">
              Find both local products and international items with group buying discounts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
