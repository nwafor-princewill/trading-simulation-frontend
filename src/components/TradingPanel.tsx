// components/TradingPanel.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // <-- Added import

interface Stock {
  symbol: string;
  price: number;
}

interface TradingPanelProps {
  stocks: Stock[];
  onOrderPlaced?: () => void;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ stocks, onOrderPlaced }) => {
  const { refreshUser } = useAuth(); // <-- Extract refreshUser

  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(10);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const currentStock = stocks.find(s => s.symbol === symbol);
  const currentPrice = currentStock?.price || 0;

  const placeOrder = async (type: 'buy' | 'sell') => {
    if (!currentStock) {
      setMessage('Please select a valid stock');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol,
          type,
          orderType,
          quantity,
          price
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`SUCCESS ${type.toUpperCase()} order placed successfully!`);
        // Reset form
        setQuantity(10);
        setLimitPrice('');

        // Notify parent to refresh order history
        if (onOrderPlaced) {
          onOrderPlaced();
        }

        // Refresh user data (cash balance, etc.)
        refreshUser(); // <-- Added refreshUser call
      } else {
        setMessage(`ERROR: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to place order. Please try again.');
      console.error('Order error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCost = currentPrice * quantity;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Trade Stocks</h2>
      
      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.includes('SUCCESS') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Symbol</label>
          <select 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="AAPL">Apple (AAPL)</option>
            <option value="GOOGL">Google (GOOGL)</option>
            <option value="MSFT">Microsoft (MSFT)</option>
            <option value="TSLA">Tesla (TSLA)</option>
            <option value="AMZN">Amazon (AMZN)</option>
          </select>
          {currentStock && (
            <p className="text-sm text-gray-600 mt-1">
              Current Price: <span className="font-semibold">${currentPrice.toFixed(2)}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setOrderType('market')}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                orderType === 'market' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Market Order
            </button>
            <button
              onClick={() => setOrderType('limit')}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                orderType === 'limit' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Limit Order
            </button>
          </div>
        </div>

        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Limit Price ($)</label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter limit price"
              step="0.01"
              min="0.01"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Estimated Cost:</span>
            <span className="font-semibold">${totalCost.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button 
            onClick={() => placeOrder('buy')}
            disabled={isLoading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Placing Order...
              </>
            ) : (
              `Buy ${symbol}`
            )}
          </button>
          <button 
            onClick={() => placeOrder('sell')}
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Placing Order...
              </>
            ) : (
              `Sell ${symbol}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingPanel;