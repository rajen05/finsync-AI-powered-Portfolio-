import React from 'react';
import { DollarIcon } from './icons/DollarIcon';
import { useMarketData } from '../context/MarketDataProvider';
import { useTheme } from '../context/ThemeContext';

const API_KEY = (process.env.API_KEY || process.env.GEMINI_API_KEY);
const hasApiKey = !!API_KEY;

interface HeaderProps {
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  // isLoading is the initial load, isRefreshing is for subsequent background polls
  const { isRefreshing } = useMarketData();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <>
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center">
                <img src="/icon/Finsync.png" alt="FinSync Logo" className="h-20 w-20" />
                <h1 className="text-xl font-bold ml-3">FinSync</h1>
              </div>
              
              {/* Navigation Tabs */}
              {currentPage && setCurrentPage && (
                <nav className="flex items-baseline space-x-4">
                  <button
                    onClick={() => setCurrentPage('heatmap')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 'heatmap' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    Heatmap
                  </button>
                  <button
                    onClick={() => setCurrentPage('portfolio')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 'portfolio' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    Portfolio
                  </button>
                  <button
                    onClick={() => setCurrentPage('transactions')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 'transactions' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={() => setCurrentPage('market')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 'market' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    Market Data
                  </button>
                </nav>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isRefreshing && (
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:block">Updating...</span>
                </div>
              )}
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  // Moon icon for dark mode
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  // Sun icon for light mode
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
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
