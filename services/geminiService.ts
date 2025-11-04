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

    console.log(`🔍 Fetching real data for ${symbol} from Gemini AI...`);
    
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
        throw new Error('API key not configured for top movers');
    }

    console.log('🔍 Fetching real top movers from Gemini AI...');
    
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
        throw new Error('Failed to parse top movers data');
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
    
    if (!hasApiKey || !ai) {
        throw new Error('API key not configured for heatmap');
    }
    
    console.log('🔍 Fetching real heatmap data from Gemini AI...');
    
    const prompt = `Generate data for a stock market heatmap. Provide a list of 50 major companies from diverse sectors including: Technology, Healthcare, Financials, Consumer Discretionary, Consumer Staples, Energy, Industrials, Communication Services, Materials, Utilities, and Real Estate. For each company, provide: ticker symbol, company name, today's percentage change, market cap as a number, primary sector, and a public logo URL (use official company logo URLs). Focus on well-known S&P 500 companies with variety across all sectors.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: heatmapSchema,
        }
    });

    const data = parseJsonResponse<HeatmapStock[]>(response.text, 'heatmap data');
    if (!data) {
        throw new Error('Failed to parse heatmap data');
    }

    console.log('✅ Heatmap data fetched successfully:', data.length, 'stocks');
    setInCache(cacheKey, data);
    return data;
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
