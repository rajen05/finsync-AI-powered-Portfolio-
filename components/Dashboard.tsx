import React, { useState } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import PortfolioSummary from './PortfolioSummary';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import TransactionsTable from './TransactionsTable';
import TransactionModal from './TransactionModal';
import MarketData from './MarketData';
import Heatmap from './Heatmap';
import { Transaction } from '../types';
import { usePortfolio } from '../hooks/usePortfolio';
import { PlusIcon } from './icons/PlusIcon';

interface DashboardProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('heatmap');
  const [marketSymbol, setMarketSymbol] = useState<string | null>(null);

  const { holdings, summary, allocationData, isLoading } = usePortfolio(transactions);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    onAddTransaction(newTransaction);
    setIsModalOpen(false);
  };

  const handleHoldingClick = (ticker: string) => {
    setMarketSymbol(ticker);
    setCurrentPage('market');
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'portfolio':
        return (
          <div className="space-y-6">
            <PortfolioSummary summary={summary} isLoading={isLoading} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <HoldingsTable holdings={holdings} isLoading={isLoading} onRowClick={handleHoldingClick} />
              </div>
              <div>
                <AllocationChart data={allocationData} isLoading={isLoading} />
              </div>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <TransactionsTable transactions={transactions} />
        );
      case 'market':
        return <MarketData symbol={marketSymbol} setSymbol={setMarketSymbol} />;
      case 'heatmap':
        return <Heatmap />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold capitalize">{currentPage}</h1>
          {currentPage !== 'market' && currentPage !== 'heatmap' && (
             <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md inline-flex items-center transition-colors"
            >
              <PlusIcon />
              <span className="ml-2">Add Transaction</span>
            </button>
          )}
        </div>
        
        {renderPage()}
      </main>

      {isModalOpen && (
        <TransactionModal
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </>
  );
};
