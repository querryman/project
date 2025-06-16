import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Search, Filter, Upload } from 'lucide-react';
import { Card } from '../../components/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../types/supabase';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';



type Job = Database['public']['Tables']['jobs']['Row'];

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'latest' | 'salary_asc' | 'salary_desc'>(
    (searchParams.get('sort') as 'latest' | 'salary_asc' | 'salary_desc') || 'latest'
  );
  const { convertPrice, formatPrice, currentCurrency } = useCurrency();

  const categories = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship'
  ];

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('job_type', selectedCategory);
      }

      switch (sortBy) {
        case 'latest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'salary_asc':
          query = query.order('salary', { ascending: true });
          break;
        case 'salary_desc':
          query = query.order('salary', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
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
          <h1 className="text-3xl font-bold text-white mb-4">Find Your Next Opportunity</h1>
          <p className="text-purple-100 mb-8">Browse and apply to the latest job openings</p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or keywords..."
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
                    <h4 className="font-medium text-gray-700 mb-2">Job Type</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="type-all"
                          type="radio"
                          checked={selectedCategory === 'all'}
                          onChange={() => setSelectedCategory('all')}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label htmlFor="type-all" className="ml-2 text-gray-700">
                          All Types
                        </label>
                      </div>
                      {categories.map((type) => (
                        <div key={type} className="flex items-center">
                          <input
                            id={`type-${type}`}
                            type="radio"
                            checked={selectedCategory === type}
                            onChange={() => setSelectedCategory(type)}
                            className="h-4 w-4 text-purple-600"
                          />
                          <label htmlFor={`type-${type}`} className="ml-2 text-gray-700">
                            {type}
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
                          id="sort-salary-asc"
                          type="radio"
                          checked={sortBy === 'salary_asc'}
                          onChange={() => setSortBy('salary_asc')}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label htmlFor="sort-salary-asc" className="ml-2 text-gray-700">
                          Salary: Low to High
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="sort-salary-desc"
                          type="radio"
                          checked={sortBy === 'salary_desc'}
                          onChange={() => setSortBy('salary_desc')}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label htmlFor="sort-salary-desc" className="ml-2 text-gray-700">
                          Salary: High to Low
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/post-job"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Post a Job
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">
                    {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex items-center text-gray-500 text-sm mb-4">
                              {job.company && (
                                <div className="flex items-center mr-4">
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  {job.company}
                                </div>
                              )}
                              {job.location && (
                                <div className="flex items-center">
                                  <Search className="h-4 w-4 mr-1" />
                                  {job.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {job.job_type}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          {job.salary && (
                            <div className="text-right">
                              <div className="text-lg font-semibold text-purple-600">
                                {formatPrice(convertPrice(job.salary, job.currency_code))}
                              </div>
                              {job.currency_code !== currentCurrency?.code && (
                                <p className="text-sm text-gray-500">
                                  (Originally {formatPrice(job.salary, job.currency_code)})
                                </p>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `No jobs match "${searchQuery}". Try different search terms or filters.`
                    : 'No jobs are currently available.'}
                </p>
                <Link
                  to="/post-job"
                  className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Post a Job
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};