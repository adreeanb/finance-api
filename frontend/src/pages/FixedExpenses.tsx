import { useState } from 'react';
import { PlusCircle, Repeat, Trash2 } from 'lucide-react';
import { useFixedExpenses, useDeleteFixedExpense } from '../hooks/useFixedExpenses';
import { NewFixedExpenseModal } from '../components/NewFixedExpenseModal';

export function FixedExpenses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: fixedExpenses, isLoading } = useFixedExpenses();
  const { mutateAsync: deleteMutate } = useDeleteFixedExpense();

  async function handleDelete(id: string) {
    if (confirm('Deseja realmente remover este gasto fixo?')) {
      await deleteMutate(id);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Gastos Fixos (Assinaturas)</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center">
            <PlusCircle className="w-4 h-4" /> Novo Gasto Fixo
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Carregando...</div>
        ) : fixedExpenses?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum gasto fixo cadastrado.</div>
        ) : (
          <>
            {/* VISÃO MOBILE: Lista de Cards */}
            <div className="block sm:hidden space-y-3">
              {fixedExpenses?.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                      <Repeat className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 block">{t.description}</span>
                      <span className="text-xs text-gray-500">
                        {t.dueDate ? `Vencimento: Dia ${t.dueDate}` : 'Data Variável'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="font-bold text-rose-600">R$ {Number(t.amount).toFixed(2)}</span>
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
                    <th className="py-3">Vencimento</th>
                    <th className="py-3">Valor Mensal</th>
                    <th className="py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {fixedExpenses?.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="py-4 flex items-center gap-2 font-medium text-gray-800">
                        <Repeat className="text-blue-500 w-4 h-4" /> {t.description}
                      </td>
                      <td className="py-4 text-gray-500">{t.dueDate ? `Dia ${t.dueDate}` : 'Variável'}</td>
                      <td className="py-4 font-bold text-rose-600">R$ {Number(t.amount).toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
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
      <NewFixedExpenseModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
    </main>
  );
}