import React from 'react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const NavItem: React.FC<{ title: string; pageName: string; currentPage: string; onClick: () => void; }> = ({ title, pageName, currentPage, onClick }) => {
  const isActive = currentPage === pageName;
  const activeClasses = 'bg-slate-700 text-white';
  const inactiveClasses = 'text-slate-300 hover:bg-slate-700/50 hover:text-white';
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClasses : inactiveClasses}`}
    >
      {title}
    </button>
  );
};

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start h-12">
          <div className="flex items-baseline space-x-4">
            <NavItem title="Heatmap" pageName="heatmap" currentPage={currentPage} onClick={() => setCurrentPage('heatmap')} />
            <NavItem title="Portfolio" pageName="portfolio" currentPage={currentPage} onClick={() => setCurrentPage('portfolio')} />
            <NavItem title="Transactions" pageName="transactions" currentPage={currentPage} onClick={() => setCurrentPage('transactions')} />
            <NavItem title="Market Data" pageName="market" currentPage={currentPage} onClick={() => setCurrentPage('market')} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;