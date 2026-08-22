import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateTransaction } from '../hooks/useCreateTransaction';
import { useCategories } from '../hooks/useCategories';

interface NewTransactionModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const newTransactionSchema = z.object({
  description: z.string().min(3, 'Descrição obrigatória'),
  amount: z.coerce.number().positive('O valor deve ser positivo'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().min(1, 'A data é obrigatória'),
  categoryId: z.string().min(1, 'A categoria é obrigatória'),
});

type NewTransactionInputs = z.infer<typeof newTransactionSchema>;

export function NewTransactionModal({ isOpen, onRequestClose }: NewTransactionModalProps) {
  const { mutateAsync, isPending } = useCreateTransaction();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  
  // Pega a data de hoje no formato "YYYY-MM-DD" para preencher o input por padrão
  const todayString = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewTransactionInputs>({
    resolver: zodResolver(newTransactionSchema),
    defaultValues: {
      date: todayString, // <-- Define o dia de hoje como o padrão inicial
      type: 'EXPENSE',
    },
  });

  if (!isOpen) return null;

  async function handleCreateNewTransaction(data: NewTransactionInputs) {
    try {
      // Garantimos que a data escolhida no input seja enviada corretamente para a API
      const formattedData = {
        ...data,
        date: new Date(data.date + 'T00:00:00').toISOString(), // Evita problemas de fuso horário
      };

      await mutateAsync(formattedData);
      reset(); 
      onRequestClose(); 
    } catch (error: unknown) {
        // Estrutura esperada de erro vindos do backend (ex: Axios)
        const err = error as {
          response?: { data?: { message?: string; error?: string } };
          message?: string;
        };

        console.error('Erro detalhado do backend:', err.response?.data || err.message);
        const mensagem = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro desconhecido';
        alert(`O backend recusou os dados: ${JSON.stringify(mensagem)}`);
      }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onRequestClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Nova Transação</h2>

        <form onSubmit={handleSubmit(handleCreateNewTransaction)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Descrição</label>
            <input 
              {...register('description')} 
              placeholder="Ex: Supermercado, Salário..." 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            {errors.description && <span className="text-rose-500 text-xs mt-1 block">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Valor (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                {...register('amount')} 
                placeholder="0,00" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
              {errors.amount && <span className="text-rose-500 text-xs mt-1 block">{errors.amount.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Data da Transação</label>
              {/* O usuário pode alterar livremente este campo para qualquer dia */}
              <input 
                type="date" 
                {...register('date')} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
              />
              {errors.date && <span className="text-rose-500 text-xs mt-1 block">{errors.date.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tipo</label>
            <select 
              {...register('type')} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
            >
              <option value="INCOME">Entrada (Receita)</option>
              <option value="EXPENSE">Saída (Despesa)</option>
            </select>
            {errors.type && <span className="text-rose-500 text-xs mt-1 block">{errors.type.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Categoria</label>
            <select 
              {...register('categoryId')} 
              disabled={isLoadingCategories}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm disabled:bg-gray-100"
            >
              <option value="">
                {isLoadingCategories ? 'Carregando categorias...' : 'Selecione uma categoria'}
              </option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="text-rose-500 text-xs mt-1 block">{errors.categoryId.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 mt-2 text-sm shadow-sm"
          >
            {isPending ? 'Salvando...' : 'Cadastrar Transação'}
          </button>
        </form>
      </div>
    </div>
  );
}