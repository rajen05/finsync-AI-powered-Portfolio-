import React from 'react';
import { DollarIcon } from './icons/DollarIcon';
import { useMarketData } from '../context/MarketDataProvider';

const Header: React.FC = () => {
  // isLoading is the initial load, isRefreshing is for subsequent background polls
  const { isRefreshing } = useMarketData();
  
  return (
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
  );
};

export default Header;
