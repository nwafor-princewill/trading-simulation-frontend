// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import type { Stock } from '../types/trading';

// Get API URL from Vite (set in Vercel)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_URL = `${API_URL.replace(/^http/, 'ws')}/ws`;

export const useWebSocket = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      ws.current?.close();
    };
  }, []);

  const connectWebSocket = () => {
    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('Connected to WebSocket:', WS_URL);
        setConnected(true);
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      };

      ws.current.onmessage = (event) => {
        try {
          const stock: Stock = JSON.parse(event.data);
          setStocks((prev) => {
            const existing = prev.find((s) => s.symbol === stock.symbol);
            if (existing) {
              return prev.map((s) => (s.symbol === stock.symbol ? stock : s));
            }
            return [...prev, stock];
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected - reconnecting...');
        setConnected(false);
        reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnected(false);
    }
  };

  return { stocks, connected };
};