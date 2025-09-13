import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  CreditCard,
  CheckCircle
} from 'lucide-react-native';
import { formatPrice, formatDateTime } from '../utils/formatting';

interface BookingScreenProps {
  route: {
    params: {
      serviceId: string;
      serviceTitle?: string;
      servicePrice?: number;
    };
  };
  navigation: any;
}

export function BookingScreen({ route, navigation }: BookingScreenProps) {
  const { serviceId, serviceTitle, servicePrice } = route.params;
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookService = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement actual booking logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      Alert.alert(
        'Booking Confirmed!',
        `Your service has been booked for ${selectedDate} at ${selectedTime}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Service Info */}
        <Card style={styles.serviceCard}>
          <CardHeader title="Service Details" />
          <CardContent>
            <Text style={styles.serviceTitle}>
              {serviceTitle || 'Service Title'}
            </Text>
            <View style={styles.serviceInfo}>
              <View style={styles.infoItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.infoText}>60 minutes</Text>
              </View>
              <View style={styles.infoItem}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.infoText}>In-person service</Text>
              </View>
            </View>
            <Text style={styles.servicePrice}>
              {formatPrice(servicePrice || 0)}
            </Text>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card style={styles.dateCard}>
          <CardHeader title="Select Date" />
          <CardContent>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateContainer}>
                {getAvailableDates().map((date) => {
                  const dateObj = new Date(date);
                  const isSelected = selectedDate === date;
                  
                  return (
                    <TouchableOpacity
                      key={date}
                      style={[
                        styles.dateOption,
                        isSelected && styles.selectedDateOption
                      ]}
                      onPress={() => handleDateSelect(date)}
                    >
                      <Text style={[
                        styles.dateText,
                        isSelected && styles.selectedDateText
                      ]}>
                        {dateObj.toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card style={styles.timeCard}>
          <CardHeader title="Select Time" />
          <CardContent>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => {
                const isSelected = selectedTime === time;
                
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      isSelected && styles.selectedTimeOption
                    ]}
                    onPress={() => handleTimeSelect(time)}
                  >
                    <Text style={[
                      styles.timeText,
                      isSelected && styles.selectedTimeText
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card style={styles.notesCard}>
          <CardHeader title="Additional Notes (Optional)" />
          <CardContent>
            <TextInput
              style={styles.notesInput}
              placeholder="Any special requirements or notes for the service provider..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card style={styles.paymentCard}>
          <CardHeader title="Payment Summary" />
          <CardContent>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Fee</Text>
              <Text style={styles.paymentValue}>
                {formatPrice(servicePrice || 0)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Platform Fee</Text>
              <Text style={styles.paymentValue}>
                {formatPrice((servicePrice || 0) * 0.05)}
              </Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatPrice((servicePrice || 0) * 1.05)}
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button 
          mode="contained" 
          onPress={handleBookService}
          style={styles.bookButton}
          loading={loading}
          disabled={!selectedDate || !selectedTime || loading}
          icon={() => <CheckCircle size={20} color="#FFF" />}
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default BookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  serviceCard: {
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  dateCard: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedDateOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  timeCard: {
    marginBottom: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  timeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  notesCard: {
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#374151',
  },
  paymentValue: {
    fontSize: 16,
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    width: '100%',
  },
});
