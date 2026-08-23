import { createContext, useState, type ReactNode, useContext } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicialização segura direto do localStorage
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('@FinanceApp:token');
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { id: '1', name: 'Usuário Logado', email: '' }; 
    }
    
    return null;
  });

  async function signIn({ email, password }: { email: string; password: string }) {
    const response = await api.post('/login', { email, password });
    const { token } = response.data; 

    localStorage.setItem('@FinanceApp:token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser({ id: '1', name: 'Usuário Logado', email });
  }

  function signOut() {
    localStorage.removeItem('@FinanceApp:token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  // Garantimos que isAuthenticated seja rigorosamente verdadeiro se houver user OU o token no storage
  const hasTokenInStorage = !!localStorage.getItem('@FinanceApp:token');
  const isAuthenticated = !!user || hasTokenInStorage;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}