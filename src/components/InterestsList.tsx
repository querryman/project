import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Offer, Bid } from '../types/supabase';
import { Database } from '../types/supabase';
import { useCurrency } from '../context/CurrencyContext';

type Interest = Database['public']['Tables']['interests']['Row'] & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

type Resume = Database['public']['Tables']['resumes']['Row'] & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

interface InterestsListProps {
  listingId: string;
  listingType: 'item' | 'job' | 'service';
  offers?: Offer[];
  bids?: Bid[];
  showOffers?: boolean;
  showBids?: boolean;
}

export const InterestsList: React.FC<InterestsListProps> = ({ listingId, listingType, offers, bids, showOffers, showBids }) => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, currentCurrency } = useCurrency();

  useEffect(() => {
    if (offers || bids) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch interests
        const { data: interestsData, error: interestsError } = await supabase
          .from('interests')
          .select(`*, profiles:interested_user_id(username, avatar_url)`)
          .eq('listing_id', listingId)
          .eq('listing_type', listingType);
        if (interestsError) throw interestsError;
        setInterests(interestsData || []);
        // If this is a job listing, also fetch resumes
        if (listingType === 'job') {
          const { data: resumesData, error: resumesError } = await supabase
            .from('resumes')
            .select(`*, profiles:user_id(username, avatar_url)`)
            .eq('job_id', listingId);
          if (resumesError) throw resumesError;
          setResumes(resumesData || []);
        }
      } catch (error) {
        console.error('Error fetching interests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [listingId, listingType, offers, bids]);

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Loading interested users...</div>;
  }

  // If offers or bids are provided, render them instead of interests
  if (showOffers && offers) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Offers ({offers.length})</h3>
        </div>
        {offers.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No offers yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {offers.map((offer) => (
              <li key={offer.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {offer.profiles?.avatar_url ? (
                      <img src={offer.profiles.avatar_url} alt={offer.profiles.username || 'User'} className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-purple-800">{(offer.profiles?.username || 'U').charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{offer.profiles?.username || 'Anonymous User'}</p>
                    <p className="text-sm text-purple-700 font-semibold">{formatPrice(convertPrice(offer.amount, 'USD', currentCurrency?.code), currentCurrency?.code)}</p>
                    <p className="text-sm text-gray-500">Offered on {new Date(offer.created_at).toLocaleDateString()}</p>
                    {offer.message && <p className="mt-2 text-sm text-gray-800 bg-purple-50 p-3 rounded">{offer.message}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  if (showBids && bids) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Bids ({bids.length})</h3>
        </div>
        {bids.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No bids yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bids.map((bid) => (
              <li key={bid.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {bid.profiles?.avatar_url ? (
                      <img src={bid.profiles.avatar_url} alt={bid.profiles.username || 'User'} className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-purple-800">{(bid.profiles?.username || 'U').charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{bid.profiles?.username || 'Anonymous User'}</p>
                    <p className="text-sm text-purple-700 font-semibold">{formatPrice(convertPrice(bid.amount, 'USD', currentCurrency?.code), currentCurrency?.code)}</p>
                    <p className="text-sm text-gray-500">Bid on {new Date(bid.created_at).toLocaleDateString()}</p>
                    {bid.message && <p className="mt-2 text-sm text-gray-800 bg-purple-50 p-3 rounded">{bid.message}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (interests.length === 0 && resumes.length === 0) {
    return <div className="py-4 text-center text-gray-500">No one has shown interest yet.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {listingType === 'job' ? 'Applications' : 'Interested Users'} ({interests.length + resumes.length})
        </h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {/* Show resumes first for job listings */}
        {listingType === 'job' && resumes.map((resume) => (
          <li key={resume.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {resume.profiles?.avatar_url ? (
                  <img
                    src={resume.profiles.avatar_url}
                    alt={resume.profiles.username || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                    <span className="text-lg font-medium text-purple-800">
                      {(resume.profiles?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-gray-900">
                  {resume.profiles?.username || 'Anonymous User'}
                </p>
                <p className="text-sm text-gray-500">
                  Applied on {new Date(resume.created_at).toLocaleDateString()}
                </p>
                {resume.cover_letter && (
                  <p className="mt-2 text-sm text-gray-800 bg-purple-50 p-3 rounded">
                    {resume.cover_letter}
                  </p>
                )}
                <div className="mt-2">
                  <a
                    href={resume.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}

        {/* Show regular interests */}
        {interests.map((interest) => (
          <li key={interest.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {interest.profiles?.avatar_url ? (
                  <img
                    src={interest.profiles.avatar_url}
                    alt={interest.profiles.username || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                    <span className="text-lg font-medium text-purple-800">
                      {(interest.profiles?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {interest.profiles?.username || 'Anonymous User'}
                </p>
                <p className="text-sm text-gray-500">
                  Interested since {new Date(interest.created_at).toLocaleDateString()}
                </p>
                {interest.message && (
                  <p className="mt-2 text-sm text-gray-800 bg-purple-50 p-3 rounded">
                    {interest.message}
                  </p>
                )}
                {interest.contact_info && (
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Contact:</span> {interest.contact_info}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

function convertPrice(amount: number, fromCurrency: string, toCurrency: string | undefined): number {
  // For now, let's assume the conversion rate from USD to the target currency is 1:1
  // In a real application, you would fetch the current conversion rate from an API
  if (toCurrency === 'USD' || !toCurrency) return amount;
  const conversionRate = 1; // Placeholder conversion rate
  return amount * conversionRate;
}