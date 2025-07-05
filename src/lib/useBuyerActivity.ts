import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface BuyerActivity {
  offers: any[];
  bids: any[];
  interests: any[];
  items: any[];
}

const buyerActivityCache: { [userId: string]: BuyerActivity } = {};

export function useBuyerActivity(userId: string) {
  const [offers, setOffers] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (buyerActivityCache[userId]) {
      setOffers(buyerActivityCache[userId].offers);
      setBids(buyerActivityCache[userId].bids);
      setInterests(buyerActivityCache[userId].interests);
      setItems(buyerActivityCache[userId].items);
      setLoading(false);
      return;
    }
    let isMounted = true;
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const { data: offersData } = await supabase
          .from('offers')
          .select('*')
          .eq('user_id', userId);
        const { data: bidsData } = await supabase
          .from('bids')
          .select('*')
          .eq('user_id', userId);
        const { data: interestsData } = await supabase
          .from('interests')
          .select('*')
          .eq('interested_user_id', userId);
        const itemIds = Array.from(new Set([
          ...(offersData || []).map(o => o.listing_id),
          ...(bidsData || []).map(b => b.listing_id),
          ...(interestsData || []).map(i => i.listing_id),
        ]));
        let itemsData: any[] = [];
        if (itemIds.length > 0) {
          const { data } = await supabase
            .from('items')
            .select('*')
            .in('id', itemIds);
          itemsData = data || [];
        }
        if (isMounted) {
          setOffers(offersData || []);
          setBids(bidsData || []);
          setInterests(interestsData || []);
          setItems(itemsData);
          buyerActivityCache[userId] = {
            offers: offersData || [],
            bids: bidsData || [],
            interests: interestsData || [],
            items: itemsData,
          };
        }
      } catch {
        toast.error('Failed to load buyer activity');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchActivity();
    return () => { isMounted = false; };
  }, [userId]);

  return { offers, bids, interests, items, loading };
}
