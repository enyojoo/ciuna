import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { 
  Text, 
  Card, 
  Searchbar, 
  Chip,
  Avatar,
  IconButton,
  FAB
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  MapPin, 
  Star, 
  Eye, 
  Heart,
  Filter,
  Bell
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '../utils/formatting';
import type { ListingWithRelations, Category } from '@ciuna/types';

const { width } = Dimensions.get('window');

export function HomeScreen() {
  const navigation = useNavigation();
  const [listings, setListings] = useState<ListingWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listingsData, categoriesData] = await Promise.all([
        db.listings.getAll({}, 1, 10),
        db.categories.getAll()
      ]);
      setListings(listingsData.data);
      setCategories(categoriesData.slice(0, 8));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderListingCard = (listing: ListingWithRelations) => (
    <TouchableOpacity
      key={listing.id}
      onPress={() => navigation.navigate('ListingDetail', { id: listing.id })}
      style={styles.listingCard}
    >
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          {listing.photo_urls && listing.photo_urls.length > 0 ? (
            <Image
              source={{ uri: listing.photo_urls[0] }}
              style={styles.listingImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listingImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>📦</Text>
            </View>
          )}
          <View style={styles.conditionBadge}>
            <Chip mode="outlined" compact>
              {listing.condition}
            </Chip>
          </View>
        </View>
        
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
            {listing.title}
          </Text>
          
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text variant="bodySmall" style={styles.location}>
              {listing.city}{listing.district && `, ${listing.district}`}
            </Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text variant="titleLarge" style={styles.price}>
              {formatPrice(listing.price_rub)}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Eye size={14} color="#6B7280" />
                <Text variant="bodySmall" style={styles.statText}>
                  {listing.view_count}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Heart size={14} color="#6B7280" />
                <Text variant="bodySmall" style={styles.statText}>
                  {listing.favorite_count}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.sellerRow}>
            <Avatar.Text size={20} label={listing.seller.email.charAt(0)} />
            <Text variant="bodySmall" style={styles.sellerText}>
              by {listing.seller.email}
            </Text>
            <Text variant="bodySmall" style={styles.timeText}>
              {formatRelativeTime(listing.created_at)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      onPress={() => navigation.navigate('Search', { category: category.slug })}
      style={styles.categoryChip}
    >
      <Chip
        mode="outlined"
        icon={() => <Text style={styles.categoryIcon}>{category.icon || '📦'}</Text>}
        style={styles.chip}
      >
        {category.name}
      </Chip>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text variant="headlineSmall" style={styles.greeting}>
              Welcome to Ciuna
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Discover amazing products from fellow expats
            </Text>
          </View>
          <IconButton
            icon="bell-outline"
            size={24}
            onPress={() => navigation.navigate('Inbox')}
          />
        </View>
        
        <Searchbar
          placeholder="Search products, services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          onSubmitEditing={() => navigation.navigate('Search', { query: searchQuery })}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map(renderCategoryChip)}
          </ScrollView>
        </View>

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Featured Listings
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text variant="bodyMedium" style={styles.seeAllText}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.listingsScroll}
          >
            {listings.map(renderListingCard)}
          </ScrollView>
        </View>

        {/* Recent Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Recent Listings
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text variant="bodyMedium" style={styles.seeAllText}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.grid}>
            {listings.slice(0, 4).map(renderListingCard)}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Sell')}
        label="Sell"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    color: '#3B82F6',
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
  },
  categoryIcon: {
    fontSize: 16,
  },
  listingsScroll: {
    paddingLeft: 16,
  },
  listingCard: {
    width: width * 0.7,
    marginRight: 12,
  },
  card: {
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  listingImage: {
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
  placeholderText: {
    fontSize: 32,
  },
  conditionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cardContent: {
    padding: 12,
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    color: '#6B7280',
    marginLeft: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerText: {
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  timeText: {
    color: '#9CA3AF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
});
