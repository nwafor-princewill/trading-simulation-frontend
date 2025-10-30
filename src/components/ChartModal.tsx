import React from 'react';
import type { Stock } from '../types/trading';
import StockChart from './StockChart';

interface ChartModalProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChartModal: React.FC<ChartModalProps> = ({ stock, isOpen, onClose }) => {
  if (!isOpen || !stock) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {stock.symbol} - {stock.name} Chart
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <StockChart stock={stock} />
        </div>
      </div>
    </div>
  );
};

export default ChartModal;