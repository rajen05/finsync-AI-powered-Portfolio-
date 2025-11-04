import React, { useState, useMemo } from 'react';
import { Holding, AssetType } from '../types';
import { StockIcon } from './icons/StockIcon';
import { CryptoIcon } from './icons/CryptoIcon';
import { SearchIcon } from './icons/SearchIcon';
import { prefetchStockDetails } from '../services/geminiService';

type SortField = 'ticker' | 'value' | 'pl' | 'plPercent' | 'quantity';
type SortDirection = 'asc' | 'desc';

interface HoldingsTableProps {
  holdings: Holding[];
  isLoading: boolean;
  onRowClick: (ticker: string) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, isLoading, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsset, setFilterAsset] = useState<'all' | AssetType>('all');
  const [filterPerformance, setFilterPerformance] = useState<'all' | 'profit' | 'loss'>('all');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

  // Filter and sort holdings
  const filteredAndSortedHoldings = useMemo(() => {
    let result = [...holdings];

    // Search filter
    if (searchTerm) {
      result = result.filter(h => h.ticker.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Asset type filter
    if (filterAsset !== 'all') {
      result = result.filter(h => h.assetType === filterAsset);
    }

    // Performance filter
    if (filterPerformance === 'profit') {
      result = result.filter(h => h.unrealizedPL !== null && h.unrealizedPL > 0);
    } else if (filterPerformance === 'loss') {
      result = result.filter(h => h.unrealizedPL !== null && h.unrealizedPL < 0);
    }

    // Sort
    result.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortField) {
        case 'ticker':
          return sortDirection === 'asc' 
            ? a.ticker.localeCompare(b.ticker)
            : b.ticker.localeCompare(a.ticker);
        case 'value':
          aValue = a.marketValue || 0;
          bValue = b.marketValue || 0;
          break;
        case 'pl':
          aValue = a.unrealizedPL || 0;
          bValue = b.unrealizedPL || 0;
          break;
        case 'plPercent':
          aValue = a.unrealizedPLPercent || 0;
          bValue = b.unrealizedPLPercent || 0;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return result;
  }, [holdings, searchTerm, filterAsset, filterPerformance, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>;
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAsset('all');
    setFilterPerformance('all');
  };

  const hasActiveFilters = searchTerm || filterAsset !== 'all' || filterPerformance !== 'all';

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
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Holdings</h2>
        
        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search holdings..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Assets</option>
            <option value={AssetType.Stock}>Stocks Only</option>
            <option value={AssetType.Crypto}>Crypto Only</option>
          </select>

          <select
            value={filterPerformance}
            onChange={(e) => setFilterPerformance(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Performance</option>
            <option value="profit">Profitable Only</option>
            <option value="loss">Losing Only</option>
          </select>

          <span className="text-sm text-gray-600 dark:text-slate-400 ml-auto">
            Showing {filteredAndSortedHoldings.length} of {holdings.length}
          </span>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider"></th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('ticker')}
              >
                Asset <SortIcon field="ticker" />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('quantity')}
              >
                Quantity <SortIcon field="quantity" />
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">Avg. Cost</th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('value')}
              >
                Market Value <SortIcon field="value" />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-gray-900 dark:hover:text-white"
                onClick={() => handleSort('pl')}
              >
                Unrealized P&L <SortIcon field="pl" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {isLoading && renderSkeleton()}
            {!isLoading && filteredAndSortedHoldings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                  {hasActiveFilters ? (
                    <div>
                      <p className="text-lg mb-2">🔍 No holdings match your filters</p>
                      <button
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <p>No holdings yet</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredAndSortedHoldings.map((holding) => (
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
            )))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default HoldingsTable;