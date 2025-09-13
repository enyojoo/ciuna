'use client';

import { Card, CardContent, Avatar } from '@ciuna/ui';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    country: 'USA',
    city: 'Moscow',
    avatar: null,
    rating: 5,
    text: 'Ciuna has been a lifesaver! I found everything I needed for my apartment in Moscow, from furniture to kitchen appliances. The community is so helpful and the escrow system gives me peace of mind.',
    service: 'Furniture & Home Goods',
  },
  {
    id: 2,
    name: 'Marco Rossi',
    country: 'Italy',
    city: 'St. Petersburg',
    avatar: null,
    rating: 5,
    text: 'As a business owner, I love the vendor marketplace. I can source products from both local and international vendors with group buying discounts. It has significantly reduced my costs.',
    service: 'Business Supplies',
  },
  {
    id: 3,
    name: 'Emma Chen',
    country: 'China',
    city: 'Moscow',
    avatar: null,
    rating: 5,
    text: 'The service marketplace is incredible! I found a great lawyer who helped me with my visa paperwork and a financial advisor who explained the Russian banking system. All verified and trustworthy.',
    service: 'Legal & Financial Services',
  },
  {
    id: 4,
    name: 'David Smith',
    country: 'UK',
    city: 'Moscow',
    avatar: null,
    rating: 5,
    text: 'The real-time chat with translation is amazing. I can communicate with sellers in Russian even though I don\'t speak the language fluently. It makes everything so much easier.',
    service: 'Electronics',
  },
  {
    id: 5,
    name: 'Anna Kowalski',
    country: 'Poland',
    city: 'St. Petersburg',
    avatar: null,
    rating: 5,
    text: 'I love how I can find both local products and international items. The group buying feature helped me get a great deal on some electronics that would have been expensive otherwise.',
    service: 'Electronics & Gadgets',
  },
  {
    id: 6,
    name: 'Ahmed Hassan',
    country: 'Egypt',
    city: 'Moscow',
    avatar: null,
    rating: 5,
    text: 'The delivery tracking system is fantastic. I can see exactly where my order is and when it will arrive. The courier service is reliable and the app keeps me updated throughout the process.',
    service: 'Books & Education',
  },
];

export function Testimonials() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Quote className="h-6 w-6 text-blue-500 mr-2" />
              <div className="flex">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 italic">
              "{testimonial.text}"
            </p>
            
            <div className="flex items-center space-x-3">
              <Avatar
                src={testimonial.avatar || undefined}
                fallback={testimonial.name.charAt(0)}
                size="md"
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonial.country} • {testimonial.city}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {testimonial.service}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
