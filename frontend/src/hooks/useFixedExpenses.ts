import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFixedExpenses, createFixedExpense, deleteFixedExpense, type CreateFixedExpenseInput } from '../services/fixedExpenseService';

export function useFixedExpenses() {
  return useQuery({
    queryKey: ['fixed-expenses'],
    queryFn: getFixedExpenses,
  });
}

export function useCreateFixedExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFixedExpenseInput) => createFixedExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
    },
  });
}

export function useDeleteFixedExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFixedExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
    },
  });
}