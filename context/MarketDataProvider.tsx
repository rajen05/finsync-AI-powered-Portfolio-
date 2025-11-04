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
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

interface MarketDataProviderProps {
  children: ReactNode;
  portfolioTickers: string[];
}

// Polling interval: 30 seconds.
const POLLING_INTERVAL = 30 * 1000;

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

      if (results[0].status === 'fulfilled') setHeatmapData(results[0].value);
      if (results[1].status === 'fulfilled') setTopMovers(results[1].value);
      if (results[2].status === 'fulfilled') setPortfolioPrices(results[2].value);

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error("Some market data failed to update:", failed);
        setError("Could not update all market data.");
      }

    } catch (err) {
      console.error("A critical error occurred while fetching market data:", err);
      setError("Could not update market data. Please check your connection.");
    } finally {
      if (isInitialLoad) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [portfolioTickersString]);

  useEffect(() => {
    fetchData(true); // Initial fetch
    const intervalId = setInterval(() => fetchData(false), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const value = useMemo(() => ({
    heatmapData,
    topMovers,
    portfolioPrices,
    isLoading,
    error,
    isRefreshing,
  }), [heatmapData, topMovers, portfolioPrices, isLoading, error, isRefreshing]);

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
