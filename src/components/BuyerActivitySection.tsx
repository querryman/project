import React from 'react';
import { useBuyerActivity } from '../lib/useBuyerActivity';
import { InterestsList } from './InterestsList';
import { supabase } from '../lib/supabase';

interface BuyerActivitySectionProps {
  userId: string;
}

const BuyerActivitySection: React.FC<BuyerActivitySectionProps> = ({ userId }) => {
  const { offers, bids, interests, items, loading } = useBuyerActivity(userId);

  if (loading) return <div>Loading...</div>;
  if (items.length === 0) return <div className="text-gray-500">No activity yet.</div>;

  return (
    <div className="space-y-6">
      {items.filter(item => item.status !== 'closed').map(item => {
        const myBid = bids.find(b => b.listing_id === item.id);
        const myOffer = offers.find(o => o.listing_id === item.id);
        const myInterest = interests.find(i => i.listing_id === item.id);
        // Helper: handle complete payment
        const handleCompletePayment = async (type: 'bid' | 'offer', id: string) => {
          try {
            if (type === 'bid') {
              await supabase.from('bids').update({ status: 'completed' }).eq('id', id);
            } else {
              await supabase.from('offers').update({ status: 'completed' }).eq('id', id);
            }
            await supabase.from('items').update({ status: 'closed' }).eq('id', item.id);
            window.location.reload();
          } catch (e) {
            alert('Failed to complete payment');
          }
        };
        // Helper: handle cancel bid/offer
        const handleCancel = async (type: 'bid' | 'offer', id: string) => {
          try {
            if (type === 'bid') {
              await supabase.from('bids').update({ status: 'failed' }).eq('id', id);
              // Promote next highest bid
              const { data: allBids } = await supabase.from('bids').select('*').eq('listing_id', item.id).order('amount', { ascending: false });
              const next = (allBids || []).find((b: any) => b.status !== 'failed');
              if (next) await supabase.from('bids').update({ status: 'payment processing' }).eq('id', next.id);
            } else {
              await supabase.from('offers').update({ status: 'failed' }).eq('id', id);
              // Promote next highest offer
              const { data: allOffers } = await supabase.from('offers').select('*').eq('listing_id', item.id).order('amount', { ascending: false });
              const next = (allOffers || []).find((o: any) => o.status !== 'failed');
              if (next) await supabase.from('offers').update({ status: 'payment processing' }).eq('id', next.id);
            }
            window.location.reload();
          } catch (e) {
            alert('Failed to cancel');
          }
        };

        return (
          <div key={item.id} className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <a href={`/buy/${item.id}`} className="text-lg font-medium text-purple-700 hover:underline">
                {item.title}
              </a>
              <span className="text-sm text-gray-500">Listed: {new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <InterestsList
              listingId={item.id}
              listingType="item"
              offers={myOffer ? [myOffer] : undefined}
              showOffers={!!myOffer}
              bids={myBid ? [myBid] : undefined}
              showBids={!!myBid}
            />
            {/* Show bid/offer status and payment button for buyer */}
            {myBid && myBid.status && (
              <div className="p-4">
                <span className="font-semibold">Bid Status:</span> {myBid.status}
                {myBid.status === 'payment processing' && (
                  <>
                    <button className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => handleCompletePayment('bid', myBid.id)}>Complete Payment</button>
                    <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={() => handleCancel('bid', myBid.id)}>Cancel Bid</button>
                  </>
                )}
              </div>
            )}
            {myOffer && myOffer.status && (
              <div className="p-4">
                <span className="font-semibold">Offer Status:</span> {myOffer.status}
                {myOffer.status === 'payment processing' && (
                  <>
                    <button className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => handleCompletePayment('offer', myOffer.id)}>Complete Payment</button>
                    <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={() => handleCancel('offer', myOffer.id)}>Cancel Offer</button>
                  </>
                )}
              </div>
            )}
            {myInterest && !myBid && !myOffer && (
              <div className="p-4 text-green-700">Interest Shown</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BuyerActivitySection;
