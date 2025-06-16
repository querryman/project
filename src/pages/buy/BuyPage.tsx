import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { Card } from '../../components/Card';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type Item = Database['public']['Tables']['items']['Row'];

export const BuyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc'>(
    (searchParams.get('sort') as 'latest' | 'price_asc' | 'price_desc') || 'latest'
  );

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        
        // Construct the query
        let query = supabase
          .from('items')
          .select('*')
          .eq('status', 'active');
          
        // Apply category filter
        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }
        
        // Apply search filter
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
        
        // Apply sorting
        switch (sortBy) {
          case 'latest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setItems(data || []);
        
        // Extract unique categories
        if (data) {
          const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [selectedCategory, searchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      q: searchQuery,
      category: selectedCategory,
      sort: sortBy,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">Shop Items</h1>
          <p className="text-purple-100 mb-8">Browse and purchase items from our marketplace</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-4 pr-12 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-purple-700"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          {/* Filters Sidebar */}
          <div className="lg:w-64 mb-6 lg:mb-0 lg:mr-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </h3>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="category-all"
                        name="category"
                        type="radio"
                        checked={selectedCategory === 'all'}
                        onChange={() => setSelectedCategory('all')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <label htmlFor="category-all" className="ml-2 text-gray-700">
                        All Categories
                      </label>
                    </div>
                    
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          id={`category-${category}`}
                          name="category"
                          type="radio"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <label htmlFor={`category-${category}`} className="ml-2 text-gray-700">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Sort By</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="sort-latest"
                        name="sort"
                        type="radio"
                        checked={sortBy === 'latest'}
                        onChange={() => setSortBy('latest')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <label htmlFor="sort-latest" className="ml-2 text-gray-700">
                        Latest
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="sort-price-asc"
                        name="sort"
                        type="radio"
                        checked={sortBy === 'price_asc'}
                        onChange={() => setSortBy('price_asc')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <label htmlFor="sort-price-asc" className="ml-2 text-gray-700">
                        Price: Low to High
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="sort-price-desc"
                        name="sort"
                        type="radio"
                        checked={sortBy === 'price_desc'}
                        onChange={() => setSortBy('price_desc')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <label htmlFor="sort-price-desc" className="ml-2 text-gray-700">
                        Price: High to Low
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link
                to="/sell"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Sell Your Items
              </Link>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
              </div>
            ) : items.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">
                    {items.length} {items.length === 1 ? 'item' : 'items'} found
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      id={item.id}
                      type="item"
                      title={item.title}
                      description={item.description || ''}
                      price={item.price}
                      currencyCode={item.currency_code}
                      image={item.images && item.images.length > 0 ? item.images[0] : undefined}
                      category={item.category}
                      createdAt={item.created_at}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <ShoppingCart className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No items match "${searchQuery}". Try a different search term or browse all items.`
                    : 'No items are currently available in this category.'}
                </p>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors mr-4"
                  >
                    View All Categories
                  </button>
                )}
                <Link
                  to="/sell"
                  className="inline-flex items-center bg-yellow-500 text-purple-900 px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Sell Your Items
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};