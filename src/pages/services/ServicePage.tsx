import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeft, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Database } from '../../types/supabase';

type Service = Database['public']['Tables']['services']['Row'] & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export const ServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { convertPrice, formatPrice, currentCurrency } = useCurrency();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasShownInterest, setHasShownInterest] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
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
        setService(data);

        // Check if user has already shown interest
        if (user) {
          const { data: interestData } = await supabase
            .from('interests')
            .select('*')
            .eq('listing_id', id)
            .eq('interested_user_id', user.id)
            .eq('listing_type', 'service');

          setHasShownInterest(interestData && interestData.length > 0);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, user]);

  const handleShowInterest = async () => {
    if (!user) {
      toast.error('Please log in to show interest');
      navigate('/login');
      return;
    }

    if (!message) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('interests')
        .insert({
          listing_type: 'service',
          listing_id: id,
          interested_user_id: user.id,
          message,
          contact_info: user.email
        });

      if (error) throw error;

      setHasShownInterest(true);
      toast.success('Interest shown successfully! The service provider will contact you.');
      setMessage('');
    } catch (error) {
      console.error('Error showing interest:', error);
      toast.error('Failed to show interest. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Service not found</h2>
          <button
            onClick={() => navigate('/services')}
            className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to services
          </button>
        </div>
      </div>
    );
  }

  const convertedPrice = convertPrice(service.price, service.currency_code);
  const displayPrice = formatPrice(convertedPrice);
  const originalPriceDisplay = service.currency_code !== currentCurrency?.code
    ? formatPrice(service.price, service.currency_code)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/services')}
          className="mb-8 inline-flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to services
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {service.category}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{new Date(service.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{displayPrice}</p>
                {originalPriceDisplay && (
                  <p className="text-sm text-gray-500">
                    (Originally {originalPriceDisplay})
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-600 whitespace-pre-line">{service.description}</p>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    {service.profiles?.avatar_url ? (
                      <img
                        src={service.profiles.avatar_url}
                        alt={service.profiles.username || 'Service Provider'}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {service.profiles?.username || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-500">Service Provider</p>
                    </div>
                  </div>

                  {user?.id !== service.user_id && (
                    <div>
                      {hasShownInterest ? (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <MessageSquare className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">
                                Interest Shown
                              </h3>
                              <p className="mt-2 text-sm text-green-700">
                                You've already shown interest in this service. The provider will contact you soon.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write a message to the service provider..."
                            rows={4}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 mb-4"
                          />
                          <button
                            onClick={handleShowInterest}
                            disabled={submitting}
                            className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            {submitting ? 'Sending...' : 'Contact Service Provider'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};