import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInstallments, createInstallment, deleteInstallment, type CreateInstallmentInput } from '../services/installmentService';

export function useInstallments() {
  return useQuery({
    queryKey: ['installments'],
    queryFn: getInstallments,
  });
}

export function useCreateInstallment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInstallmentInput) => createInstallment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
    },
  });
}

export function useDeleteInstallment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInstallment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
    },
  });
}