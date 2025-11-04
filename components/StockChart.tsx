import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StockDetails } from '../types';

interface StockChartProps {
  data: StockDetails['historicalData'];
  changePercent: number;
}

const StockChart: React.FC<StockChartProps> = ({ data, changePercent }) => {
  const isPositive = changePercent >= 0;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const gradientColor = isPositive ? 'url(#colorUv)' : 'url(#colorPv)';

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
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
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
  );
};

export default StockChart;