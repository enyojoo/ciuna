import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationPermissions {
  foreground: boolean;
  background: boolean;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface AddressResult {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  name?: string;
  formattedAddress?: string;
}

export interface LocationOptions {
  accuracy?: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
  mayShowUserSettingsDialog?: boolean;
}

export class LocationService {
  private static watchId: Location.LocationSubscription | null = null;

  /**
   * Request location permissions
   */
  static async requestPermissions(): Promise<LocationPermissions> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      return {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted',
      };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return { foreground: false, background: false };
    }
  }

  /**
   * Check location permissions
   */
  static async checkPermissions(): Promise<LocationPermissions> {
    try {
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();

      return {
        foreground: foregroundStatus.status === 'granted',
        background: backgroundStatus.status === 'granted',
      };
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return { foreground: false, background: false };
    }
  }

  /**
   * Get current location
   */
  static async getCurrentLocation(
    options: LocationOptions = {}
  ): Promise<LocationResult | null> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.foreground) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: options.accuracy || Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: options.mayShowUserSettingsDialog || true,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || undefined,
        accuracy: location.coords.accuracy || undefined,
        altitudeAccuracy: location.coords.altitudeAccuracy || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Watch location changes
   */
  static async watchLocation(
    callback: (location: LocationResult) => void,
    options: LocationOptions = {}
  ): Promise<boolean> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.foreground) {
        throw new Error('Location permission not granted');
      }

      // Stop existing watch
      if (this.watchId) {
        this.watchId.remove();
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy || Location.Accuracy.Balanced,
          timeInterval: options.timeInterval || 1000,
          distanceInterval: options.distanceInterval || 1,
          mayShowUserSettingsDialog: options.mayShowUserSettingsDialog || true,
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || undefined,
            accuracy: location.coords.accuracy || undefined,
            altitudeAccuracy: location.coords.altitudeAccuracy || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          });
        }
      );

      return true;
    } catch (error) {
      console.error('Error watching location:', error);
      return false;
    }
  }

  /**
   * Stop watching location
   */
  static stopWatchingLocation(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  /**
   * Get address from coordinates
   */
  static async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<AddressResult | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length === 0) {
        return null;
      }

      const address = addresses[0];
      return {
        street: address.street,
        city: address.city,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode,
        name: address.name,
        formattedAddress: [
          address.street,
          address.city,
          address.region,
          address.country,
        ].filter(Boolean).join(', '),
      };
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  }

  /**
   * Get coordinates from address
   */
  static async getCoordinatesFromAddress(
    address: string
  ): Promise<LocationResult | null> {
    try {
      const locations = await Location.geocodeAsync(address);

      if (locations.length === 0) {
        return null;
      }

      const location = locations[0];
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if location services are enabled
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      return enabled;
    } catch (error) {
      console.error('Error checking if location services are enabled:', error);
      return false;
    }
  }

  /**
   * Get location accuracy
   */
  static getLocationAccuracy(accuracy: number): string {
    if (accuracy <= 5) return 'Excellent';
    if (accuracy <= 10) return 'Good';
    if (accuracy <= 20) return 'Fair';
    if (accuracy <= 50) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Format distance for display
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  /**
   * Get location history (if available)
   */
  static async getLocationHistory(
    startDate: Date,
    endDate: Date
  ): Promise<LocationResult[]> {
    try {
      // This would require additional setup for location history
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  /**
   * Check if location is within radius
   */
  static isWithinRadius(
    centerLat: number,
    centerLon: number,
    pointLat: number,
    pointLon: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(
      centerLat,
      centerLon,
      pointLat,
      pointLon
    );
    return distance <= radiusKm;
  }

  /**
   * Get nearby locations
   */
  static async getNearbyLocations(
    centerLat: number,
    centerLon: number,
    radiusKm: number,
    locations: Array<{ latitude: number; longitude: number; [key: string]: any }>
  ): Promise<Array<{ latitude: number; longitude: number; [key: string]: any; distance: number }>> {
    const nearby = locations
      .map(location => ({
        ...location,
        distance: this.calculateDistance(
          centerLat,
          centerLon,
          location.latitude,
          location.longitude
        ),
      }))
      .filter(location => location.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  }
}
