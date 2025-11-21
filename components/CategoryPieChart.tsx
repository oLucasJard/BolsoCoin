'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryPieChartProps {
  categories: Array<{ name: string; value: number }>;
}

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

export default function CategoryPieChart({ categories }: CategoryPieChartProps) {
  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
        Nenhuma despesa registrada
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categories}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {categories.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `R$ ${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

