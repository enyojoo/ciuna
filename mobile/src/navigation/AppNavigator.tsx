import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../screens/LoadingScreen';
import { AuthNavigator } from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SellScreen from '../screens/SellScreen';
import VendorsScreen from '../screens/VendorsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import InboxScreen from '../screens/InboxScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { VendorDashboardScreen } from '../screens/VendorDashboardScreen';
import { ProviderDashboardScreen } from '../screens/ProviderDashboardScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { VendorDetailScreen } from '../screens/VendorDetailScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { 
  Home, 
  Search, 
  Plus, 
  Store, 
  Wrench, 
  MessageCircle, 
  ShoppingBag, 
  User,
  BarChart3
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Home') {
            IconComponent = Home;
          } else if (route.name === 'Search') {
            IconComponent = Search;
          } else if (route.name === 'Sell') {
            IconComponent = Plus;
          } else if (route.name === 'Vendors') {
            IconComponent = Store;
          } else if (route.name === 'Services') {
            IconComponent = Wrench;
          } else if (route.name === 'Inbox') {
            IconComponent = MessageCircle;
          } else if (route.name === 'Orders') {
            IconComponent = ShoppingBag;
          } else if (route.name === 'Dashboard') {
            IconComponent = BarChart3;
          } else if (route.name === 'Profile') {
            IconComponent = User;
          }

          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Sell" component={SellScreen} />
      <Tab.Screen name="Vendors" component={VendorsScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Dashboard') {
            IconComponent = BarChart3;
          } else if (route.name === 'Products') {
            IconComponent = Store;
          } else if (route.name === 'Orders') {
            IconComponent = ShoppingBag;
          } else if (route.name === 'Profile') {
            IconComponent = User;
          }

          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={VendorDashboardScreen} />
      <Tab.Screen name="Products" component={VendorDashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Dashboard') {
            IconComponent = BarChart3;
          } else if (route.name === 'Services') {
            IconComponent = Wrench;
          } else if (route.name === 'Bookings') {
            IconComponent = MessageCircle;
          } else if (route.name === 'Profile') {
            IconComponent = User;
          }

          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={ProviderDashboardScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Bookings" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="VendorDetail" component={VendorDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthNavigator />;
  }

  // Show different navigation based on user role
  if (profile?.role === 'VENDOR') {
    return (
      <NavigationContainer>
        <VendorTabs />
      </NavigationContainer>
    );
  }

  if (profile?.role === 'USER' && profile?.verified_expat) {
    // Check if user is also a service provider
    return (
      <NavigationContainer>
        <ProviderTabs />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}
