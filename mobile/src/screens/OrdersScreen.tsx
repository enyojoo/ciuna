import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { 
  Text, 
  Card, 
  Badge,
  Chip,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageCircle,
  Star
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '../utils/formatting';
import type { OrderWithRelations } from '@ciuna/types';

export function OrdersScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // In a real app, you would filter by current user ID
      const { data } = await db.orders.getAll({}, 1, 50);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Package size={20} color="#F59E0B" />;
      case 'PAID':
        return <CheckCircle size={20} color="#3B82F6" />;
      case 'FULFILLING':
        return <Truck size={20} color="#8B5CF6" />;
      case 'DELIVERED':
        return <CheckCircle size={20} color="#10B981" />;
      case 'CANCELLED':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <ShoppingBag size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B';
      case 'PAID':
        return '#3B82F6';
      case 'FULFILLING':
        return '#8B5CF6';
      case 'DELIVERED':
        return '#10B981';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderOrderCard = (order: OrderWithRelations) => (
    <TouchableOpacity
      key={order.id}
      onPress={() => navigation.navigate('OrderDetail', { id: order.id })}
      style={styles.orderCard}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              {getStatusIcon(order.status)}
              <View style={styles.orderDetails}>
                <Text variant="titleMedium" style={styles.orderNumber}>
                  Order #{order.id}
                </Text>
                <Text variant="bodySmall" style={styles.orderDate}>
                  {formatRelativeTime(order.created_at)}
                </Text>
              </View>
            </View>
            <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              {order.status}
            </Badge>
          </View>

          <View style={styles.orderItem}>
            {order.listing && (
              <View style={styles.itemContainer}>
                <View style={styles.itemImage}>
                  {order.listing.photo_urls && order.listing.photo_urls.length > 0 ? (
                    <img
                      source={{ uri: order.listing.photo_urls[0] }}
                      style={styles.itemImageSource}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Package size={24} color="#9CA3AF" />
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text variant="titleSmall" style={styles.itemTitle}>
                    {order.listing.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.itemLocation}>
                    {order.listing.city}{order.listing.district && `, ${order.listing.district}`}
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.itemPrice}>
                  {formatPrice(order.listing.price_rub)}
                </Text>
              </View>
            )}

            {order.vendor_product && (
              <View style={styles.itemContainer}>
                <View style={styles.itemImage}>
                  {order.vendor_product.photo_urls && order.vendor_product.photo_urls.length > 0 ? (
                    <img
                      source={{ uri: order.vendor_product.photo_urls[0] }}
                      style={styles.itemImageSource}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Package size={24} color="#9CA3AF" />
                    </View>
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text variant="titleSmall" style={styles.itemTitle}>
                    {order.vendor_product.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.itemLocation}>
                    Vendor: {order.vendor_product.vendor?.name}
                  </Text>
                </View>
                <Text variant="titleMedium" style={styles.itemPrice}>
                  {formatPrice(order.vendor_product.price_rub)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Total Amount
              </Text>
              <Text variant="titleMedium" style={styles.summaryValue}>
                {formatPrice(order.total_amount_rub)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Escrow Protection
              </Text>
              <Chip mode="outlined" compact style={styles.escrowChip}>
                {order.escrow_status}
              </Chip>
            </View>
          </View>

          <View style={styles.orderActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Eye size={16} color="#3B82F6" />
              <Text style={styles.actionText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={16} color="#3B82F6" />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>
            {order.status === 'DELIVERED' && (
              <TouchableOpacity style={styles.actionButton}>
                <Star size={16} color="#3B82F6" />
                <Text style={styles.actionText}>Review</Text>
              </TouchableOpacity>
            )}
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
          Orders
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track your purchases and sales
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buying' && styles.activeTab]}
            onPress={() => setActiveTab('buying')}
          >
            <Text style={[styles.tabText, activeTab === 'buying' && styles.activeTabText]}>
              Buying ({orders.filter(o => o.buyer_id === 'current-user').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'selling' && styles.activeTab]}
            onPress={() => setActiveTab('selling')}
          >
            <Text style={[styles.tabText, activeTab === 'selling' && styles.activeTabText]}>
              Selling ({orders.filter(o => o.seller_id === 'current-user').length})
            </Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color="#9CA3AF" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No orders yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {activeTab === 'buying' 
                ? 'You haven\'t made any purchases yet.' 
                : 'You haven\'t received any orders yet.'}
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map(renderOrderCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default OrdersScreen;

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
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: 'bold',
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
  ordersList: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderDetails: {
    marginLeft: 12,
  },
  orderNumber: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderDate: {
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  orderItem: {
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  itemImageSource: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemLocation: {
    color: '#6B7280',
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  orderSummary: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#6B7280',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  escrowChip: {
    backgroundColor: '#10B981',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 4,
    color: '#3B82F6',
    fontSize: 14,
  },
});
