import React, { useState, useMemo } from 'react';
import { MarketDataProvider } from './context/MarketDataProvider';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { NewDashboard } from './components/NewDashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import { useTransactions } from './hooks/useTransactions';
import { useWishlist } from './hooks/useWishlist';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  
  // Use database hooks instead of localStorage
  const {
    transactions,
    loading: transactionsLoading,
    addTransaction,
  } = useTransactions();

  const {
    wishlist,
    loading: wishlistLoading,
    addWishlistItem,
    removeWishlistItem,
    updateWishlistItem,
  } = useWishlist();

  const portfolioTickers = useMemo(() => {
    const transactionTickers = new Set(transactions.map(t => t.ticker));
    const wishlistTickers = new Set(wishlist.map(w => w.ticker));
    const allTickers = new Set([...transactionTickers, ...wishlistTickers]);
    return Array.from(allTickers);
  }, [transactions, wishlist]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if not logged in and trying to access protected routes
  // Note: Heatmap and Market Data are public, so we only show auth for other pages
  // This will be handled in Dashboard component

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen transition-colors">
      <MarketDataProvider portfolioTickers={portfolioTickers}>
        <NewDashboard 
          transactions={transactions}
          onAddTransaction={addTransaction}
          wishlist={wishlist}
          onAddWishlistItem={addWishlistItem}
          onRemoveWishlistItem={removeWishlistItem}
          onUpdateWishlistItem={updateWishlistItem}
          user={user}
          onShowAuth={(view) => setAuthView(view)}
        />
      </MarketDataProvider>
      
      {/* Auth Modals - Show when user tries to access protected routes */}
      {/* These will be triggered from Dashboard when needed */}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
