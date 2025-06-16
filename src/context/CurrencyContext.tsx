import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from './AuthContext';

type Currency = Database['public']['Tables']['currencies']['Row'];

interface CurrencyContextType {
  currencies: Currency[];
  currentCurrency: Currency | null;
  loading: boolean;
  error: string | null;
  changeCurrency: (currencyCode: string) => void;
  convertPrice: (price: number, fromCurrency: string, toCurrency?: string) => number;
  formatPrice: (price: number, currencyCode?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);


export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data, error } = await supabase
          .from('currencies')
          .select('*')
          .order('code');

        if (error) throw error;

        setCurrencies(data);

        const defaultCurrency = profile?.preferred_currency
          ? data.find(c => c.code === profile.preferred_currency)
          : data.find(c => c.code === 'USD');

        setCurrentCurrency(defaultCurrency ?? data[0]);

      } catch (err) {
        setError('Failed to load currencies');
        console.error(err);
      }
    };

    fetchCurrencies();
  }, [profile]);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const res = await fetch(
          `https://api.freecurrencyapi.com/v1/latest?apikey=${import.meta.env.VITE_CURRENCY_API_KEY}&base_currency=USD`
        );
        const data = await res.json();

        if (data && data.data) {
          setExchangeRates(data.data);
        } else {
          throw new Error('Invalid exchange rate response');
        }
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
        setError('Failed to fetch real-time exchange rates');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const changeCurrency = (currencyCode: string) => {
    const newCurrency = currencies.find(c => c.code === currencyCode);
    if (newCurrency) {
      setCurrentCurrency(newCurrency);

      if (profile) {
        supabase
          .from('profiles')
          .update({ preferred_currency: currencyCode })
          .eq('id', profile.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating preferred currency:', error);
            }
          });
      }
    }
  };

  const convertPrice = (price: number, fromCurrency: string, toCurrency?: string) => {
    const fromRate = exchangeRates[fromCurrency];
    const toRate = toCurrency
      ? exchangeRates[toCurrency]
      : currentCurrency
      ? exchangeRates[currentCurrency.code]
      : 1;

    if (!fromRate || !toRate) return price;

    const priceInUsd = price / fromRate;
    return priceInUsd * toRate;
  };

  const formatPrice = (price: number, currencyCode?: string) => {
    const currency = currencyCode
      ? currencies.find(c => c.code === currencyCode)
      : currentCurrency;

    if (!currency) return `$${price.toFixed(2)}`;

    return `${currency.symbol}${price.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        currentCurrency,
        loading,
        error,
        changeCurrency,
        convertPrice,
        formatPrice
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
