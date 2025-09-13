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
  Wrench, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Users,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react-native';
import { formatPrice, formatRelativeTime } from '../utils/formatting';

interface ProviderStats {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  monthlyRevenue: number;
  totalClients: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
}

interface RecentBooking {
  id: string;
  clientName: string;
  serviceTitle: string;
  amount: number;
  status: string;
  scheduledDate: string;
  duration: number;
}

export function ProviderDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<ProviderStats>({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    averageRating: 0,
    totalReviews: 0,
    completionRate: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
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
        totalServices: 8,
        activeServices: 6,
        totalBookings: 89,
        monthlyRevenue: 85000,
        totalClients: 45,
        averageRating: 4.8,
        totalReviews: 67,
        completionRate: 96,
      });

      setRecentBookings([
        {
          id: '1',
          clientName: 'Sarah Johnson',
          serviceTitle: 'Home Cleaning',
          amount: 5000,
          status: 'completed',
          scheduledDate: new Date(Date.now() - 3600000).toISOString(),
          duration: 120,
        },
        {
          id: '2',
          clientName: 'Mike Chen',
          serviceTitle: 'Tutoring Session',
          amount: 3000,
          status: 'in_progress',
          scheduledDate: new Date(Date.now() - 1800000).toISOString(),
          duration: 60,
        },
        {
          id: '3',
          clientName: 'Emma Davis',
          serviceTitle: 'Pet Walking',
          amount: 2000,
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + 3600000).toISOString(),
          duration: 30,
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

  const handleCreateService = () => {
    // TODO: Navigate to create service page
    console.log('Create service');
  };

  const handleViewServices = () => {
    navigation.navigate('Services');
  };

  const handleViewBookings = () => {
    // TODO: Navigate to bookings page
    console.log('View bookings');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#059669';
      case 'in_progress':
        return '#3B82F6';
      case 'scheduled':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderBookingItem = (booking: RecentBooking) => (
    <Card key={booking.id} style={styles.bookingCard}>
      <CardContent>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle}>{booking.serviceTitle}</Text>
          <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            {booking.status}
          </Badge>
        </View>
        <Text style={styles.clientName}>Client: {booking.clientName}</Text>
        <View style={styles.bookingDetails}>
          <View style={styles.detailItem}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.detailText}>{booking.duration} min</Text>
          </View>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {formatRelativeTime(booking.scheduledDate)}
            </Text>
          </View>
        </View>
        <View style={styles.bookingFooter}>
          <Text style={styles.bookingAmount}>{formatPrice(booking.amount)}</Text>
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
          <Text style={styles.headerTitle}>Service Provider Dashboard</Text>
          <TouchableOpacity onPress={handleCreateService} style={styles.addButton}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Wrench size={20} color="#8B5CF6" />
                <Text style={styles.statLabel}>Total Services</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalServices}</Text>
              <Text style={styles.statSubtext}>{stats.activeServices} active</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <DollarSign size={20} color="#059669" />
                <Text style={styles.statLabel}>Monthly Revenue</Text>
              </View>
              <Text style={styles.statValue}>{formatPrice(stats.monthlyRevenue)}</Text>
              <Text style={styles.statSubtext}>+15% from last month</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Calendar size={20} color="#3B82F6" />
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalBookings}</Text>
              <Text style={styles.statSubtext}>+12 this week</Text>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent>
              <View style={styles.statHeader}>
                <Users size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>Total Clients</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalClients}</Text>
              <Text style={styles.statSubtext}>+5 new this month</Text>
            </CardContent>
          </Card>
        </View>

        {/* Performance Cards */}
        <View style={styles.performanceGrid}>
          <Card style={styles.performanceCard}>
            <CardContent>
              <View style={styles.performanceHeader}>
                <Star size={20} color="#F59E0B" />
                <Text style={styles.performanceLabel}>Rating</Text>
              </View>
              <Text style={styles.performanceValue}>{stats.averageRating}</Text>
              <Text style={styles.performanceSubtext}>
                Based on {stats.totalReviews} reviews
              </Text>
            </CardContent>
          </Card>

          <Card style={styles.performanceCard}>
            <CardContent>
              <View style={styles.performanceHeader}>
                <CheckCircle size={20} color="#059669" />
                <Text style={styles.performanceLabel}>Completion Rate</Text>
              </View>
              <Text style={styles.performanceValue}>{stats.completionRate}%</Text>
              <Text style={styles.performanceSubtext}>Last 30 days</Text>
            </CardContent>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handleCreateService}
                style={styles.actionButton}
                icon={() => <Plus size={20} color="#FFF" />}
              >
                Add Service
              </Button>
              <Button
                mode="outlined"
                onPress={handleViewServices}
                style={styles.actionButton}
                icon={() => <Wrench size={20} color="#8B5CF6" />}
              >
                View Services
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card style={styles.bookingsCard}>
          <CardHeader 
            title="Recent Bookings"
            right={() => (
              <TouchableOpacity onPress={handleViewBookings}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          />
          <CardContent>
            {recentBookings.length > 0 ? (
              recentBookings.map(renderBookingItem)
            ) : (
              <Text style={styles.emptyText}>No recent bookings</Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProviderDashboardScreen;

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
    backgroundColor: '#8B5CF6',
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
  performanceGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  performanceCard: {
    flex: 1,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  performanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  performanceSubtext: {
    fontSize: 12,
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
  bookingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  viewAllText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  bookingCard: {
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clientName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    paddingVertical: 20,
  },
});
