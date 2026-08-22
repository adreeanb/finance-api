import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateInstallment } from '../hooks/useInstallments';
import { useCategories } from '../hooks/useCategories';

interface NewInstallmentModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const installmentSchema = z.object({
  description: z.string().min(3, 'Descrição obrigatória'),
  totalAmount: z.coerce.number().positive('Valor total deve ser positivo'),
  totalInstallments: z.coerce.number().min(2, 'Mínimo de 2 parcelas'),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  categoryId: z.string().min(1, 'Categoria obrigatória'),
});

type InstallmentInputs = z.infer<typeof installmentSchema>;

export function NewInstallmentModal({ isOpen, onRequestClose }: NewInstallmentModalProps) {
  const { mutateAsync, isPending } = useCreateInstallment();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const todayString = new Date().toISOString().split('T')[0];

  const { 
    register, 
    handleSubmit, 
    reset, 
    control, // 👈 1. Substituído 'watch' por 'control'
    formState: { errors } 
  } = useForm<InstallmentInputs>({
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      startDate: todayString,
      totalInstallments: 10,
    },
  });

  // 👈 2. Uso do useWatch com o 'control'
  const [amountWatch, installmentsWatch] = useWatch({
    control,
    name: ['totalAmount', 'totalInstallments'],
  });

  // Conversão explícita para número para evitar NaN no cálculo
  const amount = Number(amountWatch);
  const installments = Number(installmentsWatch);

  const calculatedValue = 
    amount && installments ? (amount / installments).toFixed(2) : '0.00';

  if (!isOpen) return null;

  async function handleCreate(data: InstallmentInputs) {
    try {
      await mutateAsync(data);
      reset();
      onRequestClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      alert(errorMessage || 'Erro ao cadastrar parcelamento.');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onRequestClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Novo Parcelamento</h2>

        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Descrição</label>
            <input {...register('description')} placeholder="Ex: Notebook Mercado Livre" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            {errors.description && <span className="text-rose-500 text-xs mt-1 block">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Valor Total (R$)</label>
              <input type="number" step="0.01" {...register('totalAmount')} placeholder="1000,00" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              {errors.totalAmount && <span className="text-rose-500 text-xs mt-1 block">{errors.totalAmount.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nº Parcelas</label>
              <input type="number" {...register('totalInstallments')} placeholder="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              {errors.totalInstallments && <span className="text-rose-500 text-xs mt-1 block">{errors.totalInstallments.message}</span>}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center text-sm">
            <span className="text-emerald-800 font-medium">Valor mensal calculado:</span>
            <span className="text-emerald-900 font-bold text-base">R$ {calculatedValue} /mês</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mês Inicial</label>
              <input type="date" {...register('startDate')} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
              {errors.startDate && <span className="text-rose-500 text-xs mt-1 block">{errors.startDate.message}</span>}
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
          </div>

          <button type="submit" disabled={isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2">
            {isPending ? 'Salvando...' : 'Cadastrar Parcelamento'}
          </button>
        </form>
      </div>
    </div>
  );
}