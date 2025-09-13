import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export interface CameraPermissions {
  camera: boolean;
  mediaLibrary: boolean;
}

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
  base64?: string;
}

export interface CameraOptions {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  base64?: boolean;
  exif?: boolean;
}

export class CameraService {
  /**
   * Request camera and media library permissions
   */
  static async requestPermissions(): Promise<CameraPermissions> {
    try {
      const [cameraPermission, mediaLibraryPermission] = await Promise.all([
        Camera.requestCameraPermissionsAsync(),
        MediaLibrary.requestPermissionsAsync(),
      ]);

      return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
      };
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return { camera: false, mediaLibrary: false };
    }
  }

  /**
   * Check if camera permissions are granted
   */
  static async checkPermissions(): Promise<CameraPermissions> {
    try {
      const [cameraStatus, mediaLibraryStatus] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        MediaLibrary.getPermissionsAsync(),
      ]);

      return {
        camera: cameraStatus.status === 'granted',
        mediaLibrary: mediaLibraryStatus.status === 'granted',
      };
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return { camera: false, mediaLibrary: false };
    }
  }

  /**
   * Take a photo using the camera
   */
  static async takePhoto(options: CameraOptions = {}): Promise<ImageResult | null> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.camera) {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: options.quality || 0.8,
        allowsEditing: options.allowsEditing || false,
        aspect: options.aspect || [4, 3],
        base64: options.base64 || false,
        exif: options.exif || false,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        base64: asset.base64,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  /**
   * Pick an image from the gallery
   */
  static async pickImage(options: CameraOptions = {}): Promise<ImageResult | null> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.mediaLibrary) {
        throw new Error('Media library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: options.quality || 0.8,
        allowsEditing: options.allowsEditing || false,
        aspect: options.aspect || [4, 3],
        base64: options.base64 || false,
        exif: options.exif || false,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        base64: asset.base64,
      };
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  }

  /**
   * Pick multiple images from the gallery
   */
  static async pickMultipleImages(
    maxImages: number = 5,
    options: CameraOptions = {}
  ): Promise<ImageResult[]> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.mediaLibrary) {
        throw new Error('Media library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: options.quality || 0.8,
        allowsEditing: options.allowsEditing || false,
        aspect: options.aspect || [4, 3],
        base64: options.base64 || false,
        exif: options.exif || false,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
      });

      if (result.canceled) {
        return [];
      }

      return result.assets.map(asset => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        base64: asset.base64,
      }));
    } catch (error) {
      console.error('Error picking multiple images:', error);
      return [];
    }
  }

  /**
   * Save image to device gallery
   */
  static async saveToGallery(uri: string): Promise<boolean> {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.mediaLibrary) {
        throw new Error('Media library permission not granted');
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      return !!asset;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      return false;
    }
  }

  /**
   * Get image metadata
   */
  static async getImageMetadata(uri: string): Promise<any> {
    try {
      const asset = await MediaLibrary.getAssetInfoAsync(uri);
      return {
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        mediaType: asset.mediaType,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        location: asset.location,
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return null;
    }
  }

  /**
   * Compress image
   */
  static async compressImage(
    uri: string,
    quality: number = 0.8,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<string> {
    try {
      const result = await ImagePicker.manipulateAsync(
        uri,
        [
          {
            resize: maxWidth && maxHeight ? { width: maxWidth, height: maxHeight } : undefined,
          },
        ],
        {
          compress: quality,
          format: ImagePicker.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  }

  /**
   * Generate thumbnail
   */
  static async generateThumbnail(
    uri: string,
    size: number = 150
  ): Promise<string> {
    try {
      const result = await ImagePicker.manipulateAsync(
        uri,
        [
          {
            resize: { width: size, height: size },
          },
        ],
        {
          compress: 0.8,
          format: ImagePicker.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return uri;
    }
  }

  /**
   * Check if device has camera
   */
  static async hasCamera(): Promise<boolean> {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      return status === 'granted' || status === 'undetermined';
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }

  /**
   * Get camera info
   */
  static async getCameraInfo(): Promise<any> {
    try {
      const hasCamera = await this.hasCamera();
      if (!hasCamera) {
        return null;
      }

      return {
        hasCamera,
        availableCameras: await Camera.getAvailableCameraTypesAsync(),
      };
    } catch (error) {
      console.error('Error getting camera info:', error);
      return null;
    }
  }
}
