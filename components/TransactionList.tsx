'use client';

import { Database } from '@/lib/supabase/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Edit, TrendingUp, TrendingDown } from 'lucide-react';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-c6-gray-500">
        <p className="text-lg mb-2">Nenhuma transação encontrada</p>
        <p className="text-sm">Adicione sua primeira transação usando a IA!</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="sm:hidden space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-c6-gray-800 rounded-c6-sm p-4 border border-c6-gray-700 active:bg-c6-gray-700 transition touch-manipulation"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp size={16} className="text-green-500" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-c6-gray-400">
                    {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <p className={`font-bold text-lg ${
                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}R$ {parseFloat(transaction.amount.toString()).toFixed(2)}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-c6-gray-700">
              <div className="flex items-center space-x-3 text-xs">
                <span className="px-2 py-1 rounded-full bg-c6-gray-700 text-c6-gray-300">
                  {transaction.category_name}
                </span>
                {transaction.vendor && (
                  <span className="text-c6-gray-400">
                    {transaction.vendor}
                  </span>
                )}
              </div>
              
              {(onEdit || onDelete) && (
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-c6-yellow hover:bg-c6-gray-700 rounded-full transition touch-manipulation"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-2 text-red-500 hover:bg-c6-gray-700 rounded-full transition touch-manipulation"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block overflow-x-auto rounded-c6-sm border border-c6-gray-800">
        <table className="w-full">
          <thead className="bg-c6-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-c6-gray-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-c6-gray-400 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-c6-gray-400 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-c6-gray-400 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-c6-gray-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-c6-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-c6-gray-800">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-c6-gray-800 transition">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-c6-gray-300">
                  {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="px-4 py-4 text-sm text-white font-medium">
                  {transaction.description}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 rounded-full bg-c6-gray-800 text-c6-gray-300 text-xs">
                    {transaction.category_name}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-c6-gray-400">
                  {transaction.vendor || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold">
                  <span className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {parseFloat(transaction.amount.toString()).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-2 text-c6-yellow hover:bg-c6-gray-800 rounded-full transition"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="p-2 text-red-500 hover:bg-c6-gray-800 rounded-full transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
