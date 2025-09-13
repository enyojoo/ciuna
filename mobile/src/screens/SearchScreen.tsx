import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import { 
  Text, 
  Card, 
  Chip, 
  FAB, 
  Searchbar,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  MapPin, 
  Star, 
  Eye, 
  Heart,
  Filter,
  SlidersHorizontal
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '../utils/formatting';
import type { ListingWithRelations, Category } from '@ciuna/types';

const { width } = Dimensions.get('window');

export function SearchScreen() {
  const navigation = useNavigation();
  const [listings, setListings] = useState<ListingWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category_id: undefined as number | undefined,
    city: '',
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined,
    condition: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listingsData, categoriesData] = await Promise.all([
        db.listings.getAll(filters, 1, 20),
        db.categories.getAll()
      ]);
      setListings(listingsData.data);
      setCategories(categoriesData);
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

  const handleSearch = () => {
    // Implement search logic
    loadData();
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
            <img
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
      onPress={() => setFilters(prev => ({ ...prev, category_id: category.id }))}
      style={styles.categoryChip}
    >
      <Chip
        mode={filters.category_id === category.id ? "flat" : "outlined"}
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
        <Searchbar
          placeholder="Search products, services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          <SlidersHorizontal size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContent}>
              {categories.slice(0, 8).map(renderCategoryChip)}
            </View>
          </ScrollView>
        </View>
      )}

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
            {categories.slice(0, 8).map(renderCategoryChip)}
          </ScrollView>
        </View>

        {/* Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Search Results
            </Text>
            <Text variant="bodyMedium" style={styles.resultCount}>
              {listings.length} found
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : listings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No results found
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Try adjusting your search criteria
              </Text>
            </View>
          ) : (
            <View style={styles.listingsGrid}>
              {listings.map(renderListingCard)}
            </View>
          )}
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

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
    elevation: 0,
    backgroundColor: '#F3F4F6',
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
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
  resultCount: {
    color: '#6B7280',
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
  listingsGrid: {
    paddingHorizontal: 16,
  },
  listingCard: {
    marginBottom: 16,
  },
  card: {
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: 200,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerText: {
    color: '#6B7280',
  },
  timeText: {
    color: '#9CA3AF',
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
});
