// TradingView-style treemap heatmap
import React, { useMemo, useState, useEffect } from 'react';
import { useMarketData } from '../context/MarketDataProvider';
import { HeatmapStock } from '../types';

const Heatmap: React.FC = () => {
  const { heatmapData, isLoading, error } = useMarketData();
  const [dataSource, setDataSource] = useState<string>('Loading...');

  // Detect data source from console logs
  useEffect(() => {
    if (heatmapData && heatmapData.length > 0) {
      // Check localStorage to see if data was cached
      const cached = localStorage.getItem('heatmap-data');
      if (cached) {
        setDataSource('Cached Data');
      } else {
        setDataSource('Live Data');
      }
    }
  }, [heatmapData]);

  const sectors = useMemo(() => {
    if (!heatmapData) return {};
    return heatmapData.reduce((acc, stock) => {
      if (!acc[stock.sector]) {
        acc[stock.sector] = [];
      }
      acc[stock.sector].push(stock);
      return acc;
    }, {} as { [sector: string]: HeatmapStock[] });
  }, [heatmapData]);

  const getColor = (changePercent: number) => {
    // More granular color scale like TradingView
    if (changePercent > 5) return 'bg-green-500';
    if (changePercent > 3) return 'bg-green-600';
    if (changePercent > 1) return 'bg-green-700';
    if (changePercent > 0) return 'bg-green-800';
    if (changePercent > -1) return 'bg-red-800';
    if (changePercent > -3) return 'bg-red-700';
    if (changePercent > -5) return 'bg-red-600';
    return 'bg-red-500';
  };

  const getTextColor = (changePercent: number) => {
    // Lighter text for darker backgrounds
    if (Math.abs(changePercent) > 3) return 'text-white';
    return 'text-gray-200';
  };

  // Calculate relative size for treemap
  const getSizeMultiplier = (marketCap: number, maxCap: number) => {
    return Math.sqrt(marketCap / maxCap) * 100;
  };

  if (isLoading && !heatmapData) {
    return (
      <div className="bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-700 min-h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-500 bg-slate-900 rounded-lg">{error}</div>;
  }
  
  if (!heatmapData || heatmapData.length === 0) {
    return <div className="text-center p-10 bg-slate-900 rounded-lg">No heatmap data available.</div>;
  }

  return (
    <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
      {/* Compact Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Market Heatmap</h2>
          <p className="text-xs text-slate-400">Size: Market Cap • Color: % Change</p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Data Source Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-300 font-medium">{dataSource}</span>
            <span className="text-xs text-slate-500">• {heatmapData?.length || 0} stocks</span>
          </div>
          
          {/* Inline Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-slate-300">&gt;5%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-700 rounded"></div>
              <span className="text-slate-300">0-5%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-700 rounded"></div>
              <span className="text-slate-300">0-5%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-slate-300">&lt;-5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Treemap - Scrollable without visible scrollbar */}
      <div 
        className="p-3 bg-slate-900 overflow-y-auto" 
        style={{ 
          height: 'calc(100vh - 180px)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="grid gap-2" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gridAutoRows: 'minmax(150px, auto)'
        }}>
          {Object.entries(sectors)
            .sort(([, a], [, b]) => {
              const sumA = a.reduce((sum, s) => sum + s.marketCap, 0);
              const sumB = b.reduce((sum, s) => sum + s.marketCap, 0);
              return sumB - sumA;
            })
            .map(([sectorName, stocks]) => {
              const sortedStocks = stocks.sort((a, b) => b.marketCap - a.marketCap);
              const totalSectorCap = sortedStocks.reduce((sum, s) => sum + s.marketCap, 0);

              return (
                <div 
                  key={sectorName} 
                  className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-2 flex flex-col"
                >
                  {/* Sector Label */}
                  <div className="text-xs font-bold text-slate-300 mb-2 px-1 truncate border-b border-slate-700/50 pb-1">
                    {sectorName}
                  </div>
                  
                  {/* Stocks Grid - Fixed Structure */}
                  <div className="flex-1 grid gap-1.5" style={{
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gridAutoRows: 'minmax(75px, auto)',
                    alignContent: 'start'
                  }}>
                    {sortedStocks.map(stock => {
                      const relativeSize = stock.marketCap / totalSectorCap;
                      const isLarge = relativeSize > 0.35;
                      
                      // Generate logo placeholder with first letter
                      const logoLetter = stock.ticker.charAt(0);
                      
                      return (
                        <div
                          key={stock.ticker}
                          className={`${getColor(stock.changePercent)} ${getTextColor(stock.changePercent)} rounded-lg transition-all hover:scale-[1.02] hover:shadow-lg hover:z-50 cursor-pointer p-2.5 flex flex-col justify-between relative group border border-black/20`}
                          style={{
                            gridColumn: isLarge ? 'span 2' : 'span 1',
                            minHeight: '75px'
                          }}
                        >
                          {/* Top Row: Ticker and Logo */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="font-bold text-sm tracking-wide">
                              {stock.ticker}
                            </div>
                            
                            {/* Logo Circle - Always shows letter, image overlay if available */}
                            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 relative">
                              <span className="text-slate-800 font-bold text-xs">{logoLetter}</span>
                              {stock.logoUrl && (
                                <img 
                                  src={stock.logoUrl} 
                                  alt={stock.ticker}
                                  className="absolute inset-0 w-full h-full object-contain rounded-full p-1"
                                  onError={(e) => { 
                                    // Hide image if it fails to load, letter shows underneath
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          
                          {/* Company name for large tiles */}
                          {isLarge && (
                            <div className="text-[10px] opacity-75 truncate mb-1">
                              {stock.companyName}
                            </div>
                          )}
                          
                          {/* Percentage - Bottom */}
                          <div className="font-bold text-base mt-auto" style={{
                            textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                          }}>
                            {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>

                          {/* Enhanced Hover tooltip - Stays within viewport */}
                          <div className="absolute hidden group-hover:block bg-slate-950 text-white text-xs p-3 rounded-lg shadow-2xl z-[100] w-44 border border-slate-600 pointer-events-none" 
                            style={{
                              top: '100%',
                              marginTop: '8px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              maxWidth: 'calc(100vw - 32px)'
                            }}>
                            {/* Tooltip arrow pointing up */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-px">
                              <div className="border-4 border-transparent border-b-slate-950"></div>
                            </div>
                            
                            <div className="font-bold text-xs mb-1 truncate">{stock.companyName}</div>
                            <div className="text-slate-300 space-y-0.5 text-[10px]">
                              <div className="flex justify-between">
                                <span>Ticker:</span>
                                <span className="text-white font-semibold">{stock.ticker}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cap:</span>
                                <span className="text-white font-semibold">${(stock.marketCap / 1e9).toFixed(1)}B</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Change:</span>
                                <span className={`font-semibold ${stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
