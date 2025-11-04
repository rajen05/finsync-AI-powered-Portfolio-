import React, { useState, useEffect } from 'react';
import { WishlistItem, AssetType } from '../types';
import { useMarketData } from '../context/MarketDataProvider';
import { PlusIcon } from './icons/PlusIcon';
import { CloseIcon } from './icons/CloseIcon';

interface WishlistProps {
  wishlist: WishlistItem[];
  onAddItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<WishlistItem>) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ wishlist, onAddItem, onRemoveItem, onUpdateItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    ticker: '',
    assetType: AssetType.Stock,
    targetPrice: '',
    notes: '',
  });
  const { portfolioPrices } = useMarketData();

  // Enrich wishlist with current prices
  const enrichedWishlist = wishlist.map(item => {
    const currentPrice = portfolioPrices[item.ticker] || null;
    let priceChange = null;
    let priceChangePercent = null;
    let alertTriggered = false;

    if (currentPrice && item.targetPrice) {
      priceChange = currentPrice - item.targetPrice;
      priceChangePercent = (priceChange / item.targetPrice) * 100;
      alertTriggered = currentPrice >= item.targetPrice;
    }

    return {
      ...item,
      currentPrice,
      priceChange,
      priceChangePercent,
      alertTriggered,
    };
  });

  const handleAddItem = () => {
    if (!newItem.ticker.trim()) return;

    onAddItem({
      ticker: newItem.ticker.toUpperCase().trim(),
      assetType: newItem.assetType,
      targetPrice: newItem.targetPrice ? parseFloat(newItem.targetPrice) : null,
      notes: newItem.notes.trim(),
    });

    setNewItem({
      ticker: '',
      assetType: AssetType.Stock,
      targetPrice: '',
      notes: '',
    });
    setIsModalOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Track stocks and crypto you're interested in
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center transition-colors shadow-md"
        >
          <PlusIcon />
          <span className="ml-2">Add to Watchlist</span>
        </button>
      </div>

      {/* Wishlist Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        {enrichedWishlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👀</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-4">
              Start tracking stocks and crypto you're interested in
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Target Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {enrichedWishlist.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.ticker}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.assetType === AssetType.Stock
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {item.assetType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.currentPrice !== null && item.currentPrice !== undefined ? (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.currentPrice)}
                          </div>
                          {item.priceChangePercent !== null && (
                            <div className={`text-xs ${item.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.priceChangePercent >= 0 ? '+' : ''}
                              {item.priceChangePercent.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500 text-sm">Loading...</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.targetPrice ? (
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(item.targetPrice)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.targetPrice && item.currentPrice ? (
                        item.alertTriggered ? (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Target Hit! 🎯
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-slate-400">
                            {((item.currentPrice / item.targetPrice - 1) * 100).toFixed(1)}% away
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-slate-400 max-w-xs truncate">
                        {item.notes || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Remove from watchlist"
                      >
                        <CloseIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Add to Watchlist
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ticker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Ticker Symbol *
                </label>
                <input
                  type="text"
                  value={newItem.ticker}
                  onChange={(e) => setNewItem({ ...newItem, ticker: e.target.value.toUpperCase() })}
                  placeholder="e.g., AAPL, BTC-USD"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Asset Type
                </label>
                <select
                  value={newItem.assetType}
                  onChange={(e) => setNewItem({ ...newItem, assetType: e.target.value as AssetType })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value={AssetType.Stock}>Stock</option>
                  <option value={AssetType.Crypto}>Crypto</option>
                </select>
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Target Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.targetPrice}
                  onChange={(e) => setNewItem({ ...newItem, targetPrice: e.target.value })}
                  placeholder="e.g., 150.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  You'll be notified when the price reaches this target
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Why are you watching this?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.ticker.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
