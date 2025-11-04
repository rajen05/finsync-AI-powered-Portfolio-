import React from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-lg p-10 text-center border border-slate-700">
        <p className="text-slate-500">No transactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ticker</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Broker</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{tx.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{tx.ticker}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tx.type === TransactionType.Buy ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">{tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-300">{formatCurrency(tx.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white font-medium hidden sm:table-cell">{formatCurrency(tx.quantity * tx.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 hidden md:table-cell">{tx.broker || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;