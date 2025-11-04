import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Header from './Header';
import Navbar from './Navbar';
import PortfolioSummary from './PortfolioSummary';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import PerformanceChart from './PerformanceChart';
import TransactionsTable from './TransactionsTable';
import TransactionModal from './TransactionModal';
import ImportExportModal from './ImportExportModal';
import MarketData from './MarketData';
import Heatmap from './Heatmap';
import Wishlist from './Wishlist';
import AIAssistant from './AIAssistant';
import Profile from './Profile';
import Login from './Login';
import Signup from './Signup';
import { Transaction, WishlistItem } from '../types';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioPerformance } from '../hooks/usePortfolioPerformance';
import { useMarketData } from '../context/MarketDataProvider';
import { PlusIcon } from './icons/PlusIcon';
import { ChatIcon } from './icons/ChatIcon';

interface DashboardProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  wishlist: WishlistItem[];
  onAddWishlistItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  onRemoveWishlistItem: (id: string) => void;
  onUpdateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void;
  user: User | null;
  onShowAuth: (view: 'login' | 'signup') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  onAddTransaction,
  wishlist,
  onAddWishlistItem,
  onRemoveWishlistItem,
  onUpdateWishlistItem,
  user,
  onShowAuth,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'heatmap' | 'portfolio' | 'transactions' | 'market' | 'wishlist' | 'profile'>('heatmap');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [marketSymbol, setMarketSymbol] = useState<string | null>(null);

  // Protected pages that require authentication
  const protectedPages = ['portfolio', 'transactions', 'wishlist', 'profile'];

  // Handle page navigation with auth check
  const handlePageChange = (page: typeof currentPage) => {
    if (protectedPages.includes(page) && !user) {
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }
    setCurrentPage(page);
    setShowAuthModal(false);
  };

  // Close auth modal and return to public page
  const handleCloseAuth = () => {
    setShowAuthModal(false);
    setCurrentPage('heatmap');
  };

  // When user logs in, close auth modal and go to portfolio
  // When user logs out, go to heatmap (first page)
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
      setCurrentPage('portfolio');
    } else if (!user) {
      // User logged out, go to public page
      setCurrentPage('heatmap');
      setShowAuthModal(false);
    }
  }, [user]);

  const { holdings, summary, allocationData, isLoading } = usePortfolio(transactions);
  const { portfolioPrices } = useMarketData();
  const performanceData = usePortfolioPerformance(transactions, portfolioPrices);

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
            <PerformanceChart data={performanceData} isLoading={isLoading} />
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
        return <TransactionsTable transactions={transactions} />;
      case 'market':
        return (
          <MarketData 
            symbol={marketSymbol} 
            setSymbol={setMarketSymbol}
            wishlist={wishlist}
            onAddToWishlist={onAddWishlistItem}
          />
        );
      case 'heatmap':
        return <Heatmap />;
      case 'wishlist':
        return (
          <Wishlist
            wishlist={wishlist}
            onAddItem={onAddWishlistItem}
            onRemoveItem={onRemoveWishlistItem}
            onUpdateItem={onUpdateWishlistItem}
          />
        );
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  // If showing auth modal, render it fullscreen
  if (showAuthModal) {
    return authView === 'login' ? (
      <Login onSwitchToSignup={() => setAuthView('signup')} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        user={user}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage !== 'market' && currentPage !== 'heatmap' && (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold capitalize text-gray-900 dark:text-white">{currentPage}</h1>
            <div className="flex gap-3">
              {currentPage === 'transactions' && (
                <button
                  onClick={() => setIsImportExportOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Import / Export CSV</span>
                </button>
              )}
              {currentPage !== 'wishlist' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md inline-flex items-center transition-colors"
                >
                  <PlusIcon />
                  <span className="ml-2">Add Transaction</span>
                </button>
              )}
            </div>
          </div>
        )}
        
        {renderPage()}
      </main>

      {isModalOpen && (
        <TransactionModal
          onClose={() => setIsModalOpen(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}

      {isImportExportOpen && (
        <ImportExportModal
          transactions={transactions}
          onImport={(importedTransactions) => {
            importedTransactions.forEach(tx => onAddTransaction(tx));
          }}
          onClose={() => setIsImportExportOpen(false)}
        />
      )}

      {/* AI Assistant Floating Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 group"
          title="Open AI Assistant"
        >
          <ChatIcon className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* AI Assistant Chat */}
      {isChatOpen && <AIAssistant onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};
