import React, { useState, useEffect } from 'react';
import { fetchStockDetails, getStockAnalysis } from '../services/geminiService';
import { StockDetails } from '../types';
import StockChart from './StockChart';
import ReactMarkdown from 'react-markdown';

interface StockDetailViewProps {
  symbol: string;
  onBack: () => void;
}

const Stat: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-slate-700">
    <span className="text-sm text-slate-400">{label}</span>
    <span className="text-sm font-medium text-white">{value ?? 'N/A'}</span>
  </div>
);

const StockDetailView: React.FC<StockDetailViewProps> = ({ symbol, onBack }) => {
  const [details, setDetails] = useState<StockDetails | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  useEffect(() => {
    const getDetails = async () => {
      if (!symbol) return;
      setLoading(true);
      setAnalysisLoading(true);
      setError(null);
      setDetails(null);
      setAnalysis('');

      try {
        const data = await fetchStockDetails(symbol);
        setDetails(data);
        if (data && data.news && data.news.length > 0) {
          getStockAnalysis(data.ticker, data.companyName, data.news)
            .then(setAnalysis)
            .finally(() => setAnalysisLoading(false));
        } else {
            setAnalysis('Not enough recent news to generate an AI analysis.');
            setAnalysisLoading(false);
        }
      } catch (err) {
        setError(`Failed to fetch data for ${symbol}. The symbol may be incorrect or the API may be unavailable.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getDetails();
  }, [symbol]);

  if (loading) {
    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 min-h-[500px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg border border-red-900/50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">Stock Not Found</h3>
          <p className="text-red-400 mb-4">
            We couldn't find data for "<span className="font-semibold">{symbol}</span>"
          </p>
          <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-400 mb-2">💡 <strong className="text-white">Try searching for:</strong></p>
            <ul className="text-sm text-slate-400 space-y-1 ml-6 list-disc">
              <li>Company name: <span className="text-blue-400">Apple, Microsoft, Tesla</span></li>
              <li>Stock symbol: <span className="text-blue-400">AAPL, MSFT, TSLA</span></li>
              <li>Crypto symbol: <span className="text-orange-400">BTC-USD, ETH-USD</span></li>
            </ul>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-slate-400 mb-4">
            Unable to load data for {symbol}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  const isPositive = details.changePercent >= 0;
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
                {details.logoUrl && <img src={details.logoUrl} alt={`${details.companyName} logo`} className="h-12 w-12 rounded-full bg-white p-1"/>}
                <div>
                    <h2 className="text-2xl font-bold text-white">{details.companyName} ({details.ticker})</h2>
                    <div className="flex items-baseline space-x-2 mt-1">
                        <p className="text-3xl font-semibold text-white">${details.currentPrice.toFixed(2)}</p>
                        <p className={`text-xl font-semibold ${colorClass}`}>
                            {isPositive ? '+' : ''}{details.change.toFixed(2)} ({isPositive ? '+' : ''}{details.changePercent.toFixed(2)}%)
                        </p>
                    </div>
                </div>
            </div>
            <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                &larr; Back to Search
            </button>
        </div>

        <div className="mt-4">
            <StockChart data={details.historicalData} changePercent={details.changePercent} symbol={details.ticker} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Key Statistics</h3>
          <div className="space-y-2">
            <Stat label="Day's Range" value={details.dayRange} />
            <Stat label="52-Week Range" value={details.yearRange} />
            <Stat label="Market Cap" value={details.marketCap} />
            <Stat label="P/E Ratio" value={details.peRatio ? details.peRatio.toFixed(2) : 'N/A'} />
            <Stat label="Dividend Yield" value={details.dividendYield ? `${details.dividendYield.toFixed(2)}%` : 'N/A'} />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-semibold text-white">AI-Powered Analysis</h3>
            <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full">Gemini AI</span>
          </div>
          {analysisLoading ? (
            <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-1/4 mt-4"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none 
              [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-3 [&>h1]:mt-4
              [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-white [&>h2]:mb-2 [&>h2]:mt-3
              [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-blue-400 [&>h3]:mb-2 [&>h3]:mt-3
              [&>p]:text-slate-300 [&>p]:leading-relaxed [&>p]:mb-3
              [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-3 [&>ul]:text-slate-300
              [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-3 [&>ol]:text-slate-300
              [&>li]:mb-1
              [&>strong]:text-white [&>strong]:font-semibold
              [&>em]:text-blue-300 [&>em]:italic
              [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-400
              [&>code]:bg-slate-900 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm [&>code]:text-blue-300
              [&>hr]:border-slate-700 [&>hr]:my-4
            ">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent News</h3>
        <ul className="space-y-4">
          {details.news.length > 0 ? details.news.slice(0, 5).map((item, index) => (
            <li key={index} className="border-b border-slate-700 pb-4 last:border-b-0 last:pb-0">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                <h4 className="font-semibold text-white">{item.headline}</h4>
              </a>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.summary}</p>
              <div className="text-xs text-slate-500 mt-2">
                <span>{item.source}</span>
              </div>
            </li>
          )) : <p className="text-slate-400">No recent news available.</p>}
        </ul>
      </div>
    </div>
  );
};

export default StockDetailView;