import React from 'react';
import { useBuyerActivity } from '../lib/useBuyerActivity';
import { InterestsList } from './InterestsList';

interface BuyerActivitySectionProps {
  userId: string;
}

const BuyerActivitySection: React.FC<BuyerActivitySectionProps> = ({ userId }) => {
  const { offers, bids, interests, items, loading } = useBuyerActivity(userId);

  if (loading) return <div>Loading...</div>;
  if (items.length === 0) return <div className="text-gray-500">No activity yet.</div>;

  return (
    <div className="space-y-6">
      {items.map(item => {
        const myBid = bids.find(b => b.listing_id === item.id);
        const myOffer = offers.find(o => o.listing_id === item.id);
        const myInterest = interests.find(i => i.listing_id === item.id);
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
