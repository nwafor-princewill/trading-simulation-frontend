import React, { useState, useEffect } from 'react';
import type { Portfolio as PortfolioType, Stock } from '../types/trading';
import { useAuth } from '../contexts/AuthContext';

interface PortfolioProps {
  stocks?: Stock[];
}

const Portfolio: React.FC<PortfolioProps> = ({ stocks = [] }) => {
  const { refreshUser } = useAuth(); // <-- now used

  const [portfolio, setPortfolio] = useState<PortfolioType[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [cashBalance, setCashBalance] = useState(10000);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setPortfolio(data.portfolio || []);
        setCashBalance(data.cashBalance || 10000);
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (portfolio.length > 0 && stocks.length > 0) {
      let newTotalValue = 0;
      let newTotalProfit = 0;

      portfolio.forEach((position) => {
        const cur = stocks.find((s) => s.symbol === position.symbol);
        const curPrice = cur?.price || 0;
        const value = curPrice * position.shares;
        const cost = position.avgCost * position.shares;
        const profit = value - cost;

        newTotalValue += value;
        newTotalProfit += profit;
      });

      setTotalValue(newTotalValue);
      setTotalProfit(newTotalProfit);
    }
  }, [portfolio, stocks]);

  useEffect(() => {
    fetchPortfolio();
    const id = setInterval(() => {
      fetchPortfolio();
      refreshUser(); // <-- keeps cash in sync
    }, 5000);
    return () => clearInterval(id);
  }, [refreshUser]);

  const getProfitColor = (profit: number) =>
    profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-600';

  const getProfitBgColor = (profit: number) =>
    profit > 0
      ? 'bg-green-50 border-green-200'
      : profit < 0
      ? 'bg-red-50 border-red-200'
      : 'bg-gray-50 border-gray-200';

  const totalAssets = totalValue + cashBalance;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
        <button
          onClick={fetchPortfolio}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Assets</div>
          <div className="text-xl font-bold text-gray-900">
            ${totalAssets.toFixed(2)}
          </div>
        </div>
        <div
          className={`p-4 rounded-lg border ${getProfitBgColor(totalProfit)}`}
        >
          <div className="text-sm text-gray-600">Total P&L</div>
          <div className={`text-xl font-bold ${getProfitColor(totalProfit)}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <span className="text-green-800 font-medium">Cash Balance</span>
          <span className="text-green-800 font-bold">
            ${cashBalance.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Your Positions
        </h3>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading portfolio...</p>
          </div>
        ) : portfolio.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">Portfolio</div>
            <p className="text-gray-500">No positions yet. Start trading!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {portfolio.map((position) => {
              const cur = stocks.find((s) => s.symbol === position.symbol);
              const curPrice = cur?.price || 0;
              const value = curPrice * position.shares;
              const cost = position.avgCost * position.shares;
              const profit = value - cost;
              const profitPct = cost ? (profit / cost) * 100 : 0;

              return (
                <div
                  key={position.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {position.symbol}
                      </div>
                      <div className="text-sm text-gray-600">
                        {position.shares} shares
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${value.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm font-medium ${getProfitColor(
                          profit
                        )}`}
                      >
                        {profit >= 0 ? '+' : ''}${profit.toFixed(2)} (
                        {profitPct.toFixed(2)}%)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Avg Cost: ${position.avgCost.toFixed(2)}</div>
                    <div className="text-right">
                      Current: ${curPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {portfolio.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Stocks Value:</div>
            <div className="text-right font-semibold">
              ${totalValue.toFixed(2)}
            </div>

            <div className="text-gray-600">Positions:</div>
            <div className="text-right font-semibold">{portfolio.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;