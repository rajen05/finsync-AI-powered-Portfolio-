// Fix: This file was a placeholder. It is now implemented with functions that call the Gemini API to fetch financial data required by various components.
import { GoogleGenAI, Type } from "@google/genai";
import { StockDetails, NewsArticle, HeatmapStock, TopMover } from '../types';
import { getFromCache, setInCache } from './cachingService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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

const CACHE_DURATION_DETAILS = 5 * 60 * 1000; // 5 minutes
const CACHE_DURATION_MARKET = 2 * 60 * 1000; // 2 minutes
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

    const prompt = `Provide detailed stock information for the ticker "${symbol}". Include the company name, current price, day's change (value and percent), day's range, 52-week range, market cap, P/E ratio, dividend yield. Also, provide the last 90 days of historical daily closing prices and 10 recent news articles with headlines, URLs, sources, and summaries. Provide a public URL for the company's logo. If it's a crypto ticker like 'BTC-USD', provide similar relevant data.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
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

    const prompt = `List the top 10 market movers for today from the US stock market (e.g., S&P 500, NASDAQ). Include both top gainers and losers. For each, provide the ticker, company name, current price, change value, and change percentage.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
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
        return cachedData;
    }
    
    const prompt = `Generate data for a stock market heatmap representing the S&P 500. Provide a list of 50 diverse companies from different sectors. For each company, give me the ticker, company name, percentage change for the day, total market cap (as a number, not string), its primary sector (e.g., "Technology", "Healthcare"), and a public URL for its logo.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: heatmapSchema,
        }
    });

    const data = parseJsonResponse<HeatmapStock[]>(response.text, 'heatmap data');
    if (!data) {
        console.error('Returning empty array for heatmap data due to parse failure');
        return [];
    }

    setInCache(cacheKey, data);
    return data;
};

export const fetchMarketData = async (tickers: string[]): Promise<{ [key: string]: number }> => {
    if (tickers.length === 0) {
        return {};
    }
    const cacheKey = `market-prices-${tickers.sort().join(',')}`;
    const cachedData = getFromCache<{ [key: string]: number }>(cacheKey, CACHE_DURATION_MARKET);
    if (cachedData) {
        return cachedData;
    }

    const prompt = `Get the current market price for the following tickers: ${tickers.join(', ')}. Return the data as a JSON object where keys are the tickers and values are the prices (as numbers).`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });
    
    const data = parseJsonResponse<{ [key: string]: number }>(response.text, `market prices for ${tickers.join(', ')}`);
    if (!data) {
        console.error('Returning empty object for market prices due to parse failure');
        return {};
    }

    setInCache(cacheKey, data);
    return data;
};
