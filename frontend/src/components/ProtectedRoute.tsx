import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Chamamos o nosso hook customizado em vez do useContext
  const { isAuthenticated } = useAuth();

const hasToken = !!localStorage.getItem('@FinanceApp:token');

  if (!isAuthenticated && !hasToken) {
    // Se não estiver logado, redireciona para a tela de login
    return <Navigate to="/" replace />;
  }

  // Se estiver logado, renderiza o componente filho (ex: Dashboard)
  return <>{children}</>;
}