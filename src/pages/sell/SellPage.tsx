import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Upload, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const SellPage: React.FC = () => {
  const { user } = useAuth();
  const { currencies, currentCurrency } = useCurrency();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency?.code || 'USD');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('new');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saleType, setSaleType] = useState<'fixed' | 'offer' | 'auction'>('fixed');

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Collectibles',
    'Automotive',
    'Other'
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('item-images')
        .upload(filePath, image);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to list an item');
      navigate('/login');
      return;
    }

    if (!title || !description || !price || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Upload images first
      const imageUrls = images.length > 0 ? await uploadImages() : [];

      // Create the item listing
      const { error } = await supabase
        .from('items')
        .insert({
          title,
          description,
          price: parseFloat(price),
          currency_code: selectedCurrency,
          category,
          condition,
          images: imageUrls,
          user_id: user.id,
          status: 'active',
          sale_type: saleType
        });

      if (error) throw error;

      toast.success('Item listed successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    return currency?.symbol || '$';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">List an Item for Sale</h1>
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sale Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Sale Type*</label>
                <div className="mt-2 flex space-x-4">
                  <label>
                    <input
                      type="radio"
                      name="saleType"
                      value="fixed"
                      checked={saleType === 'fixed'}
                      onChange={() => setSaleType('fixed')}
                      className="mr-2"
                    />
                    Fixed Price
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="saleType"
                      value="offer"
                      checked={saleType === 'offer'}
                      onChange={() => setSaleType('offer')}
                      className="mr-2"
                    />
                    Counter Offer
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="saleType"
                      value="auction"
                      checked={saleType === 'auction'}
                      onChange={() => setSaleType('auction')}
                      className="mr-2"
                    />
                    Auction
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title*
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter a descriptive title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description*
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Describe your item in detail"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price* ({getSelectedCurrencySymbol()})
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency*
                  </label>
                  <select
                    id="currency"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category*
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                  Condition
                </label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {conditions.map((cond) => (
                    <label
                      key={cond.value}
                      className={`
                        flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium
                        ${condition === cond.value
                          ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                          : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                        }
                        cursor-pointer transition-colors
                      `}
                    >
                      <input
                        type="radio"
                        name="condition"
                        value={cond.value}
                        checked={condition === cond.value}
                        onChange={(e) => setCondition(e.target.value)}
                        className="sr-only"
                      />
                      {cond.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Images
                </label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                      >
                        <span>Upload images</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>
                </div>

                {imageUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Creating listing...' : 'List Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};