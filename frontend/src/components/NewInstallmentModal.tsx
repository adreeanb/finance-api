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
  totalInstallments: z.coerce
    .number()
    .min(2, 'Mínimo de 2 parcelas'),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  categoryId: z.string().min(1, 'Categoria obrigatória'),
});

type InstallmentInputs = z.infer<typeof installmentSchema>;

/**
 * Retorna a data do mesmo dia no mês seguinte
 * no formato YYYY-MM-DD.
 *
 * Exemplos:
 * 22/08/2026 -> 22/09/2026
 * 22/12/2026 -> 22/01/2027
 */
function getNextMonthDateString(): string {
  const date = new Date();

  date.setMonth(date.getMonth() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function NewInstallmentModal({
  isOpen,
  onRequestClose,
}: NewInstallmentModalProps) {
  const { mutateAsync, isPending } = useCreateInstallment();

  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<InstallmentInputs>({
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      description: '',
      totalAmount: undefined,
      totalInstallments: 10,
      startDate: getNextMonthDateString(),
      categoryId: '',
    },
  });

  const [amountWatch, installmentsWatch] = useWatch({
    control,
    name: ['totalAmount', 'totalInstallments'],
  });

  const amount = Number(amountWatch);
  const installments = Number(installmentsWatch);

  const calculatedValue =
    amount > 0 && installments >= 2
      ? (amount / installments).toFixed(2)
      : '0.00';

  if (!isOpen) return null;

  async function handleCreate(data: InstallmentInputs) {
    try {
      await mutateAsync(data);

      /**
       * Limpa o formulário e restaura os valores padrão.
       * A data volta para o mesmo dia do mês seguinte.
       */
      reset({
        description: '',
        totalAmount: undefined,
        totalInstallments: 10,
        startDate: getNextMonthDateString(),
        categoryId: '',
      });

      onRequestClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' &&
            error !== null &&
            'response' in error
          ? (
              error as {
                response?: {
                  data?: {
                    message?: string;
                  };
                };
              }
            ).response?.data?.message
          : undefined;

      console.error('Erro ao cadastrar parcelamento:', error);

      alert(
        errorMessage || 'Erro ao cadastrar parcelamento.'
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">

        {/* Botão fechar */}
        <button
          type="button"
          onClick={onRequestClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Novo Parcelamento
        </h2>

        <form
          onSubmit={handleSubmit(handleCreate)}
          className="space-y-4"
        >
          {/* Descrição */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-gray-600 uppercase mb-1"
            >
              Descrição
            </label>

            <input
              id="description"
              type="text"
              {...register('description')}
              placeholder="Ex: Notebook Mercado Livre"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />

            {errors.description && (
              <span className="text-rose-500 text-xs mt-1 block">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Valor total e número de parcelas */}
          <div className="grid grid-cols-2 gap-4">

            {/* Valor total */}
            <div>
              <label
                htmlFor="totalAmount"
                className="block text-xs font-semibold text-gray-600 uppercase mb-1"
              >
                Valor Total (R$)
              </label>

              <input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                {...register('totalAmount')}
                placeholder="1000,00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              {errors.totalAmount && (
                <span className="text-rose-500 text-xs mt-1 block">
                  {errors.totalAmount.message}
                </span>
              )}
            </div>

            {/* Número de parcelas */}
            <div>
              <label
                htmlFor="totalInstallments"
                className="block text-xs font-semibold text-gray-600 uppercase mb-1"
              >
                Nº Parcelas
              </label>

              <input
                id="totalInstallments"
                type="number"
                min="2"
                {...register('totalInstallments')}
                placeholder="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              {errors.totalInstallments && (
                <span className="text-rose-500 text-xs mt-1 block">
                  {errors.totalInstallments.message}
                </span>
              )}
            </div>
          </div>

          {/* Valor mensal calculado */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center text-sm">
            <span className="text-emerald-800 font-medium">
              Valor mensal calculado:
            </span>

            <span className="text-emerald-900 font-bold text-base">
              R$ {calculatedValue} /mês
            </span>
          </div>

          {/* Data inicial e categoria */}
          <div className="grid grid-cols-2 gap-4">

            {/* Data inicial */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-xs font-semibold text-gray-600 uppercase mb-1"
              >
                Mês Inicial
              </label>

              <input
                id="startDate"
                type="date"
                {...register('startDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              {errors.startDate && (
                <span className="text-rose-500 text-xs mt-1 block">
                  {errors.startDate.message}
                </span>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-xs font-semibold text-gray-600 uppercase mb-1"
              >
                Categoria
              </label>

              <select
                id="categoryId"
                {...register('categoryId')}
                disabled={isLoadingCategories}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingCategories
                    ? 'Carregando...'
                    : 'Selecione...'}
                </option>

                {categories?.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {errors.categoryId && (
                <span className="text-rose-500 text-xs mt-1 block">
                  {errors.categoryId.message}
                </span>
              )}
            </div>
          </div>

          {/* Botão cadastrar */}
          <button
            type="submit"
            disabled={isPending || isLoadingCategories}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2 disabled:opacity-70"
          >
            {isPending
              ? 'Salvando...'
              : 'Cadastrar Parcelamento'}
          </button>
        </form>
      </div>
    </div>
  );
}