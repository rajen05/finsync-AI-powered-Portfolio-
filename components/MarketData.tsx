import React, { useState, useEffect } from 'react';
import StockDetailView from './StockDetailView';
import MarketNews from './MarketNews';
import StockSearch from './StockSearch';
import { prefetchStockDetails } from '../services/geminiService';
import { useMarketData } from '../context/MarketDataProvider';

interface MarketDataProps {
  symbol: string | null;
  setSymbol: (symbol: string | null) => void;
}

const MarketData: React.FC<MarketDataProps> = ({ symbol, setSymbol }) => {
  const [inputValue, setInputValue] = useState('');
  
  const { topMovers, isLoading: isLoadingMovers, error: errorMovers } = useMarketData();

  useEffect(() => {
    // If a symbol is passed via props (e.g., from portfolio click), update the input.
    if (symbol) {
      setInputValue(symbol);
    }
  }, [symbol]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue) {
      setSymbol(inputValue.toUpperCase());
    }
  };
  
  const handleMoverClick = (moverSymbol: string) => {
      setInputValue(moverSymbol);
      setSymbol(moverSymbol);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 transition-colors">
        <StockSearch 
          value={inputValue}
          onSelect={(selectedSymbol) => {
            setInputValue(selectedSymbol)
            setSymbol(selectedSymbol)
          }}
        />
      </div>

      {symbol ? (
        <StockDetailView symbol={symbol} onBack={() => setSymbol(null)} />
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Movers Today</h3>
            {isLoadingMovers && !topMovers && <p className="text-slate-400">Loading top movers...</p>}
            {errorMovers && <p className="text-red-500">{errorMovers}</p>}
            {!isLoadingMovers && topMovers && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {topMovers.map((mover) => {
                  const isPositive = mover.changePercent >= 0;
                  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
                  return (
                    <div
                      key={mover.ticker}
                      onClick={() => handleMoverClick(mover.ticker)}
                      onMouseEnter={() => prefetchStockDetails(mover.ticker)}
                      className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-600"
                    >
                      <p className="font-bold text-gray-900 dark:text-white truncate">{mover.ticker}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300 truncate">{mover.companyName}</p>
                      <p className="font-semibold text-white mt-2">${mover.price.toFixed(2)}</p>
                      <p className={`text-sm font-medium ${colorClass}`}>
                        {isPositive ? '+' : ''}{mover.change.toFixed(2)} ({isPositive ? '+' : ''}{mover.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Market News Section */}
          <MarketNews />
        </>
      )}
    </div>
  );
};

export default MarketData;
