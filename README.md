# Trading Simulator – Frontend

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **A real-time stock trading simulator** with live market data, portfolio tracking, advanced order types (stop-loss, limit), and a sleek responsive UI.

---

## Features

| Feature | Description |
|--------|-------------|
| **Live Market Data** | WebSocket-powered price updates every **3 seconds** |
| **Buy / Sell** | Market & limit orders with instant execution |
| **Advanced Orders** | Stop-loss, take-profit, trailing stop |
| **Portfolio** | Real-time P&L, cash balance, position list |
| **Order History** | Filterable table with timestamps |
| **Auth** | Register / Login with JWT (persisted) |
| **Responsive UI** | Mobile-first Tailwind design |
| **SPA Routing** | React Router + Vercel rewrites (no 404) |

---

## Tech Stack

- **Framework** – React 18 + Vite  
- **Styling** – Tailwind CSS (via PostCSS)  
- **State** – React Context (`AuthContext`)  
- **Routing** – React Router v6  
- **WebSocket** – Custom `useWebSocket` hook  
- **Deploy** – Vercel (free tier)

---

## Project Structure
src/
├── components/      # UI components (Login, StockList, etc.)
├── contexts/        # AuthContext
├── hooks/           # useWebSocket
├── pages/           # Dashboard, Trade, PortfolioPage
├── types/           # TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css        # Tailwind entry

## WebSocket – Real-Time Market Engine

ts
// src/hooks/useWebSocket.ts
const ws = new WebSocket(`${API_URL.replace('http', 'ws')}/ws`);
ws.onmessage = (e) => setStocks(prev => updateStock(prev, JSON.parse(e.data)));

How It Works

Frontend opens a persistent WebSocket to /ws on page load.
Backend runs a ticker every 3s → broadcasts updated Stock objects.
UI reacts instantly – no polling, no lag.
Auto-reconnect logic keeps the feed alive.


Result: Stock prices move like a real exchange.
No refresh needed – feels like Bloomberg.

Getting Started
1. Clone & Install
      git clone https://github.com/yourname/trading-simulator-frontend.git
      cd trading-simulator-frontend
      npm install

 2. Environment
     # .env (VITE_)
    VITE_API_URL=https://your-backend.onrender.com

3. Run Locally
    npm run dev

4. Deploy to Vercel
    vercel --prod

{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }

Scripts
Script,    Command
Dev,      npm run dev
Build,    npm run build
Preview,  npm run preview

Made with passion for finance & code.
