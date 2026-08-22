import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction, type CreateTransactionInput } from '../services/transactionService';

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    // A função que vai de fato chamar a API
    mutationFn: (data: CreateTransactionInput) => createTransaction(data),
    
    // O que fazer quando a API retornar sucesso?
    onSuccess: () => {
      // Invalida o cache da chave 'transactions'. 
      // Isso força o useTransactions() do seu Dashboard a buscar os dados novos automaticamente!
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}