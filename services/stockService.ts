// Finnhub API service for fast stock data (free tier)
import { getFromCache, setInCache } from './cachingService';

const FINNHUB_API = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = 'ct4a0j9r01qnhqrjrr1gct4a0j9r01qnhqrjrr20'; // Free public demo key
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fallback to Yahoo Finance API (no key required)
const YAHOO_API = 'https://query1.finance.yahoo.com/v8/finance/chart';

interface StockQuote {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

/**
 * Fetch stock prices from Finnhub
 */
export async function fetchStockPrices(tickers: string[]): Promise<{ [ticker: string]: number }> {
  const cacheKey = `stock-prices-${tickers.sort().join(',')}`;
  const cached = getFromCache<{ [ticker: string]: number }>(cacheKey, CACHE_DURATION);
  
  if (cached) {
    console.log('📦 Using cached stock prices');
    return cached;
  }

  const prices: { [ticker: string]: number } = {};
  
  try {
    console.log('📈 Fetching stock prices from Finnhub...');
    
    // Fetch prices for each ticker
    const promises = tickers.map(async (ticker) => {
      try {
        const url = `${FINNHUB_API}/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (data.c && data.c > 0) { // c = current price
            return { ticker, price: data.c };
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${ticker} from Finnhub`);
      }
      return null;
    });
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      if (result) {
        prices[result.ticker] = result.price;
      }
    });
    
    console.log('✅ Stock prices fetched from Finnhub:', Object.keys(prices).length);
    
    if (Object.keys(prices).length > 0) {
      setInCache(cacheKey, prices);
    }
    
    return prices;
  } catch (error) {
    console.error('❌ Error fetching stock prices from Finnhub:', error);
    return {};
  }
}

/**
 * Fetch stock prices from Yahoo Finance (fallback, no API key needed)
 */
export async function fetchStockPricesYahoo(tickers: string[]): Promise<{ [ticker: string]: number }> {
  const cacheKey = `yahoo-stock-prices-${tickers.sort().join(',')}`;
  const cached = getFromCache<{ [ticker: string]: number }>(cacheKey, CACHE_DURATION);
  
  if (cached) {
    console.log('📦 Using cached Yahoo stock prices');
    return cached;
  }

  const prices: { [ticker: string]: number } = {};
  
  try {
    console.log('📊 Fetching stock prices from Yahoo Finance...');
    
    // Yahoo Finance allows batch requests
    const promises = tickers.map(async (ticker) => {
      try {
        const url = `${YAHOO_API}/${ticker}?interval=1d&range=1d`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          const quote = data.chart?.result?.[0]?.meta?.regularMarketPrice;
          
          if (quote && quote > 0) {
            return { ticker, price: quote };
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${ticker} from Yahoo`);
      }
      return null;
    });
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      if (result) {
        prices[result.ticker] = result.price;
      }
    });
    
    console.log('✅ Stock prices fetched from Yahoo:', Object.keys(prices).length);
    
    if (Object.keys(prices).length > 0) {
      setInCache(cacheKey, prices);
    }
    
    return prices;
  } catch (error) {
    console.error('❌ Error fetching stock prices from Yahoo:', error);
    return {};
  }
}

/**
 * Fetch detailed stock quote
 */
export async function fetchStockQuote(ticker: string): Promise<StockQuote | null> {
  const cacheKey = `stock-quote-${ticker}`;
  const cached = getFromCache<StockQuote>(cacheKey, CACHE_DURATION);
  
  if (cached) {
    return cached;
  }

  try {
    const url = `${FINNHUB_API}/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.c && data.c > 0) {
      const quote: StockQuote = {
        price: data.c,           // current price
        change: data.d,          // change
        changePercent: data.dp,  // percent change
        high: data.h,            // high
        low: data.l,             // low
        open: data.o,            // open
        previousClose: data.pc,  // previous close
      };
      
      setInCache(cacheKey, quote);
      return quote;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching stock quote:', error);
    return null;
  }
}

/**
 * Fetch stock prices with automatic fallback
 * Tries Finnhub first, falls back to Yahoo Finance
 */
export async function fetchStockPricesWithFallback(tickers: string[]): Promise<{ [ticker: string]: number }> {
  if (tickers.length === 0) {
    return {};
  }

  // Try Finnhub first
  let prices = await fetchStockPrices(tickers);
  
  // Find missing tickers
  const missingTickers = tickers.filter(t => !prices[t]);
  
  // If some failed, try Yahoo Finance
  if (missingTickers.length > 0) {
    console.log('🔄 Trying Yahoo Finance for missing tickers:', missingTickers);
    const yahooPrices = await fetchStockPricesYahoo(missingTickers);
    prices = { ...prices, ...yahooPrices };
  }
  
  return prices;
}

/**
 * Get company profile from Finnhub
 */
export async function fetchCompanyProfile(ticker: string): Promise<{
  name: string;
  ticker: string;
  marketCap: number;
  logo: string;
  industry: string;
  weburl: string;
} | null> {
  const cacheKey = `company-profile-${ticker}`;
  const cached = getFromCache<any>(cacheKey, 24 * 60 * 60 * 1000); // Cache for 24 hours
  
  if (cached) {
    return cached;
  }

  try {
    const url = `${FINNHUB_API}/stock/profile2?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.name) {
      const profile = {
        name: data.name,
        ticker: data.ticker || ticker,
        marketCap: data.marketCapitalization || 0,
        logo: data.logo || '',
        industry: data.finnhubIndustry || '',
        weburl: data.weburl || '',
      };
      
      setInCache(cacheKey, profile);
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching company profile:', error);
    return null;
  }
}
