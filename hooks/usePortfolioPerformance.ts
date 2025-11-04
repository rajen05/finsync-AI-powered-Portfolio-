import { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

export interface PerformanceDataPoint {
  date: string;
  value: number;
  cost: number;
  pl: number;
  plPercent: number;
}

export const usePortfolioPerformance = (
  transactions: Transaction[],
  currentPrices: { [ticker: string]: number }
): PerformanceDataPoint[] => {
  return useMemo(() => {
    if (transactions.length === 0) return [];

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get date range
    const firstDate = new Date(sortedTransactions[0].date);
    const today = new Date();
    
    // Generate daily data points
    const dataPoints: PerformanceDataPoint[] = [];
    const currentDate = new Date(firstDate);

    // Track holdings over time
    const holdings: { [ticker: string]: { quantity: number; totalCost: number } } = {};

    let transactionIndex = 0;

    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split('T')[0];

      // Process all transactions up to this date
      while (
        transactionIndex < sortedTransactions.length &&
        sortedTransactions[transactionIndex].date <= dateString
      ) {
        const tx = sortedTransactions[transactionIndex];
        
        if (!holdings[tx.ticker]) {
          holdings[tx.ticker] = { quantity: 0, totalCost: 0 };
        }

        if (tx.type === TransactionType.Buy) {
          holdings[tx.ticker].quantity += tx.quantity;
          holdings[tx.ticker].totalCost += tx.quantity * tx.price;
        } else {
          // Sell
          const costPerShare = holdings[tx.ticker].quantity > 0
            ? holdings[tx.ticker].totalCost / holdings[tx.ticker].quantity
            : 0;
          holdings[tx.ticker].quantity -= tx.quantity;
          holdings[tx.ticker].totalCost -= tx.quantity * costPerShare;
        }

        transactionIndex++;
      }

      // Calculate portfolio value at this date
      let totalValue = 0;
      let totalCost = 0;

      Object.entries(holdings).forEach(([ticker, holding]) => {
        if (holding.quantity > 0) {
          const currentPrice = currentPrices[ticker] || 0;
          totalValue += holding.quantity * currentPrice;
          totalCost += holding.totalCost;
        }
      });

      // Only add data point if there are holdings
      if (totalCost > 0) {
        const pl = totalValue - totalCost;
        const plPercent = totalCost > 0 ? (pl / totalCost) * 100 : 0;

        dataPoints.push({
          date: dateString,
          value: totalValue,
          cost: totalCost,
          pl,
          plPercent,
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dataPoints;
  }, [transactions, currentPrices]);
};
