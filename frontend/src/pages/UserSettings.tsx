import { useState } from 'react';
import { User, Mail, Phone, DollarSign, ShieldCheck, Edit3, Tags } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { UpdateUserSettingsModal } from '../components/UpdateUserSettingsModal';
import { NewCategoryModal } from '../components/NewCategoryModal';

export function UserSettings() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Carregando perfil...</div>;
  }

  const formattedSalary = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(user?.salary || 0);

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Botões Responsivos */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium w-full sm:w-auto"
            >
              <Tags className="w-4 h-4" />
              Criar Categoria
            </button>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm w-full sm:w-auto"
            >
              <Edit3 className="w-4 h-4" />
              Editar Dados
            </button>
          </div>
        </div>

        {/* Informações detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <User className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">Nome Completo</span>
              <span className="text-sm font-medium text-gray-800">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <Mail className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">E-mail</span>
              <span className="text-sm font-medium text-gray-800">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <Phone className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">Telefone / WhatsApp</span>
              <span className="text-sm font-medium text-gray-800">
                {user?.phone ? user.phone : 'Não informado'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <DollarSign className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">Renda Base Mensal</span>
              <span className="text-sm font-medium text-emerald-700">{formattedSalary}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 md:col-span-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">Status da Conta</span>
              <span className="text-sm font-medium text-emerald-700">Ativa</span>
            </div>
          </div>
        </div>

      </div>

      <UpdateUserSettingsModal 
        isOpen={isUpdateModalOpen} 
        onRequestClose={() => setIsUpdateModalOpen(false)} 
        user={user} 
      />
      
      <NewCategoryModal 
        isOpen={isCategoryModalOpen} 
        onRequestClose={() => setIsCategoryModalOpen(false)} 
      />
    </main>
  );
}