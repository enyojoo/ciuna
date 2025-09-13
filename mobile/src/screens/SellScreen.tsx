import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput,
  Chip,
  FAB,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  Camera, 
  Image as ImageIcon, 
  MapPin, 
  DollarSign, 
  Tag,
  Plus,
  X
} from 'lucide-react-native';
import { db } from '@ciuna/sb';
import type { Category, ListingCondition } from '@ciuna/types';

export function SellScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price_rub: '',
    condition: 'GOOD' as ListingCondition,
    city: '',
    district: '',
    photo_urls: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await db.categories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = () => {
    // In a real app, you would use expo-image-picker here
    Alert.alert('Image Upload', 'Image upload functionality would be implemented here');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    if (!formData.price_rub || isNaN(Number(formData.price_rub)) || Number(formData.price_rub) <= 0) {
      newErrors.price_rub = 'Valid price is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would upload images to Supabase Storage first
      const listingData = {
        ...formData,
        price_rub: parseInt(formData.price_rub),
        category_id: parseInt(formData.category_id),
        status: 'ACTIVE' as const,
      };

      const { data: listing } = await db.listings.create(listingData);
      navigation.navigate('ListingDetail', { id: listing.id });
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const conditions: { value: ListingCondition; label: string }[] = [
    { value: 'NEW', label: 'New' },
    { value: 'LIKE_NEW', label: 'Like New' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Create New Listing
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sell your items to fellow expats
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text variant="titleMedium" style={styles.label}>
                Title *
              </Text>
              <TextInput
                value={formData.title}
                onChangeText={(value) => handleChange('title', value)}
                placeholder="What are you selling?"
                mode="outlined"
                error={!!errors.title}
                style={styles.input}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text variant="titleMedium" style={styles.label}>
                Description *
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Describe your item in detail..."
                mode="outlined"
                multiline
                numberOfLines={4}
                error={!!errors.description}
                style={styles.input}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            {/* Category and Condition */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text variant="titleMedium" style={styles.label}>
                  Category *
                </Text>
                <View style={styles.dropdown}>
                  <Text style={styles.dropdownText}>
                    {categories.find(c => c.id.toString() === formData.category_id)?.name || 'Select category'}
                  </Text>
                </View>
                {errors.category_id && (
                  <Text style={styles.errorText}>{errors.category_id}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text variant="titleMedium" style={styles.label}>
                  Condition
                </Text>
                <View style={styles.dropdown}>
                  <Text style={styles.dropdownText}>
                    {conditions.find(c => c.value === formData.condition)?.label || 'Good'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text variant="titleMedium" style={styles.label}>
                Price (RUB) *
              </Text>
              <TextInput
                value={formData.price_rub}
                onChangeText={(value) => handleChange('price_rub', value)}
                placeholder="0"
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.price_rub}
                style={styles.input}
                left={<TextInput.Icon icon="currency-rub" />}
              />
              {errors.price_rub && (
                <Text style={styles.errorText}>{errors.price_rub}</Text>
              )}
            </View>

            {/* Location */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text variant="titleMedium" style={styles.label}>
                  City *
                </Text>
                <TextInput
                  value={formData.city}
                  onChangeText={(value) => handleChange('city', value)}
                  placeholder="Moscow, St. Petersburg..."
                  mode="outlined"
                  error={!!errors.city}
                  style={styles.input}
                  left={<TextInput.Icon icon="map-marker" />}
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text variant="titleMedium" style={styles.label}>
                  District
                </Text>
                <TextInput
                  value={formData.district}
                  onChangeText={(value) => handleChange('district', value)}
                  placeholder="Arbat, Nevsky..."
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Photos */}
            <View style={styles.inputGroup}>
              <Text variant="titleMedium" style={styles.label}>
                Photos
              </Text>
              
              {/* Upload Button */}
              <TouchableOpacity
                onPress={handleImageUpload}
                style={styles.uploadButton}
              >
                <ImageIcon size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Tap to add photos</Text>
                <Text style={styles.uploadSubtext}>PNG, JPG up to 10MB each</Text>
              </TouchableOpacity>

              {/* Image Preview */}
              {formData.photo_urls.length > 0 && (
                <View style={styles.imageGrid}>
                  {formData.photo_urls.map((url, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: url }} style={styles.previewImage} />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        style={styles.removeButton}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SellScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
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
  card: {
    margin: 16,
    elevation: 2,
  },
  cardContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  dropdownText: {
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
