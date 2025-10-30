import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import AuthModal from './AuthModal';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-100 text-blue-700 border-blue-500' : 'text-gray-600 hover:bg-gray-100 border-transparent';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📈</span>
                </div>
                <span className="text-xl font-bold text-gray-900">TradeSim</span>
              </Link>
            </div>

            {/* Navigation Links - Only show when logged in */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${isActive('/')}`}
                >
                  🏠 Dashboard
                </Link>
                <Link
                  to="/market"
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${isActive('/market')}`}
                >
                  📊 Market
                </Link>
                <Link
                  to="/trade"
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${isActive('/trade')}`}
                >
                  💰 Trade
                </Link>
                <Link
                  to="/portfolio"
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${isActive('/portfolio')}`}
                >
                  💼 Portfolio
                </Link>
                <Link
                  to="/orders"
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${isActive('/orders')}`}
                >
                  📋 Orders
                </Link>
              </div>
            )}

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-600">${user.cashBalance.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  {/* <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    🔐 Login
                  </button>
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sign Up
                  </button> */}
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation - Only show when logged in */}
          {user && (
            <div className="md:hidden flex overflow-x-auto py-2 space-x-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded text-sm font-medium border whitespace-nowrap ${isActive('/')}`}
              >
                🏠 Dashboard
              </Link>
              <Link
                to="/market"
                className={`px-3 py-2 rounded text-sm font-medium border whitespace-nowrap ${isActive('/market')}`}
              >
                📊 Market
              </Link>
              <Link
                to="/trade"
                className={`px-3 py-2 rounded text-sm font-medium border whitespace-nowrap ${isActive('/trade')}`}
              >
                💰 Trade
              </Link>
              <Link
                to="/portfolio"
                className={`px-3 py-2 rounded text-sm font-medium border whitespace-nowrap ${isActive('/portfolio')}`}
              >
                💼 Portfolio
              </Link>
              <Link
                to="/orders"
                className={`px-3 py-2 rounded text-sm font-medium border whitespace-nowrap ${isActive('/orders')}`}
              >
                📋 Orders
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      /> */}
    </>
  );
};

export default Navigation;