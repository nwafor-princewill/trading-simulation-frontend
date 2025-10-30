// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import StockList from '../components/StockList';
import Portfolio from '../components/Portfolio';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { stocks, connected } = useWebSocket();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Trading Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold text-blue-600">
            {user?.username || 'Trader'}
          </span>!
        </p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
          connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {connected ? 'Live' : 'Disconnected'}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockList />
        </div>

        <div>
          <Portfolio stocks={stocks} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;