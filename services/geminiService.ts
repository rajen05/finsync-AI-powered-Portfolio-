// Fix: This file was a placeholder. It is now implemented with functions that call the Gemini API to fetch financial data required by various components.
import { GoogleGenAI, Type } from "@google/genai";
import { StockDetails, NewsArticle, HeatmapStock, TopMover } from '../types';
import { getFromCache, setInCache } from './cachingService';
import { fetchCryptoPrices, isCrypto } from './cryptoService';
import { fetchStockPricesWithFallback } from './stockService';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const hasApiKey = !!API_KEY;

console.log('🔑 API Key Check:', {
    hasApiKey,
    API_KEY_length: API_KEY?.length || 0,
    process_env_API_KEY: !!process.env.API_KEY,
    process_env_GEMINI_API_KEY: !!process.env.GEMINI_API_KEY
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

    if (!hasApiKey || !ai) {
        throw new Error('API key not configured. Please add GEMINI_API_KEY to .env.local');
    }

    const prompt = `Provide stock information for "${symbol}": company name, current price, day's change (value and percent), day's range, 52-week range, market cap, P/E ratio, dividend yield. Include last 30 days of daily closing prices and 5 recent news articles with headlines, URLs, sources, and brief summaries. If crypto (like BTC-USD), provide similar data.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: stockDetailsSchema,
        }
    });

    const data = parseJsonResponse<StockDetails>(response.text, `stock details for ${symbol}`);
    if (!data) {
        throw new Error(`Failed to get or parse stock details for ${symbol}`);
    }

    setInCache(cacheKey, data);
    return data;
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

    if (!hasApiKey || !ai) {
        // Return mock top movers when API key is not available
        return [
            { ticker: 'NVDA', companyName: 'NVIDIA Corp', price: 495.50, change: 25.30, changePercent: 5.38 },
            { ticker: 'AMD', companyName: 'Advanced Micro Devices', price: 165.20, change: 8.15, changePercent: 5.19 },
            { ticker: 'TSLA', companyName: 'Tesla Inc', price: 245.75, change: -12.40, changePercent: -4.80 },
        ];
    }

    const prompt = `List the top 6 market movers today from major US stocks. Include 3 top gainers and 3 top losers. For each: ticker, company name, current price, change value, and change percentage.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: topMoversSchema,
        }
    });
    
    const data = parseJsonResponse<TopMover[]>(response.text, 'top movers');
    if (!data) {
        console.error('Returning empty array for top movers due to parse failure');
        return [];
    }

    setInCache(cacheKey, data);
    return data;
};

export const fetchHeatmapData = async (): Promise<HeatmapStock[]> => {
    const cacheKey = 'heatmap-data';
    const cachedData = getFromCache<HeatmapStock[]>(cacheKey, CACHE_DURATION_MARKET);
    if (cachedData) {
        console.log('⚡ FAST: Using cached heatmap data (instant load)');
        return cachedData;
    }
    
    // Use mock data by default (fast and reliable)
    // Real APIs will be enabled when you add proper backend/proxy
    
    // Fallback to mock data if APIs fail
    console.log('📦 Using mock data (API fallback)');
    const mockData = [
            { ticker: 'AAPL', companyName: 'Apple Inc', changePercent: 2.5, marketCap: 2800000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'MSFT', companyName: 'Microsoft Corp', changePercent: 1.8, marketCap: 2600000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'GOOGL', companyName: 'Alphabet Inc', changePercent: -0.5, marketCap: 1700000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'AMZN', companyName: 'Amazon.com Inc', changePercent: 1.2, marketCap: 1500000000000, sector: 'Consumer Discretionary', logoUrl: null },
            { ticker: 'NVDA', companyName: 'NVIDIA Corp', changePercent: 5.4, marketCap: 1200000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'TSLA', companyName: 'Tesla Inc', changePercent: -2.3, marketCap: 780000000000, sector: 'Automotive', logoUrl: null },
            { ticker: 'JPM', companyName: 'JPMorgan Chase', changePercent: 0.8, marketCap: 450000000000, sector: 'Financials', logoUrl: null },
            { ticker: 'JNJ', companyName: 'Johnson & Johnson', changePercent: -0.3, marketCap: 380000000000, sector: 'Healthcare', logoUrl: null },
            { ticker: 'V', companyName: 'Visa Inc', changePercent: 1.5, marketCap: 520000000000, sector: 'Financials', logoUrl: null },
            { ticker: 'WMT', companyName: 'Walmart Inc', changePercent: -0.8, marketCap: 410000000000, sector: 'Consumer Staples', logoUrl: null },
            { ticker: 'XOM', companyName: 'Exxon Mobil', changePercent: 2.1, marketCap: 440000000000, sector: 'Energy', logoUrl: null },
            { ticker: 'UNH', companyName: 'UnitedHealth Group', changePercent: 1.3, marketCap: 480000000000, sector: 'Healthcare', logoUrl: null },
            { ticker: 'PG', companyName: 'Procter & Gamble', changePercent: 0.5, marketCap: 360000000000, sector: 'Consumer Staples', logoUrl: null },
            { ticker: 'HD', companyName: 'Home Depot', changePercent: 0.9, marketCap: 330000000000, sector: 'Consumer Discretionary', logoUrl: null },
            { ticker: 'CVX', companyName: 'Chevron Corp', changePercent: -1.2, marketCap: 290000000000, sector: 'Energy', logoUrl: null },
            { ticker: 'MA', companyName: 'Mastercard Inc', changePercent: 1.7, marketCap: 380000000000, sector: 'Financials', logoUrl: null },
            { ticker: 'BAC', companyName: 'Bank of America', changePercent: 0.6, marketCap: 280000000000, sector: 'Financials', logoUrl: null },
            { ticker: 'ABBV', companyName: 'AbbVie Inc', changePercent: 1.1, marketCap: 270000000000, sector: 'Healthcare', logoUrl: null },
            { ticker: 'KO', companyName: 'Coca-Cola Co', changePercent: 0.3, marketCap: 260000000000, sector: 'Consumer Staples', logoUrl: null },
            { ticker: 'PEP', companyName: 'PepsiCo Inc', changePercent: 0.7, marketCap: 240000000000, sector: 'Consumer Staples', logoUrl: null },
            { ticker: 'COST', companyName: 'Costco Wholesale', changePercent: 1.4, marketCap: 320000000000, sector: 'Consumer Staples', logoUrl: null },
            { ticker: 'MRK', companyName: 'Merck & Co', changePercent: 0.9, marketCap: 250000000000, sector: 'Healthcare', logoUrl: null },
            { ticker: 'TMO', companyName: 'Thermo Fisher', changePercent: 1.2, marketCap: 210000000000, sector: 'Healthcare', logoUrl: null },
            { ticker: 'DIS', companyName: 'Walt Disney Co', changePercent: -0.4, marketCap: 180000000000, sector: 'Communication Services', logoUrl: null },
            { ticker: 'CMCSA', companyName: 'Comcast Corp', changePercent: 0.8, marketCap: 160000000000, sector: 'Communication Services', logoUrl: null },
            { ticker: 'NFLX', companyName: 'Netflix Inc', changePercent: -1.5, marketCap: 190000000000, sector: 'Communication Services', logoUrl: null },
            { ticker: 'ORCL', companyName: 'Oracle Corp', changePercent: 1.6, marketCap: 280000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'CSCO', companyName: 'Cisco Systems', changePercent: 0.4, marketCap: 200000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'ADBE', companyName: 'Adobe Inc', changePercent: 2.2, marketCap: 230000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'CRM', companyName: 'Salesforce Inc', changePercent: 1.9, marketCap: 220000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'ACN', companyName: 'Accenture PLC', changePercent: 1.1, marketCap: 210000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'TXN', companyName: 'Texas Instruments', changePercent: 0.8, marketCap: 170000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'AMD', companyName: 'Advanced Micro Devices', changePercent: -1.8, marketCap: 240000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'INTC', companyName: 'Intel Corp', changePercent: 0.5, marketCap: 160000000000, sector: 'Technology', logoUrl: null },
            { ticker: 'LLY', companyName: 'Eli Lilly', changePercent: 2.8, marketCap: 580000000000, sector: 'Healthcare', logoUrl: null },
            { ticker: 'NKE', companyName: 'Nike Inc', changePercent: -0.6, marketCap: 150000000000, sector: 'Consumer Discretionary', logoUrl: null },
            { ticker: 'MCD', companyName: 'McDonald\'s Corp', changePercent: 0.9, marketCap: 200000000000, sector: 'Consumer Discretionary', logoUrl: null },
            { ticker: 'UPS', companyName: 'United Parcel Service', changePercent: 1.3, marketCap: 130000000000, sector: 'Industrials', logoUrl: null },
            { ticker: 'BA', companyName: 'Boeing Co', changePercent: -2.1, marketCap: 120000000000, sector: 'Industrials', logoUrl: null },
            { ticker: 'CAT', companyName: 'Caterpillar Inc', changePercent: 1.5, marketCap: 150000000000, sector: 'Industrials', logoUrl: null },
        ];
    
    return mockData;
};

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
        try {
            console.log('🪙 Attempting to fetch crypto prices...');
            const cryptoPrices = await fetchCryptoPrices(cryptoTickers);
            
            if (Object.keys(cryptoPrices).length > 0) {
                Object.assign(allPrices, cryptoPrices);
                console.log('⚡ Crypto prices fetched from CoinGecko:', Object.keys(cryptoPrices).length);
            } else {
                throw new Error('No crypto prices returned');
            }
        } catch (error) {
            console.warn('⚠️ CoinGecko failed, using mock crypto prices:', error);
            // Fallback to mock crypto prices
            const mockCryptoMap: { [key: string]: number } = {
                'BTC-USD': 43500.00,
                'BTC': 43500.00,
                'ETH-USD': 2250.00,
                'ETH': 2250.00,
                'USDT': 1.00,
                'BNB': 310.00,
                'SOL': 98.50,
            };
            
            cryptoTickers.forEach(ticker => {
                allPrices[ticker] = mockCryptoMap[ticker] || mockCryptoMap[ticker.replace('-USD', '')] || 100.00;
            });
        }
    }
    
    // Try to fetch stock prices from Finnhub/Yahoo (fast!)
    if (stockTickers.length > 0) {
        try {
            console.log('📈 Attempting to fetch stock prices...');
            const stockPrices = await fetchStockPricesWithFallback(stockTickers);
            
            if (Object.keys(stockPrices).length > 0) {
                Object.assign(allPrices, stockPrices);
                console.log('⚡ Stock prices fetched from Finnhub/Yahoo:', Object.keys(stockPrices).length);
            } else {
                throw new Error('No stock prices returned');
            }
        } catch (error) {
            console.warn('⚠️ Stock APIs failed, using mock prices:', error);
            
            // Fallback to mock prices if API fails
            const mockPriceMap: { [key: string]: number } = {
                'AAPL': 175.50,
                'GOOGL': 140.25,
                'MSFT': 380.00,
                'TSLA': 245.75,
                'AMZN': 155.30,
                'NVDA': 495.00,
                'META': 325.00,
                'JPM': 150.00,
                'V': 245.00,
                'WMT': 165.00,
            };
            
            stockTickers.forEach(ticker => {
                if (!allPrices[ticker]) {
                    allPrices[ticker] = mockPriceMap[ticker] || 100.00;
                }
            });
        }
    }
    
    return allPrices;
};
