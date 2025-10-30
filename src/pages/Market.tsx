import React from 'react';
import StockList from '../components/StockList';

const Market: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📊 Live Market</h1>
        <p className="text-gray-600">Real-time stock prices and market data</p>
      </header>
      
      <StockList />
    </div>
  );
};

export default Market;