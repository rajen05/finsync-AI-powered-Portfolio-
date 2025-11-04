import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, AssetType } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface TransactionsTableProps {
  transactions: Transaction[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterAsset, setFilterAsset] = useState<'all' | AssetType>('all');
  const [filterBroker, setFilterBroker] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Get unique brokers for filter
  const brokers = useMemo(() => {
    const uniqueBrokers = new Set(transactions.map(tx => tx.broker).filter(Boolean));
    return Array.from(uniqueBrokers).sort();
  }, [transactions]);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search filter
      if (searchTerm && !tx.ticker.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Transaction type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Asset type filter
      if (filterAsset !== 'all' && tx.assetType !== filterAsset) {
        return false;
      }

      // Broker filter
      if (filterBroker !== 'all' && tx.broker !== filterBroker) {
        return false;
      }

      // Date range filter
      if (dateFrom && tx.date < dateFrom) {
        return false;
      }
      if (dateTo && tx.date > dateTo) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, filterType, filterAsset, filterBroker, dateFrom, dateTo]);

  // Calculate filtered stats
  const stats = useMemo(() => {
    const totalBuys = filteredTransactions.filter(tx => tx.type === TransactionType.Buy).length;
    const totalSells = filteredTransactions.filter(tx => tx.type === TransactionType.Sell).length;
    const totalValue = filteredTransactions.reduce((sum, tx) => sum + (tx.quantity * tx.price), 0);
    return { totalBuys, totalSells, totalValue, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterAsset('all');
    setFilterBroker('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterAsset !== 'all' || filterBroker !== 'all' || dateFrom || dateTo;

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-10 text-center border border-slate-700">
        <p className="text-slate-500">No transactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticker (e.g., AAPL, BTC-USD)..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Transaction Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value={TransactionType.Buy}>Buy Only</option>
            <option value={TransactionType.Sell}>Sell Only</option>
          </select>

          {/* Asset Type */}
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assets</option>
            <option value={AssetType.Stock}>Stocks Only</option>
            <option value={AssetType.Crypto}>Crypto Only</option>
          </select>

          {/* Broker */}
          <select
            value={filterBroker}
            onChange={(e) => setFilterBroker(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Brokers</option>
            {brokers.map(broker => (
              <option key={broker} value={broker}>{broker}</option>
            ))}
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From date"
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To date"
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Clear Filters & Stats */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-slate-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{stats.count}</span> of {transactions.length} transactions
            </span>
            <span className="text-gray-600 dark:text-slate-400">•</span>
            <span className="text-green-600 dark:text-green-400">{stats.totalBuys} Buys</span>
            <span className="text-red-600 dark:text-red-400">{stats.totalSells} Sells</span>
            <span className="text-gray-600 dark:text-slate-400">•</span>
            <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(stats.totalValue)}</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wider">Ticker</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Broker</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-500 dark:text-slate-400">
                    {hasActiveFilters ? (
                      <div>
                        <p className="text-lg mb-2">🔍 No transactions match your filters</p>
                        <button
                          onClick={clearFilters}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Clear filters to see all transactions
                        </button>
                      </div>
                    ) : (
                      <p>No transactions recorded yet.</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{tx.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tx.ticker}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tx.type === TransactionType.Buy ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">{tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">{formatCurrency(tx.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white font-medium hidden sm:table-cell">{formatCurrency(tx.quantity * tx.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 hidden md:table-cell">{tx.broker || '--'}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default TransactionsTable;