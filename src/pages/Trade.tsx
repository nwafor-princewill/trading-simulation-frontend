// src/pages/Trade.tsx
import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import TradingPanel from '../components/TradingPanel';
import AdvancedOrdersPanel from '../components/AdvancedOrdersPanel';

const Trade: React.FC = () => {
  const { stocks } = useWebSocket();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshOrders = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trading Desk</h1>
        <p className="text-gray-600">Execute trades and manage advanced orders</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradingPanel stocks={stocks} onOrderPlaced={refreshOrders} />
        <AdvancedOrdersPanel stocks={stocks} onOrderPlaced={refreshOrders} />
      </div>
    </div>
  );
};

export default Trade;