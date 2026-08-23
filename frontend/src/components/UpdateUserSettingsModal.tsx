import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useUpdateUser } from '../hooks/useUser';
import type { UserProfile } from '../services/userService';

interface UpdateUserSettingsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  user: UserProfile | undefined;
}

const updateSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  phone: z.string().optional(),
  salary: z.coerce.number().min(0, 'O valor da renda não pode ser negativo.'),
});

type UpdateUserInputs = z.infer<typeof updateSchema>;

export function UpdateUserSettingsModal({ isOpen, onRequestClose, user }: UpdateUserSettingsModalProps) {
  const { mutateAsync, isPending } = useUpdateUser();

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateUserInputs>({
    resolver: zodResolver(updateSchema),
    values: {
      name: user?.name || '',
      phone: user?.phone || '',
      salary: user?.salary || 0,
    },
  });

  if (!isOpen) return null;

  async function handleUpdate(data: UpdateUserInputs) {
    try {
      const payload: UpdateUserInputs = {
        name: data.name,
        phone: data.phone,
        salary: data.salary,
      };

      await mutateAsync(payload);
      alert('Dados atualizados com sucesso!');
      onRequestClose();
    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário:', error);
      const err = error as { response?: { data?: { message?: string } } } | Error | { message?: string };
      const message =
        'response' in err && err.response?.data?.message
          ? err.response.data.message
          : err instanceof Error
          ? err.message
          : 'Erro ao atualizar dados.';
      alert(message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onRequestClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Perfil</h2>

        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nome</label>
            <input 
              {...register('name')} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            {errors.name && <span className="text-rose-500 text-xs mt-1 block">{errors.name.message}</span>}
          </div>


          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Telefone / WhatsApp</label>
            <input 
              type="text"
              placeholder="(49) 99999-9999"
              {...register('phone')} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Renda Base / Salário Mensal (R$)</label>
            <input 
              type="number"
              step="0.01"
              {...register('salary')} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            {errors.salary && <span className="text-rose-500 text-xs mt-1 block">{errors.salary.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 mt-2 text-sm shadow-sm"
          >
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}