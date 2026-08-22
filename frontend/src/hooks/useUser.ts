import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile, type UpdateUserInput } from '../services/userService';

// Hook para buscar os dados
export function useUser() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  });
}

// Hook para atualizar os dados
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => updateUserProfile(data),
    onSuccess: () => {
      // Invalida o cache para atualizar a tela e o contexto se necessário
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}