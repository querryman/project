// Types for offers and bids
type Offer = {
  id: string;
  user_id: string;
  amount: number;
  message: string | null;
  created_at: string;
  listing_id: string;
  profiles?: { username: string | null; avatar_url: string | null } | null;
};
type Bid = Offer;
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShoppingCart, Briefcase, Wrench, User as UserIcon, Edit, Clock, Heart, MessageSquare } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { InterestsList } from '../components/InterestsList';
import { Card } from '../components/Card';
import { Database } from '../types/supabase';
import toast from 'react-hot-toast';

type Item = Database['public']['Tables']['items']['Row'] & { sale_type?: string };
type Job = Database['public']['Tables']['jobs']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export const ProfilePage: React.FC = () => {
  // Offers and bids state
  const [offersByItem, setOffersByItem] = useState<{ [itemId: string]: Offer[] }>({});
  const [bidsByItem, setBidsByItem] = useState<{ [itemId: string]: Bid[] }>({});
  const { user, profile: authProfile } = useAuth() as { user: SupabaseUser | null; profile: Profile | null };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');
  const [viewMode, setViewMode] = useState<'listings' | 'interests'>('listings');
  const [editMode, setEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (!user) return;
    // Fetch offers and bids for user's items
    const fetchOffersAndBids = async () => {
      if (items.length === 0) return;
      // Get all item ids by sale type
      const offerItemIds = items.filter(i => i.sale_type === 'offer').map(i => i.id);
      const auctionItemIds = items.filter(i => i.sale_type === 'auction').map(i => i.id);
      // Fetch offers
      if (offerItemIds.length > 0) {
        const { data: offersData } = await supabase
          .from('offers')
          .select('*, profiles:user_id(username, avatar_url)')
          .in('listing_id', offerItemIds);
        const grouped: { [itemId: string]: Offer[] } = {};
        (offersData || []).forEach((offer: Offer) => {
          if (!grouped[offer.listing_id]) grouped[offer.listing_id] = [];
          grouped[offer.listing_id].push(offer);
        });
        setOffersByItem(grouped);
      }
      // Fetch bids
      if (auctionItemIds.length > 0) {
        const { data: bidsData } = await supabase
          .from('bids')
          .select('*, profiles:user_id(username, avatar_url)')
          .in('listing_id', auctionItemIds);
        const grouped: { [itemId: string]: Bid[] } = {};
        (bidsData || []).forEach((bid: Bid) => {
          if (!grouped[bid.listing_id]) grouped[bid.listing_id] = [];
          grouped[bid.listing_id].push(bid);
        });
        setBidsByItem(grouped);
      }
    };
    fetchOffersAndBids();
    // Only run when items change
  }, [items, user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        // Fetch profile data if not already available
        if (!authProfile) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profileError) throw profileError;
          setProfile(profileData);
          setUpdatedProfile(profileData);
        } else {
          setProfile(authProfile);
          setUpdatedProfile(authProfile);
        }
        // Fetch user's items
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (itemsError) throw itemsError;
        setItems(itemsData || []);
        // Fetch user's jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (jobsError) throw jobsError;
        setJobs(jobsData || []);
        // Fetch user's services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authProfile]);



  const handleProfileUpdate = async () => {
    if (!user || !updatedProfile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile({ ...profile, ...updatedProfile } as Profile);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-8 text-center">
                  <div className="relative inline-block">
                    <div className="h-24 w-24 rounded-full bg-purple-200 flex items-center justify-center mx-auto ring-4 ring-purple-100">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username || 'Profile'}
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-12 w-12 text-purple-700" />
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mt-4">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-purple-200">
                    @{profile?.username || 'username'}
                  </p>
                </div>
                
                {!editMode ? (
                  <div className="p-6">
                    <div className="mb-6 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Profile Info</h3>
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center text-sm text-purple-600 hover:text-purple-800"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800">{user.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-800">{profile?.location || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Bio</p>
                        <p className="text-gray-800">{profile?.bio || 'No bio provided'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        {profile?.website ? (
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          <p className="text-gray-800">Not specified</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Preferred Currency</p>
                        <p className="text-gray-800">{profile?.preferred_currency || 'USD'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="text-gray-800">{new Date(profile?.created_at || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="mb-6 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
                      <button
                        onClick={() => setEditMode(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="username" className="block text-sm text-gray-700 font-medium mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={updatedProfile?.username || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="full_name" className="block text-sm text-gray-700 font-medium mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={updatedProfile?.full_name || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="location" className="block text-sm text-gray-700 font-medium mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={updatedProfile?.location || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="bio" className="block text-sm text-gray-700 font-medium mb-1">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          value={updatedProfile?.bio || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="website" className="block text-sm text-gray-700 font-medium mb-1">
                          Website
                        </label>
                        <input
                          type="url"
                          id="website"
                          name="website"
                          value={updatedProfile?.website || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <button
                          onClick={handleProfileUpdate}
                          className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/sell"
                    className="flex items-center text-purple-700 hover:text-purple-900 font-medium"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    List an Item
                  </Link>
                  <Link
                    to="/post-job"
                    className="flex items-center text-purple-700 hover:text-purple-900 font-medium"
                  >
                    <Briefcase className="h-5 w-5 mr-2" />
                    Post a Job
                  </Link>
                  <Link
                    to="/post-service"
                    className="flex items-center text-purple-700 hover:text-purple-900 font-medium"
                  >
                    <Wrench className="h-5 w-5 mr-2" />
                    Offer a Service
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="border-b border-gray-200">
                  <div className="flex justify-between p-4">
                    <div className="flex space-x-4 items-center">
                      <button
                        className={`px-4 py-2 font-medium rounded-md ${
                          viewMode === 'listings'
                            ? 'bg-purple-100 text-purple-800'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setViewMode('listings')}
                      >
                        My Listings
                      </button>
                      <button
                        className={`px-4 py-2 font-medium rounded-md ${
                          viewMode === 'interests'
                            ? 'bg-purple-100 text-purple-800'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setViewMode('interests')}
                      >
                        Interested Users
                      </button>
                    </div>
                  </div>
                </div>
                
                {viewMode === 'listings' ? (
                  /* My Listings View */
                  <div>
                    <div className="flex border-b border-gray-200">
                      <button
                        className={`flex-1 py-3 px-4 text-center ${
                          activeTab === 'items'
                            ? 'border-b-2 border-purple-600 text-purple-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveTab('items')}
                      >
                        <div className="flex items-center justify-center">
                          <ShoppingCart className={`h-5 w-5 ${activeTab === 'items' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                          Items ({items.length})
                        </div>
                      </button>
                      <button
                        className={`flex-1 py-3 px-4 text-center ${
                          activeTab === 'jobs'
                            ? 'border-b-2 border-purple-600 text-purple-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveTab('jobs')}
                      >
                        <div className="flex items-center justify-center">
                          <Briefcase className={`h-5 w-5 ${activeTab === 'jobs' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                          Jobs ({jobs.length})
                        </div>
                      </button>
                      <button
                        className={`flex-1 py-3 px-4 text-center ${
                          activeTab === 'services'
                            ? 'border-b-2 border-purple-600 text-purple-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveTab('services')}
                      >
                        <div className="flex items-center justify-center">
                          <Wrench className={`h-5 w-5 ${activeTab === 'services' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                          Services ({services.length})
                        </div>
                      </button>
                    </div>
                    
                    <div className="p-4">
                      {activeTab === 'items' && (
                        items.length > 0 ? (
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
                        ) : (
                          <div className="text-center py-8">
                            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No items listed yet</h3>
                            <p className="text-gray-600 mb-4">Start selling by listing your first item</p>
                            <Link
                              to="/sell"
                              className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                            >
                              <ShoppingCart className="mr-2 h-5 w-5" />
                              List an Item
                            </Link>
                          </div>
                        )
                      )}
                      
                      {activeTab === 'jobs' && (
                        jobs.length > 0 ? (
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
                        ) : (
                          <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                            <p className="text-gray-600 mb-4">Start recruiting by posting your first job</p>
                            <Link
                              to="/post-job"
                              className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                            >
                              <Briefcase className="mr-2 h-5 w-5" />
                              Post a Job
                            </Link>
                          </div>
                        )
                      )}
                      
                      {activeTab === 'services' && (
                        services.length > 0 ? (
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
                        ) : (
                          <div className="text-center py-8">
                            <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No services offered yet</h3>
                            <p className="text-gray-600 mb-4">Start offering your expertise as a service</p>
                            <Link
                              to="/post-service"
                              className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                            >
                              <Wrench className="mr-2 h-5 w-5" />
                              Offer a Service
                            </Link>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  /* Interested Users View */
                  <div>
                    <div className="flex border-b border-gray-200">
                      <button
                        className={`flex-1 py-3 px-4 text-center ${
                          activeTab === 'items'
                            ? 'border-b-2 border-purple-600 text-purple-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveTab('items')}
                      >
                        <div className="flex items-center justify-center">
                          <Heart className={`h-5 w-5 ${activeTab === 'items' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                          Item Interests
                        </div>
                      </button>
                      <button
                        className={`flex-1 py-3 px-4 text-center ${
                          activeTab === 'jobs'
                            ? 'border-b-2 border-purple-600 text-purple-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveTab('jobs')}
                      >
                        <div className="flex items-center justify-center">
                          <MessageSquare className={`h-5 w-5 ${activeTab === 'jobs' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                          Job Applications
                        </div>
                      </button>
                      <button
                        className={`flex-1 py-3 px-4 text-center ${
                          activeTab === 'services'
                            ? 'border-b-2 border-purple-600 text-purple-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveTab('services')}
                      >
                        <div className="flex items-center justify-center">
                          <Clock className={`h-5 w-5 ${activeTab === 'services' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                          Service Requests
                        </div>
                      </button>
                    </div>
                    
                    <div className="p-4">
                      {activeTab === 'items' && (
                        items.length > 0 ? (
                          <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                                    <span className="text-sm text-gray-500">
                                      Listed: {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {/* End Auction button for seller if not sold */}
                                {item.sale_type === 'auction' && user?.id === item.user_id && item.status !== 'sold' && (
                                  <button
                                    className="m-4 mb-0 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                                    onClick={async () => {
                                      try {
                                        // Update item status to 'sold'
                                        const { error } = await supabase
                                          .from('items')
                                          .update({ status: 'sold' })
                                          .eq('id', item.id);
                                        if (error) throw error;
                                        toast.success('Auction ended. Highest bid accepted.');
                                        // Refresh items
                                        const { data: itemsData, error: itemsError } = await supabase
                                          .from('items')
                                          .select('*')
                                          .eq('user_id', user.id)
                                          .order('created_at', { ascending: false });
                                        if (!itemsError) setItems(itemsData || []);
                                      } catch (err) {
                                        toast.error('Failed to end auction.');
                                      }
                                    }}
                                  >
                                    End Auction & Accept Highest Bid
                                  </button>
                                )}
                                <InterestsList
                                  listingId={item.id}
                                  listingType="item"
                                  offers={item.sale_type === 'offer' ? offersByItem[item.id] : undefined}
                                  showOffers={item.sale_type === 'offer'}
                                  bids={item.sale_type === 'auction' ? bidsByItem[item.id] : undefined}
                                  showBids={item.sale_type === 'auction'}
                                />
                                </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No items listed yet</h3>
                            <p className="text-gray-600">List items to see who's interested</p>
                          </div>
                        )
                      )}
                      
                      {activeTab === 'jobs' && (
                        jobs.length > 0 ? (
                          <div className="space-y-4">
                            {jobs.map((job) => (
                              <div key={job.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                                    <span className="text-sm text-gray-500">
                                      Posted: {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{job.job_type} at {job.location || 'Remote'}</p>
                                </div>
                                <InterestsList listingId={job.id} listingType="job" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                            <p className="text-gray-600">Post jobs to see applications</p>
                          </div>
                        )
                      )}
                      
                      {activeTab === 'services' && (
                        services.length > 0 ? (
                          <div className="space-y-4">
                            {services.map((service) => (
                              <div key={service.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                                    <span className="text-sm text-gray-500">
                                      Listed: {new Date(service.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{service.category}</p>
                                </div>
                                <InterestsList listingId={service.id} listingType="service" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No services offered yet</h3>
                            <p className="text-gray-600">Offer services to see requests</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};