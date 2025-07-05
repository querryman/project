import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

interface ProductActionSectionProps {
  item: any;
  user: any;
  hasShownInterest: boolean;
  message: string;
  setMessage: (msg: string) => void;
  submitting: boolean;
  handleShowInterest: () => void;
  offerAmount: string;
  setOfferAmount: (amt: string) => void;
  bidAmount: string;
  setBidAmount: (amt: string) => void;
  offers: any[];
  bids: any[];
  fetchingOffers: boolean;
  formatPrice: (amount: number, currencyCode?: string) => string;
  navigate: (path: string) => void;
  setSubmitting: (val: boolean) => void;
  setOffers: (offers: any[]) => void;
  setBids: (bids: any[]) => void;
  toast: any;
  supabase: any;
}

const ProductActionSection: React.FC<ProductActionSectionProps> = ({
  item,
  user,
  hasShownInterest,
  message,
  setMessage,
  submitting,
  handleShowInterest,
  offerAmount,
  setOfferAmount,
  bidAmount,
  setBidAmount,
  offers,
  bids,
  fetchingOffers,
  formatPrice,
  navigate,
  setSubmitting,
  setOffers,
  setBids,
  toast,
  supabase,
}) => {
  const { convertPrice, currentCurrency } = useCurrency();

  // Handler for making an offer
  const handleOffer = async () => {
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
      // Convert offerAmount from user's currency to USD before saving
      const offerValue = parseFloat(offerAmount);
      const offerInUSD = convertPrice(offerValue, currentCurrency?.code || 'USD', 'USD');
      const { error } = await supabase
        .from('offers')
        .insert({
          listing_id: item.id,
          user_id: user.id,
          amount: offerInUSD,
          message,
        });
      if (error) throw error;
      toast.success('Offer sent!');
      setOfferAmount('');
      setMessage('');
      // Refresh offers
      const { data } = await supabase
        .from('offers')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('listing_id', item.id)
        .order('created_at', { ascending: false });
      setOffers(data || []);
    } catch (error) {
      toast.error('Failed to send offer');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for placing a bid
  const handleBid = async () => {
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
    // Find the current highest bid (convert all to user's currency for comparison)
    const highestBidUSD = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
    const highestBidInUserCurrency = convertPrice(highestBidUSD, 'USD', currentCurrency?.code || 'USD');
    if (bidValue <= highestBidInUserCurrency) {
      toast.error(`Your bid must be higher than the current highest bid (${formatPrice(highestBidInUserCurrency, currentCurrency?.code)})`);
      return;
    }
    // Convert bidValue from user's currency to USD before saving
    const bidInUSD = convertPrice(bidValue, currentCurrency?.code || 'USD', 'USD');
    // Check if user already has a bid
    const existingBid = bids.find(b => b.user_id === user.id);
    try {
      setSubmitting(true);
      let error, updateResult;
      if (existingBid) {
        // Update existing bid
        updateResult = await supabase
          .from('bids')
          .update({ amount: bidInUSD, message })
          .eq('id', existingBid.id);
        error = updateResult.error;
        if (error) {
          console.error('Bid update error:', error, 'Params:', { amount: bidInUSD, message, id: existingBid.id });
          toast.error('Failed to update bid: ' + error.message);
        } else {
          console.log('Bid update success:', updateResult);
        }
      } else {
        // Insert new bid
        updateResult = await supabase
          .from('bids')
          .insert({
            listing_id: item.id,
            user_id: user.id,
            amount: bidInUSD,
            message,
          });
        error = updateResult.error;
        if (error) {
          console.error('Bid insert error:', error, 'Params:', { listing_id: item.id, user_id: user.id, amount: bidInUSD, message });
          toast.error('Failed to place bid: ' + error.message);
        } else {
          console.log('Bid insert success:', updateResult);
        }
      }
      if (error) throw error;
      toast.success(existingBid ? 'Bid updated!' : 'Bid placed!');
      setBidAmount('');
      setMessage('');
      // Refresh bids
      const { data } = await supabase
        .from('bids')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('listing_id', item.id)
        .order('created_at', { ascending: false });
      setBids(data || []);
    } catch (error) {
      toast.error('Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  // Sale type logic for action buttons
  if (item.sale_type === 'fixed') {
    return hasShownInterest ? (
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Interest Shown</h3>
            <p className="mt-2 text-sm text-green-700">
              You've already shown interest in this item. The seller will contact you soon.
            </p>
          </div>
        </div>
      </div>
    ) : (
      <React.Fragment>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interested in this item?</h3>
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
              <span role="img" aria-label="heart">❤️</span>
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }

  if (item.sale_type === 'offer') {
    return (
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
          onClick={handleOffer}
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
    );
  }

  if (item.sale_type === 'auction') {
    // Seller-only: End Auction button if not sold
    const isSeller = user?.id === item.user_id;
    if (isSeller && item.status !== 'sold') {
      return (
        <button
          className="mb-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          onClick={async () => {
            try {
              setSubmitting(true);
              // Find the highest bid
              const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
              const highestBid = sortedBids[0];
              // DEBUG: Log bids and highestBid before updating
              console.log('End Auction Clicked. Bids:', bids, 'Sorted:', sortedBids, 'Highest:', highestBid);
              // Mark highest as 'payment processing', others as 'waiting for final payment'
              let bidUpdateResult, bidUpdateError;
              if (highestBid) {
                bidUpdateResult = await supabase
                  .from('bids')
                  .update({ status: 'payment processing' })
                  .eq('id', highestBid.id);
                bidUpdateError = bidUpdateResult.error;
                if (bidUpdateError) {
                  console.error('Bid status update error (highest):', bidUpdateError, 'Params:', { id: highestBid.id });
                  toast.error('Failed to update highest bid status: ' + bidUpdateError.message);
                } else {
                  console.log('Bid status update success (highest):', bidUpdateResult);
                }
                if (sortedBids.length > 1) {
                  const otherIds = sortedBids.slice(1).map(b => b.id);
                  const otherUpdateResult = await supabase
                    .from('bids')
                    .update({ status: 'waiting for final payment' })
                    .in('id', otherIds);
                  if (otherUpdateResult.error) {
                    console.error('Bid status update error (others):', otherUpdateResult.error, 'Params:', { ids: otherIds });
                    toast.error('Failed to update other bids status: ' + otherUpdateResult.error.message);
                  } else {
                    console.log('Bid status update success (others):', otherUpdateResult);
                  }
                }
              }
              // Update item status to 'sold'
              const { error: itemError, ...itemUpdateResult } = await supabase
                .from('items')
                .update({ status: 'sold' })
                .eq('id', item.id);
              if (itemError) {
                console.error('Item status update error:', itemError, 'Params:', { id: item.id });
                toast.error('Failed to update item status: ' + itemError.message);
                throw itemError;
              } else {
                console.log('Item status update success:', itemUpdateResult);
              }
              toast.success('Auction ended. Highest bid accepted.');
              // Refresh item and bids
              // (Assume parent will refresh state as needed)
            } catch (err) {
              toast.error('Failed to end auction.');
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={submitting}
        >
          {submitting ? 'Ending Auction...' : 'End Auction & Accept Highest Bid'}
        </button>
      );
    }
    // If sold, show message and hide bid UI
    if (item.status === 'sold') {
      return (
        <div className="bg-yellow-100 text-yellow-900 p-4 rounded mb-4 font-semibold">
          Auction ended. Item is sold.
          {bids.some(bid => bid.user_id === user?.id && bid.status === 'payment processing') && (
            <div className="mt-2 bg-green-100 text-green-800 p-2 rounded font-semibold">
              You are the highest bidder! Please proceed with payment.
            </div>
          )}
          {bids.some(bid => bid.user_id === user?.id && bid.status === 'waiting for final payment') && (
            <div className="mt-2 bg-blue-100 text-blue-800 p-2 rounded font-semibold">
              Auction closed. Waiting for payment from the highest bidder.
            </div>
          )}
          {bids.some(bid => bid.user_id === user?.id && bid.status === 'failed') && (
            <div className="mt-2 bg-red-100 text-red-800 p-2 rounded font-semibold">
              Your bid was not successful. Payment window has passed or was marked as failed.
            </div>
          )}
        </div>
      );
    }
    // Bid UI
    return (
      <>
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
          onClick={handleBid}
          disabled={submitting}
          className="bg-yellow-500 text-purple-900 px-6 py-3 rounded-md hover:bg-yellow-400 disabled:opacity-50"
        >
          {submitting ? 'Placing...' : 'Place Bid'}
        </button>
      </>
    );
  }

  if (item.sale_type === 'offer' && user?.id === item.user_id && item.status !== 'sold') {
    return (
      <button
        className="mb-4 bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700"
        onClick={async () => {
          try {
            setSubmitting(true);
            // Find the highest offer
            const sortedOffers = [...offers].sort((a, b) => b.amount - a.amount);
            const highestOffer = sortedOffers[0];
            // Mark highest as 'payment processing', others as 'waiting for final payment'
            let offerUpdateResult, offerUpdateError;
            if (highestOffer) {
              offerUpdateResult = await supabase
                .from('offers')
                .update({ status: 'payment processing' })
                .eq('id', highestOffer.id);
              offerUpdateError = offerUpdateResult.error;
              if (offerUpdateError) {
                console.error('Offer status update error (highest):', offerUpdateError, 'Params:', { id: highestOffer.id });
                toast.error('Failed to update highest offer status: ' + offerUpdateError.message);
              } else {
                console.log('Offer status update success (highest):', offerUpdateResult);
              }
              if (sortedOffers.length > 1) {
                const otherIds = sortedOffers.slice(1).map(o => o.id);
                const otherUpdateResult = await supabase
                  .from('offers')
                  .update({ status: 'waiting for final payment' })
                  .in('id', otherIds);
                if (otherUpdateResult.error) {
                  console.error('Offer status update error (others):', otherUpdateResult.error, 'Params:', { ids: otherIds });
                  toast.error('Failed to update other offers status: ' + otherUpdateResult.error.message);
                } else {
                  console.log('Offer status update success (others):', otherUpdateResult);
                }
              }
            }
            // Update item status to 'sold'
            const { error: itemError, ...itemUpdateResult } = await supabase
              .from('items')
              .update({ status: 'sold' })
              .eq('id', item.id);
            if (itemError) {
              console.error('Item status update error:', itemError, 'Params:', { id: item.id });
              toast.error('Failed to update item status: ' + itemError.message);
              throw itemError;
            } else {
              console.log('Item status update success:', itemUpdateResult);
            }
            toast.success('Offer accepted. Highest offer is now payment processing.');
            // Refresh item and offers (assume parent will refresh state as needed)
          } catch (err) {
            toast.error('Failed to accept offer.');
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={submitting}
      >
        {submitting ? 'Accepting...' : 'Accept Highest Offer'}
      </button>
    );
  }

  return null;
};

export default ProductActionSection;
