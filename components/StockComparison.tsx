import React, { useState, useEffect } from 'react';
import { fetchStockDetails } from '../services/geminiService';
import { StockDetails } from '../types';

export const StockComparison: React.FC = () => {
  const [stock1Symbol, setStock1Symbol] = useState('MSFT');
  const [stock2Symbol, setStock2Symbol] = useState('AAPL');
  const [stock1Data, setStock1Data] = useState<StockDetails | null>(null);
  const [stock2Data, setStock2Data] = useState<StockDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('6 Months');

  const timeRanges = ['1 Day', '1 Week', '1 Month', '3 Months', '6 Months', '1 Year', '5 Years', 'All Time'];

  useEffect(() => {
    loadStockData();
  }, [stock1Symbol, stock2Symbol]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const [data1, data2] = await Promise.all([
        fetchStockDetails(stock1Symbol),
        fetchStockDetails(stock2Symbol),
      ]);
      setStock1Data(data1);
      setStock2Data(data2);
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    loadStockData();
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Search Stocks to Compare</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stock 1 Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              1ST STOCK
            </label>
            <input
              type="text"
              value={stock1Symbol}
              onChange={(e) => setStock1Symbol(e.target.value.toUpperCase())}
              placeholder="e.g., Microsoft"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg className="absolute right-3 top-11 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Stock 2 Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              2ND STOCK
            </label>
            <input
              type="text"
              value={stock2Symbol}
              onChange={(e) => setStock2Symbol(e.target.value.toUpperCase())}
              placeholder="e.g., Apple"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg className="absolute right-3 top-11 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Compare Button */}
          <div className="flex items-end">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Compare Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {stock1Data && stock2Data && (
        <div className="bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock 1 Card */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{stock1Symbol.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 dark:text-white">{stock1Symbol}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stock1Data.companyName}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
                <div className="font-bold text-green-600 dark:text-green-400">
                  ${stock1Data.currentPrice.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
                <div className="font-bold text-gray-900 dark:text-white">{stock1Data.marketCap}</div>
              </div>
            </div>

            {/* Stock 2 Card */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{stock2Symbol.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 dark:text-white">{stock2Symbol}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stock2Data.companyName}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
                <div className="font-bold text-green-600 dark:text-green-400">
                  ${stock2Data.currentPrice.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
                <div className="font-bold text-gray-900 dark:text-white">{stock2Data.marketCap}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Comparison Charts */}
      {stock1Data && stock2Data && (
        <div className="bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Price Comparison</h2>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock 1 Chart */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{stock1Symbol}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stock1Data.companyName}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${stock1Data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock1Data.change >= 0 ? '▲' : '▼'} {Math.abs(stock1Data.changePercent).toFixed(2)}%
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stock1Data.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated at {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500">Chart visualization</span>
              </div>
            </div>

            {/* Stock 2 Chart */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{stock2Symbol}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stock2Data.companyName}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${stock2Data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock2Data.change >= 0 ? '▲' : '▼'} {Math.abs(stock2Data.changePercent).toFixed(2)}%
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stock2Data.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated at {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500">Chart visualization</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
