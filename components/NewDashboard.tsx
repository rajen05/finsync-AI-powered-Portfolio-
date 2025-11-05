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
  const [chatInitialQuery, setChatInitialQuery] = useState<string>('');
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
          <div className="bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Help & Support</h2>
            
            <div className="space-y-8">
              {/* Getting Started */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Getting Started</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Welcome to FinSync! Track your investments, analyze market trends, and get AI-powered insights.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Add transactions to track your portfolio</li>
                  <li>Use the search bar to ask FynAI questions</li>
                  <li>Monitor market trends with real-time data</li>
                  <li>Compare stocks and analyze performance</li>
                </ul>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Portfolio Tracking</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your investments with real-time market prices</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">FynAI Assistant</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get instant answers about stocks, crypto, and investing</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Market Analysis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View heatmaps, top movers, and market trends</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Stock Comparison</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Compare multiple stocks side-by-side</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
                <div className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                    <svg className="w-5 h-5 text-gray-900 dark:text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                      <a href="mailto:rajendrank.work@gmail.com" className="text-gray-900 dark:text-white hover:underline font-medium">
                        rajendrank.work@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                    <svg className="w-5 h-5 text-gray-900 dark:text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">LinkedIn</div>
                      <a href="https://www.linkedin.com/in/rajendran-kumarasamy/" target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white hover:underline font-medium">
                        Rajendran Kumarasamy
                      </a>
                    </div>
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                    <svg className="w-5 h-5 text-gray-900 dark:text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">GitHub</div>
                      <a href="https://github.com/rajen05" target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white hover:underline font-medium">
                        rajen05
                      </a>
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                    <svg className="w-5 h-5 text-gray-900 dark:text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Portfolio</div>
                      <a href="https://rajenk.dev" target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white hover:underline font-medium">
                        rajenk.dev
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          onNavigate={(page) => setCurrentPage(page)}
          onOpenChatbot={(query) => {
            setChatInitialQuery(query);
            setIsChatOpen(true);
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
      {isChatOpen && (
        <AIAssistant 
          onClose={() => {
            setIsChatOpen(false);
            setChatInitialQuery('');
          }} 
          initialQuery={chatInitialQuery}
        />
      )}

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
