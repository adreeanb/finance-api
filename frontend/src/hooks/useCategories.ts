import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
}

interface CreateCategoryData {
  name: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
}

// 1. Hook para BUSCAR as categorias (usado nos formulários de transação)
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      // Usando apenas a rota, pois a 'api' já sabe qual é o IP correto da sua rede!
      const response = await api.get('/categories');
      return response.data;
    },
  });
}

// 2. Hook para CRIAR uma nova categoria (usado no NewCategoryModal)
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await api.post('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      // Quando criar com sucesso, avisa o React Query para recarregar a lista de categorias
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}