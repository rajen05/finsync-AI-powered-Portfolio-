import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, AssetType, TransactionType, WishlistItem } from './types';
import { MarketDataProvider } from './context/MarketDataProvider';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './components/Dashboard';

const initialTransactions: Transaction[] = [
  { id: '1', ticker: 'AAPL', assetType: AssetType.Stock, type: TransactionType.Buy, quantity: 10, price: 150, date: '2023-01-15', broker: 'Fidelity' },
  { id: '2', ticker: 'GOOGL', assetType: AssetType.Stock, type: TransactionType.Buy, quantity: 5, price: 130, date: '2023-02-20', broker: 'Fidelity' },
  { id: '3', ticker: 'BTC-USD', assetType: AssetType.Crypto, type: TransactionType.Buy, quantity: 0.1, price: 40000, date: '2023-03-10', broker: 'Coinbase' },
  { id: '4', ticker: 'AAPL', assetType: AssetType.Stock, type: TransactionType.Sell, quantity: 2, price: 170, date: '2023-05-01', broker: 'Fidelity' },
  { id: '5', ticker: 'ETH-USD', assetType: AssetType.Crypto, type: TransactionType.Buy, quantity: 1, price: 2000, date: '2023-06-12', broker: 'Coinbase' },
];


const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const savedTransactions = localStorage.getItem('portfolio-transactions');
      return savedTransactions ? JSON.parse(savedTransactions) : initialTransactions;
    } catch (error) {
      console.error('Error reading transactions from localStorage', error);
      return initialTransactions;
    }
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const savedWishlist = localStorage.getItem('portfolio-wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Error reading wishlist from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('portfolio-transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage', error);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('portfolio-wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to localStorage', error);
    }
  }, [wishlist]);
  
  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transactionWithId: Transaction = {
      ...newTransaction,
      id: new Date().getTime().toString(), // simple unique id
    };
    setTransactions(prev => [...prev, transactionWithId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleAddWishlistItem = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: new Date().getTime().toString(),
      addedAt: new Date().toISOString(),
    };
    setWishlist(prev => [...prev, newItem]);
  };

  const handleRemoveWishlistItem = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateWishlistItem = (id: string, updates: Partial<WishlistItem>) => {
    setWishlist(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const portfolioTickers = useMemo(() => {
    const transactionTickers = new Set(transactions.map(t => t.ticker));
    const wishlistTickers = new Set(wishlist.map(w => w.ticker));
    const allTickers = new Set([...transactionTickers, ...wishlistTickers]);
    return Array.from(allTickers);
  }, [transactions, wishlist]);

  return (
    <ThemeProvider>
      <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white min-h-screen transition-colors">
        <MarketDataProvider portfolioTickers={portfolioTickers}>
          <Dashboard 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            wishlist={wishlist}
            onAddWishlistItem={handleAddWishlistItem}
            onRemoveWishlistItem={handleRemoveWishlistItem}
            onUpdateWishlistItem={handleUpdateWishlistItem}
          />
        </MarketDataProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
