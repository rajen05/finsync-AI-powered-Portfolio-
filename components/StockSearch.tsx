import React, { useState, useEffect, useRef } from 'react'
import { SearchIcon } from './icons/SearchIcon'

interface SearchResult {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  exchange?: string
}

interface StockSearchProps {
  onSelect: (symbol: string) => void
  value: string
}

// Popular stocks and crypto with full names
const POPULAR_ASSETS: SearchResult[] = [
  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc. (Facebook)', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'stock', exchange: 'NYSE' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'BA', name: 'Boeing Company', type: 'stock', exchange: 'NYSE' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'ADBE', name: 'Adobe Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'ORCL', name: 'Oracle Corporation', type: 'stock', exchange: 'NYSE' },
  { symbol: 'IBM', name: 'International Business Machines', type: 'stock', exchange: 'NYSE' },
  
  // Crypto
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto' },
  { symbol: 'BNB-USD', name: 'Binance Coin', type: 'crypto' },
  { symbol: 'XRP-USD', name: 'Ripple', type: 'crypto' },
  { symbol: 'ADA-USD', name: 'Cardano', type: 'crypto' },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', type: 'crypto' },
  { symbol: 'DOT-USD', name: 'Polkadot', type: 'crypto' },
  { symbol: 'MATIC-USD', name: 'Polygon', type: 'crypto' },
  { symbol: 'AVAX-USD', name: 'Avalanche', type: 'crypto' },
  { symbol: 'LINK-USD', name: 'Chainlink', type: 'crypto' },
  { symbol: 'UNI-USD', name: 'Uniswap', type: 'crypto' },
]

// Fuzzy search function with typo tolerance
const fuzzyMatch = (query: string, target: string): number => {
  query = query.toLowerCase()
  target = target.toLowerCase()
  
  // Exact match
  if (target === query) return 100
  
  // Starts with query
  if (target.startsWith(query)) return 90
  
  // Contains query
  if (target.includes(query)) return 80
  
  // Levenshtein distance for typo tolerance
  const distance = levenshteinDistance(query, target)
  const maxLength = Math.max(query.length, target.length)
  const similarity = ((maxLength - distance) / maxLength) * 70
  
  return similarity
}

// Calculate Levenshtein distance (edit distance)
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

const StockSearch: React.FC<StockSearchProps> = ({ onSelect, value }) => {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    
    if (!searchQuery.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Search through popular assets
    const results = POPULAR_ASSETS.map(asset => {
      const symbolScore = fuzzyMatch(searchQuery, asset.symbol)
      const nameScore = fuzzyMatch(searchQuery, asset.name)
      const maxScore = Math.max(symbolScore, nameScore)
      
      return {
        ...asset,
        score: maxScore,
      }
    })
    .filter(result => result.score > 40) // Threshold for relevance
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // Top 8 results

    setSuggestions(results)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }

  const handleSelect = (symbol: string) => {
    setQuery(symbol)
    setShowSuggestions(false)
    onSelect(symbol)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (suggestions.length > 0) {
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (suggestions.length > 0) {
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        }
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions.length > 0) {
          // If user has selected a suggestion, use it
          if (selectedIndex >= 0) {
            handleSelect(suggestions[selectedIndex].symbol)
          } else {
            // Auto-select first suggestion if available
            handleSelect(suggestions[0].symbol)
          }
        } else if (query.trim()) {
          // If no suggestions, try the query as-is (uppercase for symbol)
          handleSelect(query.toUpperCase())
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text
    
    return (
      <>
        {text.substring(0, index)}
        <span className="bg-yellow-200 dark:bg-yellow-900/50 font-semibold">
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    )
  }

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder="Search stocks or crypto (e.g., Apple, TSLA, Bitcoin)..."
          className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          {suggestions.map((result, index) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result.symbol)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center justify-between ${
                index === selectedIndex ? 'bg-gray-100 dark:bg-gray-900' : ''
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {highlightMatch(result.symbol, query)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    result.type === 'crypto' 
                      ? 'bg-orange-900/50 text-orange-300' 
                      : 'bg-blue-900/50 text-blue-300'
                  }`}>
                    {result.type === 'crypto' ? 'Crypto' : 'Stock'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {highlightMatch(result.name, query)}
                  {result.exchange && (
                    <span className="ml-2 text-gray-500 dark:text-gray-500">• {result.exchange}</span>
                  )}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions && query && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-2xl p-4">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No results found for "{query}"
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm text-center mt-2">
            Try searching by symbol (AAPL) or company name (Apple)
          </p>
        </div>
      )}

      {/* Popular Suggestions (when empty) */}
      {showSuggestions && !query && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Popular Assets</p>
          </div>
          {POPULAR_ASSETS.slice(0, 10).map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result.symbol)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{result.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    result.type === 'crypto' 
                      ? 'bg-orange-900/50 text-orange-300' 
                      : 'bg-blue-900/50 text-blue-300'
                  }`}>
                    {result.type === 'crypto' ? 'Crypto' : 'Stock'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {result.name}
                  {result.exchange && (
                    <span className="ml-2 text-gray-500 dark:text-gray-500">• {result.exchange}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default StockSearch
