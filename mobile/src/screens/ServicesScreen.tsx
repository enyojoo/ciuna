import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import { 
  Text, 
  Card, 
  Chip, 
  Searchbar,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users,
  Wrench
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '../utils/formatting';
import type { ServiceWithRelations } from '@ciuna/types';

const { width } = Dimensions.get('window');

export function ServicesScreen() {
  const navigation = useNavigation();
  const [services, setServices] = useState<ServiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data } = await db.services.getAll({}, 1, 20);
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const filteredServices = services.filter(service => {
    if (searchQuery) {
      return service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             service.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const renderServiceCard = (service: ServiceWithRelations) => (
    <TouchableOpacity
      key={service.id}
      onPress={() => navigation.navigate('ServiceDetail', { id: service.id })}
      style={styles.serviceCard}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
                {service.title}
              </Text>
              <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
                {service.description}
              </Text>
            </View>
            <Chip mode="outlined" style={styles.categoryChip}>
              {service.category}
            </Chip>
          </View>
          
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text variant="bodySmall" style={styles.location}>
              {service.location || 'Online'}
              {service.is_online && service.is_in_person && ' • Online'}
            </Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text variant="titleLarge" style={styles.price}>
              {formatPrice(service.price_rub)}
            </Text>
            <View style={styles.durationContainer}>
              <Clock size={14} color="#6B7280" />
              <Text variant="bodySmall" style={styles.duration}>
                {service.duration_minutes} min
              </Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#F59E0B" />
              <Text variant="bodySmall" style={styles.rating}>
                {service.rating.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={styles.reviewCount}>
                ({service.review_count} reviews)
              </Text>
            </View>
            <View style={styles.participantsContainer}>
              <Users size={14} color="#6B7280" />
              <Text variant="bodySmall" style={styles.participants}>
                {service.max_participants} max
              </Text>
            </View>
          </View>
          
          <View style={styles.footerRow}>
            <Text variant="bodySmall" style={styles.providerText}>
              by {service.provider.name}
            </Text>
            <Text variant="bodySmall" style={styles.timeText}>
              {formatRelativeTime(service.created_at)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Professional Services
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Find trusted professionals for all your needs
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Wrench size={48} color="#9CA3AF" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No services found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Try adjusting your search criteria
            </Text>
          </View>
        ) : (
          <View style={styles.servicesList}>
            {filteredServices.map(renderServiceCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default ServicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  servicesList: {
    padding: 16,
  },
  serviceCard: {
    marginBottom: 16,
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    color: '#6B7280',
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    color: '#6B7280',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    color: '#6B7280',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewCount: {
    color: '#6B7280',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participants: {
    color: '#6B7280',
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerText: {
    color: '#6B7280',
  },
  timeText: {
    color: '#9CA3AF',
  },
});
