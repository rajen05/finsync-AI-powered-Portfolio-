// Market News Component
import React, { useEffect, useState } from 'react';

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  image?: string;
}

const MarketNews: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketNews();
  }, []);

  const fetchMarketNews = async () => {
    setLoading(true);
    try {
      // Try to fetch from NewsAPI (you can get free API key from newsapi.org)
      // For now, using RSS feed proxy as fallback
      const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US');
      const data = await response.json();
      
      if (data.status === 'ok' && data.items) {
        const fetchedNews: NewsArticle[] = data.items.slice(0, 6).map((item: any) => ({
          title: item.title,
          source: 'Yahoo Finance',
          url: item.link,
          publishedAt: item.pubDate,
          summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' || 'Market news update',
          image: item.thumbnail || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop'
        }));
        
        setNews(fetchedNews);
      } else {
        throw new Error('Failed to fetch news');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // Fallback to basic market news if API fails
      const fallbackNews: NewsArticle[] = [
        {
          title: "Market Update - Refresh to get latest news",
          source: "Market Data",
          url: "https://finance.yahoo.com/markets",
          publishedAt: new Date().toISOString(),
          summary: "Click refresh to fetch the latest market news from Yahoo Finance.",
          image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop"
        }
      ];
      
      setNews(fallbackNews);
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Market News</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="w-32 h-20 bg-slate-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    setLoading(true);
    fetchMarketNews();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Market News</h2>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg transition-colors text-sm font-medium"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-xs">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-50 dark:bg-slate-700 rounded-lg overflow-hidden hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer border border-gray-200 dark:border-slate-600"
          >
            {article.image && (
              <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">{article.summary}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-slate-500 font-medium">{article.source}</span>
                <span className="text-gray-400 dark:text-slate-600">{formatTimeAgo(article.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* View More */}
      <div className="mt-6 text-center">
        <button 
          onClick={() => window.open('https://www.cnbc.com/markets/', '_blank')}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors hover:underline cursor-pointer"
        >
          View More News →
        </button>
      </div>
    </div>
  );
};

export default MarketNews;
