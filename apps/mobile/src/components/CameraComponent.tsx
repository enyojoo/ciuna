import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { CameraService, ImageResult } from '../services/camera';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface CameraComponentProps {
  onImageCaptured: (image: ImageResult) => void;
  onClose: () => void;
  type?: 'camera' | 'gallery';
  allowMultiple?: boolean;
  maxImages?: number;
}

export default function CameraComponent({
  onImageCaptured,
  onClose,
  type = 'camera',
  allowMultiple = false,
  maxImages = 5,
}: CameraComponentProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<ImageResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageResult | null>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const permissions = await CameraService.checkPermissions();
    setHasPermission(permissions.camera && permissions.mediaLibrary);
  };

  const requestPermissions = async () => {
    const permissions = await CameraService.requestPermissions();
    setHasPermission(permissions.camera && permissions.mediaLibrary);
    
    if (!permissions.camera || !permissions.mediaLibrary) {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to take photos.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const result = await CameraService.takePhoto({
        quality: 0.8,
        allowsEditing: false,
        base64: false,
      });

      if (result) {
        if (allowMultiple) {
          setCapturedImages(prev => [...prev, result]);
          if (capturedImages.length + 1 >= maxImages) {
            onImageCaptured(result);
            onClose();
          }
        } else {
          setPreviewImage(result);
          setShowPreview(true);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      if (allowMultiple) {
        const results = await CameraService.pickMultipleImages(maxImages, {
          quality: 0.8,
          allowsEditing: false,
        });
        
        if (results.length > 0) {
          setCapturedImages(results);
          onImageCaptured(results[0]);
          onClose();
        }
      } else {
        const result = await CameraService.pickImage({
          quality: 0.8,
          allowsEditing: false,
        });
        
        if (result) {
          setPreviewImage(result);
          setShowPreview(true);
        }
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const confirmImage = () => {
    if (previewImage) {
      onImageCaptured(previewImage);
      onClose();
    }
  };

  const retakeImage = () => {
    setShowPreview(false);
    setPreviewImage(null);
  };

  const toggleCameraType = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showPreview && previewImage) {
    return (
      <Modal visible={showPreview} animationType="slide">
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={retakeImage} style={styles.previewButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.placeholder} />
          </View>
          
          <Image source={{ uri: previewImage.uri }} style={styles.previewImage} />
          
          <View style={styles.previewActions}>
            <TouchableOpacity onPress={retakeImage} style={styles.retakeButton}>
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmImage} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {type === 'camera' ? 'Take Photo' : 'Select Photo'}
          </Text>
          <TouchableOpacity onPress={toggleCameraType} style={styles.flipButton}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {type === 'camera' ? (
          <Camera
            style={styles.camera}
            type={cameraType}
            ref={cameraRef}
            ratio="4:3"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={pickFromGallery}
                >
                  <Ionicons name="images" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.captureButton, isCapturing && styles.capturingButton]}
                  onPress={takePicture}
                  disabled={isCapturing}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <View style={styles.placeholder} />
              </View>
            </View>
          </Camera>
        ) : (
          <View style={styles.galleryContainer}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
              <Ionicons name="images" size={48} color="#666" />
              <Text style={styles.galleryText}>Select from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {allowMultiple && capturedImages.length > 0 && (
          <View style={styles.capturedImagesContainer}>
            <Text style={styles.capturedImagesTitle}>
              {capturedImages.length}/{maxImages} photos selected
            </Text>
            <View style={styles.capturedImagesList}>
              {capturedImages.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.uri }}
                  style={styles.capturedImage}
                />
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  flipButton: {
    padding: 5,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  capturingButton: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholder: {
    width: 50,
  },
  galleryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  galleryText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  previewTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  previewButton: {
    padding: 5,
  },
  previewImage: {
    flex: 1,
    width: width,
    height: height * 0.7,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  retakeButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  capturedImagesContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  capturedImagesTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  capturedImagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  capturedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
});
