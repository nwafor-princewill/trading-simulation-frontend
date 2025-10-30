import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';
// chartjs-adapter-date-fns does not provide TypeScript types by default — ignore the type check for this import
// @ts-ignore
import 'chartjs-adapter-date-fns';
import type { Stock, CandleData, ChartTimeframe } from '../types/trading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

interface StockChartProps {
  stock: Stock;
  timeframe?: string;
}

const StockChart: React.FC<StockChartProps> = ({ stock, timeframe = '1D' }) => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const timeframes: ChartTimeframe[] = [
    { label: '1D', value: '1D', interval: 1 },
    { label: '1W', value: '1W', interval: 5 },
    { label: '1M', value: '1M', interval: 30 },
    { label: '3M', value: '3M', interval: 90 },
  ];

  // Generate mock historical data
  const generateHistoricalData = (symbol: string, days: number): CandleData[] => {
    const basePrice = getBasePrice(symbol);
    const data: CandleData[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Realistic price movement based on volatility
      const volatility = getVolatility(symbol);
      const change = (Math.random() - 0.5) * 2 * volatility;
      
      const prevClose = i === days ? basePrice : data[data.length - 1].close;
      const open = prevClose;
      const close = prevClose * (1 + change / 100);
      const high = Math.max(open, close) * (1 + Math.random() * volatility / 200);
      const low = Math.min(open, close) * (1 - Math.random() * volatility / 200);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;

      data.push({
        timestamp: date.toISOString(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });
    }

    return data;
  };

  const getBasePrice = (symbol: string): number => {
    const basePrices: { [key: string]: number } = {
      'AAPL': 269,
      'GOOGL': 267,
      'MSFT': 542,
      'TSLA': 460,
      'AMZN': 229,
    };
    return basePrices[symbol] || 100;
  };

  const getVolatility = (symbol: string): number => {
    const volatilities: { [key: string]: number } = {
      'AAPL': 2,
      'GOOGL': 2.5,
      'MSFT': 2.2,
      'TSLA': 5,
      'AMZN': 3,
    };
    return volatilities[symbol] || 2;
  };

  useEffect(() => {
    const days = selectedTimeframe === '1D' ? 1 : 
                 selectedTimeframe === '1W' ? 7 :
                 selectedTimeframe === '1M' ? 30 : 90;
    
    const historicalData = generateHistoricalData(stock.symbol, days);
    setChartData(historicalData);
  }, [stock.symbol, selectedTimeframe]);

  const getChartData = (): ChartData<'line', any, Date> => {
    const isPositive = chartData.length > 0 && 
      chartData[chartData.length - 1].close >= chartData[0].open;

    return {
      labels: chartData.map(d => new Date(d.timestamp)),
      datasets: [
        {
          label: `${stock.symbol} Price`,
          data: chartData.map(d => d.close),
          borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          backgroundColor: chartType === 'area' 
            ? isPositive 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)'
            : 'transparent',
          borderWidth: 2,
          fill: chartType === 'area',
          tension: 0.4,
          pointRadius: chartData.length > 50 ? 0 : 3,
          pointHoverRadius: 5,
          pointBackgroundColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        },
      ],
    };
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const candle = chartData[dataIndex];
            if (candle) {
              return [
                `Open: $${candle.open.toFixed(2)}`,
                `High: $${candle.high.toFixed(2)}`,
                `Low: $${candle.low.toFixed(2)}`,
                `Close: $${candle.close.toFixed(2)}`,
                `Volume: ${candle.volume.toLocaleString()}`,
              ];
            }
            // context.parsed can be null, a number, or an object like { x, y }
            const parsed = context.parsed as any;
            const y = parsed == null ? undefined : (typeof parsed === 'number' ? parsed : parsed.y);
            if (typeof y === 'number') {
              return `Price: $${y.toFixed(2)}`;
            }
            return 'Price: N/A';
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: selectedTimeframe === '1D' ? 'hour' : 'day',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toFixed(2);
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const currentChange = stock.changePercent;
  const chartColor = currentChange >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{stock.symbol}</h2>
          <p className="text-gray-600">{stock.name}</p>
        </div>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <div className={`text-xl font-bold ${chartColor}`}>
            ${stock.price.toFixed(2)}
          </div>
          <div className={`px-2 py-1 rounded text-sm font-medium ${
            currentChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {currentChange >= 0 ? '+' : ''}{currentChange.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Timeframe Buttons */}
        <div className="flex space-x-1">
          {timeframes.map(tf => (
            <button
              key={tf.value}
              onClick={() => setSelectedTimeframe(tf.value)}
              className={`px-3 py-1 text-sm rounded-lg ${
                selectedTimeframe === tf.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart Type Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 text-sm rounded-lg ${
              chartType === 'area'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded-lg ${
              chartType === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <Line
            data={getChartData()}
            options={chartOptions}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        )}
      </div>

      {/* Chart Footer */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-600">Open</div>
          <div className="font-semibold">${chartData[0]?.open.toFixed(2) || '0.00'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">High</div>
          <div className="font-semibold text-green-600">
            ${Math.max(...chartData.map(d => d.high)).toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Low</div>
          <div className="font-semibold text-red-600">
            ${Math.min(...chartData.map(d => d.low)).toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Volume</div>
          <div className="font-semibold">
            {chartData[chartData.length - 1]?.volume.toLocaleString() || '0'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;