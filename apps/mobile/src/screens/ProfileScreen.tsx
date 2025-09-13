import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { formatPrice } from '../utils/formatting';
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Edit3,
  Shield,
  Star,
  Package,
  MessageSquare,
  CreditCard,
  MapPin,
  Calendar,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';

interface ProfileStats {
  totalOrders: number;
  totalListings: number;
  totalServices: number;
  averageRating: number;
  totalReviews: number;
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    totalOrders: 0,
    totalListings: 0,
    totalServices: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Mock data for demo
      setStats({
        totalOrders: 12,
        totalListings: 8,
        totalServices: 3,
        averageRating: 4.8,
        totalReviews: 24,
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleVerification = () => {
    if (profile?.verification_status === 'APPROVED') {
      Alert.alert('Verified', 'Your account is already verified!');
    } else {
      navigation.navigate('Verification' as never);
    }
  };

  const menuItems = [
    {
      title: 'My Orders',
      icon: Package,
      onPress: () => navigation.navigate('Orders' as never),
      badge: stats.totalOrders > 0 ? stats.totalOrders : undefined,
    },
    {
      title: 'My Listings',
      icon: Edit3,
      onPress: () => navigation.navigate('MyListings' as never),
      badge: stats.totalListings > 0 ? stats.totalListings : undefined,
    },
    {
      title: 'My Services',
      icon: Star,
      onPress: () => navigation.navigate('MyServices' as never),
      badge: stats.totalServices > 0 ? stats.totalServices : undefined,
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      onPress: () => navigation.navigate('Inbox' as never),
    },
    {
      title: 'Payment Methods',
      icon: CreditCard,
      onPress: () => navigation.navigate('PaymentMethods' as never),
    },
    {
      title: 'Addresses',
      icon: MapPin,
      onPress: () => navigation.navigate('Addresses' as never),
    },
    {
      title: 'Notifications',
      icon: Bell,
      onPress: () => navigation.navigate('Notifications' as never),
    },
    {
      title: 'Settings',
      icon: Settings,
      onPress: () => navigation.navigate('Settings' as never),
    },
    {
      title: 'Help & Support',
      icon: HelpCircle,
      onPress: () => navigation.navigate('Help' as never),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#6B7280" />
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
                <Edit3 size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile?.email || 'User'}</Text>
              <Text style={styles.location}>
                {profile?.city}, {profile?.country_of_origin}
              </Text>
              
              {/* Verification Status */}
              <View style={styles.verificationContainer}>
                {profile?.verification_status === 'APPROVED' ? (
                  <View style={styles.verifiedBadge}>
                    <CheckCircle size={16} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified Expat</Text>
                  </View>
                ) : profile?.verification_status === 'PENDING' ? (
                  <TouchableOpacity style={styles.pendingBadge} onPress={handleVerification}>
                    <AlertCircle size={16} color="#F59E0B" />
                    <Text style={styles.pendingText}>Verification Pending</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.unverifiedBadge} onPress={handleVerification}>
                    <Shield size={16} color="#6B7280" />
                    <Text style={styles.unverifiedText}>Get Verified</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalListings}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <item.icon size={20} color="#6B7280" />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <ChevronRight size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Ciuna v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  verificationContainer: {
    marginTop: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  unverifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signOutContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
