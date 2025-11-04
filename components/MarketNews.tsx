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
    try {
      // Mock news data with real external links
      const mockNews: NewsArticle[] = [
        {
          title: "Tech Stocks Rally as AI Investments Surge",
          source: "Financial Times",
          url: "https://www.ft.com/technology",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          summary: "Major technology companies see significant gains as artificial intelligence investments continue to drive market sentiment.",
          image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop"
        },
        {
          title: "Federal Reserve Holds Interest Rates Steady",
          source: "Bloomberg",
          url: "https://www.bloomberg.com/markets",
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          summary: "The Fed maintains current interest rate levels, citing stable inflation and strong employment data.",
          image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=200&fit=crop"
        },
        {
          title: "Energy Sector Sees Mixed Results Amid Oil Price Volatility",
          source: "Reuters",
          url: "https://www.reuters.com/business/energy",
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          summary: "Oil prices fluctuate as global demand concerns offset supply constraints, impacting energy stocks.",
          image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop"
        },
        {
          title: "Cryptocurrency Market Rebounds After Recent Selloff",
          source: "CoinDesk",
          url: "https://www.coindesk.com/markets",
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          summary: "Bitcoin and Ethereum recover losses as institutional investors return to the market.",
          image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop"
        },
        {
          title: "Healthcare Stocks Gain on Breakthrough Drug Approvals",
          source: "CNBC",
          url: "https://www.cnbc.com/health-and-science",
          publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          summary: "Major pharmaceutical companies announce FDA approvals for innovative treatments, boosting sector performance.",
          image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop"
        },
        {
          title: "Retail Sales Beat Expectations in Latest Report",
          source: "Wall Street Journal",
          url: "https://www.wsj.com/news/markets",
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          summary: "Consumer spending remains robust, signaling continued economic strength despite inflation concerns.",
          image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop"
        }
      ];

      // Load immediately (no fake delay)
      setNews(mockNews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
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

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Market News</h2>
        <button 
          onClick={fetchMarketNews}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-700/50 rounded-lg overflow-hidden hover:bg-slate-700 transition-all hover:scale-[1.02] border border-slate-600/50 hover:border-slate-500"
          >
            {/* Image */}
            {article.image && (
              <div className="relative h-32 overflow-hidden bg-slate-600">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                {article.summary}
              </p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{article.source}</span>
                <span className="text-slate-600">{formatTimeAgo(article.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* View More */}
      <div className="mt-6 text-center">
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View More News →
        </button>
      </div>
    </div>
  );
};

export default MarketNews;
