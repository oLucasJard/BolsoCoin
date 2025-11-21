'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BalanceChartProps {
  totalIncome: number;
  totalExpense: number;
}

export default function BalanceChart({ totalIncome, totalExpense }: BalanceChartProps) {
  const data = [
    {
      name: 'Este Mês',
      Receitas: totalIncome,
      Despesas: totalExpense,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => `R$ ${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

