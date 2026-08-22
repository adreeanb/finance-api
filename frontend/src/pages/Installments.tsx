import { useState } from 'react';
import { PlusCircle, CreditCard, Trash2 } from 'lucide-react';
import { useInstallments, useDeleteInstallment } from '../hooks/useInstallments';
import { NewInstallmentModal } from '../components/NewInstallmentModal';

export function Installments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: installments, isLoading } = useInstallments();
  const { mutateAsync: deleteMutate } = useDeleteInstallment();

  async function handleDelete(id: string) {
    if (confirm('Deseja realmente remover este parcelamento?')) {
      await deleteMutate(id);
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gerenciar Parcelamentos</h1>
          <p className="text-sm text-gray-500">Acompanhe suas compras parceladas no cartão</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Novo Parcelamento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Carregando parcelamentos...</div>
        ) : installments?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum parcelamento cadastrado.</div>
        ) : (
          <>
            {/* VISÃO MOBILE: Lista de Cards */}
            <div className="block sm:hidden space-y-4">
              {installments?.map((inst) => (
                <div key={inst.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">{inst.description}</span>
                        <span className="text-xs text-gray-500">{inst.category?.name || 'Geral'} • {inst.totalInstallments}x</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(inst.id)} className="text-gray-400 hover:text-rose-600 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Mensalidade</span>
                      <span className="font-bold text-rose-600">R$ {Number(inst.installmentValue).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Valor Total</span>
                      <span className="font-semibold text-gray-800">R$ {Number(inst.totalAmount).toFixed(2)}</span>
                    </div>
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
                    <th className="py-3">Categoria</th>
                    <th className="py-3">Valor Total</th>
                    <th className="py-3">Parcelas</th>
                    <th className="py-3">Valor / Mês</th>
                    <th className="py-3">Início</th>
                    <th className="py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {installments?.map((inst) => (
                    <tr key={inst.id} className="hover:bg-gray-50">
                      <td className="py-4 font-medium text-gray-800 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        {inst.description}
                      </td>
                      <td className="py-4 text-gray-500">{inst.category?.name || 'Geral'}</td>
                      <td className="py-4 font-bold text-gray-900">R$ {Number(inst.totalAmount).toFixed(2)}</td>
                      <td className="py-4 text-gray-600">{inst.totalInstallments}x</td>
                      <td className="py-4 font-semibold text-rose-600">R$ {Number(inst.installmentValue).toFixed(2)}</td>
                      <td className="py-4 text-gray-400">{new Date(inst.startDate).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 text-right">
                        <button onClick={() => handleDelete(inst.id)} className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
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

      <NewInstallmentModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
    </main>
  );
}