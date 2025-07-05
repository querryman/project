import React from 'react';

interface AuctionStatusBannerProps {
  userId: string | null | undefined;
  bids: Array<{ user_id: string; status?: string }>;
  itemStatus: string;
}

export const AuctionStatusBanner: React.FC<AuctionStatusBannerProps> = ({ userId, bids, itemStatus }) => {
  if (itemStatus !== 'sold') return null;
  const myBid = bids.find(bid => bid.user_id === userId);
  if (!myBid) return null;
  if (myBid.status === 'payment processing') {
    return <div className="mt-2 bg-green-100 text-green-800 p-2 rounded font-semibold">You are the highest bidder! Please proceed with payment.</div>;
  }
  if (myBid.status === 'waiting for final payment') {
    return <div className="mt-2 bg-blue-100 text-blue-800 p-2 rounded font-semibold">Auction closed. Waiting for payment from the highest bidder.</div>;
  }
  if (myBid.status === 'failed') {
    return <div className="mt-2 bg-red-100 text-red-800 p-2 rounded font-semibold">Your bid was not successful. Payment window has passed or was marked as failed.</div>;
  }
  return null;
};
