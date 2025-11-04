import { Transaction, AssetType, TransactionType } from '../types';

// Export transactions to CSV
export const exportTransactionsToCSV = (transactions: Transaction[]): string => {
  // CSV Header
  const headers = ['Date', 'Ticker', 'Asset Type', 'Transaction Type', 'Quantity', 'Price', 'Broker'];
  
  // CSV Rows
  const rows = transactions.map(tx => [
    tx.date,
    tx.ticker,
    tx.assetType,
    tx.type,
    tx.quantity.toString(),
    tx.price.toString(),
    tx.broker || ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string = 'transactions.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Parse CSV content to transactions
export const parseCSVToTransactions = (csvContent: string): { 
  transactions: Omit<Transaction, 'id'>[], 
  errors: string[] 
} => {
  const errors: string[] = [];
  const transactions: Omit<Transaction, 'id'>[] = [];

  try {
    // Split into lines
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      errors.push('CSV file is empty or has no data rows');
      return { transactions, errors };
    }

    // Parse header
    const header = lines[0].toLowerCase();
    
    // Check for required columns
    const requiredColumns = ['date', 'ticker', 'type', 'quantity', 'price'];
    const missingColumns = requiredColumns.filter(col => !header.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      return { transactions, errors };
    }

    // Parse data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      try {
        // Parse CSV row (handle quoted values)
        const values = parseCSVLine(line);
        
        if (values.length < 6) {
          errors.push(`Row ${i + 1}: Insufficient columns`);
          continue;
        }

        const [date, ticker, assetType, transactionType, quantity, price, broker] = values;

        // Validate and parse
        const parsedTransaction = validateAndParseTransaction({
          date: date.trim(),
          ticker: ticker.trim().toUpperCase(),
          assetType: assetType.trim(),
          transactionType: transactionType.trim(),
          quantity: quantity.trim(),
          price: price.trim(),
          broker: broker?.trim() || ''
        }, i + 1);

        if (parsedTransaction.error) {
          errors.push(`Row ${i + 1}: ${parsedTransaction.error}`);
        } else if (parsedTransaction.transaction) {
          transactions.push(parsedTransaction.transaction);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { transactions, errors };
};

// Parse a single CSV line (handles quoted values)
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current); // Add last value
  return values;
};

// Validate and parse a single transaction
const validateAndParseTransaction = (
  data: {
    date: string;
    ticker: string;
    assetType: string;
    transactionType: string;
    quantity: string;
    price: string;
    broker: string;
  },
  rowNumber: number
): { transaction?: Omit<Transaction, 'id'>; error?: string } => {
  // Validate date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) {
    return { error: 'Invalid date format (use YYYY-MM-DD)' };
  }

  // Validate ticker
  if (!data.ticker || data.ticker.length === 0) {
    return { error: 'Ticker is required' };
  }

  // Validate asset type
  const assetType = data.assetType as AssetType;
  if (!Object.values(AssetType).includes(assetType)) {
    return { error: `Invalid asset type "${data.assetType}" (use Stock or Crypto)` };
  }

  // Validate transaction type
  const transactionType = data.transactionType as TransactionType;
  if (!Object.values(TransactionType).includes(transactionType)) {
    return { error: `Invalid transaction type "${data.transactionType}" (use Buy or Sell)` };
  }

  // Validate quantity
  const quantity = parseFloat(data.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    return { error: 'Quantity must be a positive number' };
  }

  // Validate price
  const price = parseFloat(data.price);
  if (isNaN(price) || price <= 0) {
    return { error: 'Price must be a positive number' };
  }

  return {
    transaction: {
      date: data.date,
      ticker: data.ticker,
      assetType,
      type: transactionType,
      quantity,
      price,
      broker: data.broker || 'Unknown'
    }
  };
};

// Generate sample CSV template
export const generateSampleCSV = (): string => {
  const sampleData = [
    ['Date', 'Ticker', 'Asset Type', 'Transaction Type', 'Quantity', 'Price', 'Broker'],
    ['2024-01-15', 'AAPL', 'Stock', 'Buy', '10', '150.50', 'Fidelity'],
    ['2024-02-20', 'GOOGL', 'Stock', 'Buy', '5', '130.25', 'Fidelity'],
    ['2024-03-10', 'BTC-USD', 'Crypto', 'Buy', '0.1', '45000', 'Coinbase'],
    ['2024-04-05', 'AAPL', 'Stock', 'Sell', '2', '175.00', 'Fidelity'],
  ];

  return sampleData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
};
