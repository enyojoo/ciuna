'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { SearchService, SearchResult, SearchSuggestion } from '@ciuna/sb';
import { useAuth } from '../lib/auth-context';
import AdvancedSearch from '../../components/advanced-search';
import SearchResults from '../../components/search-results';
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Star,
  BarChart3,
  Filter
} from 'lucide-react';

export default function SearchPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [trending, setTrending] = useState<SearchSuggestion[]>([]);
  const [popular, setPopular] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (query) {
      handleSearch(query, 'ALL');
    }
  }, [query]);

  const loadInitialData = async () => {
    try {
      const [trendingData, popularData] = await Promise.all([
        SearchService.getTrendingSearches(10),
        SearchService.getPopularSearches(10)
      ]);

      setTrending(trendingData);
      setPopular(popularData);

      if (user) {
        const history = await SearchService.getSearchHistory(user.id, 10);
        setSearchHistory(history.map(h => ({
          suggestion: h.query_text,
          type: 'AUTOCOMPLETE' as const,
          score: 0
        })));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSearch = async (searchQuery: string, contentType: 'ALL' | 'LISTINGS' | 'VENDORS' | 'SERVICES' | 'PRODUCTS' = 'ALL') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchResults = await SearchService.search(
        searchQuery,
        contentType,
        20,
        0,
        {},
        user?.id
      );

      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the result page
    const baseUrl = result.content_type === 'LISTING' ? '/listings' :
                   result.content_type === 'VENDOR' ? '/vendors' :
                   result.content_type === 'SERVICE' ? '/services' :
                   result.content_type === 'PRODUCT' ? '/products' : '/';
    
    window.location.href = `${baseUrl}/${result.id}`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion, 'ALL');
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        Search for anything
      </h3>
      <p className="text-gray-600 mb-6">
        Find listings, vendors, services, and products in your area.
      </p>
      
      {/* Trending Searches */}
      {trending.length > 0 && (
        <div className="max-w-md mx-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {trending.slice(0, 6).map((trend, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(trend.suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
              >
                {trend.suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSearchResults = () => (
    <div className="space-y-6">
      <AdvancedSearch
        onResults={setResults}
        onLoading={setLoading}
        placeholder="Search for anything..."
        showFilters={true}
        showSuggestions={true}
        showTrending={true}
        contentType={activeTab === 'all' ? 'ALL' : activeTab.toUpperCase() as any}
      />
      
      {results.length > 0 && (
        <SearchResults
          results={results}
          loading={loading}
          onResultClick={handleResultClick}
          showFilters={true}
          showSorting={true}
          showViewToggle={true}
        />
      )}
    </div>
  );

  const renderDiscoverSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover</h2>
        <p className="text-gray-600">Explore popular searches and trending items.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Trending Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Trending Searches
            </CardTitle>
            <CardDescription>
              What's popular right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trending.slice(0, 5).map((trend, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(trend.suggestion)}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center justify-between"
                >
                  <span>{trend.suggestion}</span>
                  <Star className="h-4 w-4 text-yellow-500" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Popular Searches
            </CardTitle>
            <CardDescription>
              Most searched items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popular.slice(0, 5).map((pop, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(pop.suggestion)}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm flex items-center justify-between"
                >
                  <span>{pop.suggestion}</span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search History */}
        {user && searchHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Searches
              </CardTitle>
              <CardDescription>
                Your search history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((history, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(history.suggestion)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                  >
                    {history.suggestion}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search</h1>
          <p className="text-gray-600 mt-2">
            Find exactly what you're looking for
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {query ? renderSearchResults() : renderEmptyState()}
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            {query ? renderSearchResults() : renderEmptyState()}
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            {query ? renderSearchResults() : renderEmptyState()}
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {query ? renderSearchResults() : renderEmptyState()}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {query ? renderSearchResults() : renderEmptyState()}
          </TabsContent>
        </Tabs>

        {/* Discover Section - Only show when no search query */}
        {!query && (
          <div className="mt-12">
            {renderDiscoverSection()}
          </div>
        )}
      </div>
    </div>
  );
}
