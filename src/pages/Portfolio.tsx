// src/pages/PortfolioPage.tsx
import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import Portfolio from '../components/Portfolio';

const PortfolioPage: React.FC = () => {
  const { stocks } = useWebSocket();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
        <p className="text-gray-600">Track your investments and performance</p>
      </header>

      <Portfolio stocks={stocks} />
    </div>
  );
};

export default PortfolioPage;