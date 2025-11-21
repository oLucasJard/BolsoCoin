'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BalanceChartProps {
  totalIncome: number;
  totalExpense: number;
}

export default function BalanceChart({ totalIncome, totalExpense }: BalanceChartProps) {
  const data = [
    {
      name: 'Receitas',
      valor: totalIncome,
    },
    {
      name: 'Despesas',
      valor: totalExpense,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
        <XAxis 
          dataKey="name" 
          stroke="#888888"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#888888"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `R$ ${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #FFD100',
            borderRadius: '12px',
            color: '#FFFFFF',
          }}
          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
          cursor={{ fill: '#2D2D2D' }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', color: '#888888' }}
        />
        <Bar 
          dataKey="valor" 
          fill="#FFD100"
          radius={[8, 8, 0, 0]}
          label={{
            position: 'top',
            fill: '#FFFFFF',
            fontSize: '12px',
            formatter: (value: number) => `R$ ${value.toFixed(2)}`,
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
