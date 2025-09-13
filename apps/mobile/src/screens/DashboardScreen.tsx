import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Package,
  ShoppingCart,
  MessageSquare,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

interface UserListing {
  id: number;
  title: string;
  price_rub: number;
  condition: string;
  status: string;
  city: string;
  district: string;
  photo_urls: string[];
  created_at: string;
  view_count: number;
}

interface UserOrder {
  id: number;
  type: 'buying' | 'selling';
  title: string;
  price_rub: number;
  status: string;
  created_at: string;
  buyer_name?: string;
  seller_name?: string;
  photo_url?: string;
}

interface UserMessage {
  id: number;
  conversation_id: number;
  other_user_name: string;
  other_user_avatar?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export default function DashboardScreen({ navigation }: any) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState<UserListing[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demo
      const mockListings: UserListing[] = [
        {
          id: 1,
          title: 'MacBook Pro 13" 2020',
          price_rub: 120000,
          condition: 'LIKE_NEW',
          status: 'ACTIVE',
          city: 'Moscow',
          district: 'Arbat',
          photo_urls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
          created_at: '2024-01-15T10:30:00Z',
          view_count: 45
        },
        {
          id: 2,
          title: 'iPhone 14 Pro Max',
          price_rub: 85000,
          condition: 'NEW',
          status: 'SOLD',
          city: 'Moscow',
          district: 'Tverskaya',
          photo_urls: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
          created_at: '2024-01-10T14:20:00Z',
          view_count: 78
        }
      ];

      const mockOrders: UserOrder[] = [
        {
          id: 1,
          type: 'buying',
          title: 'Samsung Galaxy S23',
          price_rub: 65000,
          status: 'delivered',
          created_at: '2024-01-12T09:15:00Z',
          seller_name: 'Alex Johnson'
        },
        {
          id: 2,
          type: 'selling',
          title: 'MacBook Pro 13" 2020',
          price_rub: 120000,
          status: 'in_transit',
          created_at: '2024-01-14T16:45:00Z',
          buyer_name: 'Maria Petrov'
        }
      ];

      const mockMessages: UserMessage[] = [
        {
          id: 1,
          conversation_id: 1,
          other_user_name: 'Alex Johnson',
          other_user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          last_message: 'Thanks for the quick delivery!',
          last_message_at: '2024-01-15T11:30:00Z',
          unread_count: 0
        },
        {
          id: 2,
          conversation_id: 2,
          other_user_name: 'Maria Petrov',
          other_user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
          last_message: 'When can I pick up the laptop?',
          last_message_at: '2024-01-15T10:15:00Z',
          unread_count: 2
        }
      ];

      setListings(mockListings);
      setOrders(mockOrders);
      setMessages(mockMessages);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#10B981';
      case 'sold': return '#3B82F6';
      case 'pending_review': return '#F59E0B';
      case 'paused': return '#6B7280';
      case 'delivered': return '#10B981';
      case 'in_transit': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'New';
      case 'LIKE_NEW': return 'Like New';
      case 'GOOD': return 'Good';
      case 'FAIR': return 'Fair';
      default: return condition;
    }
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#EBF8FF' }]}>
            <Package size={24} color="#3B82F6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>My Listings</Text>
            <Text style={styles.statValue}>{listings.length}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
            <ShoppingCart size={24} color="#10B981" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{orders.length}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
            <MessageSquare size={24} color="#8B5CF6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Messages</Text>
            <Text style={styles.statValue}>
              {messages.reduce((sum, msg) => sum + msg.unread_count, 0)}
            </Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Star size={24} color="#F59E0B" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>4.8</Text>
          </View>
        </View>
      </View>

      {/* Recent Listings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          <TouchableOpacity onPress={() => setActiveTab('listings')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listingsContainer}>
          {listings.slice(0, 3).map((listing) => (
            <View key={listing.id} style={styles.listingCard}>
              <Image
                source={{ uri: listing.photo_urls[0] || 'https://via.placeholder.com/60' }}
                style={styles.listingImage}
              />
              <View style={styles.listingContent}>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {listing.title}
                </Text>
                <Text style={styles.listingPrice}>
                  {formatPrice(listing.price_rub)} • {listing.city}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
                <Text style={styles.statusText}>{listing.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => setActiveTab('orders')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ordersContainer}>
          {orders.slice(0, 3).map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <Image
                source={{ uri: order.photo_url || 'https://via.placeholder.com/60' }}
                style={styles.orderImage}
              />
              <View style={styles.orderContent}>
                <Text style={styles.orderTitle} numberOfLines={1}>
                  {order.title}
                </Text>
                <Text style={styles.orderDetails}>
                  {formatPrice(order.price_rub)} • {order.type === 'buying' ? 'Buying from' : 'Selling to'} {order.type === 'buying' ? order.seller_name : order.buyer_name}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Messages */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Messages</Text>
          <TouchableOpacity onPress={() => setActiveTab('messages')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.messagesContainer}>
          {messages.slice(0, 3).map((message) => (
            <TouchableOpacity key={message.id} style={styles.messageCard}>
              <Image
                source={{ uri: message.other_user_avatar || 'https://via.placeholder.com/40' }}
                style={styles.messageAvatar}
              />
              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageName}>{message.other_user_name}</Text>
                  <Text style={styles.messageTime}>
                    {formatRelativeTime(message.last_message_at)}
                  </Text>
                </View>
                <Text style={styles.messageText} numberOfLines={1}>
                  {message.last_message}
                </Text>
              </View>
              {message.unread_count > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{message.unread_count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderListings = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>My Listings</Text>
        <TouchableOpacity style={styles.createButton}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listingsGrid}>
        {listings.map((listing) => (
          <View key={listing.id} style={styles.listingCard}>
            <Image
              source={{ uri: listing.photo_urls[0] || 'https://via.placeholder.com/200' }}
              style={styles.listingCardImage}
            />
            <View style={styles.listingCardContent}>
              <Text style={styles.listingCardTitle} numberOfLines={2}>
                {listing.title}
              </Text>
              <Text style={styles.listingCardPrice}>
                {formatPrice(listing.price_rub)}
              </Text>
              <View style={styles.listingCardFooter}>
                <Text style={styles.listingCardLocation}>
                  {listing.city}, {listing.district}
                </Text>
                <Text style={styles.listingCardViews}>
                  {listing.view_count} views
                </Text>
              </View>
              <View style={styles.listingCardActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Eye size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Edit size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderOrders = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>My Orders</Text>
      
      <View style={styles.ordersList}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <Image
              source={{ uri: order.photo_url || 'https://via.placeholder.com/80' }}
              style={styles.orderCardImage}
            />
            <View style={styles.orderCardContent}>
              <Text style={styles.orderCardTitle} numberOfLines={2}>
                {order.title}
              </Text>
              <Text style={styles.orderCardDetails}>
                {order.type === 'buying' ? 'Buying from' : 'Selling to'} {order.type === 'buying' ? order.seller_name : order.buyer_name}
              </Text>
              <View style={styles.orderCardFooter}>
                <Text style={styles.orderCardPrice}>
                  {formatPrice(order.price_rub)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMessages = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Messages</Text>
      
      <View style={styles.messagesList}>
        {messages.map((message) => (
          <TouchableOpacity key={message.id} style={styles.messageCard}>
            <Image
              source={{ uri: message.other_user_avatar || 'https://via.placeholder.com/50' }}
              style={styles.messageCardAvatar}
            />
            <View style={styles.messageCardContent}>
              <View style={styles.messageCardHeader}>
                <Text style={styles.messageCardName}>{message.other_user_name}</Text>
                <Text style={styles.messageCardTime}>
                  {formatRelativeTime(message.last_message_at)}
                </Text>
              </View>
              <Text style={styles.messageCardText} numberOfLines={2}>
                {message.last_message}
              </Text>
            </View>
            {message.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{message.unread_count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Profile Settings</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/80' }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.first_name || user?.email}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
        
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.profileAction}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.profileActionText}>Edit Profile</Text>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileAction}>
            <CreditCard size={20} color="#6B7280" />
            <Text style={styles.profileActionText}>Payment Methods</Text>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileAction}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.profileActionText}>Settings</Text>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Please Sign In</Text>
          <Text style={styles.authSubtitle}>You need to be signed in to access your dashboard.</Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#EBF8FF', '#F0F9FF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Welcome back, {profile?.first_name || user.email}!
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabs}>
              {['overview', 'listings', 'orders', 'messages', 'profile'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    activeTab === tab && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText
                  ]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'listings' && renderListings()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'messages' && renderMessages()}
          {activeTab === 'profile' && renderProfile()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewContainer: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  listingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  listingContent: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ordersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  orderContent: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  messagesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageText: {
    fontSize: 12,
    color: '#6B7280',
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listingCardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  listingCardContent: {
    padding: 12,
  },
  listingCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  listingCardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  listingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingCardLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  listingCardViews: {
    fontSize: 12,
    color: '#6B7280',
  },
  listingCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 8,
  },
  ordersList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderCardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  orderCardContent: {
    flex: 1,
  },
  orderCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderCardDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  messagesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  messageCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  messageCardContent: {
    flex: 1,
  },
  messageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageCardName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  messageCardTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageCardText: {
    fontSize: 14,
    color: '#6B7280',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  profileActions: {
    gap: 16,
  },
  profileAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  profileActionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
