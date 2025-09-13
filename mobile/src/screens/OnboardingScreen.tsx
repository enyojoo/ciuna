import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to Ciuna',
    description: 'The ultimate marketplace for expats in Russia. Buy, sell, and discover amazing products and services.',
    image: '🛍️',
    color: '#3B82F6',
  },
  {
    id: '2',
    title: 'Connect with Fellow Expats',
    description: 'Join a vibrant community of expats from around the world living in Russia.',
    image: '🌍',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Safe & Secure',
    description: 'All transactions are protected with escrow payments and verified sellers.',
    image: '🔒',
    color: '#8B5CF6',
  },
  {
    id: '4',
    title: 'Everything You Need',
    description: 'From P2P marketplace to vendor products, services, and group buying deals.',
    image: '✨',
    color: '#F59E0B',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      navigation.navigate('SignIn' as never);
    }
  };

  const handleSkip = () => {
    navigation.navigate('SignIn' as never);
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { backgroundColor: item.color }]}>
      <View style={styles.slideContent}>
        <Text style={styles.slideEmoji}>{item.image}</Text>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        {renderPagination()}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  slideEmoji: {
    fontSize: 120,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
