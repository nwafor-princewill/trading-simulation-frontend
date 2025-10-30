import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Register from '../components/Register';

const Home: React.FC = () => {
  const [isLogin, setIsLogin] = React.useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📈</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">TradeSim</span>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setIsLogin(true)}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Master Trading
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                Risk-Free
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Practice stock trading with $10,000 virtual cash. Test strategies, 
              learn market dynamics, and build confidence before investing real money.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl mb-2">💼</div>
                <div className="font-semibold text-gray-900">Real-time Data</div>
                <div className="text-sm text-gray-600">Live market simulation</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="font-semibold text-gray-900">Advanced Orders</div>
                <div className="text-sm text-gray-600">Stop losses & limits</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-gray-900">Portfolio Tracking</div>
                <div className="text-sm text-gray-600">Monitor performance</div>
              </div>
            </div>
          </div>

          {/* Right Column - Auth Form */}
          <div className="bg-white rounded-2xl shadow-xl border p-8">
            {isLogin ? (
              <Login onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <Register onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Learn Trading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Live Market Data</h3>
              <p className="text-gray-600">Real-time stock prices with realistic market movements</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Virtual $10,000</h3>
              <p className="text-gray-600">Start with virtual cash to practice risk-free</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Advanced Orders</h3>
              <p className="text-gray-600">Stop losses, limit orders, and trailing stops</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Performance Tracking</h3>
              <p className="text-gray-600">Detailed analytics and order history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;