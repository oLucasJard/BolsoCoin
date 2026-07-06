'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  categoria: string;
  fornecedor: string;
  data: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 text-c6-gray-500">
        <p className="text-lg mb-2">Nenhuma transação encontrada</p>
        <p className="text-sm">Adicione sua primeira transação usando a IA!</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-c6-gray-800 rounded-c6-sm p-4 border border-c6-gray-700 active:bg-c6-gray-700 transition touch-manipulation">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${transaction.tipo === 'receita' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {transaction.tipo === 'receita' ? (
                    <TrendingUp size={16} className="text-green-500" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{transaction.descricao}</p>
                  <p className="text-xs text-c6-gray-400">
                    {format(new Date(transaction.data + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <p className={`font-bold text-lg ${transaction.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                {transaction.tipo === 'receita' ? '+' : '-'}R$ {Number(transaction.valor).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-c6-gray-700">
              <div className="flex items-center space-x-3 text-xs">
                <span className="px-2 py-1 rounded-full bg-c6-gray-700 text-c6-gray-300">
                  {transaction.categoria || 'Outros'}
                </span>
                {transaction.fornecedor && (
                  <span className="text-c6-gray-400">{transaction.fornecedor}</span>
                )}
              </div>
              {onDelete && (
                <button onClick={() => onDelete(transaction.id)} className="p-2 text-red-500 hover:bg-c6-gray-700 rounded-full transition touch-manipulation">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto rounded-c6-sm border border-c6-gray-800">
        <table className="w-full">
          <thead className="bg-c6-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-c6-gray-400 uppercase tracking-wider">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-c6-gray-400 uppercase tracking-wider">Descrição</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-c6-gray-400 uppercase tracking-wider">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-c6-gray-400 uppercase tracking-wider">Fornecedor</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-c6-gray-400 uppercase tracking-wider">Valor</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-c6-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-c6-gray-800">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-c6-gray-800 transition">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-c6-gray-300">
                  {format(new Date(transaction.data + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="px-4 py-4 text-sm text-white font-medium">{transaction.descricao}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 rounded-full bg-c6-gray-800 text-c6-gray-300 text-xs">
                    {transaction.categoria || 'Outros'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-c6-gray-400">{transaction.fornecedor || '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-bold">
                  <span className={transaction.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}>
                    {transaction.tipo === 'receita' ? '+' : '-'}R$ {Number(transaction.valor).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                  {onDelete && (
                    <button onClick={() => onDelete(transaction.id)} className="p-2 text-red-500 hover:bg-c6-gray-800 rounded-full transition">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
