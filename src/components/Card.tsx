import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Briefcase, Wrench } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface CardProps {
  id: string;
  type: 'item' | 'job' | 'service';
  title: string;
  description: string;
  price?: number;
  currencyCode?: string;
  image?: string;
  category: string;
  createdAt: string;
}

export const Card: React.FC<CardProps> = ({
  id,
  type,
  title,
  description,
  price,
  currencyCode = 'USD',
  image,
  category,
  createdAt,
}) => {
  const { convertPrice, formatPrice, currentCurrency } = useCurrency();
  
  const formattedDate = new Date(createdAt).toLocaleDateString();
  
  const getIcon = () => {
    switch (type) {
      case 'item':
        return <ShoppingCart className="text-purple-600" />;
      case 'job':
        return <Briefcase className="text-purple-600" />;
      case 'service':
        return <Wrench className="text-purple-600" />;
      default:
        return null;
    }
  };
  
  const getPath = () => {
    switch (type) {
      case 'item':
        return `/buy/${id}`;
      case 'job':
        return `/jobs/${id}`;
      case 'service':
        return `/services/${id}`;
      default:
        return '/';
    }
  };
  
  const truncateDescription = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const convertedPrice = price 
    ? convertPrice(price, currencyCode) 
    : undefined;
  
  const displayPrice = convertedPrice 
    ? formatPrice(convertedPrice) 
    : '';

  return (
    <Link to={getPath()} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-lg hover:translate-y-[-2px]">
        {image ? (
          <div className="h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-purple-100 flex items-center justify-center">
            <div className="text-5xl text-purple-300">{getIcon()}</div>
          </div>
        )}
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
            <div className="flex items-center text-sm text-gray-500">
              {getIcon()}
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {category}
            </span>
            <span className="ml-2 text-xs text-gray-500">{formattedDate}</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">
            {truncateDescription(description)}
          </p>
          
          {price !== undefined && (
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-purple-700">
                {displayPrice}
                {currentCurrency?.code !== currencyCode && (
                  <span className="text-xs text-gray-500 ml-1">
                    (Originally {formatPrice(price, currencyCode)})
                  </span>
                )}
              </p>
              <div className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 text-xs font-semibold px-3 py-1 rounded-full transition-colors">
                View Details
              </div>
            </div>
          )}
          
          {type === 'job' && price === undefined && (
            <div className="flex justify-end">
              <div className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 text-xs font-semibold px-3 py-1 rounded-full transition-colors">
                View Job
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};