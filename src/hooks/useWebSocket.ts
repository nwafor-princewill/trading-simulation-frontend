import { useEffect, useRef, useState } from 'react';
import type { Stock } from '../types/trading';

export const useWebSocket = (url: string) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      ws.current?.close();
    };
  }, [url]);

  const connectWebSocket = () => {
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        console.log('✅ Connected to WebSocket');
        setConnected(true);
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const stock: Stock = JSON.parse(event.data);
          setStocks(prev => {
            const existing = prev.find(s => s.symbol === stock.symbol);
            if (existing) {
              return prev.map(s => s.symbol === stock.symbol ? stock : s);
            }
            return [...prev, stock];
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected - attempting reconnect...');
        setConnected(false);
        // Attempt reconnect after 3 seconds
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