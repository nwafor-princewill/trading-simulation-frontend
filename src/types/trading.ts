export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  quantity: number;
  price: number;
  stopPrice?: number;
  limitPrice?: number;
  trailingPercent?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'active' | 'triggered';
  timestamp: string;
  triggeredAt?: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartTimeframe {
  label: string;
  value: string;
  interval: number; // minutes
}

// Remove the AdvancedOrder interface - we don't need it since Order now includes all types