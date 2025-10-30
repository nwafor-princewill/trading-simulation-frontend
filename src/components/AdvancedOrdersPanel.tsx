// components/AdvancedOrdersPanel.tsx
import React, { useState, useEffect } from 'react';
import type { Order, Stock } from '../types/trading';
import { useAuth } from '../contexts/AuthContext';   // <-- added

interface AdvancedOrdersPanelProps {
  stocks: Stock[];
  onOrderPlaced?: () => void;
}

const AdvancedOrdersPanel: React.FC<AdvancedOrdersPanelProps> = ({
  stocks,
  onOrderPlaced,
}) => {
  const { refreshUser } = useAuth();               // <-- added

  const [symbol, setSymbol] = useState('AAPL');
  const [orderType, setOrderType] = useState<'stop' | 'stop_limit'>('stop');
  const [quantity, setQuantity] = useState(10);
  const [stopPrice, setStopPrice] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  const currentStock = stocks.find((s) => s.symbol === symbol);
  const currentPrice = currentStock?.price || 0;

  // -----------------------------------------------------------------
  // 1. Fetch active stop orders
  // -----------------------------------------------------------------
  const fetchActiveOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:8080/api/advanced-orders/active',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) setActiveOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching active orders:', err);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------------------------------------------
  // 2. Place a stop / stop-limit order
  // -----------------------------------------------------------------
  const placeStopOrder = async (type: 'buy' | 'sell') => {
    if (!currentStock) {
      setMessage('Please select a valid stock');
      return;
    }
    if (!stopPrice || parseFloat(stopPrice) <= 0) {
      setMessage('Please enter a valid stop price');
      return;
    }
    if (orderType === 'stop_limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setMessage('Please enter a valid limit price');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const orderData: any = {
        symbol,
        type,
        orderType,
        quantity,
        stopPrice: parseFloat(stopPrice),
      };
      if (orderType === 'stop_limit') {
        orderData.limitPrice = parseFloat(limitPrice);
        orderData.price = parseFloat(limitPrice);
      } else {
        orderData.price = parseFloat(stopPrice);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:8080/api/advanced-orders/stop',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(`SUCCESS STOP Order Created! Will trigger at $${stopPrice}`);
        setStopPrice('');
        setLimitPrice('');
        setQuantity(10);
        fetchActiveOrders();
        if (onOrderPlaced) onOrderPlaced();

        // <-- refresh user (cash, etc.) after order
        refreshUser();
      } else {
        setMessage(`ERROR: ${data.error}`);
      }
    } catch (err) {
      setMessage('Failed to place stop order');
      console.error('Stop order error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // 3. Cancel an active stop order
  // -----------------------------------------------------------------
  const cancelOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/advanced-orders/cancel/${orderId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setMessage('Order cancelled successfully');
        fetchActiveOrders();
        refreshUser();          // <-- keep cash in sync after cancel
      } else {
        setMessage('Failed to cancel order');
      }
    } catch (err) {
      setMessage('Error cancelling order');
    }
  };

  // -----------------------------------------------------------------
  // UI helpers
  // -----------------------------------------------------------------
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'triggered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Orders</h2>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.includes('SUCCESS')
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {message}
        </div>
      )}

      {/* ---- Form ---- */}
      <div className="space-y-4">
        {/* Symbol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Symbol
          </label>
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
              Current Price:{' '}
              <span className="font-semibold">
                ${currentPrice.toFixed(2)}
              </span>
            </p>
          )}
        </div>

        {/* Order type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Type
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setOrderType('stop')}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                orderType === 'stop'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Stop Order
            </button>
            <button
              onClick={() => setOrderType('stop_limit')}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                orderType === 'stop_limit'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Stop-Limit
            </button>
          </div>
        </div>

        {/* Stop price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stop Price ($)
          </label>
          <input
            type="number"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter stop price"
            step="0.01"
            min="0.01"
          />
        </div>

        {/* Limit price (only for stop_limit) */}
        {orderType === 'stop_limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limit Price ($)
            </label>
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

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
        </div>

        {/* Action button */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={() => placeStopOrder('sell')}
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Placing...
              </>
            ) : (
              `Sell Stop ${symbol}`
            )}
          </button>
        </div>

        {/* ---- Active Orders List ---- */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Active Stop Orders
          </h3>
          {activeOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No active stop orders
            </div>
          ) : (
            <div className="space-y-2">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg border ${getOrderStatusColor(
                    order.status
                  )} flex justify-between items-center`}
                >
                  <div>
                    <div className="font-medium">{order.symbol}</div>
                    <div className="text-sm text-gray-600">
                      {order.quantity} shares • Stop: $
                      {order.stopPrice?.toFixed(2)}
                      {order.limitPrice &&
                        ` • Limit: $${order.limitPrice.toFixed(2)}`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {order.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedOrdersPanel;