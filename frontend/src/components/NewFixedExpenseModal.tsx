import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateFixedExpense } from '../hooks/useFixedExpenses';
import { useCategories } from '../hooks/useCategories';

interface NewFixedExpenseModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const fixedExpenseSchema = z.object({
  description: z.string().min(3, 'Descrição obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  dueDate: z.coerce.number().min(1).max(31).optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Categoria obrigatória'),
});

type FixedExpenseInputs = z.infer<typeof fixedExpenseSchema>;

export function NewFixedExpenseModal({ isOpen, onRequestClose }: NewFixedExpenseModalProps) {
  const { mutateAsync, isPending } = useCreateFixedExpense();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FixedExpenseInputs>({
    resolver: zodResolver(fixedExpenseSchema),
  });

  if (!isOpen) return null;

  async function handleCreate(data: FixedExpenseInputs) {
    try {
      await mutateAsync({
        ...data,
        dueDate: data.dueDate ? Number(data.dueDate) : undefined,
      });
      reset();
      onRequestClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar gasto fixo.';

      alert(message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onRequestClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Novo Gasto Fixo</h2>

        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Descrição</label>
            <input {...register('description')} placeholder="Ex: Internet, Aluguel, Netflix..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            {errors.description && <span className="text-rose-500 text-xs mt-1 block">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Valor Mensal (R$)</label>
              <input type="number" step="0.01" {...register('amount')} placeholder="100,00" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              {errors.amount && <span className="text-rose-500 text-xs mt-1 block">{errors.amount.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Dia do Vencimento</label>
              <input type="number" {...register('dueDate')} placeholder="Ex: 5" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              {errors.dueDate && <span className="text-rose-500 text-xs mt-1 block">{errors.dueDate.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Categoria</label>
            <select {...register('categoryId')} disabled={isLoadingCategories} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">Selecione...</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="text-rose-500 text-xs mt-1 block">{errors.categoryId.message}</span>}
          </div>

          <button type="submit" disabled={isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2">
            {isPending ? 'Salvando...' : 'Cadastrar Gasto Fixo'}
          </button>
        </form>
      </div>
    </div>
  );
}