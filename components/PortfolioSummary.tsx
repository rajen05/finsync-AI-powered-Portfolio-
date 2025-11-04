import React from 'react';
import { PortfolioSummary as PortfolioSummaryType } from '../types';

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
  isLoading: boolean;
}

const SummaryCard: React.FC<{ title: string; value: string | React.ReactNode; isLoading: boolean, className?: string }> = ({ title, value, isLoading, className }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 transition-colors ${className}`}>
    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
    {isLoading ? (
      <div className="animate-pulse bg-slate-700 h-8 w-3/4 rounded-md mt-2"></div>
    ) : (
      <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
    )}
  </div>
);

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ summary, isLoading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const plColor = summary.totalPL >= 0 ? 'text-green-500' : 'text-red-500';

  const plValue = (
    <span className={plColor}>
      {formatCurrency(summary.totalPL)}
    </span>
  );

  const plPercentValue = (
      <span className={`text-base font-normal ml-2 ${plColor}`}>
        ({summary.totalPLPercent >= 0 ? '+' : ''}{(summary.totalPLPercent * 100).toFixed(2)}%)
      </span>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard title="Total Value" value={formatCurrency(summary.totalValue)} isLoading={isLoading} />
      <SummaryCard title="Total Cost" value={formatCurrency(summary.totalCost)} isLoading={isLoading} />
      <SummaryCard 
        title="Unrealized P&L" 
        value={<>{plValue}{!isLoading && !isNaN(summary.totalPLPercent) && plPercentValue}</>} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default PortfolioSummary;