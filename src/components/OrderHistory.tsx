import React, { useState, useEffect } from 'react';
import type { Order } from '../types/trading';

interface OrderHistoryProps {
  refreshTrigger?: number;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ refreshTrigger = 0 }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Sort orders by timestamp (newest first)
        const sortedOrders = (data.orders || []).sort((a: Order, b: Order) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.type === filter
  );

  const getOrderTypeColor = (type: string) => {
    return type === 'buy' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';
  };

  const getOrderTypeIcon = (type: string) => {
    return type === 'buy' ? '🔼' : '🔽';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const totalTrades = orders.length;
  const buyTrades = orders.filter(o => o.type === 'buy').length;
  const sellTrades = orders.filter(o => o.type === 'sell').length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <button 
          onClick={fetchOrders}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalTrades}</div>
          <div className="text-sm text-blue-800">Total Trades</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">{buyTrades}</div>
          <div className="text-sm text-green-800">Buy Orders</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
          <div className="text-2xl font-bold text-red-600">{sellTrades}</div>
          <div className="text-sm text-red-800">Sell Orders</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setFilter('buy')}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            filter === 'buy' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Buy Orders
        </button>
        <button
          onClick={() => setFilter('sell')}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            filter === 'sell' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sell Orders
        </button>
      </div>

      {/* Orders List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading order history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">📋</div>
            <p className="text-gray-500">No orders found</p>
            <p className="text-gray-400 text-sm">Start trading to see your order history!</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.symbol}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getOrderTypeColor(order.type)}`}>
                        <span className="mr-1">{getOrderTypeIcon(order.type)}</span>
                        {order.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {order.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${order.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                      ${(order.price * order.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} total orders
          {filter !== 'all' && ` (${filter} orders only)`}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;