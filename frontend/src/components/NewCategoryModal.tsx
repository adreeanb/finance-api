import { useState } from 'react';
import { X, Tag } from 'lucide-react';
// 1. IMPORTANTE: Importe o useCreateCategory!
import { useCreateCategory } from '../hooks/useCategories'; 

interface NewCategoryModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export function NewCategoryModal({ isOpen, onRequestClose }: NewCategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('tag');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  
  // 2. CORREÇÃO DOS ERROS 1 E 2: Usando o hook correto e renomeando as funções do React Query
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();

  if (!isOpen) return null;

  async function handleCreateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await createCategory({ name, icon, type });
      setName('');
      setIcon('tag');
      setType('EXPENSE');
      onRequestClose();
    } catch (error) {
      // 3. CORREÇÃO DO ERRO 3: Agora estamos "usando" a variável error no console
      console.error('Falha na criação da categoria:', error); 
      alert('Erro ao criar categoria. Verifique se o nome já existe.');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        <button 
          onClick={onRequestClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Tag className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Nova Categoria</h2>
        </div>

        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Assinaturas"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`py-2 rounded-lg font-medium text-sm transition-colors border ${
                  type === 'INCOME' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`py-2 rounded-lg font-medium text-sm transition-colors border ${
                  type === 'EXPENSE' 
                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Despesa
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
          >
            {isCreating ? 'Salvando...' : 'Salvar Categoria'}
          </button>
        </form>
      </div>
    </div>
  );
}