'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryPieChartProps {
  categories: { name: string; value: number }[];
}

const C6_COLORS = ['#FFD100', '#FFE066', '#E6BB00', '#FFA500', '#FF8C00', '#FF7F50'];

export default function CategoryPieChart({ categories }: CategoryPieChartProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-c6-gray-500 text-sm">
        Nenhuma despesa registrada ainda
      </div>
    );
  }

  const data = categories.map((cat) => ({
    name: cat.name,
    value: parseFloat(cat.value.toString()),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#FFD100"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={C6_COLORS[index % C6_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #FFD100',
            borderRadius: '12px',
            color: '#FFFFFF',
          }}
          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', color: '#888888' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
