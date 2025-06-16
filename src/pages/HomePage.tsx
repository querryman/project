import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, Briefcase, Wrench, TrendingUp, Eye, PlusSquare } from 'lucide-react';
import { Card } from '../components/Card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Database } from '../types/supabase';

type Item = Database['public']['Tables']['items']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [popularJobs, setPopularJobs] = useState<Job[]>([]);
  const [topServices, setTopServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        // Fetch featured items
        const { data: items, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(4);

        if (itemsError) throw itemsError;
        setFeaturedItems(items || []);

        // Fetch popular jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(4);

        if (jobsError) throw jobsError;
        setPopularJobs(jobs || []);

        // Fetch top services
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(4);

        if (servicesError) throw servicesError;
        setTopServices(services || []);
      } catch (error) {
        console.error('Error fetching featured listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                Your Global Marketplace
              </h1>
              <p className="text-lg sm:text-xl mb-6 text-purple-100">
                Buy and sell items, find jobs, or offer services - all in one place.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <Link
                  to="/buy"
                  className="flex items-center justify-center py-3 px-6 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-purple-900 font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop Now
                </Link>
                <Link
                  to="/jobs"
                  className="flex items-center justify-center py-3 px-6 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium border border-purple-500 transition-colors shadow-md hover:shadow-lg"
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Find Jobs
                </Link>
                <Link
                  to="/services"
                  className="flex items-center justify-center py-3 px-6 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium border border-purple-500 transition-colors shadow-md hover:shadow-lg"
                >
                  <Wrench className="mr-2 h-5 w-5" />
                  Services
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-8 right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute -top-8 right-8 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
              
              <div className="relative bg-white p-6 rounded-2xl shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <ShoppingCart className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-bold text-gray-900">Buy & Sell</h3>
                    <p className="text-sm text-gray-600">Shop with confidence in our secure marketplace</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Briefcase className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-bold text-gray-900">Jobs</h3>
                    <p className="text-sm text-gray-600">Find your next opportunity or hire talent</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Wrench className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-bold text-gray-900">Services</h3>
                    <p className="text-sm text-gray-600">Discover services or offer your expertise</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
                    <h3 className="font-bold text-gray-900">Global Reach</h3>
                    <p className="text-sm text-gray-600">Connect with people worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Items</h2>
          <Link 
            to="/buy" 
            className="flex items-center text-purple-700 hover:text-purple-900 transition-colors font-medium"
          >
            View all
            <Eye className="ml-1 h-5 w-5" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
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
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <ShoppingCart className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">Be the first to sell something amazing!</p>
            <Link
              to="/sell"
              className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
            >
              <PlusSquare className="mr-2 h-5 w-5" />
              List an item
            </Link>
          </div>
        )}
      </section>
      
      {/* Latest Jobs Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-purple-50">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Jobs</h2>
          <Link 
            to="/jobs" 
            className="flex items-center text-purple-700 hover:text-purple-900 transition-colors font-medium"
          >
            View all jobs
            <Eye className="ml-1 h-5 w-5" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
          </div>
        ) : popularJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularJobs.map((job) => (
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
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Briefcase className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Be the first to post a job opportunity!</p>
            <Link
              to="/post-job"
              className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
            >
              <PlusSquare className="mr-2 h-5 w-5" />
              Post a job
            </Link>
          </div>
        )}
      </section>
      
      {/* Top Services Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Top Services</h2>
          <Link 
            to="/services" 
            className="flex items-center text-purple-700 hover:text-purple-900 transition-colors font-medium"
          >
            View all services
            <Eye className="ml-1 h-5 w-5" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
          </div>
        ) : topServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topServices.map((service) => (
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
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Wrench className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">Be the first to offer your expertise!</p>
            <Link
              to="/post-service"
              className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
            >
              <PlusSquare className="mr-2 h-5 w-5" />
              Offer a service
            </Link>
          </div>
        )}
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">How Tradex Works</h2>
            <p className="text-purple-200 max-w-2xl mx-auto">Simple steps to start buying, selling, or finding what you need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-purple-800 rounded-lg p-6 text-center relative">
              <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-900 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-purple-200">Sign up for free and set up your profile to get started.</p>
            </div>
            
            <div className="bg-purple-800 rounded-lg p-6 text-center relative">
              <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-900 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse or List</h3>
              <p className="text-purple-200">Explore offerings or create your own listing in minutes.</p>
            </div>
            
            <div className="bg-purple-800 rounded-lg p-6 text-center relative">
              <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-900 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Trade</h3>
              <p className="text-purple-200">Connect with others and complete your transactions securely.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            {user ? (
              <Link 
                to="/profile" 
                className="inline-flex items-center bg-yellow-500 hover:bg-yellow-400 text-purple-900 px-6 py-3 rounded-lg font-medium text-lg transition-colors shadow-md hover:shadow-lg"
              >
                Go to My Profile
              </Link>
            ) : (
              <Link 
                to="/signup" 
                className="inline-flex items-center bg-yellow-500 hover:bg-yellow-400 text-purple-900 px-6 py-3 rounded-lg font-medium text-lg transition-colors shadow-md hover:shadow-lg"
              >
                Get Started Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};