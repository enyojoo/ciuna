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
  Shield, 
  Store
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import { formatPrice } from '../utils/formatting';
import type { VendorWithOwner } from '@ciuna/types';

const { width } = Dimensions.get('window');

export function VendorsScreen() {
  const navigation = useNavigation();
  const [vendors, setVendors] = useState<VendorWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const { data } = await db.vendors.getAll({ verified: true }, 1, 20);
      setVendors(data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVendors();
    setRefreshing(false);
  };

  const filteredVendors = vendors.filter(vendor => {
    if (searchQuery) {
      return vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const renderVendorCard = (vendor: VendorWithOwner) => (
    <TouchableOpacity
      key={vendor.id}
      onPress={() => navigation.navigate('VendorDetail', { id: vendor.id })}
      style={styles.vendorCard}
    >
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          {vendor.logo_url ? (
            <img
              source={{ uri: vendor.logo_url }}
              style={styles.vendorImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.vendorImage, styles.placeholderImage]}>
              <Store size={32} color="#6B7280" />
            </View>
          )}
          <View style={styles.badgesContainer}>
            <Chip
              mode="outlined"
              compact
              style={[
                styles.badge,
                vendor.type === 'LOCAL' ? styles.localBadge : styles.internationalBadge
              ]}
            >
              {vendor.type}
            </Chip>
            {vendor.verified && (
              <Chip
                mode="outlined"
                compact
                style={[styles.badge, styles.verifiedBadge]}
                icon={() => <Shield size={12} color="#10B981" />}
              >
                Verified
              </Chip>
            )}
          </View>
        </View>
        
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
            {vendor.name}
          </Text>
          
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text variant="bodySmall" style={styles.location}>
              {vendor.city}, {vendor.country}
            </Text>
          </View>
          
          <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
            {vendor.description}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Star size={14} color="#F59E0B" />
              <Text variant="bodySmall" style={styles.statText}>
                {vendor.rating.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                ({vendor.review_count})
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statText}>
                {vendor.total_sales}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                sales
              </Text>
            </View>
          </View>
          
          <View style={styles.footerRow}>
            <Text variant="bodySmall" style={styles.ownerText}>
              by {vendor.owner.email}
            </Text>
            <Text variant="bodySmall" style={styles.dateText}>
              {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : ''}
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
          Verified Vendors
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Trusted sellers with quality products
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search vendors..."
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
            <Text style={styles.loadingText}>Loading vendors...</Text>
          </View>
        ) : filteredVendors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Store size={48} color="#9CA3AF" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No vendors found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Try adjusting your search criteria
            </Text>
          </View>
        ) : (
          <View style={styles.vendorsGrid}>
            {filteredVendors.map(renderVendorCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  vendorsGrid: {
    padding: 16,
  },
  vendorCard: {
    marginBottom: 16,
  },
  card: {
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  vendorImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  badge: {
    marginLeft: 4,
    marginBottom: 4,
  },
  localBadge: {
    backgroundColor: '#3B82F6',
  },
  internationalBadge: {
    backgroundColor: '#6B7280',
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    color: '#6B7280',
    marginLeft: 4,
  },
  description: {
    color: '#6B7280',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 4,
  },
  statLabel: {
    color: '#6B7280',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerText: {
    color: '#6B7280',
  },
  dateText: {
    color: '#9CA3AF',
  },
});
