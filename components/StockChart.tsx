import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StockDetails } from '../types';

interface StockChartProps {
  data: StockDetails['historicalData'];
  changePercent: number;
  symbol: string;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'All';

const StockChart: React.FC<StockChartProps> = ({ data, changePercent, symbol }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [chartData, setChartData] = useState(data);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistoricalData(timeRange);
  }, [timeRange, symbol]);

  const fetchHistoricalData = async (range: TimeRange) => {
    setLoading(true);
    try {
      // Fetch from Yahoo Finance via serverless API
      const interval = range === '1D' ? '5m' : range === '1W' ? '1h' : '1d';
      const yahooRange = range === '1D' ? '1d' : range === '1W' ? '5d' : range === '1M' ? '1mo' : range === '3M' ? '3mo' : range === '1Y' ? '1y' : range === '5Y' ? '5y' : 'max';
      
      console.log(`📊 Fetching ${range} data for ${symbol}...`);
      const apiUrl = `/api/yahoo-finance?symbol=${symbol}&range=${yahooRange}&interval=${interval}`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const result = await response.json();
        const quotes = result.chart?.result?.[0];
        
        if (quotes && quotes.timestamp && quotes.indicators?.quote?.[0]) {
          const timestamps = quotes.timestamp;
          const prices = quotes.indicators.quote[0].close;
          
          const historicalData = timestamps.map((ts: number, index: number) => ({
            date: new Date(ts * 1000).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              ...(range === '1D' ? { hour: '2-digit', minute: '2-digit' } : {})
            }),
            price: prices[index] || 0
          })).filter((d: any) => d.price > 0);
          
          console.log(`✅ Chart data loaded: ${historicalData.length} data points`);
          setChartData(historicalData);
          setLoading(false);
          return;
        }
      }
      
      // If Yahoo fails, use the initial data
      console.warn('⚠️ Yahoo Finance failed, using initial data');
      setChartData(data);
    } catch (error) {
      console.error('❌ Error fetching chart data:', error);
      setChartData(data);
    } finally {
      setLoading(false);
    }
  };

  const isPositive = changePercent >= 0;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const gradientColor = isPositive ? 'url(#colorUv)' : 'url(#colorPv)';

  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'All'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 p-2 border border-slate-600 rounded-md shadow-lg">
          <p className="label text-slate-300">{`Date: ${label}`}</p>
          <p className="intro text-white">{`Price: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Time Range Buttons */}
      <div className="flex justify-end gap-2">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 300 }} className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#94a3b8' }} 
              axisLine={{ stroke: '#475569' }} 
              tickLine={{ stroke: '#475569' }}
            />
            <YAxis 
              domain={['dataMin', 'dataMax']}
              tick={{ fill: '#94a3b8' }} 
              axisLine={{ stroke: '#475569' }} 
              tickLine={{ stroke: '#475569' }}
              tickFormatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={2} fillOpacity={1} fill={gradientColor} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;