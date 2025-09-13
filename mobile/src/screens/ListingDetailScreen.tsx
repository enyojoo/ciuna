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
  ShoppingCart,
  Star
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import type { ListingWithRelations } from '@ciuna/types';
import { formatPrice, formatRelativeTime } from '../utils/formatting';

const { width } = Dimensions.get('window');

interface ListingDetailScreenProps {
  route: {
    params: {
      id: string;
    };
  };
  navigation: any;
}

export function ListingDetailScreen({ route, navigation }: ListingDetailScreenProps) {
  const { id } = route.params;
  const [listing, setListing] = useState<ListingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.listings.getById(id);
      
      if (error) {
        Alert.alert('Error', 'Failed to load listing details');
        return;
      }
      
      setListing(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = () => {
    // TODO: Implement contact seller functionality
    Alert.alert('Contact Seller', 'This feature will be implemented soon');
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    Alert.alert('Add to Cart', 'This feature will be implemented soon');
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

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Listing not found</Text>
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
            source={{ uri: listing.photo_urls[0] || 'https://via.placeholder.com/400x300' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>{formatPrice(listing.price_rub)}</Text>
          </View>

          <View style={styles.badges}>
            <Badge style={styles.statusBadge}>
              {listing.status}
            </Badge>
            <Badge style={styles.conditionBadge}>
              {listing.condition}
            </Badge>
          </View>

          <Text style={styles.description}>{listing.description}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.location}>
              {listing.city}{listing.district && `, ${listing.district}`}
            </Text>
          </View>

          {/* Seller Info */}
          <Card style={styles.sellerCard}>
            <CardHeader title="Seller Information" />
            <CardContent>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerAvatar}>
                  <User size={24} color="#6B7280" />
                </View>
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>
                    {listing.seller?.first_name || 'Anonymous'}
                  </Text>
                  <Text style={styles.sellerLocation}>
                    {listing.seller?.city || listing.city}
                  </Text>
                  <View style={styles.sellerRating}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>4.8 (24 reviews)</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Posted Date */}
          <View style={styles.dateRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.dateText}>
              Posted {formatRelativeTime(listing.created_at)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button 
          mode="outlined" 
          onPress={handleContactSeller}
          style={styles.contactButton}
          icon={() => <MessageCircle size={20} color="#3B82F6" />}
        >
          Contact Seller
        </Button>
        <Button 
          mode="contained" 
          onPress={handleAddToCart}
          style={styles.cartButton}
          icon={() => <ShoppingCart size={20} color="#FFF" />}
        >
          Add to Cart
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default ListingDetailScreen;

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
  conditionBadge: {
    backgroundColor: '#F3F4F6',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
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
  sellerCard: {
    marginBottom: 16,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sellerLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sellerRating: {
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
  cartButton: {
    flex: 1,
  },
});
