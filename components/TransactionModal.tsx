import React, { useState } from 'react';
import { Transaction, AssetType, TransactionType } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import StockSearch from './StockSearch';

interface TransactionModalProps {
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ onClose, onAddTransaction }) => {
  const [ticker, setTicker] = useState('');
  const [assetType, setAssetType] = useState<AssetType>(AssetType.Stock);
  const [type, setType] = useState<TransactionType>(TransactionType.Buy);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [broker, setBroker] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction({
      ticker: ticker.toUpperCase(),
      assetType,
      type,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      date,
      broker,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-md p-8 m-4 relative transform transition-all border border-gray-200 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <CloseIcon />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            
          <div>
            <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ticker</label>
            <StockSearch
              value={ticker}
              onSelect={(selectedSymbol) => setTicker(selectedSymbol)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="assetType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asset Type</label>
              <select id="assetType" value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)} className="mt-1 block w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                <option value={AssetType.Stock}>Stock</option>
                <option value={AssetType.Crypto}>Crypto</option>
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as TransactionType)} className="mt-1 block w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
                <option value={TransactionType.Buy}>Buy</option>
                <option value={TransactionType.Sell}>Sell</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
              <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="0" step="any" className="mt-1 block w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price per Unit</label>
              <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="any" className="mt-1 block w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
          </div>

          <div>
            <label htmlFor="broker" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Broker/Exchange (Optional)</label>
            <input type="text" id="broker" value={broker} onChange={(e) => setBroker(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" placeholder="e.g., Robinhood, Coinbase" />
          </div>

          <div className="pt-2 flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-6 rounded-lg mr-2 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors font-medium">Cancel</button>
            <button type="submit" className="bg-black dark:bg-white text-white dark:text-black py-2 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;