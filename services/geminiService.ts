// Fix: This file was a placeholder. It is now implemented with functions that call the Gemini API to fetch financial data required by various components.
import { GoogleGenAI, Type } from "@google/genai";
import { StockDetails, NewsArticle, HeatmapStock, TopMover } from '../types';
import { getFromCache, setInCache } from './cachingService';
import { fetchCryptoPrices, isCrypto } from './cryptoService';
import { fetchStockPricesWithFallback } from './stockService';
import { getStockLogoUrl } from './logoService';

// Helper function to fetch from Yahoo Finance via our serverless API
async function fetchYahooFinance(symbol: string, range: string = '1d', interval: string = '1d') {
    try {
        // Use our serverless function (works in production on Vercel)
        const apiUrl = `/api/yahoo-finance?symbol=${symbol}&range=${range}&interval=${interval}`;
        console.log(`🔍 Fetching ${symbol} via serverless API...`);
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            return await response.json();
        }
        
        throw new Error(`API returned ${response.status}`);
    } catch (error) {
        console.error(`❌ Serverless API failed for ${symbol}:`, error);
        throw error;
    }
}

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
const hasApiKey = !!API_KEY;

console.log('🔑 API Key Check:', {
    hasApiKey,
    API_KEY_length: API_KEY?.length || 0,
    VITE_GEMINI_API_KEY: !!import.meta.env.VITE_GEMINI_API_KEY,
    GEMINI_API_KEY: !!import.meta.env.GEMINI_API_KEY,
    process_env_API_KEY: !!process.env.API_KEY,
    process_env_GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    allEnvVars: Object.keys(import.meta.env)
});

if (!hasApiKey) {
    console.warn('⚠️ Gemini API key not found. Set GEMINI_API_KEY in .env.local file. Using mock data for now.');
} else {
    console.log('✅ Gemini API key loaded successfully');
}

const ai = hasApiKey ? new GoogleGenAI({ apiKey: API_KEY as string }) : null;

// Schemas for JSON responses from Gemini
const stockDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        ticker: { type: Type.STRING },
        companyName: { type: Type.STRING },
        currentPrice: { type: Type.NUMBER },
        change: { type: Type.NUMBER },
        changePercent: { type: Type.NUMBER },
        dayRange: { type: Type.STRING },
        yearRange: { type: Type.STRING },
        marketCap: { type: Type.STRING },
        peRatio: { type: Type.NUMBER, nullable: true },
        dividendYield: { type: Type.NUMBER, nullable: true },
        historicalData: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING },
                    price: { type: Type.NUMBER }
                },
                required: ['date', 'price']
            }
        },
        news: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    url: { type: Type.STRING },
                    source: { type: Type.STRING },
                    summary: { type: Type.STRING }
                },
                required: ['headline', 'url', 'source', 'summary']
            }
        },
        logoUrl: { type: Type.STRING, nullable: true }
    },
    required: [
        'ticker', 'companyName', 'currentPrice', 'change', 'changePercent', 'dayRange', 'yearRange', 'marketCap', 'historicalData', 'news'
    ]
};

const topMoversSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            ticker: { type: Type.STRING },
            companyName: { type: Type.STRING },
            price: { type: Type.NUMBER },
            change: { type: Type.NUMBER },
            changePercent: { type: Type.NUMBER }
        },
        required: ['ticker', 'companyName', 'price', 'change', 'changePercent']
    }
};

const heatmapSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            ticker: { type: Type.STRING },
            companyName: { type: Type.STRING },
            changePercent: { type: Type.NUMBER },
            marketCap: { type: Type.NUMBER },
            sector: { type: Type.STRING },
            logoUrl: { type: Type.STRING, nullable: true }
        },
        required: ['ticker', 'companyName', 'changePercent', 'marketCap', 'sector']
    }
};

const CACHE_DURATION_DETAILS = 30 * 60 * 1000; // 30 minutes (increased from 5)
const CACHE_DURATION_MARKET = 15 * 60 * 1000; // 15 minutes (increased from 2)
const CACHE_DURATION_ANALYSIS = 60 * 60 * 1000; // 1 hour

// Helper to parse JSON safely
const parseJsonResponse = <T>(jsonString: string, logContext: string): T | null => {
    try {
        // The API might return the JSON string wrapped in markdown backticks
        const cleanedString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(cleanedString) as T;
    } catch (e) {
        console.error(`Failed to parse JSON for ${logContext}:`, e);
        console.error("Invalid JSON string:", jsonString);
        return null;
    }
};

export const fetchStockDetails = async (symbol: string): Promise<StockDetails> => {
    const cacheKey = `stock-details-${symbol}`;
    const cachedData = getFromCache<StockDetails>(cacheKey, CACHE_DURATION_DETAILS);
    if (cachedData) {
        return cachedData;
    }

    // Priority 1: Try Yahoo Finance via serverless API
    console.log(`🔍 PRIMARY: Fetching ${symbol} from Yahoo Finance...`);
    
    try {
        const data = await fetchYahooFinance(symbol, '30d', '1d');
        
        if (data && data.chart?.result?.[0]) {
            const result = data.chart.result[0];
            const meta = result?.meta;
            const timestamps = result?.timestamp;
            const prices = result?.indicators?.quote?.[0]?.close;
            
            if (meta && meta.regularMarketPrice && timestamps && prices) {
                const currentPrice = meta.regularMarketPrice;
                const previousClose = meta.chartPreviousClose || meta.previousClose;
                const change = currentPrice - previousClose;
                const changePercent = (change / previousClose) * 100;
                
                const historicalData = timestamps.map((ts: number, index: number) => ({
                    date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    price: parseFloat((prices[index] || 0).toFixed(2))
                })).filter((d: any) => d.price > 0);
                
                const stockData: StockDetails = {
                    ticker: symbol.toUpperCase(),
                    companyName: meta.longName || meta.shortName || symbol.toUpperCase(),
                    currentPrice: parseFloat(currentPrice.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2)),
                    dayRange: meta.regularMarketDayRange || `$${(currentPrice * 0.98).toFixed(2)} - $${(currentPrice * 1.02).toFixed(2)}`,
                    yearRange: meta.fiftyTwoWeekRange || `$${(currentPrice * 0.7).toFixed(2)} - $${(currentPrice * 1.3).toFixed(2)}`,
                    marketCap: meta.marketCap ? `$${(meta.marketCap / 1e9).toFixed(1)}B` : 'N/A',
                    peRatio: null,
                    dividendYield: null,
                    logoUrl: null,
                    historicalData: historicalData,
                    news: [
                        {
                            headline: `${symbol.toUpperCase()} Market Update`,
                            url: `https://finance.yahoo.com/quote/${symbol}`,
                            source: 'Yahoo Finance',
                            summary: `Latest trading data and market information for ${symbol.toUpperCase()}.`
                        }
                    ]
                };
                
                console.log(`✅ PRIMARY SUCCESS: Stock details from Yahoo Finance for ${symbol}`);
                setInCache(cacheKey, stockData);
                return stockData;
            }
        }
    } catch (error) {
        console.error(`❌ PRIMARY FAILED: Yahoo Finance error for ${symbol}:`, error);
    }
    
    // Priority 2: Fallback to Gemini AI
    if (hasApiKey && ai) {
        try {
            console.log(`🔄 SECONDARY: Trying Gemini AI for ${symbol}...`);
            const prompt = `Provide stock information for "${symbol}": company name, current price, day's change, day's range, 52-week range, market cap, P/E ratio, dividend yield. Include last 30 days of daily closing prices and 5 recent news articles.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: stockDetailsSchema,
                }
            });
            
            const data = parseJsonResponse<StockDetails>(response.text, `stock details for ${symbol}`);
            if (data) {
                console.log(`✅ SECONDARY SUCCESS: Stock details from Gemini AI for ${symbol}`);
                setInCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.error(`❌ SECONDARY FAILED: Gemini AI error for ${symbol}:`, error);
        }
    }
    
    throw new Error(`Failed to fetch data for ${symbol} from all sources`);
};

// Prefetch function can just call fetch and ignore the result to populate cache
export const prefetchStockDetails = (symbol: string): void => {
    const cacheKey = `stock-details-${symbol}`;
    const cachedData = getFromCache<StockDetails>(cacheKey, CACHE_DURATION_DETAILS);
    if (!cachedData) {
        fetchStockDetails(symbol).catch(error => {
            console.warn(`Prefetch failed for ${symbol}:`, error);
        });
    }
};


export const getStockAnalysis = async (ticker: string, companyName: string, news: NewsArticle[]): Promise<string> => {
    const cacheKey = `stock-analysis-${ticker}`;
    const cachedData = getFromCache<string>(cacheKey, CACHE_DURATION_ANALYSIS);
    if (cachedData) {
        return cachedData;
    }

    const newsContext = news.slice(0, 5).map(n => `- ${n.headline}: ${n.summary}`).join('\n');
    const prompt = `Based on the following recent news for ${companyName} (${ticker}), provide a brief, balanced "bull vs. bear" analysis for a potential investor. Summarize the key positive and negative points from the news. Conclude with a neutral summary of the overall sentiment. Format the response in Markdown.

Recent News:
${newsContext}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    const analysis = response.text;
    setInCache(cacheKey, analysis);
    return analysis;
};


export const fetchTopMoversData = async (): Promise<TopMover[]> => {
    const cacheKey = 'top-movers';
    const cachedData = getFromCache<TopMover[]>(cacheKey, CACHE_DURATION_MARKET);
    if (cachedData) {
        return cachedData;
    }

    const popularTickers = ['NVDA', 'AMD', 'TSLA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX', 'DIS'];
    
    // Priority 1: Try Yahoo Finance via serverless API
    console.log('🔍 PRIMARY: Fetching top movers from Yahoo Finance...');
    
    try {
        const quotePromises = popularTickers.map(async (ticker) => {
            try {
                const data = await fetchYahooFinance(ticker, '1d', '1d');
                
                if (data && data.chart?.result?.[0]) {
                    const meta = data.chart.result[0]?.meta;
                    
                    if (meta && meta.regularMarketPrice) {
                        const currentPrice = meta.regularMarketPrice;
                        const previousClose = meta.chartPreviousClose || meta.previousClose;
                        const change = currentPrice - previousClose;
                        const changePercent = (change / previousClose) * 100;
                        
                        return {
                            ticker: ticker,
                            companyName: meta.longName || meta.shortName || ticker,
                            price: parseFloat(currentPrice.toFixed(2)),
                            change: parseFloat(change.toFixed(2)),
                            changePercent: parseFloat(changePercent.toFixed(2))
                        };
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch ${ticker} from Yahoo`);
            }
            return null;
        });
        
        const results = await Promise.all(quotePromises);
        const validMovers = results.filter(m => m !== null) as TopMover[];
        
        if (validMovers.length >= 6) {
            const sorted = validMovers.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
            const topMovers = sorted.slice(0, 6);
            
            console.log('✅ PRIMARY SUCCESS: Top movers from Yahoo Finance:', topMovers.length);
            setInCache(cacheKey, topMovers);
            return topMovers;
        } else {
            console.warn(`⚠️ Yahoo Finance returned only ${validMovers.length} movers, trying Gemini...`);
        }
    } catch (error) {
        console.error('❌ PRIMARY FAILED: Yahoo Finance error:', error);
    }
    
    // Priority 2: Fallback to Gemini AI
    if (hasApiKey && ai) {
        try {
            console.log('🔄 SECONDARY: Trying Gemini AI for top movers...');
            const prompt = `List the top 6 market movers today from major US stocks. Include 3 top gainers and 3 top losers. For each: ticker, company name, current price, change value, change percentage.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: topMoversSchema,
                }
            });
            
            const data = parseJsonResponse<TopMover[]>(response.text, 'top movers');
            if (data && data.length > 0) {
                console.log('✅ SECONDARY SUCCESS: Top movers from Gemini AI:', data.length);
                setInCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.error('❌ SECONDARY FAILED: Gemini AI error:', error);
        }
    }
    
    throw new Error('All data sources failed for top movers');
};

export const fetchHeatmapData = async (): Promise<HeatmapStock[]> => {
    const cacheKey = 'heatmap-data';
    const cachedData = getFromCache<HeatmapStock[]>(cacheKey, CACHE_DURATION_MARKET);
    if (cachedData) {
        console.log('⚡ Using cached heatmap data');
        return cachedData;
    }
    
    // Top 80 S&P 500 stocks by market cap - more stocks to fill grid
    const topTickers = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'UNH',
        'XOM', 'JNJ', 'WMT', 'JPM', 'MA', 'PG', 'CVX', 'HD', 'MRK', 'ABBV',
        'KO', 'PEP', 'COST', 'AVGO', 'LLY', 'MCD', 'TMO', 'CSCO', 'ACN', 'ADBE',
        'NKE', 'DIS', 'NFLX', 'CMCSA', 'VZ', 'INTC', 'AMD', 'CRM', 'ORCL', 'TXN',
        'BA', 'CAT', 'UPS', 'HON', 'NEE', 'LIN', 'DHR', 'PM', 'ABT', 'BMY',
        'QCOM', 'RTX', 'SBUX', 'INTU', 'AMGN', 'LOW', 'SPGI', 'GE', 'NOW', 'BKNG',
        'GILD', 'AXP', 'BLK', 'MDLZ', 'ISRG', 'TJX', 'MMM', 'CVS', 'PLD', 'CB',
        'SYK', 'CI', 'ZTS', 'MO', 'REGN', 'VRTX', 'DUK', 'SO', 'PNC', 'USB'
    ];
    
    // Priority 1: Try Yahoo Finance via serverless API
    console.log('🔍 PRIMARY: Fetching heatmap data from Yahoo Finance...');
    
    try {
        const quotePromises = topTickers.map(async (ticker) => {
            try {
                const data = await fetchYahooFinance(ticker, '1d', '1d');
                
                if (data && data.chart?.result?.[0]) {
                    const quote = data.chart.result[0];
                    const meta = quote?.meta;
                    
                    if (meta && meta.regularMarketPrice) {
                        const currentPrice = meta.regularMarketPrice;
                        const previousClose = meta.chartPreviousClose || meta.previousClose;
                        const change = currentPrice - previousClose;
                        const changePercent = (change / previousClose) * 100;
                        
                        // Fallback market cap if not provided by API
                        let marketCap = meta.marketCap || 0;
                        if (!marketCap || marketCap === 0) {
                            marketCap = getEstimatedMarketCap(ticker);
                        }
                        
                        return {
                            ticker: ticker,
                            companyName: meta.longName || meta.shortName || ticker,
                            changePercent: parseFloat(changePercent.toFixed(2)),
                            marketCap: marketCap,
                            sector: getSectorForTicker(ticker),
                            logoUrl: getStockLogoUrl(ticker)
                        };
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch ${ticker} from Yahoo`);
            }
            return null;
        });
        
        const results = await Promise.all(quotePromises);
        const validStocks = results.filter(s => s !== null) as HeatmapStock[];
        
        if (validStocks.length >= 20) { // At least 20 stocks
            console.log('✅ PRIMARY SUCCESS: Heatmap data from Yahoo Finance:', validStocks.length, 'stocks');
            setInCache(cacheKey, validStocks);
            return validStocks;
        } else {
            console.warn(`⚠️ Yahoo Finance returned only ${validStocks.length} stocks, trying Gemini...`);
        }
    } catch (error) {
        console.error('❌ PRIMARY FAILED: Yahoo Finance error:', error);
    }
    
    // Priority 2: Fallback to Gemini AI
    if (hasApiKey && ai) {
        try {
            console.log('🔄 SECONDARY: Trying Gemini AI as fallback...');
            const prompt = `Generate data for a stock market heatmap. Provide a list of 50 major S&P 500 companies from diverse sectors. For each: ticker, company name, today's percentage change (realistic -5% to +5%), market cap, sector.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: heatmapSchema,
                }
            });
            
            const data = parseJsonResponse<HeatmapStock[]>(response.text, 'heatmap data');
            if (data && data.length > 0) {
                console.log('✅ SECONDARY SUCCESS: Heatmap from Gemini AI:', data.length, 'stocks');
                setInCache(cacheKey, data);
                return data;
            }
        } catch (error) {
            console.error('❌ SECONDARY FAILED: Gemini AI error:', error);
        }
    }
    
    throw new Error('All data sources failed. Yahoo Finance blocked and Gemini AI unavailable.');
};

// Helper function to get estimated market cap (in dollars) when API doesn't provide it
function getEstimatedMarketCap(ticker: string): number {
    const marketCaps: { [key: string]: number } = {
        'AAPL': 3500e9, 'MSFT': 3200e9, 'GOOGL': 2100e9, 'AMZN': 1900e9, 'NVDA': 3000e9,
        'META': 1300e9, 'TSLA': 800e9, 'BRK.B': 900e9, 'V': 600e9, 'UNH': 500e9,
        'XOM': 450e9, 'JNJ': 400e9, 'WMT': 550e9, 'JPM': 550e9, 'MA': 450e9,
        'PG': 400e9, 'CVX': 300e9, 'HD': 380e9, 'MRK': 280e9, 'ABBV': 320e9,
        'KO': 280e9, 'PEP': 250e9, 'COST': 380e9, 'AVGO': 700e9, 'LLY': 650e9,
        'MCD': 220e9, 'TMO': 220e9, 'CSCO': 220e9, 'ACN': 210e9, 'ADBE': 240e9,
        'NKE': 180e9, 'DIS': 200e9, 'NFLX': 280e9, 'CMCSA': 180e9, 'VZ': 180e9,
        'INTC': 180e9, 'AMD': 280e9, 'CRM': 280e9, 'ORCL': 350e9, 'TXN': 180e9,
        'BA': 140e9, 'CAT': 160e9, 'UPS': 140e9, 'HON': 150e9, 'NEE': 160e9,
        'LIN': 200e9, 'DHR': 180e9, 'PM': 160e9, 'ABT': 180e9, 'BMY': 110e9,
        'QCOM': 200e9, 'RTX': 140e9, 'SBUX': 110e9, 'INTU': 180e9, 'AMGN': 140e9,
        'LOW': 140e9, 'SPGI': 140e9, 'GE': 180e9, 'NOW': 160e9, 'BKNG': 140e9,
        'GILD': 100e9, 'AXP': 160e9, 'BLK': 130e9, 'MDLZ': 90e9, 'ISRG': 140e9,
        'TJX': 110e9, 'MMM': 80e9, 'CVS': 90e9, 'PLD': 130e9, 'CB': 90e9,
        'SYK': 120e9, 'CI': 90e9, 'ZTS': 90e9, 'MO': 90e9, 'REGN': 100e9,
        'VRTX': 120e9, 'DUK': 80e9, 'SO': 80e9, 'PNC': 70e9, 'USB': 70e9
    };
    return marketCaps[ticker] || 100e9; // Default to 100B if not found
}

// Helper function to map tickers to sectors
function getSectorForTicker(ticker: string): string {
    const sectorMap: { [key: string]: string } = {
        // Technology
        'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'NVDA': 'Technology',
        'META': 'Technology', 'AVGO': 'Technology', 'CSCO': 'Technology', 'ADBE': 'Technology',
        'CRM': 'Technology', 'ORCL': 'Technology', 'INTC': 'Technology', 'AMD': 'Technology',
        'TXN': 'Technology', 'ACN': 'Technology', 'QCOM': 'Technology', 'INTU': 'Technology',
        'NOW': 'Technology',
        
        // Consumer Discretionary
        'AMZN': 'Consumer Discretionary', 'TSLA': 'Consumer Discretionary', 'HD': 'Consumer Discretionary',
        'MCD': 'Consumer Discretionary', 'NKE': 'Consumer Discretionary', 'SBUX': 'Consumer Discretionary',
        'LOW': 'Consumer Discretionary', 'BKNG': 'Consumer Discretionary', 'TJX': 'Consumer Discretionary',
        
        // Healthcare
        'JNJ': 'Healthcare', 'UNH': 'Healthcare', 'MRK': 'Healthcare', 'ABBV': 'Healthcare',
        'LLY': 'Healthcare', 'TMO': 'Healthcare', 'ABT': 'Healthcare', 'DHR': 'Healthcare',
        'BMY': 'Healthcare', 'AMGN': 'Healthcare', 'GILD': 'Healthcare', 'ISRG': 'Healthcare',
        'CVS': 'Healthcare', 'CI': 'Healthcare', 'ZTS': 'Healthcare', 'REGN': 'Healthcare',
        'VRTX': 'Healthcare', 'SYK': 'Healthcare',
        
        // Financials
        'JPM': 'Financials', 'V': 'Financials', 'MA': 'Financials', 'BRK.B': 'Financials',
        'AXP': 'Financials', 'BLK': 'Financials', 'SPGI': 'Financials', 'CB': 'Financials',
        'PNC': 'Financials', 'USB': 'Financials',
        
        // Energy
        'XOM': 'Energy', 'CVX': 'Energy',
        
        // Consumer Staples
        'WMT': 'Consumer Staples', 'PG': 'Consumer Staples', 'KO': 'Consumer Staples',
        'PEP': 'Consumer Staples', 'COST': 'Consumer Staples', 'PM': 'Consumer Staples',
        'MDLZ': 'Consumer Staples', 'MO': 'Consumer Staples',
        
        // Communication
        'DIS': 'Communication', 'NFLX': 'Communication', 'CMCSA': 'Communication',
        'VZ': 'Communication',
        
        // Industrials
        'BA': 'Industrials', 'CAT': 'Industrials', 'UPS': 'Industrials', 'HON': 'Industrials',
        'NEE': 'Industrials', 'LIN': 'Industrials', 'RTX': 'Industrials', 'GE': 'Industrials',
        'MMM': 'Industrials', 'PLD': 'Industrials', 'DUK': 'Industrials', 'SO': 'Industrials'
    };
    return sectorMap[ticker] || 'Other';
}

export const fetchMarketData = async (tickers: string[]): Promise<{ [key: string]: number }> => {
    if (tickers.length === 0) {
        return {};
    }
    
    // Separate crypto and stock tickers
    const cryptoTickers = tickers.filter(t => isCrypto(t));
    const stockTickers = tickers.filter(t => !isCrypto(t));
    
    const allPrices: { [key: string]: number } = {};
    
    // Try to fetch crypto prices from CoinGecko (fast!)
    if (cryptoTickers.length > 0) {
        console.log('🪙 Attempting to fetch crypto prices from CoinGecko...');
        const cryptoPrices = await fetchCryptoPrices(cryptoTickers);
        
        if (Object.keys(cryptoPrices).length > 0) {
            Object.assign(allPrices, cryptoPrices);
            console.log('⚡ Crypto prices fetched from CoinGecko:', Object.keys(cryptoPrices).length);
        } else {
            console.error('❌ No crypto prices returned from CoinGecko');
        }
    }
    
    // Try to fetch stock prices from Finnhub/Yahoo (fast!)
    if (stockTickers.length > 0) {
        console.log('📈 Attempting to fetch stock prices from Finnhub/Yahoo...');
        const stockPrices = await fetchStockPricesWithFallback(stockTickers);
        
        if (Object.keys(stockPrices).length > 0) {
            Object.assign(allPrices, stockPrices);
            console.log('⚡ Stock prices fetched from Finnhub/Yahoo:', Object.keys(stockPrices).length);
        } else {
            console.error('❌ No stock prices returned from Finnhub/Yahoo');
        }
    }
    
    return allPrices;
};
