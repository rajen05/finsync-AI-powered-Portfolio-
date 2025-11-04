import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import { exportTransactionsToCSV, downloadCSV, parseCSVToTransactions, generateSampleCSV } from '../utils/csvUtils';
import { CloseIcon } from './icons/CloseIcon';

interface ImportExportModalProps {
  transactions: Transaction[];
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  onClose: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ transactions, onImport, onClose }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Export
  const handleExport = () => {
    const csvContent = exportTransactionsToCSV(transactions);
    const filename = `finsync-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  // Handle Download Sample
  const handleDownloadSample = () => {
    const sampleCSV = generateSampleCSV();
    downloadCSV(sampleCSV, 'finsync-sample-template.csv');
  };

  // Handle File Selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setImportErrors([]);
    setImportSuccess(false);
    setImportedCount(0);

    // Check file type
    if (!file.name.endsWith('.csv')) {
      setImportErrors(['Please select a CSV file']);
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const { transactions: parsedTransactions, errors } = parseCSVToTransactions(content);

      if (errors.length > 0) {
        setImportErrors(errors);
      }

      if (parsedTransactions.length > 0) {
        onImport(parsedTransactions);
        setImportSuccess(true);
        setImportedCount(parsedTransactions.length);
      }
    };

    reader.onerror = () => {
      setImportErrors(['Failed to read file']);
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Import / Export Transactions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📤 Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📥 Import
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Export Your Transactions
                </h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  Download all your transactions as a CSV file. You can open it in Excel, Google Sheets, or any spreadsheet application.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      {transactions.length} transactions ready to export
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Includes: Date, Ticker, Asset Type, Transaction Type, Quantity, Price, Broker
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={transactions.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>📥</span>
                <span>Download CSV File</span>
              </button>

              {transactions.length === 0 && (
                <p className="text-center text-gray-500 dark:text-slate-400 text-sm">
                  No transactions to export. Add some transactions first!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Import Transactions from CSV
                </h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  Upload a CSV file to bulk import transactions. Make sure your file follows the correct format.
                </p>
              </div>

              {/* CSV Format Info */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Required CSV Format:</h4>
                <div className="text-sm text-gray-600 dark:text-slate-400 space-y-1 font-mono">
                  <p>Date, Ticker, Asset Type, Transaction Type, Quantity, Price, Broker</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    Example: 2024-01-15, AAPL, Stock, Buy, 10, 150.50, Fidelity
                  </p>
                </div>
              </div>

              {/* Download Sample */}
              <button
                onClick={handleDownloadSample}
                className="w-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>📄</span>
                <span>Download Sample Template</span>
              </button>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="text-6xl mb-4">📁</div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Choose CSV File
                </button>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                  or drag and drop your file here
                </p>
              </div>

              {/* Success Message */}
              {importSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-300 mb-1">
                        Successfully imported {importedCount} transactions!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Your transactions have been added to your portfolio.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {importErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 dark:text-red-300 mb-2">
                        Import Errors ({importErrors.length})
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {importErrors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700 dark:text-red-400">
                            • {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Rules */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">📋 Import Rules:</h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1">
                  <li>• Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
                  <li>• Asset Type: Stock or Crypto</li>
                  <li>• Transaction Type: Buy or Sell</li>
                  <li>• Quantity and Price must be positive numbers</li>
                  <li>• Ticker will be auto-capitalized</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;
