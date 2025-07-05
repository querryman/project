import React from 'react';

interface ProductOffersListProps {
  offers: any[];
  formatPrice: (n: number, code?: string) => string;
}

export const ProductOffersList: React.FC<ProductOffersListProps> = ({ offers, formatPrice }) => (
  <div className="mt-6">
    <h4 className="font-semibold mb-2">Offers</h4>
    {offers.length === 0 ? (
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
);
