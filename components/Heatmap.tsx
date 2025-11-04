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
        className="bg-slate-950 p-1 overflow-auto" 
        style={{ 
          height: 'calc(100vh - 180px)'
        }}
      >
        <div className="grid gap-1" style={{
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridAutoRows: 'minmax(70px, auto)',
          height: '100%'
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
              const sectorPercentage = (totalSectorCap / totalMarketCap) * 100;
              
              // Calculate grid spans based on size
              let colSpan = 1;
              let rowSpan = 1;
              
              if (sectorPercentage > 25) {
                colSpan = 2;
                rowSpan = 2;
              } else if (sectorPercentage > 15) {
                colSpan = 2;
                rowSpan = 1;
              } else if (sectorPercentage > 8) {
                colSpan = 1;
                rowSpan = 2;
              }

              return (
                <div 
                  key={sectorName} 
                  className="border border-slate-700 relative overflow-hidden bg-slate-900/30"
                  style={{
                    gridColumn: `span ${colSpan}`,
                    gridRow: `span ${rowSpan}`
                  }}
                >
                  {/* Sector Label */}
                  <div className="absolute top-1 left-1 text-[9px] font-semibold text-white bg-black/70 px-1.5 py-0.5 rounded z-20">
                    {sectorName} →
                  </div>
                  
                  {/* Stock Tiles Grid */}
                  <div className="grid gap-0.5 w-full h-full p-0.5" style={{
                    gridTemplateColumns: colSpan > 1 ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                    gridAutoRows: 'minmax(55px, 1fr)'
                  }}>
                    {sortedStocks.map(stock => {
                      const stockPercentage = (stock.marketCap / totalSectorCap) * 100;
                      const isLarge = stockPercentage > 30;
                      
                      return (
                        <div
                          key={stock.ticker}
                          className={`${getColor(stock.changePercent)} ${getTextColor(stock.changePercent)} transition-all hover:brightness-110 cursor-pointer p-1.5 flex flex-col justify-between relative group border border-black/20`}
                          style={{
                            gridColumn: isLarge ? 'span 2' : 'span 1',
                            gridRow: isLarge ? 'span 2' : 'span 1'
                          }}
                        >
                        {/* Ticker and Logo */}
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-bold text-xs">{stock.ticker}</div>
                          <div className="w-6 h-6 bg-white/95 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {stock.logoUrl ? (
                              <img 
                                src={stock.logoUrl} 
                                alt={stock.ticker}
                                className="w-full h-full object-contain p-0.5"
                                onError={(e) => { 
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<span class="text-slate-800 font-bold text-[10px]">${stock.ticker.charAt(0)}</span>`;
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-slate-800 font-bold text-[10px]">
                                {stock.ticker.charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Percentage */}
                        <div className="font-bold text-sm" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
                          {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>

                        {/* Tooltip */}
                        <div className="absolute hidden group-hover:block bg-slate-900 text-white text-xs p-2 rounded shadow-2xl z-[100] w-40 border border-slate-600 pointer-events-none" 
                          style={{top: '100%', marginTop: '4px', left: '50%', transform: 'translateX(-50%)'}}>
                          <div className="font-bold mb-1 truncate">{stock.companyName}</div>
                          <div className="text-slate-300 space-y-0.5 text-[10px]">
                            <div className="flex justify-between">
                              <span>Cap:</span>
                              <span className="text-white font-semibold">${(stock.marketCap / 1e9).toFixed(1)}B</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Change:</span>
                              <span className={`font-bold ${stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
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
