import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Sidebar } from './Sidebar';
import { NewHeader } from './NewHeader';
import { StockSummary } from './StockSummary';
import { StockComparison } from './StockComparison';
import PortfolioSummary from './PortfolioSummary';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import PerformanceChart from './PerformanceChart';
import TransactionsTable from './TransactionsTable';
import TransactionModal from './TransactionModal';
import ImportExportModal from './ImportExportModal';
import MarketData from './MarketData';
import MarketNews from './MarketNews';
import Heatmap from './Heatmap';
import Wishlist from './Wishlist';
import AIAssistant from './AIAssistant';
import Profile from './Profile';
import Login from './Login';
import Signup from './Signup';
import { ExpandableAuth } from './ExpandableAuth';
import { Transaction, WishlistItem } from '../types';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioPerformance } from '../hooks/usePortfolioPerformance';
import { useMarketData } from '../context/MarketDataProvider';
import { ChatIcon } from './icons/ChatIcon';

interface NewDashboardProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  wishlist: WishlistItem[];
  onAddWishlistItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  onRemoveWishlistItem: (id: string) => void;
  onUpdateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void;
  user: User | null;
  onShowAuth: (view: 'login' | 'signup') => void;
}

export const NewDashboard: React.FC<NewDashboardProps> = ({
  transactions,
  onAddTransaction,
  wishlist,
  onAddWishlistItem,
  onRemoveWishlistItem,
  onUpdateWishlistItem,
  user,
  onShowAuth,
}) => {
  const [currentPage, setCurrentPage] = useState<string>('summary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [marketSymbol, setMarketSymbol] = useState<string | null>(null);

  const { holdings, summary, allocationData, isLoading } = usePortfolio(transactions);
  const { portfolioPrices } = useMarketData();
  const performanceData = usePortfolioPerformance(transactions, portfolioPrices);

  // Protected pages that require authentication
  const protectedPages = ['portfolio', 'wishlist', 'profile', 'inbox', 'settings'];

  const handlePageChange = (page: string) => {
    if (protectedPages.includes(page) && !user) {
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }
    setCurrentPage(page);
    setShowAuthModal(false);
  };

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    onAddTransaction(newTransaction);
    setIsModalOpen(false);
  };

  const handleHoldingClick = (ticker: string) => {
    setMarketSymbol(ticker);
    setCurrentPage('market');
  };

  const renderMainContent = () => {
    switch (currentPage) {
      case 'summary':
        return (
          <div className="space-y-6">
            <StockSummary />
            <MarketNews />
          </div>
        );

      case 'market':
        return (
          <MarketData 
            symbol={marketSymbol} 
            setSymbol={setMarketSymbol}
            wishlist={wishlist}
            onAddToWishlist={onAddWishlistItem}
          />
        );

      case 'comparison':
        return <StockComparison />;

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

      case 'profile':
        return <Profile />;

      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">Settings page coming soon...</p>
          </div>
        );

      case 'help':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Help & Support</h2>
            <p className="text-gray-600 dark:text-gray-400">Help documentation coming soon...</p>
          </div>
        );

      case 'inbox':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Inbox</h2>
            <p className="text-gray-600 dark:text-gray-400">No new messages</p>
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Investo</h2>
            <p className="text-gray-600 dark:text-gray-400">Select a section from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black relative">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        portfolioValue={summary.totalValue}
        portfolioChange={summary.totalPL}
        portfolioChangePercent={summary.totalPLPercent}
      />

      {/* Main Content Area */}
      <div className="lg:ml-60 min-h-screen flex flex-col">
        {/* Header */}
        <NewHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          user={user}
          onShowAuth={(view) => {
            setAuthView(view);
            setShowAuthModal(true);
          }}
        />

        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Title and Actions */}
            {currentPage !== 'market' && currentPage !== 'heatmap' && currentPage !== 'summary' && (
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {currentPage}
                </h1>
                <div className="flex gap-3">
                  {currentPage === 'transactions' && (
                    <button
                      onClick={() => setIsImportExportOpen(true)}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <span>📊</span>
                      <span>Import / Export</span>
                    </button>
                  )}
                  {(currentPage === 'portfolio' || currentPage === 'transactions') && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all shadow-md flex items-center gap-2"
                    >
                      <span>+</span>
                      <span>Add Transaction</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Main Content */}
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
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
          className="fixed bottom-6 right-6 w-14 h-14 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 group"
          title="Open AI Assistant"
        >
          <ChatIcon className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
        </button>
      )}

      {/* AI Assistant Chat */}
      {isChatOpen && <AIAssistant onClose={() => setIsChatOpen(false)} />}

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <ExpandableAuth 
          onClose={() => {
            setShowAuthModal(false);
            setCurrentPage('summary'); // Navigate to home page
          }} 
          initialMode={authView}
        />
      )}
    </div>
  );
};
