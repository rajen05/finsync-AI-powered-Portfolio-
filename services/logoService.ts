// Service to fetch stock logos from various sources

/**
 * Get stock logo URL from multiple sources
 * Priority: 1. Clearbit 2. Logo.dev 3. Fallback
 */
export function getStockLogoUrl(ticker: string): string {
  // Clean ticker (remove any suffixes)
  const cleanTicker = ticker.replace('.B', '').replace('-USD', '');
  
  // Map of known company domains
  const domainMap: { [key: string]: string } = {
    'AAPL': 'apple.com',
    'MSFT': 'microsoft.com',
    'GOOGL': 'google.com',
    'GOOG': 'google.com',
    'AMZN': 'amazon.com',
    'NVDA': 'nvidia.com',
    'META': 'meta.com',
    'TSLA': 'tesla.com',
    'BRK.B': 'berkshirehathaway.com',
    'V': 'visa.com',
    'UNH': 'unitedhealthgroup.com',
    'XOM': 'exxonmobil.com',
    'JNJ': 'jnj.com',
    'WMT': 'walmart.com',
    'JPM': 'jpmorganchase.com',
    'MA': 'mastercard.com',
    'PG': 'pg.com',
    'CVX': 'chevron.com',
    'HD': 'homedepot.com',
    'MRK': 'merck.com',
    'ABBV': 'abbvie.com',
    'KO': 'coca-cola.com',
    'PEP': 'pepsico.com',
    'COST': 'costco.com',
    'AVGO': 'broadcom.com',
    'LLY': 'lilly.com',
    'MCD': 'mcdonalds.com',
    'TMO': 'thermofisher.com',
    'CSCO': 'cisco.com',
    'ACN': 'accenture.com',
    'ADBE': 'adobe.com',
    'NKE': 'nike.com',
    'DIS': 'disney.com',
    'NFLX': 'netflix.com',
    'CMCSA': 'comcast.com',
    'VZ': 'verizon.com',
    'INTC': 'intel.com',
    'AMD': 'amd.com',
    'CRM': 'salesforce.com',
    'ORCL': 'oracle.com',
    'TXN': 'ti.com',
    'BA': 'boeing.com',
    'CAT': 'caterpillar.com',
    'UPS': 'ups.com',
    'HON': 'honeywell.com',
    'NEE': 'nexteraenergy.com',
    'LIN': 'linde.com',
    'DHR': 'danaher.com',
    'PM': 'pmi.com',
    'ABT': 'abbott.com',
    'BMY': 'bms.com'
  };

  const domain = domainMap[cleanTicker];
  
  if (domain) {
    // Use Clearbit Logo API (free, no API key needed)
    return `https://logo.clearbit.com/${domain}`;
  }
  
  // Fallback: return null to use letter fallback
  return '';
}

/**
 * Preload logo images to avoid flickering
 */
export function preloadLogos(tickers: string[]): void {
  tickers.forEach(ticker => {
    const url = getStockLogoUrl(ticker);
    if (url) {
      const img = new Image();
      img.src = url;
    }
  });
}
