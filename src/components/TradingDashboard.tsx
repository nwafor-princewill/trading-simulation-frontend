import React, { useState } from 'react';
import StockList from './StockList';
import TradingPanel from './TradingPanel';
import Portfolio from './Portfolio';
import OrderHistory from './OrderHistory';
import AdvancedOrdersPanel from './AdvancedOrdersPanel';
import { useWebSocket } from '../hooks/useWebSocket';

const TradingDashboard: React.FC = () => {
  const { stocks, connected } = useWebSocket('ws://localhost:8080/ws');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshOrderHistory = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📈 Trading Simulator</h1>
        <p className="text-gray-600">Professional trading with advanced order types</p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
          connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {connected ? '🟢 Live' : '🔴 Disconnected'}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Stock List & Advanced Orders */}
        <div className="xl:col-span-2 space-y-6">
          <StockList />
          <AdvancedOrdersPanel stocks={stocks} onOrderPlaced={refreshOrderHistory} />
        </div>

        {/* Right Column - Trading, Portfolio & History */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradingPanel stocks={stocks} onOrderPlaced={refreshOrderHistory} />
            <Portfolio stocks={stocks} />
          </div>
          <OrderHistory refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;