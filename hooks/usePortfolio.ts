import { useState, useEffect, useMemo } from 'react';
import { Transaction, Holding, PortfolioSummary, TransactionType, AssetType } from '../types';
import { useMarketData } from '../context/MarketDataProvider';

export const usePortfolio = (transactions: Transaction[]) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalCost: 0,
    totalPL: 0,
    totalPLPercent: 0,
  });
  const [allocationData, setAllocationData] = useState<{ name: string; value: number; type: AssetType }[]>([]);
  
  const { portfolioPrices, isLoading: isMarketDataLoading } = useMarketData();

  const baseHoldings = useMemo(() => {
    console.log('🔄 usePortfolio: Calculating base holdings from transactions:', transactions.length);
    const calculatedHoldings: { [key: string]: Holding } = {};
    transactions
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((tx) => {
        let holding = calculatedHoldings[tx.ticker];
        if (!holding) {
          holding = {
            ticker: tx.ticker,
            assetType: tx.assetType,
            quantity: 0,
            totalCost: 0,
            averageCost: 0,
            currentPrice: null,
            marketValue: null,
            unrealizedPL: null,
            unrealizedPLPercent: null,
          };
        }

        if (tx.type === TransactionType.Buy) {
          holding.totalCost += tx.quantity * tx.price;
          holding.quantity += tx.quantity;
        } else { // Sell
          const costOfSoldShares = holding.quantity > 0 ? (holding.totalCost / holding.quantity) * tx.quantity : 0;
          holding.totalCost -= costOfSoldShares;
          holding.quantity -= tx.quantity;
        }
        
        holding.averageCost = holding.quantity > 0 ? holding.totalCost / holding.quantity : 0;
        calculatedHoldings[tx.ticker] = holding;
      });
      return Object.values(calculatedHoldings).filter(h => h.quantity > 0.000001);
  }, [transactions]);


  useEffect(() => {
    console.log('💼 usePortfolio: Calculating portfolio', {
      isMarketDataLoading,
      baseHoldingsCount: baseHoldings.length,
      portfolioPricesCount: Object.keys(portfolioPrices).length,
      portfolioPrices
    });

    if (isMarketDataLoading && baseHoldings.length > 0) {
      // The provider is loading for the first time, don't compute until it's done.
      console.log('⏳ usePortfolio: Waiting for market data to load');
      return;
    }

    if (baseHoldings.length === 0) {
      console.log('📭 usePortfolio: No holdings, setting empty state');
      setHoldings([]);
      setSummary({ totalValue: 0, totalCost: 0, totalPL: 0, totalPLPercent: 0 });
      setAllocationData([]);
      return;
    }

    let totalValue = 0;
    let totalCost = 0;

    const finalHoldings = baseHoldings.map((h) => {
      const currentPrice = portfolioPrices[h.ticker] ?? null;
      const newHolding = {...h, currentPrice };

      console.log(`💰 Processing ${h.ticker}:`, {
        quantity: h.quantity,
        totalCost: h.totalCost,
        currentPrice,
        marketValue: currentPrice ? h.quantity * currentPrice : null
      });

      if (currentPrice !== null) {
        newHolding.marketValue = newHolding.quantity * currentPrice;
        newHolding.unrealizedPL = newHolding.marketValue - newHolding.totalCost;
        newHolding.unrealizedPLPercent = newHolding.totalCost > 0 ? newHolding.unrealizedPL / newHolding.totalCost : 0;
        totalValue += newHolding.marketValue;
      } else {
        console.warn(`⚠️ No price found for ${h.ticker}`);
      }
      totalCost += newHolding.totalCost;
      return newHolding;
    });

    const totalPL = totalValue - totalCost;
    const totalPLPercent = totalCost > 0 ? totalPL / totalCost : 0;
    
    console.log('📊 Portfolio Summary:', {
      totalValue,
      totalCost,
      totalPL,
      totalPLPercent
    });
    
    setHoldings(finalHoldings);
    setSummary({ totalValue, totalCost, totalPL, totalPLPercent });

    const newAllocationData = finalHoldings.map(h => ({
        name: h.ticker,
        value: h.marketValue ?? 0,
        type: h.assetType,
    })).filter(d => d.value > 0);
    setAllocationData(newAllocationData);

  }, [baseHoldings, portfolioPrices, isMarketDataLoading]);

  // The isLoading prop now reflects the provider's initial loading state.
  return { holdings, summary, allocationData, isLoading: isMarketDataLoading && baseHoldings.length > 0 };
};
