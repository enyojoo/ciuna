'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, Badge, Button, Avatar, Textarea } from '@ciuna/ui';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Calendar,
  MessageCircle,
  Heart,
  Shield,
  CheckCircle
} from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import type { Service, ServiceBooking } from '@ciuna/types';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const [service, setService] = useState<Service | null>(null);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadServiceData();
    }
  }, [serviceId]);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      const [serviceData, bookingsData] = await Promise.all([
        db.services.getById(parseInt(serviceId)),
        db.bookings.getAll({ service_id: parseInt(serviceId) }, 1, 10)
      ]);
      
      setService(serviceData);
      setBookings(bookingsData.data);
    } catch (error) {
      console.error('Error loading service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !service) return;

    setBookingLoading(true);
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
      
      const bookingData = {
        service_id: service.id,
        client_id: 'current-user-id', // In real app, get from auth context
        scheduled_at: scheduledAt.toISOString(),
        status: 'PENDING' as const,
        escrow_status: 'HELD' as const,
        notes: bookingNotes,
        duration_minutes: service.duration_minutes,
        total_amount_rub: service.price_rub,
        escrow_amount_rub: service.price_rub,
        requirements: service.requirements,
        deliverables: service.deliverables,
        cancellation_policy: service.cancellation_policy || 'Standard cancellation policy',
        meeting_location: service.is_online ? 'Online' : 'TBD',
        is_online: service.is_online,
        is_in_person: !service.is_online,
      };

      const booking = await db.bookings.create(bookingData);
      router.push(`/bookings/${booking.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const getAvailableSlots = (date: string) => {
    // Mock available slots - in real app, this would come from the service's available_slots JSONB
    const slots = [
      '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
    ];
    
    // Filter out already booked slots
    const bookedSlots = bookings
      .filter(booking => 
        booking.scheduled_at.startsWith(date) && 
        booking.status !== 'CANCELLED'
      )
      .map(booking => new Date(booking.scheduled_at).toTimeString().slice(0, 5));
    
    return slots.filter(slot => !bookedSlots.includes(slot));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h1>
        <p className="text-gray-600 mb-6">The service you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/services">Browse All Services</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Service Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h1>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="outline">Service</Badge>
                  <Badge variant="success" className="bg-green-500">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Provider
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{service.is_online ? 'Online' : 'In-person'}</span>
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-semibold">4.5</span>
                <span className="text-gray-600 ml-1">(0 reviews)</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-1" />
                <span>{service.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-1" />
                <span>Max {service.max_participants} participants</span>
              </div>
            </div>
          </div>

          {/* Service Description */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this service</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {service.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What's included</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Professional consultation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Follow-up support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Documentation provided
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Valid identification</li>
                    <li>• Relevant documents</li>
                    <li>• 24-hour advance booking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Info */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the provider</h2>
              <div className="flex items-start space-x-4">
                <Avatar
                  src={undefined}
                  fallback="P"
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Provider
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Professional service provider
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">4.5</span>
                      <span className="text-gray-600 ml-1">(0 reviews)</span>
                    </div>
                    <div className="text-gray-600">
                      0 completed bookings
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reviews yet. Be the first to review this service!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(service.price_rub)}
                </div>
                <div className="text-gray-600">per session</div>
              </div>

              <div className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {getAvailableSlots(selectedDate).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-3 py-2 text-sm rounded-md border ${
                            selectedTime === slot
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <Textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>

                {/* Book Button */}
                <Button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || bookingLoading}
                  className="w-full"
                >
                  {bookingLoading ? 'Booking...' : 'Book Now'}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="h-4 w-4 text-green-500 mr-1" />
                    <span>Protected by escrow</span>
                  </div>
                  <p>Payment held until service completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
