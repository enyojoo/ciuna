'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { SearchService, SearchResult } from '@ciuna/sb';
import { useAuth } from '../lib/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { 
  Package, 
  Store, 
  Wrench, 
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Eye,
  Heart,
  Share2,
  Filter,
  SortAsc,
  Grid,
  List
} from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onResultClick?: (result: SearchResult) => void;
  showFilters?: boolean;
  showSorting?: boolean;
  showViewToggle?: boolean;
}

const CONTENT_TYPE_ICONS = {
  'LISTING': Package,
  'VENDOR': Store,
  'SERVICE': Wrench,
  'PRODUCT': ShoppingCart,
};

const CONTENT_TYPE_LABELS = {
  'LISTING': 'Listing',
  'VENDOR': 'Vendor',
  'SERVICE': 'Service',
  'PRODUCT': 'Product',
};

export default function SearchResults({
  results,
  loading,
  onResultClick,
  showFilters = true,
  showSorting = true,
  showViewToggle = true
}: SearchResultsProps) {
  const { user } = useAuth();
  const { formatPrice } = useI18n();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'date' | 'rating'>('relevance');
  const [sortedResults, setSortedResults] = useState<SearchResult[]>(results);

  useEffect(() => {
    setSortedResults(results);
  }, [results]);

  useEffect(() => {
    if (results.length === 0) return;

    const sorted = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = a.metadata.price || 0;
          const priceB = b.metadata.price || 0;
          return priceA - priceB;
        case 'date':
          const dateA = new Date(a.metadata.created_at || 0).getTime();
          const dateB = new Date(b.metadata.created_at || 0).getTime();
          return dateB - dateA;
        case 'rating':
          const ratingA = a.metadata.rating || 0;
          const ratingB = b.metadata.rating || 0;
          return ratingB - ratingA;
        case 'relevance':
        default:
          return b.score - a.score;
      }
    });

    setSortedResults(sorted);
  }, [sortBy, results]);

  const handleResultClick = async (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }

    // Track click for analytics
    if (user) {
      try {
        // In a real implementation, you would track the click with the query ID
        console.log('Tracking click for result:', result.id);
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  const handleFavorite = async (result: SearchResult) => {
    // In a real implementation, you would add to favorites
    console.log('Adding to favorites:', result.id);
  };

  const handleShare = async (result: SearchResult) => {
    // In a real implementation, you would share the result
    console.log('Sharing result:', result.id);
  };

  const getContentTypeIcon = (contentType: string) => {
    const IconComponent = CONTENT_TYPE_ICONS[contentType as keyof typeof CONTENT_TYPE_ICONS] || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  const getContentTypeLabel = (contentType: string) => {
    return CONTENT_TYPE_LABELS[contentType as keyof typeof CONTENT_TYPE_LABELS] || contentType;
  };

  const renderResultCard = (result: SearchResult) => {
    const IconComponent = CONTENT_TYPE_ICONS[result.content_type as keyof typeof CONTENT_TYPE_ICONS] || Package;

    return (
      <Card
        key={result.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleResultClick(result)}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {result.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {getContentTypeLabel(result.content_type)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {result.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {result.metadata.price && (
                      <span className="font-medium text-green-600">
                        {formatPrice(result.metadata.price, result.metadata.currency || 'RUB')}
                      </span>
                    )}
                    
                    {result.metadata.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{result.metadata.location}</span>
                      </div>
                    )}
                    
                    {result.metadata.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{result.metadata.rating}</span>
                      </div>
                    )}
                    
                    {result.metadata.created_at && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(result.metadata.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(result);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(result);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedResults.map(renderResultCard)}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {sortedResults.map(renderResultCard)}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button variant="outline">
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </h2>
          <p className="text-sm text-gray-600">
            Showing results sorted by {sortBy}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sort Options */}
          {showSorting && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price">Price</option>
              <option value="date">Date</option>
              <option value="rating">Rating</option>
            </select>
          )}
          
          {/* View Toggle */}
          {showViewToggle && (
            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}

      {/* Load More */}
      {results.length >= 20 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
}
