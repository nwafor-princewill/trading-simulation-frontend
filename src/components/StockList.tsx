import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Stock } from '../types/trading';
import ChartModal from './ChartModal';

const StockList: React.FC = () => {
  const { stocks, connected } = useWebSocket('ws://localhost:8080/ws');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isChartOpen, setIsChartOpen] = useState(false);

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50 border-green-200';
    if (change < 0) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '🔼';
    if (change < 0) return '🔽';
    return '➡️';
  };

  const openChart = (stock: Stock) => {
    setSelectedStock(stock);
    setIsChartOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Live Market Data</h2>
            <p className="text-gray-600 mt-1">Real-time stock prices and changes</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 ${
            connected ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{connected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Change</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Change %</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Chart</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {stock.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">NASDAQ</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">${stock.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getChangeColor(stock.change)}`}>
                      <span className="mr-1">{getChangeIcon(stock.change)}</span>
                      {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-semibold ${getChangeColor(stock.change).split(' ')[0]}`}>
                      {stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openChart(stock)}
                      className="text-blue-500 hover:text-blue-700 font-medium text-sm px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      📊 View Chart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {stocks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📈</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for market data</h3>
              <p className="text-gray-500">Live stock prices will appear here once connected</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Data updates every 5 seconds • {stocks.length} stocks monitored
        </div>
      </div>

      <ChartModal
        stock={selectedStock}
        isOpen={isChartOpen}
        onClose={() => setIsChartOpen(false)}
      />
    </>
  );
};

export default StockList;