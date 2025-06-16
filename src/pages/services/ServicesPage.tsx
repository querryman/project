import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Wrench, Search, Filter, Upload } from 'lucide-react';
import { Card } from '../../components/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../types/supabase';
import toast from 'react-hot-toast';

type Service = Database['public']['Tables']['services']['Row'];

export const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc'>(
    (searchParams.get('sort') as 'latest' | 'price_asc' | 'price_desc') || 'latest'
  );

  const categories = [
    'Design',
    'Development',
    'Marketing',
    'Writing',
    'Translation',
    'Video & Animation',
    'Music & Audio',
    'Business',
    'Lifestyle',
    'Other'
  ];

  useEffect(() => {
    fetchServices();
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('services')
        .select('*')
        .eq('status', 'active');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

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
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-white mb-4">Find Professional Services</h1>
          <p className="text-purple-100 mb-8">Browse and hire talented professionals for your projects</p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services..."
                className="w-full pl-4 pr-12 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Search className="absolute right-4 top-3.5 text-gray-500" />
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

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Category</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="category-all"
                          type="radio"
                          checked={selectedCategory === 'all'}
                          onChange={() => setSelectedCategory('all')}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label htmlFor="category-all" className="ml-2 text-gray-700">
                          All Categories
                        </label>
                      </div>
                      {categories.map((category) => (
                        <div key={category} className="flex items-center">
                          <input
                            id={`category-${category}`}
                            type="radio"
                            checked={selectedCategory === category.toLowerCase()}
                            onChange={() => setSelectedCategory(category.toLowerCase())}
                            className="h-4 w-4 text-purple-600"
                          />
                          <label htmlFor={`category-${category}`} className="ml-2 text-gray-700">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Sort By</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="sort-latest"
                          type="radio"
                          checked={sortBy === 'latest'}
                          onChange={() => setSortBy('latest')}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label htmlFor="sort-latest" className="ml-2 text-gray-700">
                          Latest
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="sort-price-asc"
                          type="radio"
                          checked={sortBy === 'price_asc'}
                          onChange={() => setSortBy('price_asc')}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label htmlFor="sort-price-asc" className="ml-2 text-gray-700">
                          Price: Low to High
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="sort-price-desc"
                          type="radio"
                          checked={sortBy === 'price_desc'}
                          onChange={() => setSortBy('price_desc')}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label htmlFor="sort-price-desc" className="ml-2 text-gray-700">
                          Price: High to Low
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/post-service"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
              >
                <Wrench className="mr-2 h-5 w-5" />
                Offer a Service
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
              </div>
            ) : services.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">
                    {services.length} {services.length === 1 ? 'service' : 'services'} found
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      id={service.id}
                      type="service"
                      title={service.title}
                      description={service.description}
                      price={service.price}
                      currencyCode={service.currency_code}
                      category={service.category}
                      createdAt={service.created_at}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `No services match "${searchQuery}". Try different search terms or filters.`
                    : 'No services are currently available.'}
                </p>
                <Link
                  to="/post-service"
                  className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                >
                  <Wrench className="mr-2 h-5 w-5" />
                  Offer a Service
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};