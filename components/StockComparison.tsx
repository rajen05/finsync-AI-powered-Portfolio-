import React, { useState, useEffect } from 'react';
import { fetchStockDetails } from '../services/geminiService';
import { StockDetails } from '../types';
import StockSearch from './StockSearch';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const StockComparison: React.FC = () => {
  const [stock1Symbol, setStock1Symbol] = useState('MSFT');
  const [stock2Symbol, setStock2Symbol] = useState('AAPL');
  const [stock1Data, setStock1Data] = useState<StockDetails | null>(null);
  const [stock2Data, setStock2Data] = useState<StockDetails | null>(null);
  const [stock1ChartData, setStock1ChartData] = useState<any[]>([]);
  const [stock2ChartData, setStock2ChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('3 Months');

  const timeRanges = ['1 Day', '1 Week', '1 Month', '3 Months', '6 Months', '1 Year', '5 Years', 'All Time'];

  // Map time ranges to Yahoo Finance API parameters
  const getYahooParams = (range: string) => {
    const rangeMap: { [key: string]: { range: string; interval: string } } = {
      '1 Day': { range: '1d', interval: '5m' },
      '1 Week': { range: '5d', interval: '1h' },
      '1 Month': { range: '1mo', interval: '1d' },
      '3 Months': { range: '3mo', interval: '1d' },
      '6 Months': { range: '6mo', interval: '1d' },
      '1 Year': { range: '1y', interval: '1d' },
      '5 Years': { range: '5y', interval: '1wk' },
      'All Time': { range: 'max', interval: '1mo' }
    };
    return rangeMap[range] || { range: '3mo', interval: '1d' };
  };

  useEffect(() => {
    loadStockData();
  }, [stock1Symbol, stock2Symbol, timeRange]);

  const fetchChartData = async (symbol: string) => {
    try {
      const params = getYahooParams(timeRange);
      const apiUrl = `/api/yahoo-finance?symbol=${symbol}&range=${params.range}&interval=${params.interval}`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const result = await response.json();
        const quotes = result.chart?.result?.[0];
        
        if (quotes && quotes.timestamp && quotes.indicators?.quote?.[0]) {
          const timestamps = quotes.timestamp;
          const prices = quotes.indicators.quote[0].close;
          
          const historicalData = timestamps.map((ts: number, index: number) => ({
            date: new Date(ts * 1000).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              ...(timeRange === '1 Day' ? { hour: '2-digit', minute: '2-digit' } : {})
            }),
            price: prices[index] || 0
          })).filter((d: any) => d.price > 0);
          
          return historicalData;
        }
      }
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
    }
    return [];
  };

  const loadStockData = async () => {
    setLoading(true);
    try {
      const [data1, data2, chart1, chart2] = await Promise.all([
        fetchStockDetails(stock1Symbol),
        fetchStockDetails(stock2Symbol),
        fetchChartData(stock1Symbol),
        fetchChartData(stock2Symbol),
      ]);
      setStock1Data(data1);
      setStock2Data(data2);
      setStock1ChartData(chart1);
      setStock2ChartData(chart2);
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stock 1 Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              1ST STOCK
            </label>
            <StockSearch
              value={stock1Symbol}
              onSelect={(symbol) => setStock1Symbol(symbol)}
            />
          </div>

          {/* Stock 2 Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              2ND STOCK
            </label>
            <StockSearch
              value={stock2Symbol}
              onSelect={(symbol) => setStock2Symbol(symbol)}
            />
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
              <div className="h-64 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                {stock1ChartData && stock1ChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stock1ChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorStock1Positive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9}/>
                          <stop offset="50%" stopColor="#22c55e" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="colorStock1Negative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                          <stop offset="50%" stopColor="#ef4444" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#94a3b8' }} 
                        axisLine={{ stroke: '#475569' }} 
                        tickLine={{ stroke: '#475569' }}
                      />
                      <YAxis 
                        domain={['dataMin', 'dataMax']}
                        tick={{ fill: '#94a3b8' }} 
                        axisLine={{ stroke: '#475569' }} 
                        tickLine={{ stroke: '#475569' }}
                        tickFormatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#334155',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={stock1Data.change >= 0 ? '#22c55e' : '#ef4444'}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={stock1Data.change >= 0 ? 'url(#colorStock1Positive)' : 'url(#colorStock1Negative)'}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400 dark:text-gray-500">No chart data available</span>
                  </div>
                )}
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
              <div className="h-64 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                {stock2ChartData && stock2ChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stock2ChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorStock2Positive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9}/>
                          <stop offset="50%" stopColor="#22c55e" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3}/>
                        </linearGradient>
                        <linearGradient id="colorStock2Negative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                          <stop offset="50%" stopColor="#ef4444" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#94a3b8' }} 
                        axisLine={{ stroke: '#475569' }} 
                        tickLine={{ stroke: '#475569' }}
                      />
                      <YAxis 
                        domain={['dataMin', 'dataMax']}
                        tick={{ fill: '#94a3b8' }} 
                        axisLine={{ stroke: '#475569' }} 
                        tickLine={{ stroke: '#475569' }}
                        tickFormatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#334155',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={stock2Data.change >= 0 ? '#22c55e' : '#ef4444'}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={stock2Data.change >= 0 ? 'url(#colorStock2Positive)' : 'url(#colorStock2Negative)'}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400 dark:text-gray-500">No chart data available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
