import React from 'react';
import { Holding, AssetType } from '../types';
import { StockIcon } from './icons/StockIcon';
import { CryptoIcon } from './icons/CryptoIcon';
import { prefetchStockDetails } from '../services/geminiService';

interface HoldingsTableProps {
  holdings: Holding[];
  isLoading: boolean;
  onRowClick: (ticker: string) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, isLoading, onRowClick }) => {
  const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) return <span className="text-slate-500">N/A</span>;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null || isNaN(value)) return '';
    const sign = value > 0 ? '+' : '';
    return `(${sign}${(value * 100).toFixed(2)}%)`;
  };

  const renderPL = (pl: number | null, plPercent: number | null) => {
    if (pl === null || isNaN(pl)) return <span className="text-slate-500">N/A</span>;
    const color = pl >= 0 ? 'text-green-500' : 'text-red-500';
    return (
      <div className="flex flex-col items-end">
        <span className={color}>{formatCurrency(pl)}</span>
        <span className={`text-xs ${color}`}>{formatPercent(plPercent)}</span>
      </div>
    );
  };

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4"><div className="h-6 w-6 rounded-full bg-slate-700"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-20"></div></td>
        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-700 rounded w-16"></div></td>
        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-700 rounded w-28"></div></td>
      </tr>
    ))
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-6 py-4 border-b border-gray-200 dark:border-slate-700">Holdings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider"></th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">Asset</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">Avg. Cost</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">Market Value</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">Unrealized P&L</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {isLoading && renderSkeleton()}
            {!isLoading && holdings.map((holding) => (
              <tr 
                key={holding.ticker} 
                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                onClick={() => onRowClick(holding.ticker)}
                onMouseEnter={() => prefetchStockDetails(holding.ticker)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 w-6">
                    {holding.assetType === AssetType.Stock ? <StockIcon /> : <CryptoIcon />}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{holding.ticker}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">{holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">{formatCurrency(holding.averageCost)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white font-semibold">{formatCurrency(holding.marketValue)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{renderPL(holding.unrealizedPL, holding.unrealizedPLPercent)}</td>
              </tr>
            ))}
            {!isLoading && holdings.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-500">
                  You have no holdings. Add a transaction to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;