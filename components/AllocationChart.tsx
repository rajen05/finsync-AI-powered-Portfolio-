import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AssetType } from '../types';

interface AllocationChartProps {
  data: { name: string; value: number, type: AssetType }[];
  isLoading: boolean;
}

const COLORS = ['#4c51bf', '#f7931a', '#6b46c1', '#627eea', '#d53f8c', '#de3163', '#38a169', '#26a17b', '#dd6b20', '#f0b90b'];

const AllocationChart: React.FC<AllocationChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 h-96">
        <h2 className="text-lg font-semibold text-white mb-4">Asset Allocation</h2>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-400 text-center">No data to display. Add transactions to see your allocation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b', // slate-800
              borderColor: '#334155', // slate-700
              borderRadius: '0.5rem',
            }}
            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
          />
          <Legend 
            iconSize={10} 
            wrapperStyle={{ overflow: 'auto', maxHeight: '90px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;