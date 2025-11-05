import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { useMarketData } from '../context/MarketDataProvider';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY as string }) : null;

export const StockSummary: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { topMovers, heatmapData } = useMarketData();

  useEffect(() => {
    generateMarketSummary();
  }, [topMovers, heatmapData]);

  const generateMarketSummary = async () => {
    if (!ai) {
      setSummary('AI-powered market summary is currently unavailable. Please add your Gemini API key to enable this feature.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare market context
      const topGainers = topMovers?.filter(m => m.changePercent > 0).slice(0, 3) || [];
      const topLosers = topMovers?.filter(m => m.changePercent < 0).slice(0, 3) || [];
      
      const marketContext = `
Top Gainers Today:
${topGainers.map(m => `- ${m.ticker} (${m.companyName}): +${m.changePercent.toFixed(2)}%`).join('\n')}

Top Losers Today:
${topLosers.map(m => `- ${m.ticker} (${m.companyName}): ${m.changePercent.toFixed(2)}%`).join('\n')}

Total stocks tracked: ${heatmapData?.length || 0}
`;

      const prompt = `You are a professional stock market analyst. Based on the following market data, provide a concise, insightful summary of today's stock market performance. Include:

1. Overall market sentiment (bullish/bearish/neutral)
2. Key trends and notable movements
3. Sector highlights
4. Brief outlook for investors

Keep it under 150 words, professional yet accessible. Use bullet points where appropriate.

Market Data:
${marketContext}

Provide the summary in markdown format.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const generatedSummary = response.text;
      setSummary(generatedSummary);
    } catch (err) {
      console.error('Error generating market summary:', err);
      setError('Failed to generate market summary. Please try again later.');
      setSummary('Market data is being analyzed. Please refresh to see the latest insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Market Intelligence</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Analysis</p>
          </div>
        </div>
        <button
          onClick={generateMarketSummary}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          title="Refresh summary"
        >
          <svg
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-4/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 dark:text-gray-300">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
                ),
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        )}

        {/* Market Stats */}
        {!loading && topMovers && topMovers.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Top Gainer</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {topMovers.filter(m => m.changePercent > 0)[0]?.ticker || 'N/A'}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                +{topMovers.filter(m => m.changePercent > 0)[0]?.changePercent.toFixed(2) || '0.00'}%
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Top Loser</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {topMovers.filter(m => m.changePercent < 0)[0]?.ticker || 'N/A'}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400 font-semibold">
                {topMovers.filter(m => m.changePercent < 0)[0]?.changePercent.toFixed(2) || '0.00'}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};
