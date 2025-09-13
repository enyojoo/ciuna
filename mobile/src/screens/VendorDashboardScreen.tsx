import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { Badge } from 'react-native-paper';
import { 
  Plus, 
  Eye, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  Users,
  Star,
  Calendar,
  Package
} from 'lucide-react-native';
import { formatPrice, formatRelativeTime } from '../utils/formatting';

interface VendorStats {
  totalListings: number;
  activeListings: number;
  totalSales: number;
  monthlyRevenue: number;
  totalViews: number;
  averageRating: number;
  totalReviews: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  productTitle: string;
  amount: number;
  status: string;
  date: string;
}

export function VendorDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<VendorStats>({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    monthlyRevenue: 0,
    totalViews: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual data loading from API
      
      // Mock data
      setStats({
        totalListings: 24,
        activeListings: 18,
        totalSales: 156,
        monthlyRevenue: 125000,
        totalViews: 2840,
        averageRating: 4.7,
        totalReviews: 89,
      });

      setRecentOrders([
        {
          id: '1',
          customerName: 'John Doe',
          productTitle: 'Vintage Camera',
          amount: 15000,
          status: 'delivered',
          date: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          customerName: 'Jane Smith',
          productTitle: 'Designer Handbag',
          amount: 25000,
          status: 'shipped',
          date: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '3',
          customerName: 'Mike Johnson',
          productTitle: 'Gaming Console',
          amount: 35000,
          status: 'pending',
          date: new Date(Date.now() - 10800000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCreateListing = () => {
    navigation.navigate('Sell');
  };

  const handleViewListings = () => {
    // TODO: Navigate to vendor listings page
    console.log('View listings');
  };

  const handleViewOrders = () => {
    navigation.navigate('Orders');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#059669';
      case 'shipped':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderOrderItem = (order: RecentOrder) => (
    <Card key={order.id} style={styles.orderCard}>
      <CardContent>
        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle}>{order.productTitle}</Text>
          <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            {order.status}
          </Badge>
        </View>
        <Text style={styles.customerName}>Customer: {order.customerName}</Text>
        <View style={styles.orderFooter}>
          <Text style={styles.orderAmount}>{formatPrice(order.amount)}</Text>
          <Text style={styles.orderDate}>{formatRelativeTime(order.date)}</Text>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vendor Dashboard</Text>
          <TouchableOpacity onPress={handleCreateListing} style={styles.addButton}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Package size={20} color="#3B82F6" />
                <Text style={styles.statLabel}>Total Listings</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalListings}</Text>
              <Text style={styles.statSubtext}>{stats.activeListings} active</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <DollarSign size={20} color="#059669" />
                <Text style={styles.statLabel}>Monthly Revenue</Text>
              </View>
              <Text style={styles.statValue}>{formatPrice(stats.monthlyRevenue)}</Text>
              <Text style={styles.statSubtext}>+12% from last month</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <ShoppingBag size={20} color="#8B5CF6" />
                <Text style={styles.statLabel}>Total Sales</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalSales}</Text>
              <Text style={styles.statSubtext}>+8 this week</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Eye size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>Total Views</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalViews}</Text>
              <Text style={styles.statSubtext}>+156 this week</Text>
            </CardContent>
          </Card>
        </View>

        {/* Rating Card */}
        <Card style={styles.ratingCard}>
          <CardHeader title="Customer Rating" />
          <CardContent>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingValue}>{stats.averageRating}</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      color="#F59E0B"
                      fill={star <= Math.floor(stats.averageRating) ? "#F59E0B" : "none"}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>
                  Based on {stats.totalReviews} reviews
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handleCreateListing}
                style={styles.actionButton}
                icon={() => <Plus size={20} color="#FFF" />}
              >
                Add Listing
              </Button>
              <Button
                mode="outlined"
                onPress={handleViewListings}
                style={styles.actionButton}
                icon={() => <Eye size={20} color="#3B82F6" />}
              >
                View Listings
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card style={styles.ordersCard}>
          <CardHeader 
            title="Recent Orders"
            right={() => (
              <TouchableOpacity onPress={handleViewOrders}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          />
          <CardContent>
            {recentOrders.length > 0 ? (
              recentOrders.map(renderOrderItem)
            ) : (
              <Text style={styles.emptyText}>No recent orders</Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export default VendorDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#059669',
  },
  ratingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingInfo: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  stars: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  ordersCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  viewAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    paddingVertical: 20,
  },
});
