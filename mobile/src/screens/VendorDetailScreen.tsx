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
  FlatList,
} from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { Badge } from 'react-native-paper';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Star, 
  MessageCircle,
  Store,
  Phone,
  Globe,
  CheckCircle
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import type { VendorWithOwner, ListingWithRelations } from '@ciuna/types';
import { formatPrice, formatRelativeTime } from '../utils/formatting';

interface VendorDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: any;
}

export function VendorDetailScreen({ route, navigation }: VendorDetailScreenProps) {
  const { id } = route.params;
  const [vendor, setVendor] = useState<VendorWithOwner | null>(null);
  const [listings, setListings] = useState<ListingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadVendor();
    loadVendorListings();
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.vendors.getById(id);
      
      if (error) {
        Alert.alert('Error', 'Failed to load vendor details');
        return;
      }
      
      setVendor(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  const loadVendorListings = async () => {
    try {
      const { data, error } = await db.listings.getByVendor(id, 1, 20);
      
      if (error) {
        console.error('Failed to load vendor listings:', error);
        return;
      }
      
      setListings(data);
    } catch (error) {
      console.error('Failed to load vendor listings:', error);
    }
  };

  const handleContactVendor = () => {
    // TODO: Implement contact vendor functionality
    Alert.alert('Contact Vendor', 'This feature will be implemented soon');
  };

  const handleFollowVendor = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow functionality
  };

  const handleViewListing = (listingId: string) => {
    navigation.navigate('ListingDetail', { id: listingId });
  };

  const renderListingItem = ({ item }: { item: ListingWithRelations }) => (
    <TouchableOpacity 
      style={styles.listingItem}
      onPress={() => handleViewListing(item.id)}
    >
      <Image 
        source={{ uri: item.photo_urls[0] || 'https://via.placeholder.com/150x150' }}
        style={styles.listingImage}
        resizeMode="cover"
      />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.listingPrice}>
          {formatPrice(item.price_rub)}
        </Text>
        <Text style={styles.listingDate}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Vendor not found</Text>
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
            <TouchableOpacity onPress={handleFollowVendor}>
              <Heart 
                size={24} 
                color={isFollowing ? "#EF4444" : "#6B7280"} 
                fill={isFollowing ? "#EF4444" : "none"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Share2 size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vendor Info */}
        <View style={styles.vendorInfo}>
          <Image 
            source={{ uri: vendor.logo_url || 'https://via.placeholder.com/100x100' }}
            style={styles.vendorLogo}
          />
          <View style={styles.vendorDetails}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            <Text style={styles.vendorType}>
              {vendor.type === 'LOCAL' ? 'Local Vendor' : 'International Vendor'}
            </Text>
            <View style={styles.vendorRating}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>4.7 (156 reviews)</Text>
            </View>
            <View style={styles.vendorLocation}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.locationText}>
                {vendor.city}, {vendor.country}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Badge */}
        {vendor.verified && (
          <View style={styles.verificationBadge}>
            <CheckCircle size={16} color="#059669" />
            <Text style={styles.verificationText}>Verified Vendor</Text>
          </View>
        )}

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <CardHeader title="About" />
          <CardContent>
            <Text style={styles.description}>{vendor.description}</Text>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card style={styles.contactCard}>
          <CardHeader title="Contact Information" />
          <CardContent>
            <View style={styles.contactItem}>
              <Phone size={16} color="#6B7280" />
              <Text style={styles.contactText}>
                {vendor.phone || 'Phone not available'}
              </Text>
            </View>
            {vendor.website && (
              <View style={styles.contactItem}>
                <Globe size={16} color="#6B7280" />
                <Text style={styles.contactText}>{vendor.website}</Text>
              </View>
            )}
            <View style={styles.contactItem}>
              <Store size={16} color="#6B7280" />
              <Text style={styles.contactText}>
                {vendor.business_hours || 'Business hours not specified'}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Listings */}
        <Card style={styles.listingsCard}>
          <CardHeader title={`Products (${listings.length})`} />
          <CardContent>
            <FlatList
              data={listings}
              renderItem={renderListingItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.listingsRow}
            />
          </CardContent>
        </Card>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button 
          mode="outlined" 
          onPress={handleContactVendor}
          style={styles.contactButton}
          icon={() => <MessageCircle size={20} color="#3B82F6" />}
        >
          Contact Vendor
        </Button>
        <Button 
          mode="contained" 
          onPress={handleFollowVendor}
          style={styles.followButton}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default VendorDetailScreen;

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
  vendorInfo: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  vendorLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  vendorDetails: {
    flex: 1,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  vendorType: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  vendorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  vendorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  verificationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  descriptionCard: {
    margin: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  contactCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  listingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listingsRow: {
    justifyContent: 'space-between',
  },
  listingItem: {
    width: '48%',
    marginBottom: 16,
  },
  listingImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  listingDate: {
    fontSize: 12,
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
  followButton: {
    flex: 1,
  },
});
