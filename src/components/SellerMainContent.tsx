import React from 'react';
import { ShoppingCart, Briefcase, Wrench, Heart, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { InterestsList } from './InterestsList';

interface SellerMainContentProps {
  items: any[];
  jobs: any[];
  services: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode: 'listings' | 'interests';
  setViewMode: (mode: 'listings' | 'interests') => void;
  offersByItem: { [itemId: string]: any[] };
  bidsByItem: { [itemId: string]: any[] };
  user: any;
  supabase: any;
  setItems: (items: any[]) => void;
  toast: any;
}

const SellerMainContent: React.FC<SellerMainContentProps> = ({
  items,
  jobs,
  services,
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  offersByItem,
  bidsByItem,
  user,
  supabase,
  setItems,
  toast,
}) => {
  // --- Listings/Interests Tabs ---
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="border-b border-gray-200">
        <div className="flex justify-between p-4">
          <div className="flex space-x-4 items-center">
            <button
              className={`px-4 py-2 font-medium rounded-md ${viewMode === 'listings' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setViewMode('listings')}
            >
              My Listings
            </button>
            <button
              className={`px-4 py-2 font-medium rounded-md ${viewMode === 'interests' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setViewMode('interests')}
            >
              Interested Users
            </button>
          </div>
        </div>
      </div>
      {viewMode === 'listings' ? (
        <div>
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'items' ? 'border-b-2 border-purple-600 text-purple-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('items')}
            >
              <div className="flex items-center justify-center">
                <ShoppingCart className={`h-5 w-5 ${activeTab === 'items' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                Items ({items.length})
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'jobs' ? 'border-b-2 border-purple-600 text-purple-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('jobs')}
            >
              <div className="flex items-center justify-center">
                <Briefcase className={`h-5 w-5 ${activeTab === 'jobs' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                Jobs ({jobs.length})
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'services' ? 'border-b-2 border-purple-600 text-purple-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('services')}
            >
              <div className="flex items-center justify-center">
                <Wrench className={`h-5 w-5 ${activeTab === 'services' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                Services ({services.length})
              </div>
            </button>
          </div>
          <div className="p-4">
            {activeTab === 'items' && (
              items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      id={item.id}
                      type="item"
                      title={item.title}
                      description={item.description || ''}
                      price={item.price}
                      currencyCode={item.currency_code}
                      image={item.images && item.images.length > 0 ? item.images[0] : undefined}
                      category={item.category}
                      createdAt={item.created_at}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No items listed yet</h3>
                  <p className="text-gray-600 mb-4">Start selling by listing your first item</p>
                  <Link
                    to="/sell"
                    className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    List an Item
                  </Link>
                </div>
              )
            )}
            {activeTab === 'jobs' && (
              jobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <Card
                      key={job.id}
                      id={job.id}
                      type="job"
                      title={job.title}
                      description={job.description}
                      price={job.salary || undefined}
                      currencyCode={job.currency_code}
                      category={job.job_type}
                      createdAt={job.created_at}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-4">Start recruiting by posting your first job</p>
                  <Link
                    to="/post-job"
                    className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                  >
                    <Briefcase className="mr-2 h-5 w-5" />
                    Post a Job
                  </Link>
                </div>
              )
            )}
            {activeTab === 'services' && (
              services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      id={service.id}
                      type="service"
                      title={service.title}
                      description={service.description}
                      price={service.price}
                      currencyCode={service.currency_code}
                      category={service.category}
                      createdAt={service.created_at}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No services offered yet</h3>
                  <p className="text-gray-600 mb-4">Start offering your expertise as a service</p>
                  <Link
                    to="/post-service"
                    className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                  >
                    <Wrench className="mr-2 h-5 w-5" />
                    Offer a Service
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'items' ? 'border-b-2 border-purple-600 text-purple-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('items')}
            >
              <div className="flex items-center justify-center">
                <Heart className={`h-5 w-5 ${activeTab === 'items' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                Item Interests
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'jobs' ? 'border-b-2 border-purple-600 text-purple-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('jobs')}
            >
              <div className="flex items-center justify-center">
                <MessageSquare className={`h-5 w-5 ${activeTab === 'jobs' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                Job Applications
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'services' ? 'border-b-2 border-purple-600 text-purple-700 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('services')}
            >
              <div className="flex items-center justify-center">
                <Clock className={`h-5 w-5 ${activeTab === 'services' ? 'text-purple-700' : 'text-gray-500'} mr-2`} />
                Service Requests
              </div>
            </button>
          </div>
          <div className="p-4">
            {activeTab === 'items' && (
              items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <span className="text-sm text-gray-500">
                            Listed: {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {/* Seller action buttons for auction/offer items */}
                      {(item.sale_type === 'auction' || item.sale_type === 'offer') && user?.id === item.user_id && item.status !== 'sold' && (
                        <button
                          className={`m-4 mb-0 px-6 py-2 rounded-md text-white ${item.sale_type === 'auction' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                          onClick={async () => {
                            try {
                              if (item.sale_type === 'auction') {
                                // --- Auction: update bids status ---
                                const bids = bidsByItem[item.id] || [];
                                const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
                                const highestBid = sortedBids[0];
                                if (highestBid) {
                                  // Mark highest as 'payment processing'
                                  const highestRes = await supabase
                                    .from('bids')
                                    .update({ status: 'payment processing' })
                                    .eq('id', highestBid.id);
                                  if (highestRes.error) throw highestRes.error;
                                  // Mark others as 'waiting for final payment'
                                  if (sortedBids.length > 1) {
                                    const otherIds = sortedBids.slice(1).map(b => b.id);
                                    const othersRes = await supabase
                                      .from('bids')
                                      .update({ status: 'waiting for final payment' })
                                      .in('id', otherIds);
                                    if (othersRes.error) throw othersRes.error;
                                  }
                                }
                              } else if (item.sale_type === 'offer') {
                                // --- Offer: update offer status ---
                                const offers = offersByItem[item.id] || [];
                                const sortedOffers = [...offers].sort((a, b) => b.amount - a.amount);
                                const highestOffer = sortedOffers[0];
                                if (highestOffer) {
                                  // Mark as 'accepted'
                                  const highestRes = await supabase
                                    .from('offers')
                                    .update({ status: 'accepted' })
                                    .eq('id', highestOffer.id);
                                  if (highestRes.error) throw highestRes.error;
                                  // Mark others as 'rejected'
                                  if (sortedOffers.length > 1) {
                                    const otherIds = sortedOffers.slice(1).map(o => o.id);
                                    const othersRes = await supabase
                                      .from('offers')
                                      .update({ status: 'rejected' })
                                      .in('id', otherIds);
                                    if (othersRes.error) throw othersRes.error;
                                  }
                                }
                              }
                              // --- Update item status to sold ---
                              const { error: itemError } = await supabase
                                .from('items')
                                .update({ status: 'sold' })
                                .eq('id', item.id);
                              if (itemError) throw itemError;
                              // --- Refresh items ---
                              const { data: updatedItems, error: itemsError } = await supabase
                                .from('items')
                                .select('*')
                                .eq('user_id', user.id);
                              if (itemsError) throw itemsError;
                              setItems(updatedItems);
                              toast.success('Bid/Offer status updated successfully');
                            } catch (error) {
                              console.error('Error updating bid/offer status:', error);
                              toast.error('Failed to update bid/offer status');
                            }
                          }}
                        >
                          {item.sale_type === 'auction' ? 'End Auction & Accept Highest Bid' : 'Accept Highest Offer'}
                        </button>
                      )}
                      {/* Show bids/offers/interests for this item */}
                      <InterestsList
                        listingId={item.id}
                        listingType="item"
                        offers={offersByItem[item.id]}
                        showOffers={!!offersByItem[item.id] && offersByItem[item.id].length > 0}
                        bids={bidsByItem[item.id]}
                        showBids={!!bidsByItem[item.id] && bidsByItem[item.id].length > 0}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No item interests yet</h3>
                  <p className="text-gray-600 mb-4">Users will show interest in your items here</p>
                  <Link
                    to="/"
                    className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Explore Items
                  </Link>
                </div>
              )
            )}
            {activeTab === 'jobs' && (
              jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                          <span className="text-sm text-gray-500">
                            Posted: {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700 mb-4">{job.description}</p>
                        <Link
                          to={`/job/${job.id}`}
                          className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                        >
                          <Briefcase className="mr-2 h-5 w-5" />
                          View Applications
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No job applications yet</h3>
                  <p className="text-gray-600 mb-4">Applicants will show up here once you have job postings</p>
                  <Link
                    to="/post-job"
                    className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                  >
                    <Briefcase className="mr-2 h-5 w-5" />
                    Post a Job
                  </Link>
                </div>
              )
            )}
            {activeTab === 'services' && (
              services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                          <span className="text-sm text-gray-500">
                            Offered: {new Date(service.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700 mb-4">{service.description}</p>
                        <Link
                          to={`/service/${service.id}`}
                          className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                        >
                          <Wrench className="mr-2 h-5 w-5" />
                          View Requests
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No service requests yet</h3>
                  <p className="text-gray-600 mb-4">Service requests will appear here once you start offering services</p>
                  <Link
                    to="/post-service"
                    className="inline-flex items-center bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                  >
                    <Wrench className="mr-2 h-5 w-5" />
                    Offer a Service
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerMainContent;
