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

// 1. Tiramos o "export" daqui. Ele fica interno neste arquivo.
const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  
  // 2. LAZY INITIALIZATION: O React roda essa função apenas uma vez.
  // Resolve o erro do useEffect e evita re-renderizações desnecessárias!
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('@FinanceApp:token');
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { id: '1', name: 'Usuário Logado', email: '' }; 
    }
    
    return null;
  });

  // 3. Tipamos os parâmetros para remover o erro de "any"
  async function signIn({ email, password }: { email: string; password: string }) {
    const response = await api.post('/login', { email, password });
    const { token } = response.data; 

    localStorage.setItem('@FinanceApp:token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser({ id: '1', name: 'Usuário Logado', email });
  }

  function signOut() {
    localStorage.removeItem('@FinanceApp:token');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Criamos um Hook customizado para ser consumido nas outras telas.
// O comentário abaixo avisa o Vite para ignorar a regra do Fast Refresh só nesta linha.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}