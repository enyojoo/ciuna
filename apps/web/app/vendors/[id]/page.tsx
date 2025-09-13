'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Badge, Button, Avatar } from '@ciuna/ui';
import { 
  MapPin, 
  Star, 
  Shield, 
  ExternalLink, 
  MessageCircle, 
  Heart,
  ShoppingBag,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import type { VendorWithOwner, VendorProductWithRelations } from '@ciuna/types';

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [vendor, setVendor] = useState<VendorWithOwner | null>(null);
  const [products, setProducts] = useState<VendorProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (vendorId) {
      loadVendorData();
    }
  }, [vendorId]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [vendorData, productsData] = await Promise.all([
        db.vendors.getById(parseInt(vendorId)),
        db.products.getAll({ vendor_id: parseInt(vendorId) }, 1, 20)
      ]);
      
      setVendor(vendorData);
      setProducts(productsData.data);
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-64 mb-8"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 rounded h-8 w-1/3"></div>
            <div className="bg-gray-200 rounded h-4 w-2/3"></div>
            <div className="bg-gray-200 rounded h-4 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor not found</h1>
        <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/vendors">Browse All Vendors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Vendor Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Vendor Logo */}
          <div className="lg:w-1/3">
            {vendor.logo_url ? (
              <Image
                src={vendor.logo_url}
                alt={vendor.name}
                width={300}
                height={300}
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-6xl">🏪</span>
              </div>
            )}
          </div>

          {/* Vendor Info */}
          <div className="lg:w-2/3">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {vendor.name}
                </h1>
                <div className="flex items-center space-x-2 mb-4">
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
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{vendor.city}, {vendor.country}</span>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {vendor.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{vendor.rating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{vendor.review_count}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{vendor.total_sales}</div>
                <div className="text-sm text-gray-600">Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {vendor.contact_email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${vendor.contact_email}`} className="hover:text-blue-600">
                    {vendor.contact_email}
                  </a>
                </div>
              )}
              {vendor.contact_phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${vendor.contact_phone}`} className="hover:text-blue-600">
                    {vendor.contact_phone}
                  </a>
                </div>
              )}
              {vendor.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <a 
                    href={vendor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 flex items-center"
                  >
                    Website
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews ({vendor.review_count})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              About
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Products</h2>
            <Button asChild>
              <Link href={`/vendors/${vendor.id}/products`}>
                View All Products
              </Link>
            </Button>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600">This vendor hasn't added any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="relative">
                      {product.photo_urls && product.photo_urls.length > 0 ? (
                        <Image
                          src={product.photo_urls[0]}
                          alt={product.name}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 text-gray-900">
                          {product.is_local_stock ? 'Local' : 'Dropship'}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(product.price_rub)}
                        </span>
                        <div className="text-sm text-gray-500">
                          {product.stock_quantity} in stock
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{product.view_count} views</span>
                        <span>{formatRelativeTime(product.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews</h2>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this vendor!</p>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">About {vendor.name}</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              {vendor.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium text-gray-900">Type</dt>
                    <dd className="text-gray-600">{vendor.type}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Location</dt>
                    <dd className="text-gray-600">{vendor.city}, {vendor.country}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Commission Rate</dt>
                    <dd className="text-gray-600">{(vendor.commission_rate * 100).toFixed(1)}%</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="font-medium text-gray-900">Rating</dt>
                    <dd className="text-gray-600 flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {vendor.rating.toFixed(1)} out of 5
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Total Sales</dt>
                    <dd className="text-gray-600">{vendor.total_sales}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Member Since</dt>
                    <dd className="text-gray-600">
                      {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
