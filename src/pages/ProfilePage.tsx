// Types for offers and bids
// Add status property for payment flow
type Offer = {
  id: string;
  user_id: string;
  amount: number;
  message: string | null;
  created_at: string;
  listing_id: string;
  profiles?: { username: string | null; avatar_url: string | null } | null;
  status?: string;
};
type Bid = Offer;
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Database } from '../types/supabase';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ProfileSidebar from '../components/ProfileSidebar';
import SellerMainContent from '../components/SellerMainContent';
import BuyerActivitySection from '../components/BuyerActivitySection';
import { User } from '@supabase/supabase-js';

type Item = Database['public']['Tables']['items']['Row'] & { sale_type?: string };
type Job = Database['public']['Tables']['jobs']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export const ProfilePage: React.FC = () => {
  // Offers and bids state
  const [offersByItem, setOffersByItem] = useState<{ [itemId: string]: Offer[] }>({});
  const [bidsByItem, setBidsByItem] = useState<{ [itemId: string]: Bid[] }>({});
  const { user, profile: authProfile, loading } = useAuth() as { user: User | null; profile: Profile | null; loading: boolean };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState('items');
  const [viewMode, setViewMode] = useState<'listings' | 'interests'>('listings');
  const [editMode, setEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState<Partial<Profile>>({});
  const [profileTab, setProfileTab] = useState<'seller' | 'buyer'>('seller');

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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Integrated Seller/Buyer tab inside main content */}
            <div className="flex justify-center border-b border-gray-200 items-center gap-2">
              <button
                className={`px-6 py-2 font-medium rounded-tl-md ${profileTab === 'seller' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setProfileTab('seller')}
              >
                Seller
              </button>
              <button
                className={`px-6 py-2 font-medium rounded-tr-md ${profileTab === 'buyer' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setProfileTab('buyer')}
              >
                Buyer
              </button>
              <span className="ml-4 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Select a view</span>
            </div>
            {/* Main tab content */}
            {profileTab === 'seller' ? (
              // Seller content
              <>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Profile Sidebar */}
                  <div className="lg:col-span-1">
                    <ProfileSidebar
                      profile={profile}
                      user={user}
                      editMode={editMode}
                      setEditMode={setEditMode}
                      updatedProfile={updatedProfile}
                      setUpdatedProfile={setUpdatedProfile}
                      handleInputChange={handleInputChange}
                      handleProfileUpdate={handleProfileUpdate}
                    />
                  </div>
                  {/* Main Content */}
                  <div className="lg:col-span-3">
                    <SellerMainContent
                      items={items}
                      jobs={jobs}
                      services={services}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      offersByItem={offersByItem}
                      bidsByItem={bidsByItem}
                      user={user}
                      supabase={supabase}
                      setItems={setItems}
                      toast={toast}
                    />
                  </div>
                </div>
              </>
            ) : (
              // Buyer view: show all products the user has bid, offered, or shown interest in
              <BuyerActivitySection userId={user.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};