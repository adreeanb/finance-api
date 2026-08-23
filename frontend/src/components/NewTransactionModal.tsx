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

export function NewTransactionModal({
  isOpen,
  onRequestClose,
}: NewTransactionModalProps) {
  const { mutateAsync, isPending } = useCreateTransaction();

  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useCategories();

  const { 
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewTransactionInputs>({
    resolver: zodResolver(newTransactionSchema),
    defaultValues: {
      date: getNextMonthDateString(),
      type: 'EXPENSE',
      description: '',
      amount: undefined,
      categoryId: '',
    },
  });

  if (!isOpen) return null;

  async function handleCreateNewTransaction(
    data: NewTransactionInputs
  ) {
    try {
      /**
       * O input type="date" retorna YYYY-MM-DD.
       *
       * Adicionamos T00:00:00 para representar a data escolhida
       * como meia-noite no horário local antes de converter para ISO.
       */
      const formattedData = {
        ...data,
        date: new Date(`${data.date}T00:00:00`).toISOString(),
      };

      await mutateAsync(formattedData);

      /**
       * Após cadastrar, o formulário é limpo e a data
       * volta automaticamente para o mesmo dia do mês seguinte.
       */
      reset({
        description: '',
        amount: undefined,
        type: 'EXPENSE',
        date: getNextMonthDateString(),
        categoryId: '',
      });

      onRequestClose();
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
        message?: string;
      };

      console.error(
        'Erro detalhado do backend:',
        err.response?.data || err.message
      );

      const mensagem =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Erro desconhecido';

      alert(
        `O backend recusou os dados: ${JSON.stringify(mensagem)}`
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
          Nova Transação
        </h2>

        <form
          onSubmit={handleSubmit(handleCreateNewTransaction)}
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
              placeholder="Ex: Supermercado, Salário..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />

            {errors.description && (
              <span className="text-rose-500 text-xs mt-1 block">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">

            {/* Valor */}
            <div>
              <label
                htmlFor="amount"
                className="block text-xs font-semibold text-gray-600 uppercase mb-1"
              >
                Valor (R$)
              </label>

              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount')}
                placeholder="0,00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />

              {errors.amount && (
                <span className="text-rose-500 text-xs mt-1 block">
                  {errors.amount.message}
                </span>
              )}
            </div>

            {/* Data */}
            <div>
              <label
                htmlFor="date"
                className="block text-xs font-semibold text-gray-600 uppercase mb-1"
              >
                Data da Transação
              </label>

              <input
                id="date"
                type="date"
                {...register('date')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
              />

              {errors.date && (
                <span className="text-rose-500 text-xs mt-1 block">
                  {errors.date.message}
                </span>
              )}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label
              htmlFor="type"
              className="block text-xs font-semibold text-gray-600 uppercase mb-1"
            >
              Tipo
            </label>

            <select
              id="type"
              {...register('type')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
            >
              <option value="INCOME">
                Entrada (Receita)
              </option>

              <option value="EXPENSE">
                Saída (Despesa)
              </option>
            </select>

            {errors.type && (
              <span className="text-rose-500 text-xs mt-1 block">
                {errors.type.message}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm disabled:bg-gray-100"
            >
              <option value="">
                {isLoadingCategories
                  ? 'Carregando categorias...'
                  : 'Selecione uma categoria'}
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

          {/* Botão */}
          <button
            type="submit"
            disabled={isPending || isLoadingCategories}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 mt-2 text-sm shadow-sm"
          >
            {isPending
              ? 'Salvando...'
              : 'Cadastrar Transação'}
          </button>
        </form>
      </div>
    </div>
  );
}