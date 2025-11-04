// Fix: This file was a placeholder. It is now implemented as a React component to display a stock market heatmap.
import React, { useMemo } from 'react';
import { useMarketData } from '../context/MarketDataProvider';
import { HeatmapStock } from '../types';

const Heatmap: React.FC = () => {
  const { heatmapData, isLoading, error } = useMarketData();

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
    if (changePercent > 2) return 'bg-green-600 hover:bg-green-500';
    if (changePercent > 0) return 'bg-green-800 hover:bg-green-700';
    if (changePercent < -2) return 'bg-red-600 hover:bg-red-500';
    if (changePercent < 0) return 'bg-red-800 hover:bg-red-700';
    return 'bg-slate-700 hover:bg-slate-600';
  };

  if (isLoading && !heatmapData) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-500 bg-slate-800 rounded-lg">{error}</div>;
  }
  
  if (!heatmapData || heatmapData.length === 0) {
    return <div className="text-center p-10 bg-slate-800 rounded-lg">No heatmap data available.</div>;
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
      <div className="space-y-6">
        {Object.entries(sectors).sort(([sectorA], [sectorB]) => sectorA.localeCompare(sectorB)).map(([sectorName, stocks]) => (
          <div key={sectorName}>
            <h3 className="text-lg font-semibold text-white mb-3 px-2">{sectorName}</h3>
            <div className="flex flex-wrap gap-1">
              {stocks.sort((a,b) => b.marketCap - a.marketCap).map(stock => (
                <div 
                  key={stock.ticker} 
                  className={`p-2 rounded-md text-white transition-colors cursor-pointer flex flex-col justify-between h-20 ${getColor(stock.changePercent)}`}
                  style={{
                    // Use flex-grow and flex-basis for a more responsive treemap-like feel
                    flexGrow: stock.marketCap,
                    flexBasis: '80px'
                  }}
                  title={`${stock.companyName} (${stock.ticker})\nMarket Cap: $${(stock.marketCap / 1e9).toFixed(2)}B\nChange: ${stock.changePercent.toFixed(2)}%`}
                >
                  <div className="font-bold text-sm truncate">{stock.ticker}</div>
                  <div className="text-xs text-center font-semibold">{stock.changePercent.toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
