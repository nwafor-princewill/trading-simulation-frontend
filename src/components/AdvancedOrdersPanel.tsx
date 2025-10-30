// components/AdvancedOrdersPanel.tsx
import React, { useState, useEffect } from 'react';
import type { Order, Stock } from '../types/trading';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface AdvancedOrdersPanelProps {
  stocks: Stock[];
  onOrderPlaced?: () => void;
}

const AdvancedOrdersPanel: React.FC<AdvancedOrdersPanelProps> = ({
  stocks,
  onOrderPlaced,
}) => {
  const { refreshUser } = useAuth();

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

  const fetchActiveOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/advanced-orders/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const placeStopOrder = async (type: 'buy' | 'sell') => {
    if (!currentStock) return setMessage('Please select a valid stock');
    if (!stopPrice || parseFloat(stopPrice) <= 0) return setMessage('Please enter a valid stop price');
    if (orderType === 'stop_limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      return setMessage('Please enter a valid limit price');
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
      const response = await fetch(`${API_URL}/api/advanced-orders/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`SUCCESS STOP Order Created! Will trigger at $${stopPrice}`);
        setStopPrice('');
        setLimitPrice('');
        setQuantity(10);
        fetchActiveOrders();
        onOrderPlaced?.();
        refreshUser();
      } else {
        setMessage(`ERROR: ${data.error}`);
      }
    } catch (err) {
      setMessage('Failed to place stop order');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/advanced-orders/cancel/${orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setMessage('Order cancelled successfully');
        fetchActiveOrders();
        refreshUser();
      } else {
        setMessage('Failed to cancel order');
      }
    } catch (err) {
      setMessage('Error cancelling order');
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'triggered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Orders</h2>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${message.includes('SUCCESS') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Symbol</label>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {currentStock && <p className="text-sm text-gray-600 mt-1">Current: <strong>${currentPrice.toFixed(2)}</strong></p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
          <div className="flex space-x-4">
            <button onClick={() => setOrderType('stop')} className={`flex-1 py-2 px-4 rounded-lg border ${orderType === 'stop' ? 'bg-blue-500 text-white' : 'bg-white'}`}>Stop</button>
            <button onClick={() => setOrderType('stop_limit')} className={`flex-1 py-2 px-4 rounded-lg border ${orderType === 'stop_limit' ? 'bg-blue-500 text-white' : 'bg-white'}`}>Stop-Limit</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stop Price ($)</label>
          <input type="number" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" step="0.01" />
        </div>

        {orderType === 'stop_limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Limit Price ($)</label>
            <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" step="0.01" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg" min="1" />
        </div>

        <button
          onClick={() => placeStopOrder('sell')}
          disabled={isLoading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
        >
          {isLoading ? 'Placing...' : `Sell Stop ${symbol}`}
        </button>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Active Stop Orders</h3>
          {activeOrders.length === 0 ? (
            <p className="text-center text-gray-500">No active orders</p>
          ) : (
            <div className="space-y-2">
              {activeOrders.map((order) => (
                <div key={order.id} className={`p-3 rounded-lg border ${getOrderStatusColor(order.status)} flex justify-between`}>
                  <div>
                    <div className="font-medium">{order.symbol}</div>
                    <div className="text-sm">{order.quantity} @ ${order.stopPrice?.toFixed(2)}</div>
                  </div>
                  <button onClick={() => cancelOrder(order.id)} className="text-red-500 text-xs">Cancel</button>
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