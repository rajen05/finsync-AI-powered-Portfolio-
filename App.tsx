import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, AssetType, TransactionType } from './types';
import { MarketDataProvider } from './context/MarketDataProvider';
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

  useEffect(() => {
    try {
      localStorage.setItem('portfolio-transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage', error);
    }
  }, [transactions]);
  
  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transactionWithId: Transaction = {
      ...newTransaction,
      id: new Date().getTime().toString(), // simple unique id
    };
    setTransactions(prev => [...prev, transactionWithId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const portfolioTickers = useMemo(() => {
    const tickers = new Set(transactions.map(t => t.ticker));
    return Array.from(tickers);
  }, [transactions]);

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <MarketDataProvider portfolioTickers={portfolioTickers}>
        <Dashboard 
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
        />
      </MarketDataProvider>
    </div>
  );
}

export default App;
