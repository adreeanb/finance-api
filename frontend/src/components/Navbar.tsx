import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, CreditCard, LogOut, Settings, CircleDollarSign} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { signOut } = useAuth();

  // 1. Adicionado "whitespace-nowrap shrink-0" para o texto não quebrar e os botões não espremerem
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
      isActive
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* 2. Oculta o logo em telas pequenas (hidden) e exibe a partir do tamanho 'sm' */}
        <div className="hidden sm:block font-bold text-xl text-emerald-600 shrink-0">
          FinanceAPI
        </div>

        {/* 3. overflow-x-auto permite arrastar. As classes entre colchetes escondem a barra de rolagem nativa */}
        <nav className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 overflow-x-auto flex-1 sm:flex-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            Visão geral
          </NavLink>

          <NavLink to="/transactions" className={navLinkClass}>
            <ArrowLeftRight className="w-4 h-4" />
            Transações
          </NavLink>

          <NavLink to="/installments" className={navLinkClass}>
            <CreditCard className="w-4 h-4" />
            Parcelamentos
          </NavLink>

           <NavLink to="/fixed-expenses" className={navLinkClass}>
            <CircleDollarSign className="w-4 h-4" />
            Despesas Fixas
          </NavLink>

          <NavLink to="/userSettings" className={navLinkClass}>
            <Settings className="w-4 h-4" />
            Configurações
          </NavLink>
        </nav>

        {/* 4. shrink-0 garante que o botão de sair nunca diminua de tamanho no celular */}
        <button
          onClick={signOut}
          className="shrink-0 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
          title="Sair da conta"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}