import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { LocationService, LocationResult, AddressResult } from '../services/location';
import { Ionicons } from '@expo/vector-icons';

interface LocationPickerProps {
  onLocationSelected: (location: LocationResult, address?: AddressResult) => void;
  onClose: () => void;
  initialLocation?: LocationResult;
  showMap?: boolean;
  allowSearch?: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: LocationResult;
}

export default function LocationPicker({
  onLocationSelected,
  onClose,
  initialLocation,
  showMap = true,
  allowSearch = true,
}: LocationPickerProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationResult | null>(initialLocation || null);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(initialLocation || null);
  const [address, setAddress] = useState<AddressResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 55.7558,
    longitude: initialLocation?.longitude || 37.6176,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    checkPermissions();
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      getAddressFromLocation(initialLocation);
    }
  }, []);

  const checkPermissions = async () => {
    const permissions = await LocationService.checkPermissions();
    setHasPermission(permissions.foreground);
    
    if (permissions.foreground) {
      getCurrentLocation();
    }
  };

  const requestPermissions = async () => {
    const permissions = await LocationService.requestPermissions();
    setHasPermission(permissions.foreground);
    
    if (permissions.foreground) {
      getCurrentLocation();
    } else {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services to use this feature.',
        [{ text: 'OK' }]
      );
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        setSelectedLocation(location);
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        getAddressFromLocation(location);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressFromLocation = async (location: LocationResult) => {
    try {
      const addressResult = await LocationService.getAddressFromCoordinates(
        location.latitude,
        location.longitude
      );
      setAddress(addressResult);
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const location = await LocationService.getCoordinatesFromAddress(query);
      if (location) {
        setSearchResults([{
          id: '1',
          name: query,
          address: query,
          location,
        }]);
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation: LocationResult = {
      latitude,
      longitude,
      timestamp: Date.now(),
    };
    setSelectedLocation(newLocation);
    getAddressFromLocation(newLocation);
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      onLocationSelected(selectedLocation, address || undefined);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    setSelectedLocation(result.location);
    setSearchQuery(result.name);
    setSearchResults([]);
    setRegion({
      latitude: result.location.latitude,
      longitude: result.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    getAddressFromLocation(result.location);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResult}
      onPress={() => selectSearchResult(item)}
    >
      <Ionicons name="location" size={20} color="#666" />
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultAddress}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="location-outline" size={64} color="#666" />
        <Text style={styles.message}>Location permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Location</Text>
          <TouchableOpacity onPress={confirmLocation} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {allowSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a location..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchLocation(text);
                }}
              />
              {isSearching && <ActivityIndicator size="small" color="#007AFF" />}
            </View>
            
            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                style={styles.searchResults}
              />
            )}
          </View>
        )}

        {showMap && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              onRegionChangeComplete={handleRegionChange}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title="Selected Location"
                />
              )}
            </MapView>
            
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={isLoading}
            >
              <Ionicons name="locate" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        {selectedLocation && (
          <View style={styles.locationInfo}>
            <View style={styles.locationInfoHeader}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.locationInfoTitle}>Selected Location</Text>
            </View>
            <Text style={styles.locationCoordinates}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
            {address && (
              <Text style={styles.locationAddress}>
                {address.formattedAddress}
              </Text>
            )}
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  confirmButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    maxHeight: 200,
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultContent: {
    marginLeft: 10,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationInfo: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  locationInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  locationCoordinates: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  locationAddress: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  message: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
