// Vercel Serverless Function - Server-side proxy for Yahoo Finance
// This bypasses CORS by fetching data server-side

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const range = searchParams.get('range') || '1d';
  const interval = searchParams.get('interval') || '1d';

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Symbol is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch from Yahoo Finance',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
