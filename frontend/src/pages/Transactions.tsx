import { useState, useMemo } from 'react';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Trash2, Calendar } from 'lucide-react';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransaction';
import { NewTransactionModal } from '../components/NewTransactionModal';

export function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: transactions, isLoading } = useTransactions();
  const { mutateAsync: deleteMutate } = useDeleteTransaction(); 

  // 1. Pega a data atual, avança 1 mês para ser o padrão (Mês Seguinte)
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  const currentYear = now.getFullYear();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const currentDateString = `${currentYear}-${currentMonthNum}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentDateString);

  // 2. Gera dinamicamente as opções combinando os últimos 12 meses + meses futuros com transações
  const monthOptions = useMemo(() => {
    const uniqueMonths = new Set<string>();

    // A. Base mínima: últimos 12 meses contando a partir de hoje
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      uniqueMonths.add(`${year}-${month}`);
      date.setMonth(date.getMonth() - 1);
    }

    // B. Adiciona dinamicamente meses futuros se houver transações neles
    if (transactions) {
      transactions.forEach(t => {
        const dateStr = t.date || t.createdAt;
        if (dateStr) uniqueMonths.add(dateStr.slice(0, 7));
      });
    }

    // Transforma o Set em Array e ordena do mais recente/futuro para o mais antigo
    const sortedMonths = Array.from(uniqueMonths).sort((a, b) => b.localeCompare(a));

    return sortedMonths.map(value => {
      const [y, m] = value.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, 1);
      const label = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
    });
  }, [transactions]);

  // 3. Filtra as transações de acordo com o mês selecionado
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => {
      const dateStr = t.date || t.createdAt;
      const transactionMonth = dateStr ? dateStr.toString().slice(0, 7) : '';
      return transactionMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  async function handleDelete(id: string) {
    if (confirm('Deseja realmente remover esta transação?')) {
      try {
        await deleteMutate(id);
      } catch {
        alert('Erro ao excluir transação.');
      }
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        
        {/* Cabeçalho com Título, Filtro e Botão */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <h2 className="text-xl font-bold text-gray-800">Transações</h2>
            
            {/* Seletor de Mês (Responsivo) */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none w-full cursor-pointer"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium w-full sm:w-auto justify-center shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Nova Transação
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Carregando...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhuma transação encontrada neste ciclo.</div>
        ) : (
          <>
            {/* VISÃO MOBILE: Lista de Cards */}
            <div className="block sm:hidden space-y-3">
              {filteredTransactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    {t.type === 'INCOME' ? (
                      <ArrowUpCircle className="text-emerald-500 w-8 h-8 shrink-0" />
                    ) : (
                      <ArrowDownCircle className="text-rose-500 w-8 h-8 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-gray-800 block">{t.description}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      R$ {Number(t.amount).toFixed(2)}
                    </span>
                    <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-rose-600 transition-colors p-1" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* VISÃO DESKTOP: Tabela */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-400 text-xs uppercase font-semibold">
                    <th className="py-3">Descrição</th>
                    <th className="py-3">Valor</th>
                    <th className="py-3">Tipo</th>
                    <th className="py-3">Data</th>
                    <th className="py-3 text-right">Ações</th> 
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="py-4 flex items-center gap-2 font-medium text-gray-800">
                        {t.type === 'INCOME' ? (
                          <ArrowUpCircle className="text-emerald-500 w-5 h-5" />
                        ) : (
                          <ArrowDownCircle className="text-rose-500 w-5 h-5" />
                        )}
                        {t.description}
                      </td>
                      <td className={`py-4 font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        R$ {Number(t.amount).toFixed(2)}
                      </td>
                      <td className="py-4 text-gray-500">{t.type === 'INCOME' ? 'Receita' : 'Despesa'}</td>
                      <td className="py-4 text-gray-400">
                        {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleDelete(t.id)} 
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Excluir transação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <NewTransactionModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
    </main>
  );
}