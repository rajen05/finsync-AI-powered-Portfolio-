// CoinGecko API service for fast crypto data
import { getFromCache, setInCache } from './cachingService';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Map common crypto tickers to CoinGecko IDs
const CRYPTO_ID_MAP: { [key: string]: string } = {
  'BTC': 'bitcoin',
  'BTC-USD': 'bitcoin',
  'ETH': 'ethereum',
  'ETH-USD': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'NEAR': 'near',
  'APT': 'aptos',
};

interface CryptoPrice {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
}

interface CryptoPriceResponse {
  [coinId: string]: CryptoPrice;
}

/**
 * Get crypto ID from ticker symbol
 */
function getCryptoId(ticker: string): string | null {
  const cleanTicker = ticker.toUpperCase().replace('-USD', '');
  return CRYPTO_ID_MAP[cleanTicker] || CRYPTO_ID_MAP[ticker.toUpperCase()] || null;
}

/**
 * Check if a ticker is a crypto asset
 */
export function isCrypto(ticker: string): boolean {
  return getCryptoId(ticker) !== null;
}

/**
 * Fetch crypto prices from CoinGecko
 */
export async function fetchCryptoPrices(tickers: string[]): Promise<{ [ticker: string]: number }> {
  const cacheKey = `crypto-prices-${tickers.sort().join(',')}`;
  const cached = getFromCache<{ [ticker: string]: number }>(cacheKey, CACHE_DURATION);
  
  if (cached) {
    console.log('📦 Using cached crypto prices');
    return cached;
  }

  // Filter only crypto tickers and get their IDs
  const cryptoIds = tickers
    .map(ticker => ({ ticker, id: getCryptoId(ticker) }))
    .filter(item => item.id !== null) as { ticker: string; id: string }[];

  if (cryptoIds.length === 0) {
    return {};
  }

  try {
    console.log('🪙 Fetching crypto prices from CoinGecko...');
    
    const ids = cryptoIds.map(c => c.id).join(',');
    const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data: CryptoPriceResponse = await response.json();
    
    // Map back to original tickers
    const prices: { [ticker: string]: number } = {};
    cryptoIds.forEach(({ ticker, id }) => {
      if (data[id]) {
        prices[ticker] = data[id].usd;
      }
    });
    
    console.log('✅ Crypto prices fetched:', Object.keys(prices).length, 'coins');
    setInCache(cacheKey, prices);
    
    return prices;
  } catch (error) {
    console.error('❌ Error fetching crypto prices:', error);
    return {};
  }
}

/**
 * Fetch detailed crypto data including market cap and 24h change
 */
export async function fetchCryptoDetails(ticker: string): Promise<{
  price: number;
  change24h: number;
  marketCap: number;
} | null> {
  const cryptoId = getCryptoId(ticker);
  
  if (!cryptoId) {
    return null;
  }

  const cacheKey = `crypto-details-${ticker}`;
  const cached = getFromCache<any>(cacheKey, CACHE_DURATION);
  
  if (cached) {
    return cached;
  }

  try {
    const url = `${COINGECKO_API}/simple/price?ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data: CryptoPriceResponse = await response.json();
    
    if (data[cryptoId]) {
      const result = {
        price: data[cryptoId].usd,
        change24h: data[cryptoId].usd_24h_change,
        marketCap: data[cryptoId].usd_market_cap,
      };
      
      setInCache(cacheKey, result);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching crypto details:', error);
    return null;
  }
}

/**
 * Fetch top cryptocurrencies for heatmap
 */
export async function fetchTopCryptos(limit: number = 20): Promise<Array<{
  ticker: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
}>> {
  const cacheKey = `top-cryptos-${limit}`;
  const cached = getFromCache<any>(cacheKey, CACHE_DURATION);
  
  if (cached) {
    console.log('📦 Using cached top cryptos');
    return cached;
  }

  try {
    console.log('🪙 Fetching top cryptos from CoinGecko...');
    
    const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const cryptos = data.map((coin: any) => ({
      ticker: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap,
    }));
    
    console.log('✅ Top cryptos fetched:', cryptos.length, 'coins');
    setInCache(cacheKey, cryptos);
    
    return cryptos;
  } catch (error) {
    console.error('❌ Error fetching top cryptos:', error);
    return [];
  }
}
