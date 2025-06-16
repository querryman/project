import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ShoppingCart, Briefcase, Wrench, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export const NavBar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currencies, currentCurrency, changeCurrency } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold">Tradex</h1>
              <span className="ml-1 text-yellow-400 font-bold">®</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center sm:mx-4">
            <form onSubmit={handleSearch} className="w-full max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items, jobs, services..."
                  className="w-full pl-4 pr-10 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-purple-700"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {!isHome && (
        <>
          <Link to="/buy" className="text-white hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium flex items-center">
            <ShoppingCart size={18} className="mr-1" />
            Buy
          </Link>
          <Link to="/sell" className="text-white hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium flex items-center">
            <ShoppingCart size={18} className="mr-1" />
            Sell
          </Link>
          <Link to="/jobs" className="text-white hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium flex items-center">
            <Briefcase size={18} className="mr-1" />
            Jobs
          </Link>
          <Link to="/services" className="text-white hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium flex items-center">
            <Wrench size={18} className="mr-1" />
            Services
          </Link>
        </>
      )}

            {/* Currency Selector */}
            <select
              value={currentCurrency?.code || 'USD'}
              onChange={(e) => changeCurrency(e.target.value)}
              className="bg-purple-600 text-white border border-purple-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </option>
              ))}
            </select>

            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="bg-purple-800 p-2 rounded-full hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <User size={20} />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search - visible only on mobile */}
      <div className="sm:hidden px-2 pt-2 pb-3">
        <form onSubmit={handleSearch} className="mt-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, jobs, services..."
              className="w-full pl-4 pr-10 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-purple-700"
            >
              <Search size={20} />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="sm:hidden bg-purple-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/buy"
              className="text-white hover:text-yellow-300 hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Buy
            </Link>
            <Link
              to="/sell"
              className="text-white hover:text-yellow-300 hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sell
            </Link>
            <Link
              to="/jobs"
              className="text-white hover:text-yellow-300 hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
            <Link
              to="/services"
              className="text-white hover:text-yellow-300 hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>

            <div className="pt-4 pb-3 border-t border-purple-700">
              <div className="flex items-center px-3">
                <div className="text-base font-medium text-white">Currency:</div>
                <select
                  value={currentCurrency?.code || 'USD'}
                  onChange={(e) => changeCurrency(e.target.value)}
                  className="ml-3 bg-purple-600 text-white border border-purple-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} ({currency.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {user ? (
              <div className="pt-4 pb-3 border-t border-purple-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <User size={32} className="text-white" />
                  </div>
                  <div className="ml-3">
                    <Link
                      to="/profile"
                      className="text-white hover:text-yellow-300 hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="mt-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-purple-700">
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-300 hover:bg-purple-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="mt-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};