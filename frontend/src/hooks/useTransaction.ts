import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteTransaction, getTransactions } from '../services/transactionService';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'], // Chave única para o cache dessa requisição
    queryFn: getTransactions,
    staleTime: 1000 * 60 * 5, // Os dados ficam "frescos" por 5 minutos antes de buscar de novo (opcional, mas recomendado)
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}