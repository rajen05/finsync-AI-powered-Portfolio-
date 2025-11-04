export enum AssetType {
  Stock = 'Stock',
  Crypto = 'Crypto',
}

export enum TransactionType {
  Buy = 'Buy',
  Sell = 'Sell',
}

export interface Transaction {
  id: string;
  ticker: string;
  assetType: AssetType;
  type: TransactionType;
  quantity: number;
  price: number;
  date: string;
  broker: string;
}

export interface Holding {
  ticker: string;
  assetType: AssetType;
  quantity: number;
  totalCost: number;
  averageCost: number;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedPL: number | null;
  unrealizedPLPercent: number | null;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPL: number;
  totalPLPercent: number;
}

export interface NewsArticle {
  headline: string;
  url: string;
  source: string;
  summary: string;
}

export interface HistoricalDataItem {
  date: string;
  price: number;
}

export interface StockDetails {
  ticker: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayRange: string;
  yearRange: string;
  marketCap: string;
  peRatio: number | null;
  dividendYield: number | null;
  historicalData: HistoricalDataItem[];
  news: NewsArticle[];
  logoUrl?: string;
}

export interface TopMover {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface HeatmapStock {
  ticker: string;
  companyName: string;
  changePercent: number;
  marketCap: number;
  sector: string;
  logoUrl?: string;
}

export interface WishlistItem {
  id: string;
  ticker: string;
  assetType: AssetType;
  targetPrice: number | null;
  notes: string;
  addedAt: string;
  currentPrice?: number | null;
  priceChange?: number | null;
  priceChangePercent?: number | null;
  alertTriggered?: boolean;
}
