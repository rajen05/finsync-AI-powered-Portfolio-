import React from 'react';
import { DollarIcon } from './icons/DollarIcon';
import { useMarketData } from '../context/MarketDataProvider';

const API_KEY = (process.env.API_KEY || process.env.GEMINI_API_KEY);
const hasApiKey = !!API_KEY;

const Header: React.FC = () => {
  // isLoading is the initial load, isRefreshing is for subsequent background polls
  const { isRefreshing } = useMarketData();
  
  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <DollarIcon />
              <h1 className="text-xl font-bold ml-3">PortFolio Sync</h1>
            </div>
            <div className="flex items-center">
              {isRefreshing && (
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:block">Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {!hasApiKey && (
        <div className="bg-yellow-600 text-white px-4 py-2">
          <div className="max-w-7xl mx-auto text-sm">
            ⚠️ <strong>API Key Missing:</strong> Using mock data. Add <code className="bg-yellow-700 px-1 rounded">GEMINI_API_KEY</code> to <code className="bg-yellow-700 px-1 rounded">.env.local</code> for live market data.
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
