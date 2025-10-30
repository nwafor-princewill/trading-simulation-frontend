import React from 'react';
import OrderHistory from '../components/OrderHistory';

const Orders: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📋 Order History</h1>
        <p className="text-gray-600">View your complete trading history and active orders</p>
      </header>

      <OrderHistory />
    </div>
  );
};

export default Orders;