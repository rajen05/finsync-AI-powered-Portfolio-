// TradingView-style treemap heatmap
import React, { useMemo, useState, useEffect } from 'react';
import { useMarketData } from '../context/MarketDataProvider';
import { HeatmapStock } from '../types';

const Heatmap: React.FC = () => {
  const { heatmapData, isLoading, error, refreshData } = useMarketData();
  const [dataSource, setDataSource] = useState<string>('Loading...');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Detect data source from console logs
  useEffect(() => {
    if (heatmapData && heatmapData.length > 0) {
      // Check localStorage to see if data was cached
      const cached = localStorage.getItem('heatmap-data');
      if (cached) {
        const cacheData = JSON.parse(cached);
        const cacheAge = Date.now() - cacheData.timestamp;
        if (cacheAge < 60000) { // Less than 1 minute
          setDataSource('Live Data');
        } else {
          setDataSource('Cached Data');
        }
        setLastUpdate(new Date(cacheData.timestamp));
      } else {
        setDataSource('Live Data');
        setLastUpdate(new Date());
      }
    }
  }, [heatmapData]);

  const handleRefresh = () => {
    // Clear cache and refresh
    localStorage.removeItem('heatmap-data');
    localStorage.removeItem('top-movers');
    refreshData();
  };

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

  // Calculate total market cap for sizing
  const totalMarketCap = useMemo(() => {
    if (!heatmapData) return 0;
    return heatmapData.reduce((sum, stock) => sum + stock.marketCap, 0);
  }, [heatmapData]);

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
        
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg transition-colors text-sm"
            title="Refresh data"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-medium">Refresh</span>
          </button>
          
          {/* Data Source Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-300 font-medium">{dataSource}</span>
            <span className="text-xs text-slate-500">• {heatmapData?.length || 0} stocks</span>
          </div>
        </div>
      </div>

      {/* TradingView-style Treemap */}
      <div 
        className="p-0.5 bg-slate-950 overflow-hidden" 
        style={{ 
          height: 'calc(100vh - 180px)'
        }}
      >
        <div className="flex flex-wrap gap-0.5 h-full content-start">
          {Object.entries(sectors)
            .sort(([, a], [, b]) => {
              const sumA = a.reduce((sum, s) => sum + s.marketCap, 0);
              const sumB = b.reduce((sum, s) => sum + s.marketCap, 0);
              return sumB - sumA;
            })
            .map(([sectorName, stocks]) => {
              const sortedStocks = stocks.sort((a, b) => b.marketCap - a.marketCap);
              const totalSectorCap = sortedStocks.reduce((sum, s) => sum + s.marketCap, 0);
              const sectorPercentage = (totalSectorCap / totalMarketCap) * 100;
              
              // Calculate flexible sizing based on sector percentage
              let minWidth = '200px';
              let minHeight = '140px';
              let flexBasis = '20%';
              
              if (sectorPercentage > 25) {
                minWidth = '320px';
                minHeight = '200px';
                flexBasis = '35%';
              } else if (sectorPercentage > 15) {
                minWidth = '260px';
                minHeight = '170px';
                flexBasis = '28%';
              } else if (sectorPercentage > 8) {
                minWidth = '220px';
                minHeight = '150px';
                flexBasis = '23%';
              }

              return (
                <div 
                  key={sectorName} 
                  className="border border-slate-700/60 relative bg-slate-900/40"
                  style={{
                    flexGrow: sectorPercentage,
                    flexBasis: flexBasis,
                    minWidth: minWidth,
                    minHeight: minHeight,
                    maxHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Sector Label - Top Left Corner */}
                  <div className="absolute top-1 left-1 text-[9px] font-semibold text-white/90 bg-slate-900/80 px-1.5 py-0.5 rounded z-10 backdrop-blur-sm border border-slate-700/40">
                    {sectorName} →
                  </div>
                  
                  {/* Nested Stock Tiles - Variable Sizing Based on Market Cap */}
                  <div className="flex flex-wrap gap-0.5 w-full h-full p-0.5">
                    {sortedStocks.map(stock => {
                      const stockPercentage = (stock.marketCap / totalSectorCap) * 100;
                      
                      // Calculate size based on market cap percentage
                      let minWidth = '50px';
                      let minHeight = '45px';
                      let flexGrow = stockPercentage;
                      let flexBasis = '0';
                      
                      if (stockPercentage > 30) {
                        // Very large stocks
                        minWidth = '120px';
                        minHeight = '90px';
                        flexBasis = '38%';
                      } else if (stockPercentage > 20) {
                        // Large stocks
                        minWidth = '95px';
                        minHeight = '75px';
                        flexBasis = '30%';
                      } else if (stockPercentage > 12) {
                        // Medium stocks
                        minWidth = '75px';
                        minHeight = '60px';
                        flexBasis = '22%';
                      } else if (stockPercentage > 7) {
                        // Small-medium stocks
                        minWidth = '60px';
                        minHeight = '50px';
                        flexBasis = '16%';
                      } else {
                        // Small stocks
                        minWidth = '50px';
                        minHeight = '45px';
                        flexBasis = '13%';
                      }
                      
                      const isLargeStock = stockPercentage > 20;
                      
                      return (
                        <div
                          key={stock.ticker}
                          className={`${getColor(stock.changePercent)} ${getTextColor(stock.changePercent)} transition-all hover:brightness-110 hover:z-50 cursor-pointer p-2 flex flex-col justify-between relative group border border-black/20`}
                          style={{
                            flexGrow: flexGrow,
                            flexBasis: flexBasis,
                            minWidth: minWidth,
                            minHeight: minHeight,
                            maxWidth: stockPercentage > 30 ? '45%' : stockPercentage > 20 ? '35%' : '25%'
                          }}
                        >
                          {/* Top Section: Logo and Ticker */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col">
                              <div className="font-bold text-sm tracking-tight mb-0.5">
                                {stock.ticker}
                              </div>
                              {isLargeStock && (
                                <div className="text-[9px] opacity-80 leading-tight max-w-[100px] truncate">
                                  {stock.companyName}
                                </div>
                              )}
                            </div>
                            
                            {/* Stock Logo */}
                            <div className="w-7 h-7 bg-white/95 rounded flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                              {stock.logoUrl ? (
                                <img 
                                  src={stock.logoUrl} 
                                  alt={stock.ticker}
                                  className="w-full h-full object-contain p-0.5"
                                  onError={(e) => { 
                                    // Replace with letter on error
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<span class="text-slate-800 font-bold text-xs">${stock.ticker.charAt(0)}</span>`;
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-slate-800 font-bold text-xs">
                                  {stock.ticker.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Bottom Section: Percentage */}
                          <div className="font-bold text-base mt-auto" style={{
                            textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                          }}>
                            {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>

                          {/* Enhanced Hover Tooltip */}
                          <div className="absolute hidden group-hover:block bg-slate-900 text-white text-xs p-3 rounded-lg shadow-2xl z-[100] w-48 border border-slate-600 pointer-events-none" 
                            style={{
                              top: '100%',
                              marginTop: '6px',
                              left: '50%',
                              transform: 'translateX(-50%)'
                            }}>
                            {/* Tooltip Arrow */}
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                              <div className="w-2 h-2 bg-slate-900 border-l border-t border-slate-600 rotate-45"></div>
                            </div>
                            
                            <div className="font-bold text-sm mb-2 truncate">{stock.companyName}</div>
                            <div className="text-slate-300 space-y-1 text-[11px]">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Ticker:</span>
                                <span className="text-white font-semibold">{stock.ticker}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Market Cap:</span>
                                <span className="text-white font-semibold">${(stock.marketCap / 1e9).toFixed(2)}B</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Change:</span>
                                <span className={`font-bold ${stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-1 border-t border-slate-700">
                                <span className="text-slate-400">Sector:</span>
                                <span className="text-white text-[10px]">{sectorName}</span>
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
