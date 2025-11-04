import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { PerformanceDataPoint } from '../hooks/usePortfolioPerformance';

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  isLoading?: boolean;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, isLoading = false }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
  const [showCost, setShowCost] = useState(true);

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    if (timeRange === 'ALL' || data.length === 0) return data;

    const today = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '1M':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    return data.filter(point => new Date(point.date) >= startDate);
  }, [data, timeRange]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (filteredData.length === 0) {
      return {
        currentValue: 0,
        startValue: 0,
        change: 0,
        changePercent: 0,
        highestValue: 0,
        lowestValue: 0,
      };
    }

    const currentValue = filteredData[filteredData.length - 1].value;
    const startValue = filteredData[0].value;
    const change = currentValue - startValue;
    const changePercent = startValue > 0 ? (change / startValue) * 100 : 0;

    const values = filteredData.map(d => d.value);
    const highestValue = Math.max(...values);
    const lowestValue = Math.min(...values);

    return {
      currentValue,
      startValue,
      change,
      changePercent,
      highestValue,
      lowestValue,
    };
  }, [filteredData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              <span className="font-medium">Value:</span> {formatCurrency(data.value)}
            </p>
            {showCost && (
              <p className="text-sm text-gray-600 dark:text-slate-400">
                <span className="font-medium">Cost:</span> {formatCurrency(data.cost)}
              </p>
            )}
            <p className={`text-sm font-medium ${data.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              P&L: {formatCurrency(data.pl)} ({data.plPercent >= 0 ? '+' : ''}{data.plPercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Performance</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-gray-500 dark:text-slate-400">
            Add transactions to see your portfolio performance over time
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Portfolio Performance</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats.currentValue)}
            </span>
            <span className={`text-lg font-semibold ${stats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.change >= 0 ? '+' : ''}{formatCurrency(stats.change)} ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%)
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {timeRange === 'ALL' ? 'All time' : `Last ${timeRange}`}
          </p>
        </div>

        {/* Time Range Buttons */}
        <div className="flex gap-2">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Starting Value</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.startValue)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Highest Value</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.highestValue)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Lowest Value</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.lowestValue)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
              iconType="line"
            />
            {showCost && (
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#6b7280"
                strokeWidth={2}
                fill="url(#colorCost)"
                name="Total Cost"
                dot={false}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorValue)"
              name="Portfolio Value"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Toggle Cost Line */}
      <div className="mt-4 flex justify-end">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showCost}
            onChange={(e) => setShowCost(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Show cost basis
        </label>
      </div>
    </div>
  );
};

export default PerformanceChart;
