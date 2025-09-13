import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { Badge } from 'react-native-paper';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  User, 
  MessageCircle,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import type { ServiceWithRelations } from '@ciuna/types';
import { formatPrice, formatRelativeTime } from '../utils/formatting';

const { width } = Dimensions.get('window');

interface ServiceDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: any;
}

export function ServiceDetailScreen({ route, navigation }: ServiceDetailScreenProps) {
  const { id } = route.params;
  const [service, setService] = useState<ServiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.services.getById(id);
      
      if (error) {
        Alert.alert('Error', 'Failed to load service details');
        return;
      }
      
      setService(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    // TODO: Implement booking functionality
    Alert.alert('Book Service', 'This feature will be implemented soon');
  };

  const handleContactProvider = () => {
    // TODO: Implement contact provider functionality
    Alert.alert('Contact Provider', 'This feature will be implemented soon');
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Service not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Heart 
                size={24} 
                color={isFavorite ? "#EF4444" : "#6B7280"} 
                fill={isFavorite ? "#EF4444" : "none"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Share2 size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Images */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: service.photo_urls?.[0] || 'https://via.placeholder.com/400x300' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{service.title}</Text>
            <Text style={styles.price}>{formatPrice(service.price_rub)}</Text>
          </View>

          <View style={styles.badges}>
            <Badge style={styles.statusBadge}>
              {service.status}
            </Badge>
            <Badge style={styles.typeBadge}>
              {service.is_online ? 'Online' : 'In-Person'}
            </Badge>
          </View>

          <Text style={styles.description}>{service.description}</Text>

          {/* Duration */}
          <View style={styles.durationRow}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.durationText}>
              Duration: {service.duration_minutes} minutes
            </Text>
          </View>

          {/* Location */}
          {!service.is_online && (
            <View style={styles.locationRow}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.location}>
                {service.city}{service.district && `, ${service.district}`}
              </Text>
            </View>
          )}

          {/* Requirements */}
          {service.requirements && service.requirements.length > 0 && (
            <Card style={styles.requirementsCard}>
              <CardHeader title="Requirements" />
              <CardContent>
                {service.requirements.map((requirement, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <CheckCircle size={16} color="#059669" />
                    <Text style={styles.requirementText}>{requirement}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {service.deliverables && service.deliverables.length > 0 && (
            <Card style={styles.deliverablesCard}>
              <CardHeader title="What You'll Get" />
              <CardContent>
                {service.deliverables.map((deliverable, index) => (
                  <View key={index} style={styles.deliverableItem}>
                    <CheckCircle size={16} color="#059669" />
                    <Text style={styles.deliverableText}>{deliverable}</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Provider Info */}
          <Card style={styles.providerCard}>
            <CardHeader title="Service Provider" />
            <CardContent>
              <View style={styles.providerInfo}>
                <View style={styles.providerAvatar}>
                  <User size={24} color="#6B7280" />
                </View>
                <View style={styles.providerDetails}>
                  <Text style={styles.providerName}>
                    {service.provider?.first_name || 'Anonymous'}
                  </Text>
                  <Text style={styles.providerLocation}>
                    {service.provider?.city || service.city}
                  </Text>
                  <View style={styles.providerRating}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>4.9 (32 reviews)</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Posted Date */}
          <View style={styles.dateRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.dateText}>
              Posted {formatRelativeTime(service.created_at)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button 
          mode="outlined" 
          onPress={handleContactProvider}
          style={styles.contactButton}
          icon={() => <MessageCircle size={20} color="#3B82F6" />}
        >
          Contact Provider
        </Button>
        <Button 
          mode="contained" 
          onPress={handleBookService}
          style={styles.bookButton}
        >
          Book Service
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default ServiceDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: '#DBEAFE',
  },
  typeBadge: {
    backgroundColor: '#F3F4F6',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  requirementsCard: {
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  deliverablesCard: {
    marginBottom: 16,
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliverableText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  providerCard: {
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  providerLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  contactButton: {
    flex: 1,
  },
  bookButton: {
    flex: 1,
  },
});
