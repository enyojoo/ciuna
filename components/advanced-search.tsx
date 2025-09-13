'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Input } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { SearchService, SearchResult, SearchSuggestion, SearchFilter } from '@ciuna/sb';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { 
  Search, 
  Filter, 
  X, 
  TrendingUp, 
  Clock, 
  Star,
  MapPin,
  DollarSign,
  Calendar,
  ChevronDown,
  Loader2
} from 'lucide-react';

interface AdvancedSearchProps {
  onResults: (results: SearchResult[]) => void;
  onLoading: (loading: boolean) => void;
  placeholder?: string;
  showFilters?: boolean;
  showSuggestions?: boolean;
  showTrending?: boolean;
  contentType?: 'ALL' | 'LISTINGS' | 'VENDORS' | 'SERVICES' | 'PRODUCTS';
}

export default function AdvancedSearch({
  onResults,
  onLoading,
  placeholder = "Search for anything...",
  showFilters = true,
  showSuggestions = true,
  showTrending = true,
  contentType = 'ALL'
}: AdvancedSearchProps) {
  const { user } = useAuth();
  const { formatPrice } = useI18n();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [trending, setTrending] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const loadInitialData = async () => {
    try {
      const [filtersData, trendingData] = await Promise.all([
        SearchService.getFilters(),
        showTrending ? SearchService.getTrendingSearches(5) : Promise.resolve([])
      ]);

      setFilters(filtersData);
      setTrending(trendingData);

      if (user) {
        const history = await SearchService.getSearchHistory(user.id, 5);
        setRecentSearches(history.map(h => ({
          suggestion: h.query_text,
          type: 'AUTOCOMPLETE' as const,
          score: 0
        })));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadSuggestions = useCallback(async () => {
    try {
      const suggestionsData = await SearchService.getSuggestions(query, 8);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, [query]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    onLoading(true);
    setShowSuggestionsList(false);

    try {
      const results = await SearchService.search(
        searchQuery,
        contentType,
        20,
        0,
        activeFilters,
        user?.id
      );

      onResults(results);
      
      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
      }

      // Update suggestion popularity
      await SearchService.updateSuggestionPopularity(searchQuery);
    } catch (error) {
      console.error('Error searching:', error);
      onResults([]);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleRemoveFilter = (filterKey: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getFilterDisplayValue = (filter: SearchFilter, value: any) => {
    switch (filter.filter_type) {
      case 'RANGE':
        if (Array.isArray(value) && value.length === 2) {
          return `${value[0]} - ${value[1]}`;
        }
        return value?.toString() || '';
      case 'SELECT':
      case 'MULTISELECT':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value?.toString() || '';
      case 'BOOLEAN':
        return value ? 'Yes' : 'No';
      case 'LOCATION':
        return value?.address || value?.city || 'Location';
      default:
        return value?.toString() || '';
    }
  };

  const renderFilterInput = (filter: SearchFilter) => {
    const value = activeFilters[filter.filter_key];

    switch (filter.filter_type) {
      case 'RANGE':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={value?.[0] || ''}
                onChange={(e) => {
                  const newValue = [e.target.value, value?.[1] || ''];
                  handleFilterChange(filter.filter_key, newValue);
                }}
                className="w-20"
              />
              <Input
                type="number"
                placeholder="Max"
                value={value?.[1] || ''}
                onChange={(e) => {
                  const newValue = [value?.[0] || '', e.target.value];
                  handleFilterChange(filter.filter_key, newValue);
                }}
                className="w-20"
              />
            </div>
          </div>
        );

      case 'SELECT':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.filter_key, e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select {filter.filter_name}</option>
            {filter.filter_options.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'MULTISELECT':
        return (
          <div className="space-y-2">
            {filter.filter_options.options?.map((option: string) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value?.includes(option) || false}
                  onChange={(e) => {
                    const currentValue = value || [];
                    const newValue = e.target.checked
                      ? [...currentValue, option]
                      : currentValue.filter((v: string) => v !== option);
                    handleFilterChange(filter.filter_key, newValue);
                  }}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'BOOLEAN':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFilterChange(filter.filter_key, e.target.checked)}
            />
            <span className="text-sm">{filter.filter_options.label}</span>
          </label>
        );

      case 'LOCATION':
        return (
          <div className="space-y-2">
            <Input
              placeholder="Enter location"
              value={value?.address || ''}
              onChange={(e) => handleFilterChange(filter.filter_key, {
                ...value,
                address: e.target.value
              })}
            />
            <Input
              type="number"
              placeholder="Radius (km)"
              value={value?.radius || ''}
              onChange={(e) => handleFilterChange(filter.filter_key, {
                ...value,
                radius: parseInt(e.target.value) || 0
              })}
              className="w-24"
            />
          </div>
        );

      default:
        return (
          <Input
            placeholder={`Enter ${filter.filter_name.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.filter_key, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestionsList(true)}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="h-8"
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="h-8"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestionsList && (suggestions.length > 0 || recentSearches.length > 0 || trending.length > 0) && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
            <CardContent className="p-0">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-3 border-b">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Recent</span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search.suggestion)}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                      >
                        {search.suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              {trending.length > 0 && (
                <div className="p-3 border-b">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Trending</span>
                  </div>
                  <div className="space-y-1">
                    {trending.slice(0, 3).map((trend, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(trend.suggestion)}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                      >
                        {trend.suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Suggestions</span>
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.suggestion)}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                      >
                        {suggestion.suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterKey, value]) => {
            const filter = filters.find(f => f.filter_key === filterKey);
            if (!filter || !value) return null;

            return (
              <Badge key={filterKey} variant="secondary" className="flex items-center space-x-1">
                <span>{filter.filter_name}: {getFilterDisplayValue(filter, value)}</span>
                <button
                  onClick={() => handleRemoveFilter(filterKey)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Filters Panel */}
      {showFiltersPanel && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filters</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-sm font-medium">
                    {filter.filter_name}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setActiveFilters({})}
              >
                Clear All
              </Button>
              <Button onClick={() => handleSearch()}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
