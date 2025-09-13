'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from '@ciuna/ui';
import { 
  Upload, 
  X, 
  MapPin, 
  DollarSign, 
  Tag, 
  Image as ImageIcon,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@ciuna/sb';
import type { Category, ListingCondition } from '@ciuna/types';

export default function CreateListingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price_rub: '',
    condition: 'GOOD' as ListingCondition,
    city: '',
    district: '',
    photo_urls: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    loadCategories();
  }, [user, router]);

  const loadCategories = async () => {
    try {
      const data = await db.categories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload to Supabase Storage here
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        photo_urls: [...prev.photo_urls, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    if (!formData.price_rub || isNaN(Number(formData.price_rub)) || Number(formData.price_rub) <= 0) {
      newErrors.price_rub = 'Valid price is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would upload images to Supabase Storage first
      const listingData = {
        ...formData,
        price_rub: parseInt(formData.price_rub),
        category_id: parseInt(formData.category_id),
        seller_id: user?.id,
        status: 'ACTIVE' as const,
      };

      const { data: listing } = await db.listings.create(listingData);
      router.push(`/listings/${listing.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors({ submit: 'Failed to create listing. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const conditions: { value: ListingCondition; label: string }[] = [
    { value: 'NEW', label: 'New' },
    { value: 'LIKE_NEW', label: 'Like New' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
  ];

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Create New Listing
        </h1>
        <p className="text-lg text-gray-600">
          Sell your items to fellow expats in Russia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.submit}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="What are you selling?"
                className={errors.title ? 'border-red-300' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your item in detail..."
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : ''
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category_id ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                )}
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price_rub" className="block text-sm font-medium text-gray-700 mb-2">
                Price (RUB) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="price_rub"
                  name="price_rub"
                  type="number"
                  value={formData.price_rub}
                  onChange={handleChange}
                  placeholder="0"
                  className={`pl-10 ${errors.price_rub ? 'border-red-300' : ''}`}
                />
              </div>
              {errors.price_rub && (
                <p className="mt-1 text-sm text-red-600">{errors.price_rub}</p>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Moscow, St. Petersburg, etc."
                    className={`pl-10 ${errors.city ? 'border-red-300' : ''}`}
                  />
                </div>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                  District (Optional)
                </label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Arbat, Nevsky Prospekt, etc."
                />
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos
              </label>
              <div className="space-y-4">
                {/* Upload Button */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="photos"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                    </div>
                    <input
                      id="photos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {formData.photo_urls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.photo_urls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
