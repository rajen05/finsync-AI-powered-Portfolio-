import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { fetchHeatmapData, fetchTopMoversData, fetchMarketData } from '../services/geminiService';
import { HeatmapStock, TopMover } from '../types';

interface MarketDataContextType {
  heatmapData: HeatmapStock[] | null;
  topMovers: TopMover[] | null;
  portfolioPrices: { [key: string]: number };
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
  refreshData: () => void;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

interface MarketDataProviderProps {
  children: ReactNode;
  portfolioTickers: string[];
}

// Polling interval: 5 minutes (reduced frequency to avoid excessive API calls)
const POLLING_INTERVAL = 5 * 60 * 1000;

export const MarketDataProvider: React.FC<MarketDataProviderProps> = ({ children, portfolioTickers }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapStock[] | null>(null);
  const [topMovers, setTopMovers] = useState<TopMover[] | null>(null);
  const [portfolioPrices, setPortfolioPrices] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the tickers string to prevent re-renders
  const portfolioTickersString = useMemo(() => portfolioTickers.sort().join(','), [portfolioTickers]);

  const fetchData = useCallback(async (isInitialLoad: boolean) => {
    console.log('📊 MarketDataProvider: Starting data fetch', { isInitialLoad });
    
    if (!isInitialLoad) {
      setIsRefreshing(true);
    }
    setError(null);

    const tickers = portfolioTickersString ? portfolioTickersString.split(',') : [];

    try {
      // Use Promise.allSettled to ensure one failed request doesn't stop others
      const results = await Promise.allSettled([
        fetchHeatmapData(),
        fetchTopMoversData(),
        tickers.length > 0 ? fetchMarketData(tickers) : Promise.resolve({}),
      ]);

      console.log('📊 MarketDataProvider: Fetch results', {
        heatmap: results[0].status,
        topMovers: results[1].status,
        portfolioPrices: results[2].status
      });

      if (results[0].status === 'fulfilled') {
        console.log('✅ Heatmap data received:', results[0].value?.length, 'items');
        setHeatmapData(results[0].value);
      } else {
        console.error('❌ Heatmap fetch failed:', results[0].reason);
      }
      
      if (results[1].status === 'fulfilled') {
        console.log('✅ Top movers received:', results[1].value?.length, 'items');
        setTopMovers(results[1].value);
      } else {
        console.error('❌ Top movers fetch failed:', results[1].reason);
      }
      
      if (results[2].status === 'fulfilled') {
        console.log('✅ Portfolio prices received');
        setPortfolioPrices(results[2].value);
      } else {
        console.error('❌ Portfolio prices fetch failed:', results[2].reason);
      }

      // Only show error if ALL critical data (heatmap + top movers) failed
      const criticalFailed = results[0].status === 'rejected' && results[1].status === 'rejected';
      if (criticalFailed) {
        console.error("❌ ALL market data sources failed");
        const errorMsg = results[0].status === 'rejected' ? results[0].reason?.message : 'Unknown error';
        setError(`Data fetch failed: ${errorMsg}. Please check your internet connection or add GEMINI_API_KEY to environment variables.`);
      } else if (results[0].status === 'rejected' || results[1].status === 'rejected') {
        console.warn("⚠️ Some data sources failed, but app is still functional");
        // Don't set error - app can still work with partial data
      }

    } catch (err) {
      console.error("A critical error occurred while fetching market data:", err);
      setError("Could not update market data. Please check your connection.");
    } finally {
      if (isInitialLoad) setIsLoading(false);
      setIsRefreshing(false);
      console.log('📊 MarketDataProvider: Fetch complete');
    }
  }, [portfolioTickersString]);

  useEffect(() => {
    fetchData(true); // Initial fetch
    const intervalId = setInterval(() => fetchData(false), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const refreshData = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchData(false);
  }, [fetchData]);

  const value = useMemo(() => ({
    heatmapData,
    topMovers,
    portfolioPrices,
    isLoading,
    error,
    isRefreshing,
    refreshData,
  }), [heatmapData, topMovers, portfolioPrices, isLoading, error, isRefreshing, refreshData]);

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};
