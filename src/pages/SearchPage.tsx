import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Briefcase, Wrench, Filter } from 'lucide-react';
import { Card } from '../components/Card';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';
import { Database } from '../types/supabase';
import toast from 'react-hot-toast';

type Item = Database['public']['Tables']['items']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

type ResultType = 'all' | 'items' | 'jobs' | 'services';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<ResultType>('all');
  const { convertPrice } = useCurrency();
  
  const [items, setItems] = useState<Item[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [itemCategory, setItemCategory] = useState(searchParams.get('itemCategory') || 'all');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'all');
  const [serviceCategory, setServiceCategory] = useState(searchParams.get('serviceCategory') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');

  const itemCategories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Collectibles',
    'Automotive',
    'Other'
  ];

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship'
  ];

  const serviceCategories = [
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
    const fetchResults = async () => {
      if (!searchQuery) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch items
        let itemsQuery = supabase
          .from('items')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

        if (itemCategory !== 'all') {
          itemsQuery = itemsQuery.eq('category', itemCategory.toLowerCase());
        }

        const { data: itemsData, error: itemsError } = await itemsQuery;
        if (itemsError) throw itemsError;

        // Sort items with currency conversion
        let sortedItems = itemsData || [];
        if (sortBy !== 'latest') {
          sortedItems.sort((a, b) => {
            const priceA = convertPrice(a.price, a.currency_code);
            const priceB = convertPrice(b.price, b.currency_code);
            return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
          });
        } else {
          sortedItems.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        setItems(sortedItems);

        // Fetch jobs
        let jobsQuery = supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);

        if (jobType !== 'all') {
          jobsQuery = jobsQuery.eq('job_type', jobType);
        }

        const { data: jobsData, error: jobsError } = await jobsQuery;
        if (jobsError) throw jobsError;

        // Sort jobs with currency conversion
        let sortedJobs = jobsData || [];
        if (sortBy !== 'latest') {
          sortedJobs.sort((a, b) => {
            const salaryA = a.salary ? convertPrice(a.salary, a.currency_code) : 0;
            const salaryB = b.salary ? convertPrice(b.salary, b.currency_code) : 0;
            return sortBy === 'price_asc' ? salaryA - salaryB : salaryB - salaryA;
          });
        } else {
          sortedJobs.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        setJobs(sortedJobs);

        // Fetch services
        let servicesQuery = supabase
          .from('services')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

        if (serviceCategory !== 'all') {
          servicesQuery = servicesQuery.eq('category', serviceCategory.toLowerCase());
        }

        const { data: servicesData, error: servicesError } = await servicesQuery;
        if (servicesError) throw servicesError;

        // Sort services with currency conversion
        let sortedServices = servicesData || [];
        if (sortBy !== 'latest') {
          sortedServices.sort((a, b) => {
            const priceA = convertPrice(a.price, a.currency_code);
            const priceB = convertPrice(b.price, b.currency_code);
            return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
          });
        } else {
          sortedServices.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        setServices(sortedServices);
      } catch (error) {
        console.error('Error fetching search results:', error);
        toast.error('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, itemCategory, jobType, serviceCategory, sortBy, convertPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params: Record<string, string> = { q: searchQuery };
    
    if (itemCategory !== 'all') params.itemCategory = itemCategory;
    if (jobType !== 'all') params.jobType = jobType;
    if (serviceCategory !== 'all') params.serviceCategory = serviceCategory;
    if (sortBy !== 'latest') params.sort = sortBy;
    
    setSearchParams(params);
  };

  const getTotalResults = () => {
    return items.length + jobs.length + services.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">Search Results</h1>
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchParams({ q: e.target.value })}
                placeholder="Search items, jobs, services..."
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-900">Filters</h3>
              </div>

              <div className="space-y-6">
                {/* Sort options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      updateSearchParams();
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="latest">Latest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>

                {/* Category filters based on active tab */}
                {(activeTab === 'all' || activeTab === 'items') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Category
                    </label>
                    <select
                      value={itemCategory}
                      onChange={(e) => {
                        setItemCategory(e.target.value);
                        updateSearchParams();
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="all">All Categories</option>
                      {itemCategories.map((category) => (
                        <option key={category} value={category.toLowerCase()}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'jobs') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => {
                        setJobType(e.target.value);
                        updateSearchParams();
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="all">All Types</option>
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'services') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Category
                    </label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => {
                        setServiceCategory(e.target.value);
                        updateSearchParams();
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="all">All Categories</option>
                      {serviceCategories.map((category) => (
                        <option key={category} value={category.toLowerCase()}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-4 text-sm font-medium ${
                      activeTab === 'all'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All Results ({getTotalResults()})
                  </button>
                  <button
                    onClick={() => setActiveTab('items')}
                    className={`px-4 py-4 text-sm font-medium flex items-center ${
                      activeTab === 'items'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Items ({items.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`px-4 py-4 text-sm font-medium flex items-center ${
                      activeTab === 'jobs'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Jobs ({jobs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-4 text-sm font-medium flex items-center ${
                      activeTab === 'services'
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Services ({services.length})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
                  </div>
                ) : !searchQuery ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Start searching</h3>
                    <p className="text-gray-600">Enter a search term to find items, jobs, or services</p>
                  </div>
                ) : getTotalResults() === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">
                      No matches found for "{searchQuery}". Try different keywords or adjust your filters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {(activeTab === 'all' || activeTab === 'items') && items.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Items ({items.length})
                        </h2>
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
                    )}

                    {(activeTab === 'all' || activeTab === 'jobs') && jobs.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Jobs ({jobs.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {jobs.map((job) => (
                            <Card
                              key={job.id}
                              id={job.id}
                              type="job"
                              title={job.title}
                              description={job.description}
                              price={job.salary || undefined}
                              currencyCode={job.currency_code}
                              category={job.job_type}
                              createdAt={job.created_at}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {(activeTab === 'all' || activeTab === 'services') && services.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Services ({services.length})
                        </h2>
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
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};