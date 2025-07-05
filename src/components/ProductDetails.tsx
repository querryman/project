import React from 'react';

interface ProductDetailsProps {
  title: string;
  price: string;
  originalPriceDisplay?: string | null;
  description: string | null;
  category: string;
  condition: string | null;
  sellerName: string;
  sellerAvatar?: string | null;
  listedDate: string;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  title,
  price,
  originalPriceDisplay,
  description,
  category,
  condition,
  sellerName,
  sellerAvatar,
  listedDate,
}) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
    <div className="flex items-baseline mb-6">
      <p className="text-3xl font-bold text-purple-600">{price}</p>
      {originalPriceDisplay && (
        <p className="ml-2 text-sm text-gray-500">(Originally {originalPriceDisplay})</p>
      )}
    </div>
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Description</h3>
        <p className="mt-2 text-gray-600 whitespace-pre-line">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <p className="mt-1 text-gray-900">{category}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Condition</h3>
          <p className="mt-1 text-gray-900">{condition || 'Not specified'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Listed by</h3>
          <div className="mt-1 flex items-center">
            {sellerAvatar ? (
              <img src={sellerAvatar} alt={sellerName} className="h-8 w-8 rounded-full mr-2" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                <span className="text-purple-600 font-bold">{sellerName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <span className="text-gray-900">{sellerName}</span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Listed on</h3>
          <p className="mt-1 text-gray-900">{listedDate}</p>
        </div>
      </div>
    </div>
  </div>
);
