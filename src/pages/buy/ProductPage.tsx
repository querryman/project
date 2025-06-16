// --- Offer and Bid Types ---
type Offer = {
  id: string;
  user_id: string;
  amount: number;
  message: string | null;
  created_at: string;
  profiles?: { username: string | null; avatar_url: string | null } | null;
};
type Bid = Offer;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

import { Database } from '../../types/supabase';

type Item = Database['public']['Tables']['items']['Row'] & {
  sale_type?: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export const ProductPage: React.FC = () => {
  // State and Hooks (keep only one set)
  // State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [fetchingOffers, setFetchingOffers] = useState(false);
  const [fetchingBids, setFetchingBids] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasShownInterest, setHasShownInterest] = useState(false);


  // Hooks
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { convertPrice, formatPrice, currentCurrency } = useCurrency();

  useEffect(() => {
    // Fetch offers/bids if needed
    const fetchOffers = async () => {
      if (id && item?.sale_type === 'offer') {
        setFetchingOffers(true);
        try {
          const { data } = await supabase
            .from('offers')
            .select('*, profiles:user_id(username, avatar_url)')
            .eq('listing_id', id)
            .order('created_at', { ascending: false });
          setOffers(data || []);
        } finally {
          setFetchingOffers(false);
        }
      }
    };
    const fetchBids = async () => {
      if (id && item?.sale_type === 'auction') {
        setFetchingBids(true);
        try {
          const { data } = await supabase
            .from('bids')
            .select('*, profiles:user_id(username, avatar_url)')
            .eq('listing_id', id)
            .order('created_at', { ascending: false });
          setBids(data || []);
        } finally {
          setFetchingBids(false);
        }
      }
    };
    fetchOffers();
    fetchBids();

    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select(`
            *,
            profiles:user_id(
              username,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setItem(data);
        if (data?.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }

        // Check if user has already shown interest
        if (user) {
          const { data: interestData } = await supabase
            .from('interests')
            .select('*')
            .eq('listing_id', id)
            .eq('interested_user_id', user.id)
            .eq('listing_type', 'item');

          setHasShownInterest(!!(interestData && interestData.length > 0));
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, item?.sale_type]);

  const handleShowInterest = async () => {
    if (!user) {
      toast.error('Please log in to show interest');
      navigate('/login');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('interests')
        .insert({
          listing_type: 'item',
          listing_id: id,
          interested_user_id: user.id,
          message: message.trim(),
          contact_info: user.email
        });
      if (error) throw error;
      setHasShownInterest(true);
      toast.success('Interest shown successfully! The seller will be notified.');
      setMessage('');
    } catch (error) {
      console.error('Error showing interest:', error);
      toast.error('Failed to show interest. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /*const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please log in to buy this item');
      navigate('/login');
      return;
    }

    try {
      setIsBuying(true);
      const { error } = await supabase
        .from('interests')
        .insert({
          listing_type: 'item',
          listing_id: id,
          interested_user_id: user.id,
          message: 'I want to buy this item immediately!',
          contact_info: user.email
        });

      if (error) throw error;

      toast.success('Purchase request sent! The seller will contact you soon via email.');
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setIsBuying(false);
    }
  };*/

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Item not found</h2>
          <button
            onClick={() => navigate('/buy')}
            className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const convertedPrice = convertPrice(item.price, item.currency_code);
  const displayPrice = formatPrice(convertedPrice);
  const originalPriceDisplay = item.currency_code !== currentCurrency?.code
    ? formatPrice(item.price, item.currency_code)
    : null;

  return (
    <React.Fragment>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/buy')}
            className="mb-8 inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to listings
          </button>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Image Gallery */}
              <div>
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={item.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
                    <ShoppingCart className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                {item.images && item.images.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {item.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className={`relative rounded-md overflow-hidden ${
                          selectedImage === image ? 'ring-2 ring-purple-500' : ''
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${item.title} ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Item Details */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
                <div className="flex items-baseline mb-6">
                  <p className="text-3xl font-bold text-purple-600">{displayPrice}</p>
                  {originalPriceDisplay && (
                    <p className="ml-2 text-sm text-gray-500">
                      (Originally {originalPriceDisplay})
                    </p>
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Description</h3>
                    <p className="mt-2 text-gray-600 whitespace-pre-line">{item.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <p className="mt-1 text-gray-900">{item.category}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                      <p className="mt-1 text-gray-900">{item.condition || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Listed by</h3>
                      <div className="mt-1 flex items-center">
                        {item.profiles?.avatar_url ? (
                          <img
                            src={item.profiles.avatar_url}
                            alt={item.profiles.username || 'Seller'}
                            className="h-8 w-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                        )}
                        <span className="text-gray-900">{item.profiles?.username || 'Anonymous'}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Listed on</h3>
                      <p className="mt-1 text-gray-900">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {user?.id !== item.user_id && (
                    <div className="border-t border-gray-200 pt-6">
                      {/* Sale type logic for action buttons */}
                      {item.sale_type === 'fixed' && (
                        hasShownInterest ? (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <Heart className="h-5 w-5 text-green-400" />
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                  Interest Shown
                                </h3>
                                <p className="mt-2 text-sm text-green-700">
                                  You've already shown interest in this item. The seller will contact you soon.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <React.Fragment>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Interested in this item?
                            </h3>
                            <div className="space-y-4">
                              <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write a message to the seller..."
                                rows={4}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              />
                              <div className="flex space-x-4">
                                <button
                                  onClick={handleShowInterest}
                                  disabled={submitting}
                                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                  {submitting ? 'Sending...' : 'Show Interest'}
                                </button>
                                <button
                                  onClick={() => window.location.href = `mailto:?subject=Check out this item on Tradex&body=I found this interesting item: ${item.title}%0D%0A%0D%0ACheck it out here: ${window.location.href}`}
                                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                  <Heart className="h-5 w-5 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </React.Fragment>
                        )
                      )}
                      {item.sale_type === 'offer' && (
                        <React.Fragment>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Make an Offer</h3>
                          <input
                            type="number"
                            value={offerAmount}
                            onChange={e => setOfferAmount(e.target.value)}
                            placeholder="Your offer"
                            className="w-full rounded-md border-gray-300 mb-2"
                          />
                          <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Message (optional)"
                            rows={2}
                            className="w-full rounded-md border-gray-300 mb-2"
                          />
                          <button
                            onClick={async () => {
                              if (!user) {
                                toast.error('Please log in to make an offer');
                                navigate('/login');
                                return;
                              }
                              if (!offerAmount) {
                                toast.error('Please enter your offer amount');
                                return;
                              }
                              try {
                                setSubmitting(true);
                                const { error } = await supabase
                                  .from('offers')
                                  .insert({
                                    listing_id: id,
                                    user_id: user.id,
                                    amount: parseFloat(offerAmount),
                                    message,
                                  });
                                if (error) throw error;
                                toast.success('Offer sent!');
                                setOfferAmount('');
                                setMessage('');
                                // Refresh offers
                                setFetchingOffers(true);
                                const { data } = await supabase
                                  .from('offers')
                                  .select('*, profiles:user_id(username, avatar_url)')
                                  .eq('listing_id', id)
                                  .order('created_at', { ascending: false });
                                setOffers(data || []);
                                setFetchingOffers(false);
                              } catch (error) {
                                toast.error('Failed to send offer');
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                            disabled={submitting}
                            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50"
                          >
                            {submitting ? 'Sending...' : 'Send Offer'}
                          </button>
                          {/* List of offers */}
                          <div className="mt-6">
                            <h4 className="font-semibold mb-2">Offers</h4>
                            {fetchingOffers ? (
                              <div className="text-gray-500">Loading offers...</div>
                            ) : offers.length === 0 ? (
                              <div className="text-gray-500">No offers yet.</div>
                            ) : (
                              <ul className="divide-y divide-gray-200">
                                {offers.map((offer) => (
                                  <li key={offer.id} className="py-2 flex items-center">
                                    {offer.profiles?.avatar_url ? (
                                      <img src={offer.profiles.avatar_url} alt={offer.profiles.username || 'User'} className="h-8 w-8 rounded-full mr-2" />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center mr-2">
                                        <span className="text-sm font-medium text-purple-800">{(offer.profiles?.username || 'U').charAt(0).toUpperCase()}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">{offer.profiles?.username || 'Anonymous'}</span>
                                      <span className="ml-2 text-purple-700 font-semibold">{formatPrice(offer.amount)}</span>
                                      <span className="ml-2 text-xs text-gray-500">{new Date(offer.created_at).toLocaleDateString()}</span>
                                      {offer.message && <div className="text-xs text-gray-700 mt-1">{offer.message}</div>}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </React.Fragment>
                      )}
                      {item.sale_type === 'auction' && (
                        <React.Fragment>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Place a Bid</h3>
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={e => setBidAmount(e.target.value)}
                            placeholder="Your bid"
                            className="w-full rounded-md border-gray-300 mb-2"
                          />
                          <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Message (optional)"
                            rows={2}
                            className="w-full rounded-md border-gray-300 mb-2"
                          />
                          <button
                            onClick={async () => {
                              if (!user) {
                                toast.error('Please log in to place a bid');
                                navigate('/login');
                                return;
                              }
                              if (!bidAmount) {
                                toast.error('Please enter your bid amount');
                                return;
                              }
                              const bidValue = parseFloat(bidAmount);
                              if (isNaN(bidValue) || bidValue <= 0) {
                                toast.error('Please enter a valid bid amount');
                                return;
                              }
                              // Find the current highest bid
                              const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
                              if (bidValue <= highestBid) {
                                toast.error(`Your bid must be higher than the current highest bid (${formatPrice(highestBid)})`);
                                return;
                              }
                              // Check if user already has a bid
                              const existingBid = bids.find(b => b.user_id === user.id);
                              try {
                                setSubmitting(true);
                                let error;
                                if (existingBid) {
                                  // Update existing bid
                                  ({ error } = await supabase
                                    .from('bids')
                                    .update({ amount: bidValue, message })
                                    .eq('id', existingBid.id)
                                  );
                                } else {
                                  // Insert new bid
                                  ({ error } = await supabase
                                    .from('bids')
                                    .insert({
                                      listing_id: id,
                                      user_id: user.id,
                                      amount: bidValue,
                                      message,
                                    })
                                  );
                                }
                                if (error) throw error;
                                toast.success(existingBid ? 'Bid updated!' : 'Bid placed!');
                                setBidAmount('');
                                setMessage('');
                                // Refresh bids
                                setFetchingBids(true);
                                const { data } = await supabase
                                  .from('bids')
                                  .select('*, profiles:user_id(username, avatar_url)')
                                  .eq('listing_id', id)
                                  .order('created_at', { ascending: false });
                                setBids(data || []);
                                setFetchingBids(false);
                              } catch (error) {
                                toast.error('Failed to place bid');
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                            disabled={submitting}
                            className="bg-yellow-500 text-purple-900 px-6 py-3 rounded-md hover:bg-yellow-400 disabled:opacity-50"
                          >
                            {submitting ? 'Placing...' : 'Place Bid'}
                          </button>
                          {/* List of bids */}
                          <div className="mt-6">
                            <h4 className="font-semibold mb-2">Bids</h4>
                            {fetchingBids ? (
                              <div className="text-gray-500">Loading bids...</div>
                            ) : bids.length === 0 ? (
                              <div className="text-gray-500">No bids yet.</div>
                            ) : (
                              <ul className="divide-y divide-gray-200">
                                {bids.map((bid) => (
                                  <li key={bid.id} className="py-2 flex items-center">
                                    {bid.profiles?.avatar_url ? (
                                      <img src={bid.profiles.avatar_url} alt={bid.profiles.username || 'User'} className="h-8 w-8 rounded-full mr-2" />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center mr-2">
                                        <span className="text-sm font-medium text-purple-800">{(bid.profiles?.username || 'U').charAt(0).toUpperCase()}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">{bid.profiles?.username || 'Anonymous'}</span>
                                      <span className="ml-2 text-purple-700 font-semibold">{formatPrice(bid.amount)}</span>
                                      <span className="ml-2 text-xs text-gray-500">{new Date(bid.created_at).toLocaleDateString()}</span>
                                      {bid.message && <div className="text-xs text-gray-700 mt-1">{bid.message}</div>}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};